import type { Context } from 'telegraf';
const { Markup } = require('telegraf');
const uploadService = require('../../core/services/upload');
const logger = require('../../../logger');
const { MusicNft } = require('../../../build/MusicNft/MusicNft_MusicNft');
const { Address, toNano } = require('@ton/core');

async function handleStartUpload(ctx: Context) {
    const userId = ctx.from.id;
    const user = ctx.state.user;

    if (!user || !user.walletAddress) {
        return ctx.reply('❌ You must link your wallet before uploading! Click 💎 Link Wallet.');
    }

    const flowRes = await uploadService.getOrCreateFlow(userId);
    if (!flowRes.success) return ctx.reply('❌ Error starting upload flow.');
    const flow = flowRes.data;

    return resumeFlow(ctx, flow);
}

async function handleResume(ctx: Context) {
    const userId = ctx.from.id;
    const flowRes = await uploadService.getOrCreateFlow(userId);
    if (!flowRes.success) return ctx.reply('❌ No active upload to resume.');
    
    return resumeFlow(ctx, flowRes.data);
}

async function resumeFlow(ctx: Context, flow: any) {
    switch (flow.status) {
        case 'initiated':
            return ctx.reply('🎵 <b>What is the title of your track?</b>', { parse_mode: 'HTML' });
        case 'metadata_collected':
            if (!flow.metadata.genre) {
                return ctx.reply(`🎸 <b>Genre for "${flow.metadata.title}"?</b>`, { parse_mode: 'HTML' });
            }
            return ctx.reply(`🎵 <b>Send the audio file for "${flow.metadata.title}"</b>`, { parse_mode: 'HTML' });
        case 'file_uploaded':
            return processFileUpload(ctx, flow);
        case 'submitted_on_chain':
            return ctx.reply('⏳ <b>NFT Deployment is pending...</b>\nWe are waiting for on-chain confirmation.', { parse_mode: 'HTML' });
        case 'confirmed':
            return ctx.reply('✅ <b>Upload complete!</b> Track is live on-chain.', { parse_mode: 'HTML' });
        default:
            return ctx.reply('❌ Unknown flow state. Try starting /upload again.');
    }
}

async function handleUploadMessage(ctx: Context) {
    const userId = ctx.from.id;
    const text = ctx.message.text;
    const flowRes = await uploadService.getOrCreateFlow(userId);
    if (!flowRes.success) return;
    const flow = flowRes.data;

    if (flow.status === 'initiated') {
        const metadata = { title: text.trim() };
        await uploadService.updateMetadata(flow.id, metadata);
        return ctx.reply(`🎸 <b>Genre for "${metadata.title}"?</b>`, { parse_mode: 'HTML' });
    }

    if (flow.status === 'metadata_collected' && !flow.metadata.genre) {
        const metadata = { ...flow.metadata, genre: text.trim() };
        await uploadService.updateMetadata(flow.id, metadata);
        return ctx.reply(`🎵 <b>Send the audio file for "${metadata.title}"</b>`, { parse_mode: 'HTML' });
    }
}

async function handleAudioUpload(ctx: Context) {
    const userId = ctx.from.id;
    const audio = ctx.message.audio;
    const flowRes = await uploadService.getOrCreateFlow(userId);
    if (!flowRes.success) return;
    const flow = flowRes.data;

    if (flow.status !== 'metadata_collected' || !flow.metadata.genre) {
        return ctx.reply('❌ Please provide title and genre first via /upload.');
    }

    const statusMsg = await ctx.reply('⏳ Processing audio...');
    
    // Idempotent file marking
    const updateRes = await uploadService.markFileUploaded(flow.id, audio.file_id);
    if (!updateRes.success) return ctx.reply('❌ Error saving file record.');

    return processFileUpload(ctx, updateRes.data);
}

const { client, retry } = require('../../../src/chain/client');
const { getDeployer } = require('../../../src/chain/deployer');

async function processFileUpload(ctx: Context, flow: any) {
    const userId = ctx.from.id;
    const user = ctx.state.user;

    try {
        // 1. Create Intent (Atomic & Idempotent)
        const intentRes = await uploadService.createIntent(flow.id);
        if (!intentRes.success) throw new Error(intentRes.error);

        // 2. Execute Deployment
        const trackId = `${userId}_${Date.now()}`;
        const nftInit = await MusicNft.fromInit(
            Address.parse(user.walletAddress.trim()),
            { 
                $$type: 'TrackMetadata', 
                title: flow.metadata.title, 
                uri: `https://toon.music/track/${trackId}`, 
                genre: flow.metadata.genre 
            },
            toNano('0.01'),
            0n
        );

        const nftAddr = nftInit.address;
        logger.info('Executing MusicNft deployment', { flowId: flow.id, nftAddress: nftAddr.toString() });

        const { contract: deployerContract, key } = await getDeployer();
        const trackNft = client.open(nftInit);
        
        // Check state before sending
        const stateRes = await client.getContractState(nftAddr);
        const lastLt = stateRes.lastTransaction ? stateRes.lastTransaction.lt : "0";

        // Send transaction
        await trackNft.send(deployerContract.sender(key.secretKey), { value: toNano('0.05') }, null);
        
        // 3. Mark as submitted (with real address)
        await uploadService.markSubmitted(flow.id, 'submitted', nftAddr.toString());
        
        await ctx.reply(`⏳ <b>NFT Deployment Initiated</b>\n\nContract: <code>${nftAddr.toString()}</code>\nWaiting for confirmation...`, { parse_mode: 'HTML' });
        
        // Finalize asynchronously (Verification)
        verifyAndFinalize(flow.id, nftAddr, lastLt).catch((e: any) => logger.error('Verification failed', e));

    } catch (e) {
        logger.error('processFileUpload failed', e);
        await ctx.reply('❌ Deployment failed. You can try /resume later.');
    }
}

async function verifyAndFinalize(flowId: any, address: any, lastLt: string) {
    for (let i = 0; i < 15; i++) {
        const state = await client.getContractState(address);
        if (state.lastTransaction && BigInt(state.lastTransaction.lt) > BigInt(lastLt)) {
            await uploadService.finalize(flowId);
            logger.info('Upload flow finalized successfully', { flowId, address: address.toString() });
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    logger.warn('Verification timed out for flow', { flowId });
}

module.exports = {
    handleStartUpload,
    handleResume,
    handleUploadMessage,
    handleAudioUpload
};

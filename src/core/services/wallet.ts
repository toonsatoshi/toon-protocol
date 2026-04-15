const supabase = require('../../../supabase');
const logger = require('../../../logger');
const { Address } = require('@ton/core');

/**
 * Wallet Linking States:
 * - initiated
 * - challenge_sent
 * - connected
 * - verified
 */

class WalletService {
    async getOrCreateFlow(userId) {
        try {
            const { data, error } = await supabase
                .from('wallet_flows')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['initiated', 'challenge_sent', 'connected'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (data) return { success: true, data };

            const { data: newFlow, error: createError } = await supabase
                .from('wallet_flows')
                .insert({
                    user_id: userId,
                    status: 'initiated',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) throw createError;
            return { success: true, data: newFlow };
        } catch (e) {
            logger.error('WalletService.getOrCreateFlow error', e);
            return { success: false, error: 'DB_ERROR' };
        }
    }

    async setChallenge(flowId, challenge) {
        return await supabase
            .from('wallet_flows')
            .update({ challenge, status: 'challenge_sent', updated_at: new Date().toISOString() })
            .eq('id', flowId);
    }

    async markConnected(flowId, address) {
        return await supabase
            .from('wallet_flows')
            .update({ 
                wallet_address: Address.parse(address).toString(), 
                status: 'connected', 
                updated_at: new Date().toISOString() 
            })
            .eq('id', flowId);
    }

    async verify(flowId, signature, publicKey) {
        try {
            // Cryptographic verification logic here...
            // If valid:
            const { data: flow } = await supabase.from('wallet_flows').select('*').eq('id', flowId).single();
            
            await supabase.rpc('finalize_wallet_link', {
                p_user_id: flow.user_id,
                p_wallet_address: flow.wallet_address,
                p_flow_id: flowId
            });

            return { success: true };
        } catch (e) {
            logger.error('WalletService.verify error', e);
            return { success: false, error: 'VERIFICATION_FAILED' };
        }
    }
}

module.exports = new WalletService();

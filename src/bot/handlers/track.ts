const { Markup } = require('telegraf');
const store = require('../../../store');
const listenService = require('../../core/services/listen');
const logger = require('../../../logger');

async function handleStartListen(ctx) {
    const res = await store.getAllArtists();
    const artists = res.success ? res.data : [];
    
    if (artists.length === 0) {
        return ctx.reply('🎵 No artists on Toon yet! Be the first — hit ⬆️ Upload');
    }

    await ctx.reply(`🎧 <b>Who do you want to listen to?</b>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(
            artists.map(a => [
                Markup.button.callback(
                    `👤 ${a.artistName} (${a.uploadedTracks.length} track${a.uploadedTracks.length !== 1 ? 's' : ''})`,
                    `artist_${a.telegramId}`
                )
            ])
        )
    });
}

async function handleArtistSelected(ctx) {
    const artistId = ctx.match[1];
    const res = await store.getUser(artistId);
    
    if (!res.success) return ctx.answerCbQuery('Artist not found');
    const artist = res.data;
    
    if (!artist.uploadedTracks || artist.uploadedTracks.length === 0) {
        return ctx.answerCbQuery('No tracks found');
    }

    await ctx.answerCbQuery();
    await ctx.reply(`👤 <b>${artist.artistName}'s Tracks</b>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(
            artist.uploadedTracks.map(t => [
                Markup.button.callback(
                    `🎵 ${t.title} (▶️ ${t.plays || 0})`,
                    `play_${t.id}`
                )
            ])
        )
    });
}

async function handlePlayTrack(ctx) {
    const trackId = ctx.match[1];
    const listenerId = ctx.from.id;
    const trackRes = await store.getTrack(trackId);
    
    if (!trackRes.success) return ctx.answerCbQuery('Track not found');
    const track = trackRes.data;

    await ctx.answerCbQuery('🎧 Preparing track...');
    
    // 1. Record Intent via Service
    const recordRes = await listenService.recordPlay(trackId, listenerId);
    
    // 2. Immediate UI response
    await ctx.reply(
`🎧 <b>Now Playing</b>

🎵 ${track.title}
👤 ${track.artistName}
🎸 ${track.genre}
▶️ ${track.plays || 0} plays`,
        {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('💸 Tip Artist', `tip_${trackId}`)]
            ])
        }
    );

    await ctx.replyWithAudio(track.fileId, {
        title: track.title,
        performer: track.artistName
    });

    // Handle milestones or rewards if recordRes says so
    if (recordRes.success && recordRes.data.milestone_reached) {
        // Notification logic...
    }
}

module.exports = {
    handleStartListen,
    handleArtistSelected,
    handlePlayTrack
};

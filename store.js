const supabase = require('./supabase');

const generateReferralCode = (telegramId) => {
    return 'TOON' + telegramId.toString(36).toUpperCase().slice(-4) +
        Math.random().toString(36).slice(2, 5).toUpperCase();
};

/**
 * Standardize output format
 */
const success = (data = true) => ({ success: true, data });
const fail = (error, code) => ({ success: false, error, code });

module.exports = {
    getUser: async (telegramId) => {
        if (!telegramId) return fail('Missing telegramId', 'VALIDATION_ERROR');
        const tid = Number(telegramId);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*, tracks(*)')
                .eq('telegram_id', tid)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') return fail('User not found', 'NOT_FOUND');
                return fail(error.message, 'DB_ERROR');
            }
            if (!data) return fail('User not found', 'NOT_FOUND');
            
            const user = {
                ...data,
                telegramId: Number(data.telegram_id),
                artistName: data.artist_name,
                referralCode: data.referral_code,
                referredBy: data.referred_by,
                onChain: data.on_chain,
                contractAddress: data.contract_address,
                toonBalance: data.toon_balance,
                tracksUploaded: data.tracks_uploaded,
                tipsSent: data.tips_sent,
                listeningStreak: data.listening_streak,
                lastListenDay: data.last_listen_day,
                walletAddress: data.wallet_address,
                connectorData: data.connector_data,
                pendingIdentityTx: data.pending_identity_tx,
                createdAt: data.created_at,
                uploadedTracks: (data.tracks || []).map(t => ({
                    ...t,
                    artistId: Number(t.artist_id),
                    artistName: t.artist_name,
                    fileId: t.file_id,
                    contractAddress: t.contract_address
                }))
            };
            return success(user);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    createPendingUser: async (telegramId, artistName, referredBy = null) => {
        if (!telegramId || !artistName) return fail('Missing required fields', 'VALIDATION_ERROR');
        
        try {
            const referralCode = generateReferralCode(telegramId);
            const newUser = {
                telegram_id: Number(telegramId),
                artist_name: artistName,
                referral_code: referralCode,
                referred_by: referredBy ? Number(referredBy) : null,
                on_chain: false,
                reputation: 0,
                toon_balance: 0,
                tracks_uploaded: 0,
                tips_sent: 0,
                listening_streak: 0,
                created_at: Date.now()
            };

            const { error: userError } = await supabase.from('users').insert(newUser);
            if (userError) return fail(userError.message, 'DB_ERROR');

            if (referredBy) {
                const { error: refError } = await supabase.from('referrals').insert({
                    referrer_id: Number(referredBy),
                    telegram_id: Number(telegramId),
                    signup_at: Date.now(),
                    signup_paid: false,
                    upload_paid: false,
                    plays_paid: false
                });
                if (refError) console.error('Failed to create referral record', refError);
            }

            return module.exports.getUser(telegramId);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    updateUser: async (telegramId, updates) => {
        if (!telegramId) return fail('Missing telegramId', 'VALIDATION_ERROR');
        
        try {
            const dbUpdates = {};
            if (updates.artistName !== undefined) dbUpdates.artist_name = updates.artistName;
            if (updates.onChain !== undefined) dbUpdates.on_chain = updates.onChain;
            if (updates.contractAddress !== undefined) dbUpdates.contract_address = updates.contractAddress;
            if (updates.reputation !== undefined) dbUpdates.reputation = updates.reputation;
            if (updates.toonBalance !== undefined) dbUpdates.toon_balance = updates.toonBalance;
            if (updates.tracksUploaded !== undefined) dbUpdates.tracks_uploaded = updates.tracksUploaded;
            if (updates.tipsSent !== undefined) dbUpdates.tips_sent = updates.tipsSent;
            if (updates.listeningStreak !== undefined) dbUpdates.listening_streak = updates.listeningStreak;
            if (updates.lastListenDay !== undefined) dbUpdates.last_listen_day = updates.lastListenDay;
            if (updates.walletAddress !== undefined) dbUpdates.wallet_address = updates.walletAddress;
            if (updates.connectorData !== undefined) dbUpdates.connector_data = updates.connectorData;
            if (updates.step !== undefined) dbUpdates.step = updates.step;
            if (updates.track !== undefined) dbUpdates.track = updates.track;
            if (updates.pendingIdentityTx !== undefined) dbUpdates.pending_identity_tx = updates.pendingIdentityTx;

            const { error } = await supabase
                .from('users')
                .update(dbUpdates)
                .eq('telegram_id', Number(telegramId));
            
            if (error) return fail(error.message, 'DB_ERROR');
            return module.exports.getUser(telegramId);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    setWalletAddress: async (telegramId, walletAddress) => {
        if (!walletAddress) return fail('Missing wallet address', 'VALIDATION_ERROR');
        return module.exports.updateUser(telegramId, { walletAddress });
    },

    markSignupRewardPaid: async (referrerId, newUserId) => {
        if (!referrerId || !newUserId) return fail('Missing parameters', 'VALIDATION_ERROR');
        try {
            const { error } = await supabase
                .from('referrals')
                .update({ signup_paid: true })
                .eq('referrer_id', Number(referrerId))
                .eq('telegram_id', Number(newUserId));
            if (error) return fail(error.message, 'DB_ERROR');
            return success();
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    markOnChain: async (telegramId, contractAddress) => {
        if (!telegramId || !contractAddress) return fail('Missing parameters', 'VALIDATION_ERROR');
        
        try {
            await module.exports.updateUser(telegramId, {
                onChain: true,
                contractAddress: contractAddress
            });

            const { data: user } = await supabase
                .from('users')
                .select('referred_by')
                .eq('telegram_id', Number(telegramId))
                .single();

            if (user && user.referred_by) {
                await supabase
                    .from('referrals')
                    .update({ 
                        uploaded_at: Date.now(),
                        upload_paid: true 
                    })
                    .eq('referrer_id', user.referred_by)
                    .eq('telegram_id', Number(telegramId));
            }
            return success();
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    getReferrals: async (telegramId) => {
        if (!telegramId) return fail('Missing telegramId', 'VALIDATION_ERROR');
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', Number(telegramId));
            
            if (error) return fail(error.message, 'DB_ERROR');
            const referrals = data.map(r => ({
                telegramId: Number(r.telegram_id),
                signupAt: r.signup_at,
                uploadedAt: r.uploaded_at,
                rewardsPaid: {
                    signup: r.signup_paid,
                    upload: r.upload_paid,
                    firstPlays: r.plays_paid
                }
            }));
            return success(referrals);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    getUserByReferralCode: async (code) => {
        if (!code) return fail('Missing code', 'VALIDATION_ERROR');
        try {
            const { data, error } = await supabase
                .from('users')
                .select('telegram_id')
                .eq('referral_code', code)
                .single();
            
            if (error) return fail(error.message, 'DB_ERROR');
            if (!data) return fail('Referral code not found', 'NOT_FOUND');
            return module.exports.getUser(data.telegram_id);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    getAllArtists: async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*, tracks!inner(*)')
                .order('artist_name');
            
            if (error) return fail(error.message, 'DB_ERROR');
            
            const artists = data.map(u => ({
                ...u,
                telegramId: Number(u.telegram_id),
                artistName: u.artist_name,
                referralCode: u.referral_code,
                referredBy: u.referred_by,
                onChain: u.on_chain,
                contractAddress: u.contract_address,
                toonBalance: u.toon_balance,
                tracksUploaded: u.tracks_uploaded,
                tipsSent: u.tips_sent,
                listeningStreak: u.listening_streak,
                lastListenDay: u.last_listen_day,
                walletAddress: u.wallet_address,
                connectorData: u.connector_data,
                createdAt: u.created_at,
                uploadedTracks: (u.tracks || []).map(t => ({
                    ...t,
                    artistId: Number(t.artist_id),
                    artistName: t.artist_name,
                    fileId: t.file_id,
                    contractAddress: t.contract_address
                }))
            }));
            return success(artists);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    addTrack: async (telegramId, track) => {
        if (!telegramId || !track.id || !track.fileId) return fail('Missing required track fields', 'VALIDATION_ERROR');
        
        try {
            const { error } = await supabase.from('tracks').insert({
                id: track.id,
                title: track.title,
                genre: track.genre,
                artist_name: track.artistName,
                artist_id: Number(telegramId),
                file_id: track.fileId,
                duration: track.duration,
                contract_address: track.contractAddress,
                plays: 0
            });

            if (error) return fail(error.message, 'DB_ERROR');

            const { data: user } = await supabase
                .from('users')
                .select('tracks_uploaded')
                .eq('telegram_id', Number(telegramId))
                .single();
            
            await supabase
                .from('users')
                .update({ tracks_uploaded: (user?.tracks_uploaded || 0) + 1 })
                .eq('telegram_id', Number(telegramId));
                
            return module.exports.getUser(telegramId);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    getTrack: async (trackId) => {
        if (!trackId) return fail('Missing trackId', 'VALIDATION_ERROR');
        try {
            const { data, error } = await supabase
                .from('tracks')
                .select('*')
                .eq('id', trackId)
                .single();
            
            if (error) return fail(error.message, 'DB_ERROR');
            if (!data) return fail('Track not found', 'NOT_FOUND');
            
            return success({
                ...data,
                artistId: Number(data.artist_id),
                artistName: data.artist_name,
                fileId: data.file_id,
                contractAddress: data.contract_address
            });
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    incrementPlayCount: async (trackId, telegramId) => {
        if (!trackId) return fail('Missing trackId', 'VALIDATION_ERROR');
        
        try {
            // 1. Get current track state
            const { data: track } = await supabase
                .from('tracks')
                .select('plays, unique_listeners')
                .eq('id', trackId)
                .single();

            if (!track) return fail('Track not found', 'NOT_FOUND');

            const newPlays = (track.plays || 0) + 1;
            const updates = { plays: newPlays };

            // 2. Record unique listener if telegramId is provided
            if (telegramId) {
                const { error: listenerError } = await supabase
                    .from('track_listeners')
                    .upsert({ track_id: trackId, telegram_id: Number(telegramId) },
                             { onConflict: 'track_id,telegram_id', ignoreDuplicates: true });

                if (!listenerError) {
                    const { count } = await supabase
                        .from('track_listeners')
                        .select('*', { count: 'exact', head: true })
                        .eq('track_id', trackId);
                    if (count !== null) {
                        updates.unique_listeners = count;
                    }
                }
            }

            const { error } = await supabase
                .from('tracks')
                .update(updates)
                .eq('id', trackId);

            if (error) return fail(error.message, 'DB_ERROR');
            return success({ newPlays });
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    checkPlayMilestone: async (trackId) => {
        if (!trackId) return fail('Missing trackId', 'VALIDATION_ERROR');
        const MILESTONE_UNIQUE_LISTENERS = 5;

        try {
            const { data: track } = await supabase
                .from('tracks')
                .select('unique_listeners, plays, artist_id, artist_name')
                .eq('id', trackId)
                .single();

            if (!track || track.unique_listeners < MILESTONE_UNIQUE_LISTENERS) return success(null);

            const artistId = track.artist_id;
            const { data: artist } = await supabase
                .from('users')
                .select('referred_by')
                .eq('telegram_id', artistId)
                .single();
            
            if (!artist || !artist.referred_by) return success(null);

            const referrerId = artist.referred_by;
            const { data: ref } = await supabase
                .from('referrals')
                .select('plays_paid')
                .eq('referrer_id', referrerId)
                .eq('telegram_id', artistId)
                .single();

            if (!ref || ref.plays_paid) return success(null);

            // Intent confirmed, execute updates
            await supabase
                .from('referrals')
                .update({ plays_paid: true })
                .eq('referrer_id', referrerId)
                .eq('telegram_id', artistId);

            const { data: referrer } = await supabase
                .from('users')
                .select('toon_balance')
                .eq('telegram_id', referrerId)
                .single();
            
            if (referrer) {
                await supabase
                    .from('users')
                    .update({ toon_balance: (referrer.toon_balance || 0) + 50 })
                    .eq('telegram_id', referrerId);
            }

            return success({ referrerId, artistName: track.artist_name });
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    deleteTrack: async (telegramId, trackId) => {
        if (!telegramId || !trackId) return fail('Missing parameters', 'VALIDATION_ERROR');
        try {
            const { error } = await supabase
                .from('tracks')
                .delete()
                .eq('id', trackId)
                .eq('artist_id', Number(telegramId));
            
            if (error) return fail(error.message, 'DB_ERROR');

            const { data: user } = await supabase
                .from('users')
                .select('tracks_uploaded')
                .eq('telegram_id', Number(telegramId))
                .single();
            
            await supabase
                .from('users')
                .update({ tracks_uploaded: Math.max(0, (user?.tracks_uploaded || 0) - 1) })
                .eq('telegram_id', Number(telegramId));

            return success();
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    deleteUser: async (telegramId) => {
        if (!telegramId) return fail('Missing telegramId', 'VALIDATION_ERROR');
        try {
            const tid = Number(telegramId);
            await supabase.from('referrals').delete().eq('telegram_id', tid);
            await supabase.from('referrals').delete().eq('referrer_id', tid);
            const { error } = await supabase.from('users').delete().eq('telegram_id', tid);
            if (error) return fail(error.message, 'DB_ERROR');
            return success();
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    },

    getAllUsers: async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*');
            
            if (error) return fail(error.message, 'DB_ERROR');
            
            const users = data.map(u => ({
                ...u,
                telegramId: Number(u.telegram_id),
                artistName: u.artist_name,
                referralCode: u.referral_code,
                referredBy: u.referred_by,
                onChain: u.on_chain,
                contractAddress: u.contract_address,
                toonBalance: u.toon_balance,
                tracksUploaded: u.tracks_uploaded,
                tipsSent: u.tips_sent,
                listeningStreak: u.listening_streak,
                lastListenDay: u.last_listen_day,
                walletAddress: u.wallet_address,
                connectorData: u.connector_data,
                createdAt: u.created_at
            }));
            return success(users);
        } catch (e) {
            return fail(e.message, 'INTERNAL_ERROR');
        }
    }
};

const supabase = require('./supabase');


const normalizeTelegramId = (telegramId) => Number(telegramId);

const generateReferralCode = (telegramId) => {
    return 'TOON' + telegramId.toString(36).toUpperCase().slice(-4) +
        Math.random().toString(36).slice(2, 5).toUpperCase();
};

module.exports = {
    getUser: async (telegramId) => {
        const tid = normalizeTelegramId(telegramId);
        const { data, error } = await supabase
            .from('users')
            .select('*, tracks(*)')
            .eq('telegram_id', tid)
            .single();
        
        if (error) {
            console.error(`[DEBUG] store.getUser(${tid}) error:`, error);
            return null;
        }
        if (!data) {
            console.warn(`[DEBUG] store.getUser(${tid}) no data found`);
            return null;
        }
        
        return {
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
    },

    createPendingUser: async (telegramId, artistName, referredBy = null) => {
        const tid = normalizeTelegramId(telegramId);
        const referralCode = generateReferralCode(tid);
        const newUser = {
            telegram_id: tid,
            artist_name: artistName,
            referral_code: referralCode,
            referred_by: referredBy,
            on_chain: false,
            reputation: 0,
            toon_balance: 0,
            tracks_uploaded: 0,
            tips_sent: 0,
            listening_streak: 0,
            created_at: Date.now()
        };

        // Use upsert to handle cases where a skeleton user might already exist
        const { error: userError } = await supabase.from('users').upsert(newUser, { onConflict: 'telegram_id' });
        if (userError) throw userError;

        if (referredBy) {
            const { error: refError } = await supabase.from('referrals').upsert({
                referrer_id: referredBy,
                telegram_id: tid,
                signup_at: Date.now(),
                signup_paid: false,
                upload_paid: false,
                plays_paid: false
            }, { onConflict: 'referrer_id,telegram_id' });
            if (refError) console.error('Failed to create/update referral record', refError);
        }

        return module.exports.getUser(tid);
    },

    updateUser: async (telegramId, updates) => {
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

        const tid = normalizeTelegramId(telegramId);
        const { error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('telegram_id', tid);
        
        if (error) throw error;
        return module.exports.getUser(tid);
    },

    setWalletAddress: async (telegramId, walletAddress) => {
        return module.exports.updateUser(telegramId, { walletAddress });
    },

    markSignupRewardPaid: async (referrerId, newUserId) => {
        await supabase
            .from('referrals')
            .update({ signup_paid: true })
            .eq('referrer_id', referrerId)
            .eq('telegram_id', newUserId);
    },

    markOnChain: async (telegramId, contractAddress) => {
        await module.exports.updateUser(telegramId, {
            onChain: true,
            contractAddress: contractAddress
        });

        const { data: user } = await supabase
            .from('users')
            .select('referred_by')
            .eq('telegram_id', normalizeTelegramId(telegramId))
            .single();

        if (user && user.referred_by) {
            await supabase
                .from('referrals')
                .update({ 
                    uploaded_at: Date.now(),
                    upload_paid: true 
                })
                .eq('referrer_id', user.referred_by)
                .eq('telegram_id', normalizeTelegramId(telegramId));
        }
    },

    getReferrals: async (telegramId) => {
        const { data, error } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', telegramId);
        
        if (error) return [];
        return data.map(r => ({
            telegramId: Number(r.telegram_id),
            signupAt: r.signup_at,
            uploadedAt: r.uploaded_at,
            rewardsPaid: {
                signup: r.signup_paid,
                upload: r.upload_paid,
                firstPlays: r.plays_paid
            }
        }));
    },

    getUserByReferralCode: async (code) => {
        const { data, error } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('referral_code', code)
            .single();
        
        if (error || !data) return null;
        return module.exports.getUser(data.telegram_id);
    },

    getAllArtists: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*, tracks!inner(*)') // !inner ensures only users with tracks are returned
            .order('artist_name');
        
        if (error) {
            console.error('[DEBUG] store.getAllArtists error:', error);
            return [];
        }
        
        return data.map(u => ({
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
    },

    addTrack: async (telegramId, track) => {
        const tid = normalizeTelegramId(telegramId);
        const { error } = await supabase.from('tracks').insert({
            id: track.id,
            title: track.title,
            genre: track.genre,
            artist_name: track.artistName,
            artist_id: tid,
            file_id: track.fileId,
            duration: track.duration,
            contract_address: track.contractAddress,
            plays: 0
        });

        if (error) throw error;

        const { data: user } = await supabase
            .from('users')
            .select('tracks_uploaded')
            .eq('telegram_id', tid)
            .single();
        
        await supabase
            .from('users')
            .update({ tracks_uploaded: (user?.tracks_uploaded || 0) + 1 })
            .eq('telegram_id', tid);
            
        return module.exports.getUser(tid);
    },

    getTrack: async (trackId) => {
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('id', trackId)
            .single();
        
        if (error || !data) return null;
        return {
            ...data,
            artistId: Number(data.artist_id),
            artistName: data.artist_name,
            fileId: data.file_id,
            contractAddress: data.contract_address
        };
    },

    // Increments total play count and, if this is the first play for
    // this (telegramId, trackId) pair, increments unique_listeners too.
    // unique_listeners is the authoritative input for milestone evaluation —
    // total plays are unreliable because one user can replay indefinitely.
    //
    // Requires a `track_listeners` table:
    //   CREATE TABLE track_listeners (
    //       track_id   TEXT NOT NULL,
    //       telegram_id BIGINT NOT NULL,
    //       PRIMARY KEY (track_id, telegram_id)
    //   );
    // And a `unique_listeners` INTEGER column on the `tracks` table.
    incrementPlayCount: async (trackId, telegramId) => {
        // 1. Always increment total plays.
        const { data: track } = await supabase
            .from('tracks')
            .select('plays, unique_listeners')
            .eq('id', trackId)
            .single();

        if (!track) return null;

        const newPlays = (track.plays || 0) + 1;
        const updates = { plays: newPlays };

        // 2. Record unique listener (upsert is idempotent on PK conflict).
        if (telegramId) {
            const { error: listenerError } = await supabase
                .from('track_listeners')
                .upsert({ track_id: trackId, telegram_id: Number(telegramId) },
                         { onConflict: 'track_id,telegram_id', ignoreDuplicates: true });

            // If the row was newly inserted (not a duplicate), increment unique count.
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

        await supabase
            .from('tracks')
            .update(updates)
            .eq('id', trackId);

        return newPlays;
    },

    // Milestone fires when a track reaches MILESTONE_UNIQUE_LISTENERS *unique* listeners.
    // Using unique listeners instead of total plays closes the replay-farming loop:
    // a single user cannot inflate a track's milestone counter by replaying.
    checkPlayMilestone: async (trackId) => {
        const MILESTONE_UNIQUE_LISTENERS = 5;

        const { data: track } = await supabase
            .from('tracks')
            .select('unique_listeners, plays, artist_id, artist_name')
            .eq('id', trackId)
            .single();

        if (!track || track.unique_listeners < MILESTONE_UNIQUE_LISTENERS) return null;

        const artistId = track.artist_id;
        const { data: artist } = await supabase
            .from('users')
            .select('referred_by')
            .eq('telegram_id', artistId)
            .single();
        
        if (!artist || !artist.referred_by) return null;

        const referrerId = artist.referred_by;
        const { data: ref } = await supabase
            .from('referrals')
            .select('plays_paid')
            .eq('referrer_id', referrerId)
            .eq('telegram_id', artistId)
            .single();

        if (!ref || ref.plays_paid) return null;

        await supabase
            .from('referrals')
            .update({ plays_paid: true })
            .eq('referrer_id', referrerId)
            .eq('telegram_id', artistId);

        const { data: referrer } = await supabase
            .from('users')
            .select('toon_balance, wallet_address')
            .eq('telegram_id', referrerId)
            .single();
        
        if (referrer) {
            await supabase
                .from('users')
                .update({ toon_balance: (referrer.toon_balance || 0) + 50 })
                .eq('telegram_id', referrerId);
        }

        return { 
            referrerId, 
            artistName: track.artist_name,
            referrerWallet: referrer?.wallet_address 
        };
    },

    deleteTrack: async (telegramId, trackId) => {
        const tid = normalizeTelegramId(telegramId);
        const { error } = await supabase
            .from('tracks')
            .delete()
            .eq('id', trackId)
            .eq('artist_id', tid);
        
        if (error) return false;

        const { data: user } = await supabase
            .from('users')
            .select('tracks_uploaded')
            .eq('telegram_id', tid)
            .single();
        
        await supabase
            .from('users')
            .update({ tracks_uploaded: Math.max(0, (user?.tracks_uploaded || 0) - 1) })
            .eq('telegram_id', tid);

        return true;
    },

    deleteUser: async (telegramId) => {
        const tid = normalizeTelegramId(telegramId);
        // Delete referrals first to avoid foreign key issues
        await supabase.from('referrals').delete().eq('telegram_id', tid);
        await supabase.from('referrals').delete().eq('referrer_id', tid);
        // Delete user
        const { error } = await supabase.from('users').delete().eq('telegram_id', tid);
        if (error) throw error;
        return true;
    },

    getAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        
        if (error) {
            console.error('[DEBUG] store.getAllUsers error:', error);
            return [];
        }
        
        return data.map(u => ({
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
    }
};

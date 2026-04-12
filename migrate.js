const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

async function migrate() {
    const dbPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbPath)) {
        console.log('No db.json found');
        return;
    }

    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`Starting migration of ${Object.keys(db.users).length} users...`);

    // 1. Migrate Users
    for (const telegramId of Object.keys(db.users)) {
        const u = db.users[telegramId];
        const userRow = {
            telegram_id: Number(telegramId),
            artist_name: u.artistName,
            referral_code: u.referralCode,
            referred_by: u.referredBy ? Number(u.referredBy) : null,
            on_chain: u.onChain || false,
            contract_address: u.contractAddress,
            reputation: u.reputation || 0,
            toon_balance: u.toonBalance || 0,
            tracks_uploaded: u.tracksUploaded || 0,
            tips_sent: u.tipsSent || 0,
            listening_streak: u.listeningStreak || 0,
            last_listen_day: u.lastListenDay,
            wallet_address: u.walletAddress,
            connector_data: u.connectorData || {},
            created_at: u.createdAt,
            step: u.step,
            track: u.track || {},
            pending_identity_tx: u.pendingIdentityTx
        };

        const { error } = await supabase.from('users').upsert(userRow);
        if (error) console.error(`Error migrating user ${telegramId}:`, error);
        else console.log(`Migrated user ${telegramId}`);
    }

    // 2. Migrate Tracks
    console.log('Migrating tracks...');
    for (const telegramId of Object.keys(db.users)) {
        const u = db.users[telegramId];
        if (u.uploadedTracks && u.uploadedTracks.length > 0) {
            for (const t of u.uploadedTracks) {
                const trackRow = {
                    id: t.id,
                    title: t.title,
                    genre: t.genre,
                    artist_name: t.artistName,
                    artist_id: Number(t.artistId || telegramId),
                    file_id: t.fileId,
                    duration: t.duration,
                    contract_address: t.contractAddress,
                    plays: t.plays || 0
                };
                const { error } = await supabase.from('tracks').upsert(trackRow);
                if (error) console.error(`Error migrating track ${t.id}:`, error);
                else console.log(`Migrated track ${t.id}`);
            }
        }
    }

    // 3. Migrate Referrals
    console.log('Migrating referrals...');
    for (const referrerId of Object.keys(db.referrals)) {
        const refs = db.referrals[referrerId];
        for (const r of refs) {
            const refRow = {
                referrer_id: Number(referrerId),
                telegram_id: Number(r.telegramId),
                signup_at: r.signupAt,
                uploaded_at: r.uploadedAt,
                signup_paid: r.rewardsPaid?.signup || false,
                upload_paid: r.rewardsPaid?.upload || false,
                plays_paid: r.rewardsPaid?.firstPlays || false
            };
            const { error } = await supabase.from('referrals').upsert(refRow);
            if (error) console.error(`Error migrating referral ${referrerId} -> ${r.telegramId}:`, error);
            else console.log(`Migrated referral ${referrerId} -> ${r.telegramId}`);
        }
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);

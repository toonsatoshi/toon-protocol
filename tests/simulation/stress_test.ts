require('dotenv').config();
const rewardService = require('../../src/core/services/reward');
const guardrail = require('../../src/core/services/guardrail');
const supabase = require('../../supabase');
const logger = require('../../logger');
const reconciler = require('../../src/workers/reconciler');

/**
 * Stress Test Scenario: Guardrail Targeted Attack
 * 1. Force reconciliation drift and check if reconciler catches it.
 * 2. Rapidly flood reward intents concurrently to test treasury cap.
 * 3. Verify that emergency pause is absolute even under high concurrency.
 */
async function runStressTest() {
    const testUserId = 888111;
    const initialBalance = 1000;
    
    logger.info('🧪 Starting Stress Test: Guardrail Targeted Attack...');

    // ISSUE 7 FIX: Production Safety Check
    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('supabase.co')) {
        logger.error('❌ ABORTING: Stress test detected production-like Supabase URL.');
        logger.error('To run this test, use a local/test project or set ALLOW_STRESS_TEST=true');
        if (process.env.ALLOW_STRESS_TEST !== 'true') return;
    }
        // --- SETUP ---
        // 1. Reset user and treasury
        await supabase.from('users').upsert({
            telegram_id: testUserId,
            username: 'stress_tester',
            toon_balance: initialBalance
        });
        
        await supabase.from('system_config').update({
            value: { max_emission_per_hour: 1000, current_hour_usage: 0, last_hour_reset: new Date().toISOString() }
        }).eq('key', 'treasury_limits');
        
        await guardrail.resume('Stress test setup', 0);

        // --- ATTACK 1: Reconciliation Drift ---
        logger.info('--- Phase 1: Forcing Reconciliation Drift ---');
        // Manually update balance WITHOUT an event
        await supabase.from('users').update({ toon_balance: 5000 }).eq('telegram_id', testUserId);
        
        logger.info('Running reconciler to detect drift...');
        // Mock performFullCheck logic or run it (we need it to NOT exit early)
        await reconciler.performFullCheck();
        // Expectation: Logger should show BALANCE_MISMATCH for testUserId (expected 1000, actual 5000)

        // Reset balance
        await supabase.from('users').update({ toon_balance: initialBalance }).eq('telegram_id', testUserId);


        // --- ATTACK 2: Rapid Concurrent Emission ---
        logger.info('--- Phase 2: Rapid Concurrent Emission ---');
        // We have 1000 cap. Each intent 300. 4 intents = 1200 (should fail 1).
        const intentAmount = 300;
        const concurrentRequests = 10; // Try to slip more through
        
        const promises = [];
        for (let i = 0; i < concurrentRequests; i++) {
            promises.push(rewardService.createIntent(testUserId, 'milestone', `stress_${i}`, intentAmount, `stress:key:${i}`));
        }
        
        const results = await Promise.all(promises);
        const successes = results.filter(r => r.success).length;
        const failures = results.filter(r => !r.success).length;
        const limitHits = results.filter(r => r.error === 'TREASURY_LIMIT_HIT').length;

        logger.info(`Results: ${successes} successful, ${failures} failed (${limitHits} hit limit)`);
        
        if (successes > 3) {
            logger.error(`❌ FAILURE: Slippage detected! ${successes} intents created (expected max 3)`);
        } else {
            logger.info(`✅ Success: Treasury cap enforced correctly under concurrency.`);
        }


        // --- ATTACK 3: Pause Lock-in ---
        logger.info('--- Phase 3: Pause Lock-in ---');
        // Trigger pause and immediately flood requests
        await guardrail.triggerPause('Stress test pause');
        
        const pausePromises = [];
        for (let i = 0; i < 20; i++) {
            pausePromises.push(rewardService.createIntent(testUserId, 'milestone', `pause_stress_${i}`, 1, `pause:stress:key:${i}`));
        }
        
        const pauseResults = await Promise.all(pausePromises);
        const pauseSuccesses = pauseResults.filter(r => r.success).length;
        
        if (pauseSuccesses > 0) {
            logger.error(`❌ FAILURE: ${pauseSuccesses} intents slipped through DURING PAUSE!`);
        } else {
            logger.info('✅ Success: Emergency pause is absolute.');
        }

        logger.info('🏁 Stress Test Completed.');
    } catch (e) {
        logger.error('💥 Stress Test exploded', e);
    }
}

if (require.main === module) {
    runStressTest();
}

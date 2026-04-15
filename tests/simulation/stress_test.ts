require('dotenv').config();
const rewardService = require('../../src/core/services/reward');
const guardrail = require('../../src/core/services/guardrail');
const supabase = require('../../supabase');
const logger = require('../../logger');
const reconciler = require('../../src/workers/reconciler');

/**
 * Stress Test Scenario: Guardrail Targeted Attack
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

    try {
        // --- SETUP ---
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
        // Insert a synthetic event that doesn't match the live balance update
        const syntheticLt = Date.now().toString();
        await supabase.from('indexed_events').insert({
            tx_hash: 'stress_test_synthetic_' + syntheticLt,
            lt: syntheticLt,
            event_type: 'RewardClaimed',
            contract_addr: 'stress_test',
            data: { userId: testUserId, amount: "9999000000" }, // 9999 TOON in nanotons
            timestamp: new Date().toISOString()
        });

        // We DO NOT update users.toon_balance here. 
        // Reconciler should see the event, increment shadow balance, and find drift vs the initial 1000.
        
        logger.info('Running reconciler to detect drift...');
        await reconciler.performIncrementalCheck();

        // --- ATTACK 1b: Duplicate Event (Adversarial) ---
        logger.info('--- Phase 1b: Duplicate Event Attack ---');
        // If the same event (same LT, same tx_hash) exists, reconciler cursor should skip it.
        // If different LT but same underlying business intent, shadow balance logic must handle.
        const duplicateLt = (BigInt(syntheticLt) + 1n).toString();
        await supabase.from('indexed_events').insert({
            tx_hash: 'stress_test_synthetic_' + syntheticLt, // Reuse tx_hash
            lt: duplicateLt,
            event_type: 'RewardClaimed',
            contract_addr: 'stress_test',
            data: { userId: testUserId, amount: "9999000000" },
            timestamp: new Date().toISOString()
        });

        logger.info('Running reconciler to check duplicate handling...');
        await reconciler.performIncrementalCheck();
        // Expectation: If the RPC is idempotent on tx_hash, expected_toon_balance shouldn't double-count.

        // Reset balance
        await supabase.from('users').update({ toon_balance: initialBalance }).eq('telegram_id', testUserId);


        // --- ATTACK 2: Rapid Concurrent Emission ---
        logger.info('--- Phase 2: Rapid Concurrent Emission ---');
        const intentAmount = 300;
        const concurrentRequests = 10;
        
        const promises = [];
        for (let i = 0; i < concurrentRequests; i++) {
            promises.push(rewardService.createIntent(testUserId, 'milestone', `stress_${i}`, intentAmount, `stress:key:${i}`));
        }
        
        const results = await Promise.all(promises);
        const successes = results.filter(r => r.success).length;
        const failures = results.filter(r => !r.success).length;

        logger.info(`Results: ${successes} successful, ${failures} failed`);
        
        if (successes > 3) {
            logger.error(`❌ FAILURE: Slippage detected! ${successes} intents created (expected max 3)`);
        } else {
            logger.info(`✅ Success: Treasury cap enforced correctly under concurrency.`);
        }


        // --- ATTACK 3: Pause Lock-in ---
        logger.info('--- Phase 3: Pause Lock-in ---');
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

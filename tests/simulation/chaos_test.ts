require('dotenv').config();
const rewardService = require('../../src/core/services/reward');
const guardrail = require('../../src/core/services/guardrail');
const supabase = require('../../supabase');
const logger = require('../../logger');

/**
 * Chaos Test Scenario: The "Economic Pressure" Drill
 * 1. Attempt to hit the hourly treasury cap.
 * 2. Verify subsequent intents are rejected (TREASURY_LIMIT_HIT).
 * 3. Trigger Emergency Pause.
 * 4. Verify no new intents (SYSTEM_PAUSED).
 * 5. Resume and verify cooldown (RESUME_COOLDOWN).
 */
async function runChaosTest() {
    const testUserId = 999000;
    const rewardAmount = 250; // Each intent is 250 TOON
    
    logger.info('🧪 Starting Chaos Test: Economic Pressure Drill...');

    try {
        // Reset treasury for test
        await supabase.from('system_config').update({
            value: { max_emission_per_hour: 1000, current_hour_usage: 0, last_hour_reset: new Date().toISOString() }
        }).eq('key', 'treasury_limits');
        await guardrail.resume('Chaos test reset', 0); // No cooldown for setup

        // 1. Stress the Treasury
        logger.info('--- Phase 1: Treasury Stress ---');
        for (let i = 1; i <= 5; i++) {
            const achievementKey = `chaos:pressure:${i}`;
            const res = await rewardService.createIntent(testUserId, 'milestone', `test_${i}`, rewardAmount, achievementKey);
            
            if (res.success) {
                logger.info(`✅ Intent ${i} created: ${res.data}`);
            } else {
                logger.warn(`🛑 Intent ${i} rejected: ${res.error}`);
                if (i > 4 && res.error === 'TREASURY_LIMIT_HIT') {
                    logger.info('🎯 Correctly hit treasury limit as expected.');
                }
            }
        }

        // 2. Trigger Pause
        logger.info('--- Phase 2: Emergency Pause ---');
        await guardrail.triggerPause('Chaos test simulated anomaly');
        
        const pauseCheck = await rewardService.createIntent(testUserId, 'streak', 'test_pause', 50, 'chaos:pause_test');
        if (!pauseCheck.success && pauseCheck.error === 'SYSTEM_PAUSED') {
            logger.info('🎯 Correctly rejected during pause.');
        } else {
            logger.error('❌ FAILURE: Intent created during pause!', pauseCheck);
        }

        // 3. Resume with Cooldown
        logger.info('--- Phase 3: Resume Cooldown ---');
        await guardrail.resume('Chaos test recovery', 2); // 2-minute cooldown
        
        const cooldownCheck = await rewardService.createIntent(testUserId, 'referral', 'test_ref', 10, 'chaos:cooldown_test');
        if (!cooldownCheck.success && cooldownCheck.error === 'RESUME_COOLDOWN') {
            logger.info('🎯 Correctly rejected during resume cooldown.');
        } else {
            logger.error('❌ FAILURE: Intent created during cooldown!', cooldownCheck);
        }

        logger.info('🏁 Chaos Test Completed.');
    } catch (e) {
        logger.error('💥 Chaos Test exploded', e);
    }
}

if (require.main === module) {
    runChaosTest();
}

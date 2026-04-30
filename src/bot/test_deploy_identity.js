/**
 * Full integration test for deploy_identity flow
 * Run from toonbot directory: node test_deploy_identity.js
 */

const assert = require('assert');

// ── Mock store ────────────────────────────────────────
const mockDb = {
  '12345': {
    telegramId: 12345,
    walletAddress: 'EQAF8wfP5lVcgAHpH8eW18bYMagteW9kVit_KRharLjKR5sS',
    onChain: false,
    pendingIdentityTx: JSON.stringify({
      messages: [
        {
          address: 'EQDlPoUXrdaNZMJehNj2tffu6ArOW5cWBaIEsemZxt6FWd4P',
          amount: '50000000',
          payload: 'te6cckEBAQEADgAAGAAAAAAAAAAAAAAAAHR/Pew=',
          stateInit: 'te6cckEC...' // truncated for test
        },
        {
          address: 'EQCk4CpknDNmqATW4V_FhdYGVCSyphKswL_eYHTerkXV1P_G',
          amount: '50000000',
          payload: 'te6cckEBAQEAKAAAS9/F+/WAHKfQ...'
        }
      ]
    })
  }
};

const store = {
  getUser: async (id) => mockDb[String(id)] || null,
  markOnChain: async (id, addr) => {
    mockDb[String(id)].onChain = true;
    mockDb[String(id)].artistAddress = addr;
    console.log(`  ✅ markOnChain called: ${addr}`);
  },
  updateUser: async (id, data) => {
    Object.assign(mockDb[String(id)], data);
    console.log(`  ✅ updateUser called:`, data);
  }
};

// ── Mock TonConnect connector ─────────────────────────
function makeConnector(shouldSucceed = true) {
  return {
    connected: true,
    account: { address: '0:05f307cfe6555c8001e91fc796d7c6d831a82d796f64562b7f29185aacb8ca47' },
    sendTransaction: async (request) => {
      console.log(`  ✅ sendTransaction called`);
      console.log(`     validUntil: ${request.validUntil} (${Math.round((request.validUntil - Date.now()/1000)/60)}m from now)`);
      console.log(`     messages: ${request.messages.length}`);
      assert(request.validUntil > Date.now() / 1000, 'validUntil must be in the future');
      assert(request.validUntil < Date.now() / 1000 + 700, 'validUntil must be within ~10 minutes');
      assert(request.messages.length === 2, 'Should have 2 messages');
      if (!shouldSucceed) throw new Error('User rejected transaction');
      return { boc: 'te6cck_mock_result' };
    }
  };
}

// ── Mock ctx ─────────────────────────────────────────
function makeCtx(telegramId) {
  const replies = [];
  const cbAnswers = [];
  return {
    from: { id: telegramId },
    botInfo: { username: 'toonplayerbot' },
    replies,
    cbAnswers,
    reply: async (msg) => { replies.push(msg); console.log(`  📨 Bot replied: "${msg}"`); },
    answerCbQuery: async (msg, opts) => { cbAnswers.push(msg); console.log(`  🔔 cbQuery: "${msg}"`); }
  };
}

// ── The handler logic (extracted from index.js) ───────
const deploymentInProgress = new Set();

async function handleDeployIdentity(ctx, store, getConnector) {
  const telegramId = ctx.from.id;
  if (deploymentInProgress.has(telegramId)) {
    return ctx.answerCbQuery('⏳ Deployment already in progress — check your wallet app.');
  }
  deploymentInProgress.add(telegramId);

  try {
    const user = await store.getUser(telegramId);

    if (user && user.onChain) {
      return ctx.answerCbQuery('Your identity is already on-chain!', { show_alert: true });
    }
    if (!user || !user.pendingIdentityTx) {
      return ctx.answerCbQuery('No pending deployment found. Try uploading a track first.', { show_alert: true });
    }

    const connector = await getConnector(telegramId);
    if (!connector.connected) {
      return ctx.reply('👛 Connect your Telegram Wallet to continue.');
    }

    await ctx.answerCbQuery('Sending request to your wallet...');

    let tx = user.pendingIdentityTx;
    if (typeof tx === 'string') {
      tx = JSON.parse(tx);
    }
    if (!tx || typeof tx !== 'object' || !tx.messages) {
      return ctx.reply('Could not prepare deployment transaction. Please try uploading again.');
    }

    const request = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      network: '-3',
      messages: tx.messages
    };

    await connector.sendTransaction(request);
    const artistAddress = request.messages[0].address;
    await store.markOnChain(telegramId, artistAddress);
    await store.updateUser(telegramId, { pendingIdentityTx: null });
    await ctx.reply('Artist Identity deployment sent to the blockchain!');

  } catch (e) {
    await ctx.reply('Deployment cancelled or failed.');
  } finally {
    deploymentInProgress.delete(telegramId);
  }
}

// ── Tests ─────────────────────────────────────────────
async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    console.log(`\n🧪 ${name}`);
    try {
      await fn();
      console.log(`  ✅ PASSED`);
      passed++;
    } catch (e) {
      console.log(`  ❌ FAILED: ${e.message}`);
      failed++;
    }
    deploymentInProgress.clear();
    mockDb['12345'].onChain = false;
    mockDb['12345'].pendingIdentityTx = JSON.stringify({ messages: [
      { address: 'EQDlPoUXrdaNZMJehNj2tffu6ArOW5cWBaIEsemZxt6FWd4P', amount: '50000000', payload: 'mock' },
      { address: 'EQCk4CpknDNmqATW4V_FhdYGVCSyphKswL_eYHTerkXV1P_G', amount: '50000000', payload: 'mock' }
    ]});
  }

  await test('Happy path: wallet connected, tx succeeds', async () => {
    const ctx = makeCtx(12345);
    await handleDeployIdentity(ctx, store, async () => makeConnector(true));
    assert(ctx.replies.some(r => r.includes('sent to the blockchain')), 'Should confirm deployment');
    assert(mockDb['12345'].onChain === true, 'Should be marked on-chain');
    assert(mockDb['12345'].pendingIdentityTx === null, 'Should clear pendingIdentityTx');
  });

  await test('Already on-chain: should reject early', async () => {
    mockDb['12345'].onChain = true;
    const ctx = makeCtx(12345);
    await handleDeployIdentity(ctx, store, async () => makeConnector(true));
    assert(ctx.cbAnswers.some(r => r.includes('already on-chain')), 'Should say already on-chain');
  });

  await test('No pending tx: should reject with helpful message', async () => {
    mockDb['12345'].pendingIdentityTx = null;
    const ctx = makeCtx(12345);
    await handleDeployIdentity(ctx, store, async () => makeConnector(true));
    assert(ctx.cbAnswers.some(r => r.includes('No pending deployment')), 'Should say no pending deployment');
  });

  await test('Wallet not connected: should prompt to connect', async () => {
    const ctx = makeCtx(12345);
    const disconnected = { connected: false };
    await handleDeployIdentity(ctx, store, async () => disconnected);
    assert(ctx.replies.some(r => r.includes('Connect')), 'Should prompt wallet connect');
    assert(mockDb['12345'].onChain === false, 'Should not mark on-chain');
  });

  await test('User rejects transaction: should reply with failure', async () => {
    const ctx = makeCtx(12345);
    await handleDeployIdentity(ctx, store, async () => makeConnector(false));
    assert(ctx.replies.some(r => r.includes('cancelled or failed')), 'Should report failure');
    assert(mockDb['12345'].onChain === false, 'Should not mark on-chain');
  });

  await test('Duplicate deploy attempt: should block second call', async () => {
    const ctx = makeCtx(12345);
    deploymentInProgress.add(12345);
    await handleDeployIdentity(ctx, store, async () => makeConnector(true));
    assert(ctx.cbAnswers.some(r => r.includes('already in progress')), 'Should block duplicate');
  });

  await test('validUntil is within 10 minutes', async () => {
    const ctx = makeCtx(12345);
    const before = Date.now() / 1000;
    await handleDeployIdentity(ctx, store, async () => makeConnector(true));
    const after = Date.now() / 1000;
    // sendTransaction mock already asserts this, just double check
    assert(mockDb['12345'].onChain === true, 'Should complete successfully');
  });

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });

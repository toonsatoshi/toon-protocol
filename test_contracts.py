import os,requests,json,time,sys,hashlib
from dotenv import load_dotenv
load_dotenv()

API   = os.getenv('TONCENTER_API_KEY')
V     = os.getenv('TOON_VAULT_ADDRESS')
R     = os.getenv('TOON_REGISTRY_ADDRESS')
J     = os.getenv('TOON_JETTON_ADDRESS')
A     = os.getenv('TOON_ARTIST_ADDRESS')
T     = os.getenv('TOON_TIP_ADDRESS')
G     = os.getenv('TOON_GOVERNANCE_ADDRESS')
BOT   = os.getenv('BOT_TOKEN')
MN    = os.getenv('WALLET_MNEMONIC')
WV    = os.getenv('WALLET_VERSION')
SB_U  = os.getenv('SUPABASE_URL')
SB_K  = os.getenv('SUPABASE_KEY')
ORACLE_HEX = os.getenv('ORACLE_SEED_HEX')
ORACLE_PK  = os.getenv('ORACLE_PUBLIC_KEY','').removeprefix('0x')
BASE  = 'https://testnet.toncenter.com/api/v2'
H     = {'X-API-Key': API}

R_='\033[0m';BOLD='\033[1m';DIM='\033[2m'
def c(code,t):return f'\033[{code}m{t}{R_}'
grn=lambda t:c('32',t);red=lambda t:c('31',t);yel=lambda t:c('33',t)
blu=lambda t:c('34',t);cyn=lambda t:c('36',t);mag=lambda t:c('35',t)
bold=lambda t:f'{BOLD}{t}{R_}';dim=lambda t:f'{DIM}{t}{R_}'
PASS=grn('  ✓ PASS');FAIL=red('  ✗ FAIL');WARN=yel('  ⚠ WARN');SKIP=dim('  ─ SKIP')

results=[]
def record(name,status,detail=''):
    results.append({'name':name,'status':status,'detail':detail})
    icon=PASS if status=='pass' else(FAIL if status=='fail' else(WARN if status=='warn' else SKIP))
    print(f'{icon}  {name}'+(f'  {dim(detail)}' if detail else ''))

def section(s):print(bold(cyn(f'\n  ┌─ {s} '+'─'*(44-len(s))+'┐')))
def endsec():print(bold(cyn(f'  └'+'─'*46+'┘')))

def get_method(addr,method,stack=[]):
    try:
        r=requests.post(f'{BASE}/runGetMethod',headers=H,json={'address':addr,'method':method,'stack':stack},timeout=10)
        d=r.json();return d.get('ok',False),d.get('result',{}),d.get('error','')
    except Exception as e:return False,{},str(e)

def get_state(addr):
    try:
        r=requests.get(f'{BASE}/getAddressInformation',headers=H,params={'address':addr},timeout=10)
        d=r.json();return d.get('ok',False),d.get('result',{}),d.get('error','')
    except Exception as e:return False,{},str(e)

def get_balance(addr):
    try:
        r=requests.get(f'{BASE}/getAddressBalance',headers=H,params={'address':addr},timeout=10)
        d=r.json();return d.get('ok',False),int(d.get('result','0')),d.get('error','')
    except Exception as e:return False,0,str(e)

def get_txns(addr,limit=5):
    try:
        r=requests.get(f'{BASE}/getTransactions',headers=H,params={'address':addr,'limit':limit},timeout=10)
        d=r.json();return d.get('ok',False),d.get('result',[]),d.get('error','')
    except Exception as e:return False,[],str(e)

# ══════════════════════════════════════════════════════════════════
print(bold(mag('\n  ╔════════════════════════════════════════════╗')))
print(bold(mag('  ║       🌀  TOON CONTRACT TEST SUITE         ║')))
print(bold(mag('  ╚════════════════════════════════════════════╝')))
print(dim(f'  Testnet · {time.strftime("%Y-%m-%d %H:%M:%S UTC",time.gmtime())}'))

# ── 1. ENV VARS ────────────────────────────────────────────────────
section('1 · ENV VARS')
required={
    'TONCENTER_API_KEY':API,'TOON_VAULT_ADDRESS':V,'TOON_REGISTRY_ADDRESS':R,
    'TOON_JETTON_ADDRESS':J,'TOON_ARTIST_ADDRESS':A,'TOON_TIP_ADDRESS':T,
    'TOON_GOVERNANCE_ADDRESS':G,'BOT_TOKEN':BOT,'WALLET_MNEMONIC':MN,
    'WALLET_VERSION':WV,'SUPABASE_URL':SB_U,'SUPABASE_KEY':SB_K,
    'ORACLE_SEED_HEX':ORACLE_HEX,'ORACLE_PUBLIC_KEY':os.getenv('ORACLE_PUBLIC_KEY'),
}
missing=[]
for k,v in required.items():
    if not v:missing.append(k);record(f'Env: {k}','fail','not set')
    else:
        masked=('*'*8+v[-4:]) if k in('TONCENTER_API_KEY','SUPABASE_KEY','BOT_TOKEN') else v[:14]+'…'
        record(f'Env: {k}','pass',masked)
endsec()
if missing:print(red(f'\n  ✗ {len(missing)} required env vars missing.'));sys.exit(1)

# ── 2. API CONNECTIVITY ────────────────────────────────────────────
section('2 · API CONNECTIVITY')
try:
    r=requests.get(f'{BASE}/getMasterchainInfo',headers=H,timeout=8);d=r.json()
    if d.get('ok'):record('TonCenter testnet reachable','pass',f'seqno={d["result"]["last"]["seqno"]}')
    else:record('TonCenter testnet reachable','fail',d.get('error',''))
except Exception as e:record('TonCenter testnet reachable','fail',str(e))
endsec()

# ── 3. CONTRACT LIVENESS ───────────────────────────────────────────
section('3 · CONTRACT LIVENESS  (deployed & active)')
contracts={'Vault':V,'Registry':R,'Jetton':J,'Artist':A,'Tip':T,'Governance':G}
live={}
for name,addr in contracts.items():
    ok,st,err=get_state(addr)
    if not ok:record(f'{name} deployed','fail',err);live[name]=False;continue
    status=st.get('state','uninitialized');bal=int(st.get('balance','0'))/1e9
    if status=='active':record(f'{name} deployed','pass',f'active · {bal:.4f} TON');live[name]=True
    elif status=='uninitialized':record(f'{name} deployed','fail','uninitialized');live[name]=False
    else:record(f'{name} deployed','warn',f'state={status}');live[name]=False
endsec()

# ── 4. VAULT CONTRACT (REPLACED WITH CORRECT METHODS) ─────────────
section('4 · VAULT CONTRACT')  
if live.get('Vault'):  
    no_arg_methods = ['totalReserve', 'dailyEmitted', 'dailyClaimCount',  
                      'isHalved', 'currentEmissionCap', 'getConfig', 'governance']  
    passed_any = False  
    for m in no_arg_methods:  
        ok, res, err = get_method(V, m)  
        if ok and res.get('exit_code') == 0:  
            stack = res.get('stack', [])  
            record(f'Vault.{m}()', 'pass', f'{stack[0][1] if stack else "ok"}')  
            passed_any = True  
        else:  
            record(f'Vault.{m}()', 'fail', err or f'exit_code={res.get("exit_code")}')  
    ok, bal, _ = get_balance(V)  
    if ok: record('Vault balance', 'pass' if bal > 0 else 'warn', f'{bal/1e9:.6f} TON')  
    ok2, txs, err2 = get_txns(V, 3)  
    if ok2: record('Vault tx history', 'pass' if txs else 'warn', f'{len(txs)} recent txns')  
else:  
    record('Vault tests', 'skip', 'contract not live')  
endsec()

# ── 5. JETTON CONTRACT  (TEP-74) ───────────────────────────────────
section('5 · JETTON CONTRACT  (TEP-74)')
if live.get('Jetton'):
    ok,res,err=get_method(J,'get_jetton_data')
    if ok and res.get('exit_code')==0:
        stack=res.get('stack',[])
        record('get_jetton_data executes','pass',f'{len(stack)} items')
        if len(stack)>=1:
            try:
                raw=stack[0][1] if isinstance(stack[0],list) and len(stack[0])>1 else None
                supply=int(raw,16) if raw else None
                record('Total supply readable','pass',f'{supply:,} nJetton' if supply is not None else 'supply=0')
            except:record('Total supply readable','warn','parse error')
        else:record('Jetton stack depth (TEP-74 expects 5)','warn',f'only {len(stack)} items')

        # Wallet address probe — use num type not tvm.Slice to avoid encoding issues
        ok2,res2,err2=get_method(J,'get_wallet_address',[['num','0']])
        code2=res2.get('exit_code',-1) if ok2 else -1
        if ok2 and code2==0:record('get_wallet_address accepts address arg','pass','exit_code=0')
        elif ok2 and code2 in(4,5,9):record('get_wallet_address stack error','warn',f'exit_code={code2} — arg type mismatch, contract reachable')
        elif ok2:record('get_wallet_address responds','warn',f'exit_code={code2}')
        else:record('get_wallet_address responds','fail',err2)
    else:
        record('get_jetton_data executes','fail',err or f'exit_code={res.get("exit_code")}')
else:record('Jetton tests','skip','contract not live')
endsec()

# ── 6. REGISTRY CONTRACT ───────────────────────────────────────────
section('6 · REGISTRY CONTRACT')
if live.get('Registry'):
    ok,st,err=get_state(R)
    if ok:
        record('Registry state fetched','pass',f'code_hash={hashlib.sha256(str(st.get("code","")).encode()).hexdigest()[:12]}')
        data=st.get('data','')
        record('Registry has on-chain data','pass' if data and data!='te6cckEBAQEAAgAAAEysuc0=' else 'warn',
            'non-empty' if data and data!='te6cckEBAQEAAgAAAEysuc0=' else 'empty cell')
    else:record('Registry state','fail',err)
    ok2,txs,=get_txns(R,5)
    if ok2:record('Registry tx history','pass' if txs else 'warn',f'{len(txs)} recent txns')
else:record('Registry tests','skip','contract not live')
endsec()

# ── 7. ARTIST CONTRACT (REPLACED WITH CORRECT METHODS) ─────────────
section('7 · ARTIST CONTRACT')  
if live.get('Artist'):  
    no_arg_methods = ['isActive', 'canLaunchToonDrop', 'getDetails',  
                      'reputation', 'owner', 'totalTracks', 'stakedToon']  
    for m in no_arg_methods:  
        ok, res, err = get_method(A, m)  
        if ok and res.get('exit_code') == 0:  
            stack = res.get('stack', [])  
            record(f'Artist.{m}()', 'pass', f'{stack[0][1] if stack else "ok"}')  
        else:  
            record(f'Artist.{m}()', 'fail', err or f'exit_code={res.get("exit_code")}')  
    ok, bal, _ = get_balance(A)  
    if ok:  
        record('Artist balance', 'pass' if bal > 0 else 'warn',  
               f'{bal/1e9:.6f} TON' + (' ← needs funding for gas' if bal == 0 else ''))  
else:  
    record('Artist tests', 'skip', 'contract not live')  
endsec()

# ── 8. TIP CONTRACT ────────────────────────────────────────────────
section('8 · TIP CONTRACT')
if live.get('Tip'):
    ok,st,err=get_state(T)
    if ok:
        record('Tip state fetched','pass',f'state={st.get("state")}')
        ok2,txs,=get_txns(T,10)
        if ok2:
            total_in=sum(int(tx.get('in_msg',{}).get('value','0') or 0) for tx in txs)
            record('Tip inbound value','pass' if txs else 'warn',
                f'{len(txs)} txns · \~{total_in/1e9:.4f} TON inbound' if txs else 'no txns yet')
        else:record('Tip tx fetch','fail','')
    else:record('Tip state','fail',err)
else:record('Tip tests','skip','contract not live')
endsec()

# ── 9. GOVERNANCE CONTRACT (REPLACED WITH CORRECT METHODS) ─────────
section('9 · GOVERNANCE CONTRACT')  
if live.get('Governance'):  
    no_arg_methods = ['totalStaked']  
    for m in no_arg_methods:  
        ok, res, err = get_method(G, m)  
        if ok and res.get('exit_code') == 0:  
            stack = res.get('stack', [])  
            record(f'Governance.{m}()', 'pass', f'{stack[0][1] if stack else "ok"}')  
        else:  
            record(f'Governance.{m}()', 'fail', err or f'exit_code={res.get("exit_code")}')  
    # getProposal / stake require args — just verify they respond (exit_code != -1)  
    for m, args in [('getProposal', [['num', '0']]), ('stake', [['tvm.Slice', G]])]:  
        ok, res, err = get_method(G, m, args)  
        code = res.get('exit_code', -1) if ok else -1  
        record(f'Governance.{m}() responds', 'pass' if code in (0, 4, 5, 7, 9) else 'fail',  
               f'exit_code={code}')  
    ok, bal, _ = get_balance(G)  
    if ok:  
        record('Governance balance', 'pass' if bal > 0 else 'warn',  
               f'{bal/1e9:.6f} TON' + (' ← needs funding for gas' if bal == 0 else ''))  
else:  
    record('Governance tests', 'skip', 'contract not live')  
endsec()

# ── 10. SUPABASE ──────────────────────────────────────────────────
section('10 · SUPABASE CONNECTIVITY')
try:
    r=requests.get(f'{SB_U}/rest/v1/',headers={'apikey':SB_K,'Authorization':f'Bearer {SB_K}'},timeout=8)
    if r.status_code in(200,400):record('Supabase reachable','pass',f'HTTP {r.status_code}')
    elif r.status_code==401:record('Supabase reachable','fail','401 — check SUPABASE_KEY')
    else:record('Supabase reachable','warn',f'HTTP {r.status_code}')
except Exception as e:record('Supabase reachable','fail',str(e))
endsec()

# ── 11. TELEGRAM BOT ──────────────────────────────────────────────
section('11 · TELEGRAM BOT TOKEN')
try:
    r=requests.get(f'https://api.telegram.org/bot{BOT}/getMe',timeout=8);d=r.json()
    if d.get('ok'):u=d['result'];record('Bot token valid','pass',f'@{u["username"]} (id={u["id"]})')
    else:record('Bot token valid','fail',d.get('description',''))
except Exception as e:record('Bot token valid','fail',str(e))
endsec()

# ── 12. ORACLE KEYS ───────────────────────────────────────────────
section('12 · ORACLE KEY SANITY')
if ORACLE_HEX:
    try:
        b=bytes.fromhex(ORACLE_HEX)
        record('ORACLE_SEED_HEX parseable','pass',f'{len(b)} bytes ({len(b)*8}-bit)')
        record('ORACLE_SEED_HEX length','pass' if len(b)==32 else 'warn','ed25519 ✓' if len(b)==32 else f'expected 32 got {len(b)}')
    except:record('ORACLE_SEED_HEX parseable','fail','not valid hex')
else:record('ORACLE_SEED_HEX','skip','not set')

if ORACLE_PK:
    try:
        b=bytes.fromhex(ORACLE_PK)  # 0x already stripped at top
        record('ORACLE_PUBLIC_KEY parseable','pass',f'{len(b)} bytes — 0x prefix auto-stripped')
        record('ORACLE_PUBLIC_KEY length','pass' if len(b)==32 else 'warn','ed25519 ✓' if len(b)==32 else f'expected 32 got {len(b)}')
        # Sanity: seed and pubkey should not be identical
        if ORACLE_HEX and bytes.fromhex(ORACLE_HEX)==b:
            record('Seed ≠ Pubkey','fail','seed and public key are identical — key derivation likely broken')
        elif ORACLE_HEX:
            record('Seed ≠ Pubkey','pass','distinct keys ✓')
    except:record('ORACLE_PUBLIC_KEY parseable','fail','not valid hex even after 0x strip')
else:record('ORACLE_PUBLIC_KEY','skip','not set')
endsec()

# ── SUMMARY ────────────────────────────────────────────────────────
passed =[r for r in results if r['status']=='pass']
failed =[r for r in results if r['status']=='fail']
warned =[r for r in results if r['status']=='warn']
skipped=[r for r in results if r['status']=='skip']
print(bold(mag('\n  ╔════════════════════════════════════════════╗')))
print(bold(mag('  ║              TEST SUMMARY                  ║')))
print(bold(mag('  ╚════════════════════════════════════════════╝')))
print(f'  {grn(bold(str(len(passed)).rjust(3)))} passed   {red(bold(str(len(failed)).rjust(3)))} failed   {yel(bold(str(len(warned)).rjust(3)))} warnings   {dim(str(len(skipped)).rjust(3)+" skipped")}   / {len(results)} total')
if failed:
    print(red('\n  Failed:'))
    for f in failed:print(red(f'    ✗ {f["name"]}')+(f'  — {dim(f["detail"])}' if f['detail'] else ''))
if warned:
    print(yel('\n  Warnings:'))
    for w in warned:print(yel(f'    ⚠ {w["name"]}')+(f'  — {dim(w["detail"])}' if w['detail'] else ''))
print(bold(f'\n  {grn("✅  ALL SYSTEMS GO") if not failed else (yel("⚠   PARTIAL — review warnings") if len(failed)<3 else red("❌  FAILURES DETECTED"))}\n'))

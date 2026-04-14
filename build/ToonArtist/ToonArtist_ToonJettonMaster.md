# Tact compilation report
Contract: ToonJettonMaster
BoC Size: 1789 bytes

## Structures (Structs and Messages)
Total structures: 37

### DataSize
TL-B: `_ cells:int257 bits:int257 refs:int257 = DataSize`
Signature: `DataSize{cells:int257,bits:int257,refs:int257}`

### SignedBundle
TL-B: `_ signature:fixed_bytes64 signedData:remainder<slice> = SignedBundle`
Signature: `SignedBundle{signature:fixed_bytes64,signedData:remainder<slice>}`

### StateInit
TL-B: `_ code:^cell data:^cell = StateInit`
Signature: `StateInit{code:^cell,data:^cell}`

### Context
TL-B: `_ bounceable:bool sender:address value:int257 raw:^slice = Context`
Signature: `Context{bounceable:bool,sender:address,value:int257,raw:^slice}`

### SendParameters
TL-B: `_ mode:int257 body:Maybe ^cell code:Maybe ^cell data:Maybe ^cell value:int257 to:address bounce:bool = SendParameters`
Signature: `SendParameters{mode:int257,body:Maybe ^cell,code:Maybe ^cell,data:Maybe ^cell,value:int257,to:address,bounce:bool}`

### MessageParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 to:address bounce:bool = MessageParameters`
Signature: `MessageParameters{mode:int257,body:Maybe ^cell,value:int257,to:address,bounce:bool}`

### DeployParameters
TL-B: `_ mode:int257 body:Maybe ^cell value:int257 bounce:bool init:StateInit{code:^cell,data:^cell} = DeployParameters`
Signature: `DeployParameters{mode:int257,body:Maybe ^cell,value:int257,bounce:bool,init:StateInit{code:^cell,data:^cell}}`

### StdAddress
TL-B: `_ workchain:int8 address:uint256 = StdAddress`
Signature: `StdAddress{workchain:int8,address:uint256}`

### VarAddress
TL-B: `_ workchain:int32 address:^slice = VarAddress`
Signature: `VarAddress{workchain:int32,address:^slice}`

### BasechainAddress
TL-B: `_ hash:Maybe int257 = BasechainAddress`
Signature: `BasechainAddress{hash:Maybe int257}`

### Deploy
TL-B: `deploy#946a98b6 queryId:uint64 = Deploy`
Signature: `Deploy{queryId:uint64}`

### DeployOk
TL-B: `deploy_ok#aff90f57 queryId:uint64 = DeployOk`
Signature: `DeployOk{queryId:uint64}`

### FactoryDeploy
TL-B: `factory_deploy#6d0ff13b queryId:uint64 cashback:address = FactoryDeploy`
Signature: `FactoryDeploy{queryId:uint64,cashback:address}`

### JettonData
TL-B: `_ totalSupply:int257 mintable:bool adminAddress:address content:^cell walletCode:^cell = JettonData`
Signature: `JettonData{totalSupply:int257,mintable:bool,adminAddress:address,content:^cell,walletCode:^cell}`

### TokenTransfer
TL-B: `token_transfer#0f8a7ea5 queryId:uint64 amount:coins destination:address response_destination:address customPayload:Maybe ^cell forward_ton_amount:coins forward_payload:remainder<slice> = TokenTransfer`
Signature: `TokenTransfer{queryId:uint64,amount:coins,destination:address,response_destination:address,customPayload:Maybe ^cell,forward_ton_amount:coins,forward_payload:remainder<slice>}`

### TokenMint
TL-B: `token_mint#1674b0a0 queryId:uint64 amount:coins receiver:address = TokenMint`
Signature: `TokenMint{queryId:uint64,amount:coins,receiver:address}`

### TokenTransferInternal
TL-B: `token_transfer_internal#178d4519 queryId:uint64 amount:coins from:address response_destination:address forward_ton_amount:coins forward_payload:remainder<slice> = TokenTransferInternal`
Signature: `TokenTransferInternal{queryId:uint64,amount:coins,from:address,response_destination:address,forward_ton_amount:coins,forward_payload:remainder<slice>}`

### TokenNotification
TL-B: `token_notification#7362d09c queryId:uint64 amount:coins from:address forward_payload:remainder<slice> = TokenNotification`
Signature: `TokenNotification{queryId:uint64,amount:coins,from:address,forward_payload:remainder<slice>}`

### TokenBurn
TL-B: `token_burn#595f07bc queryId:uint64 amount:coins response_destination:address = TokenBurn`
Signature: `TokenBurn{queryId:uint64,amount:coins,response_destination:address}`

### TokenBurnNotification
TL-B: `token_burn_notification#7bdd97de queryId:uint64 amount:coins owner:address response_destination:address = TokenBurnNotification`
Signature: `TokenBurnNotification{queryId:uint64,amount:coins,owner:address,response_destination:address}`

### TokenExcesses
TL-B: `token_excesses#d53276db queryId:uint64 = TokenExcesses`
Signature: `TokenExcesses{queryId:uint64}`

### UpdateMintAuthority
TL-B: `update_mint_authority#787cca54 newAuthority:address = UpdateMintAuthority`
Signature: `UpdateMintAuthority{newAuthority:address}`

### UpdateMetadata
TL-B: `update_metadata#1179e2f3 newUri:^string = UpdateMetadata`
Signature: `UpdateMetadata{newUri:^string}`

### ToonJettonMaster$Data
TL-B: `_ owner:address mintAuthority:address totalSupply:coins metadataUri:^string = ToonJettonMaster`
Signature: `ToonJettonMaster{owner:address,mintAuthority:address,totalSupply:coins,metadataUri:^string}`

### ToonJettonWallet$Data
TL-B: `_ balance:coins owner:address master:address = ToonJettonWallet`
Signature: `ToonJettonWallet{balance:coins,owner:address,master:address}`

### RegisterArtist
TL-B: `register_artist#dfc5fbf5 artistContract:address = RegisterArtist`
Signature: `RegisterArtist{artistContract:address}`

### StageArtistRegistration
TL-B: `stage_artist_registration#cc4fedf7 artistContract:address wallet:address = StageArtistRegistration`
Signature: `StageArtistRegistration{artistContract:address,wallet:address}`

### ConfirmArtistRegistration
TL-B: `confirm_artist_registration#c8526e47 wallet:address = ConfirmArtistRegistration`
Signature: `ConfirmArtistRegistration{wallet:address}`

### ArtistRegistrationConfirmed
TL-B: `artist_registration_confirmed#0954aef8 wallet:address = ArtistRegistrationConfirmed`
Signature: `ArtistRegistrationConfirmed{wallet:address}`

### StageTrackRegistration
TL-B: `stage_track_registration#c09310ed trackId:uint256 fingerprint:uint256 trackContract:address = StageTrackRegistration`
Signature: `StageTrackRegistration{trackId:uint256,fingerprint:uint256,trackContract:address}`

### ConfirmTrackRegistration
TL-B: `confirm_track_registration#a47a6dee trackId:uint256 = ConfirmTrackRegistration`
Signature: `ConfirmTrackRegistration{trackId:uint256}`

### TrackStagingAccepted
TL-B: `track_staging_accepted#d40bb4a9 trackId:uint256 = TrackStagingAccepted`
Signature: `TrackStagingAccepted{trackId:uint256}`

### TrackRegistrationFinalized
TL-B: `track_registration_finalized#b2c8fdba trackId:uint256 trackContract:address = TrackRegistrationFinalized`
Signature: `TrackRegistrationFinalized{trackId:uint256,trackContract:address}`

### UnstakeToon
TL-B: `unstake_toon#dfc52f97 amount:coins = UnstakeToon`
Signature: `UnstakeToon{amount:coins}`

### AddTrack
TL-B: `add_track#21a5a79d trackId:uint256 fingerprint:uint256 trackContract:address = AddTrack`
Signature: `AddTrack{trackId:uint256,fingerprint:uint256,trackContract:address}`

### ArtistDetails
TL-B: `_ reputation:uint32 totalTipVolume:coins stakedToon:coins isActive:bool totalTracks:uint32 = ArtistDetails`
Signature: `ArtistDetails{reputation:uint32,totalTipVolume:coins,stakedToon:coins,isActive:bool,totalTracks:uint32}`

### ToonArtist$Data
TL-B: `_ owner:address registry:address jettonMaster:address telegramHash:uint256 metadataUri:^string reputation:uint32 totalTipVolume:coins stakedToon:coins tracks:dict<int, address> totalTracks:uint32 pendingTracks:dict<int, address> isRegistered:bool = ToonArtist`
Signature: `ToonArtist{owner:address,registry:address,jettonMaster:address,telegramHash:uint256,metadataUri:^string,reputation:uint32,totalTipVolume:coins,stakedToon:coins,tracks:dict<int, address>,totalTracks:uint32,pendingTracks:dict<int, address>,isRegistered:bool}`

## Get methods
Total get methods: 6

## get_jetton_data
No arguments

## get_wallet_address
Argument: owner

## totalSupply
No arguments

## owner
No arguments

## mintAuthority
No arguments

## metadataUri
No arguments

## Exit codes
* 2: Stack underflow
* 3: Stack overflow
* 4: Integer overflow
* 5: Integer out of expected range
* 6: Invalid opcode
* 7: Type check error
* 8: Cell overflow
* 9: Cell underflow
* 10: Dictionary error
* 11: 'Unknown' error
* 12: Fatal error
* 13: Out of gas error
* 14: Virtualization error
* 32: Action list is invalid
* 33: Action list is too long
* 34: Action is invalid or not supported
* 35: Invalid source address in outbound message
* 36: Invalid destination address in outbound message
* 37: Not enough Toncoin
* 38: Not enough extra currencies
* 39: Outbound message does not fit into a cell after rewriting
* 40: Cannot process a message
* 41: Library reference is null
* 42: Library change action error
* 43: Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree
* 50: Account state size exceeded limits
* 128: Null reference exception
* 129: Invalid serialization prefix
* 130: Invalid incoming message
* 131: Constraints error
* 132: Access denied
* 133: Contract stopped
* 134: Invalid argument
* 135: Code of a contract was not found
* 136: Invalid standard address
* 138: Not a basechain address
* 1310: ToonArtist: unauthorized staging callback
* 1591: ToonArtist: no pending track found for confirmation
* 4429: Invalid sender
* 6995: ToonArtist: stake required for additional tracks
* 14534: Not owner
* 17513: ToonArtist: invalid track contract address
* 18058: ToonArtist: wallet mismatch in confirmation
* 23584: ToonArtist: unauthorized Jetton notification
* 25644: Only ToonVault can mint
* 27429: ToonArtist: only owner can initiate registration
* 33141: ToonArtist: only owner can stake
* 34393: Unauthorized burn notification
* 34415: ToonArtist: only owner can update metadata
* 36510: ToonArtist: only owner can unstake
* 41950: ToonArtist: unauthorized confirmation callback
* 42813: ToonArtist: empty metadata URI
* 44170: ToonArtist: only owner can add tracks
* 54615: Insufficient balance
* 59865: ToonArtist: insufficient stake
* 62589: ToonArtist: only owner can confirm registration

## Trait inheritance diagram

```mermaid
graph TD
ToonJettonMaster
ToonJettonMaster --> BaseTrait
ToonJettonMaster --> Deployable
Deployable --> BaseTrait
```

## Contract dependency diagram

```mermaid
graph TD
ToonJettonMaster
ToonJettonMaster --> ToonJettonWallet
```
# Tact compilation report
Contract: ToonGovernance
BoC Size: 4033 bytes

## Structures (Structs and Messages)
Total structures: 28

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

### StakeToon
TL-B: `stake_toon#4435ea95 amount:coins = StakeToon`
Signature: `StakeToon{amount:coins}`

### UnstakeGovernance
TL-B: `unstake_governance#03686687 amount:coins = UnstakeGovernance`
Signature: `UnstakeGovernance{amount:coins}`

### ProposeParameterUpdate
TL-B: `propose_parameter_update#bba923e1 parameter:^string newValue:uint64 description:^string = ProposeParameterUpdate`
Signature: `ProposeParameterUpdate{parameter:^string,newValue:uint64,description:^string}`

### ProposeAddressUpdate
TL-B: `propose_address_update#59d0887c parameter:^string newAddress:address description:^string = ProposeAddressUpdate`
Signature: `ProposeAddressUpdate{parameter:^string,newAddress:address,description:^string}`

### VoteOnProposal
TL-B: `vote_on_proposal#c4dbca40 proposalId:uint256 support:bool = VoteOnProposal`
Signature: `VoteOnProposal{proposalId:uint256,support:bool}`

### VoteOnAddressProposal
TL-B: `vote_on_address_proposal#7c14af8e proposalId:uint256 support:bool = VoteOnAddressProposal`
Signature: `VoteOnAddressProposal{proposalId:uint256,support:bool}`

### ExecuteProposal
TL-B: `execute_proposal#e47ed13b proposalId:uint256 = ExecuteProposal`
Signature: `ExecuteProposal{proposalId:uint256}`

### ExecuteAddressProposal
TL-B: `execute_address_proposal#81a594dc proposalId:uint256 = ExecuteAddressProposal`
Signature: `ExecuteAddressProposal{proposalId:uint256}`

### Configuration
TL-B: `_ emissionCap:coins minWalletAgeDays:uint32 targetDailyActivity:uint32 rewardBaseActiveListener:coins rewardBaseGrowthAgent:coins rewardBaseArtistLaunch:coins rewardBaseTrendsetter:coins rewardBaseEarlyBeliever:coins rewardBaseDropInvestor:coins decayFactor:uint16 minThreshold:coins antiFarmingCoeff:uint16 = Configuration`
Signature: `Configuration{emissionCap:coins,minWalletAgeDays:uint32,targetDailyActivity:uint32,rewardBaseActiveListener:coins,rewardBaseGrowthAgent:coins,rewardBaseArtistLaunch:coins,rewardBaseTrendsetter:coins,rewardBaseEarlyBeliever:coins,rewardBaseDropInvestor:coins,decayFactor:uint16,minThreshold:coins,antiFarmingCoeff:uint16}`

### SetConfig
TL-B: `set_config#2bd0b755 config:Configuration{emissionCap:coins,minWalletAgeDays:uint32,targetDailyActivity:uint32,rewardBaseActiveListener:coins,rewardBaseGrowthAgent:coins,rewardBaseArtistLaunch:coins,rewardBaseTrendsetter:coins,rewardBaseEarlyBeliever:coins,rewardBaseDropInvestor:coins,decayFactor:uint16,minThreshold:coins,antiFarmingCoeff:uint16} = SetConfig`
Signature: `SetConfig{config:Configuration{emissionCap:coins,minWalletAgeDays:uint32,targetDailyActivity:uint32,rewardBaseActiveListener:coins,rewardBaseGrowthAgent:coins,rewardBaseArtistLaunch:coins,rewardBaseTrendsetter:coins,rewardBaseEarlyBeliever:coins,rewardBaseDropInvestor:coins,decayFactor:uint16,minThreshold:coins,antiFarmingCoeff:uint16}}`

### UpdateMintAuthority
TL-B: `update_mint_authority#787cca54 newAuthority:address = UpdateMintAuthority`
Signature: `UpdateMintAuthority{newAuthority:address}`

### UpdateConfigParam
TL-B: `update_config_param#0e849a55 parameter:^string newValue:uint64 = UpdateConfigParam`
Signature: `UpdateConfigParam{parameter:^string,newValue:uint64}`

### GlobalProposal
TL-B: `_ parameter:^string newValue:uint64 description:^string proposer:address votesFor:coins votesAgainst:coins deadline:uint32 executed:bool = GlobalProposal`
Signature: `GlobalProposal{parameter:^string,newValue:uint64,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}`

### AddressProposal
TL-B: `_ parameter:^string newAddress:address description:^string proposer:address votesFor:coins votesAgainst:coins deadline:uint32 executed:bool = AddressProposal`
Signature: `AddressProposal{parameter:^string,newAddress:address,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}`

### ToonGovernance$Data
TL-B: `_ registry:address vault:address stakes:dict<address, int> totalStaked:coins proposals:dict<int, ^GlobalProposal{parameter:^string,newValue:uint64,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}> nextProposalId:uint256 addressProposals:dict<int, ^AddressProposal{parameter:^string,newAddress:address,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}> nextAddressProposalId:uint256 hasVoted:dict<int, bool> hasVotedAddress:dict<int, bool> = ToonGovernance`
Signature: `ToonGovernance{registry:address,vault:address,stakes:dict<address, int>,totalStaked:coins,proposals:dict<int, ^GlobalProposal{parameter:^string,newValue:uint64,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}>,nextProposalId:uint256,addressProposals:dict<int, ^AddressProposal{parameter:^string,newAddress:address,description:^string,proposer:address,votesFor:coins,votesAgainst:coins,deadline:uint32,executed:bool}>,nextAddressProposalId:uint256,hasVoted:dict<int, bool>,hasVotedAddress:dict<int, bool>}`

## Get methods
Total get methods: 7

## totalStaked
No arguments

## getStake
Argument: voter

## getProposal
Argument: proposalId

## getAddressProposal
Argument: proposalId

## hasAddressVoted
Argument: proposalId
Argument: voter

## hasAddressVotedOnAddressProposal
Argument: proposalId
Argument: voter

## quorumMet
Argument: proposalId

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
* 2999: ToonGovernance: quorum not met
* 9622: ToonGovernance: already executed
* 22462: ToonGovernance: already voted on this proposal
* 26849: ToonGovernance: voting closed
* 33397: ToonGovernance: address proposal does not exist
* 36734: ToonGovernance: unknown numeric parameter
* 37276: ToonGovernance: voting still open
* 39639: ToonGovernance: proposal does not exist
* 53903: ToonGovernance: unknown address parameter
* 61996: ToonGovernance: no voting weight
* 63274: ToonGovernance: insufficient stake
* 63731: ToonGovernance: must stake to propose

## Trait inheritance diagram

```mermaid
graph TD
ToonGovernance
ToonGovernance --> BaseTrait
ToonGovernance --> Deployable
Deployable --> BaseTrait
```

## Contract dependency diagram

```mermaid
graph TD
ToonGovernance
```
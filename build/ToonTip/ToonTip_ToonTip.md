# Tact compilation report
Contract: ToonTip
BoC Size: 970 bytes

## Structures (Structs and Messages)
Total structures: 18

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

### SplitTip
TL-B: `split_tip#c6f13361 targets:dict<int, address> ratios:dict<int, int> count:uint8 = SplitTip`
Signature: `SplitTip{targets:dict<int, address>,ratios:dict<int, int>,count:uint8}`

### CreatePool
TL-B: `create_pool#f3acbb7e trackAddress:address threshold:coins deadline:uint32 = CreatePool`
Signature: `CreatePool{trackAddress:address,threshold:coins,deadline:uint32}`

### ContributeToPool
TL-B: `contribute_to_pool#5a7a500d poolId:uint256 = ContributeToPool`
Signature: `ContributeToPool{poolId:uint256}`

### Pool
TL-B: `_ trackAddress:address targetAmount:coins currentAmount:coins deadline:uint32 completed:bool contributors:dict<int, address> contributorCount:uint16 = Pool`
Signature: `Pool{trackAddress:address,targetAmount:coins,currentAmount:coins,deadline:uint32,completed:bool,contributors:dict<int, address>,contributorCount:uint16}`

### ToonTip$Data
TL-B: `_ registry:address pools:dict<int, ^Pool{trackAddress:address,targetAmount:coins,currentAmount:coins,deadline:uint32,completed:bool,contributors:dict<int, address>,contributorCount:uint16}> nextPoolId:uint256 = ToonTip`
Signature: `ToonTip{registry:address,pools:dict<int, ^Pool{trackAddress:address,targetAmount:coins,currentAmount:coins,deadline:uint32,completed:bool,contributors:dict<int, address>,contributorCount:uint16}>,nextPoolId:uint256}`

## Get methods
Total get methods: 1

## getPool
Argument: poolId

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
* 10958: ToonTip: contribution too small for gas
* 34194: ToonTip: pool deadline passed
* 41869: ToonTip: pool already completed
* 43006: ToonTip: pool does not exist

## Trait inheritance diagram

```mermaid
graph TD
ToonTip
ToonTip --> BaseTrait
ToonTip --> Deployable
Deployable --> BaseTrait
```

## Contract dependency diagram

```mermaid
graph TD
ToonTip
```
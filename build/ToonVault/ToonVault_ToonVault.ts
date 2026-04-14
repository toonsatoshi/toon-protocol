import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type Configuration = {
    $$type: 'Configuration';
    emissionCap: bigint;
    minWalletAgeDays: bigint;
    targetDailyActivity: bigint;
    rewardBaseActiveListener: bigint;
    rewardBaseGrowthAgent: bigint;
    rewardBaseArtistLaunch: bigint;
    rewardBaseTrendsetter: bigint;
    rewardBaseEarlyBeliever: bigint;
    rewardBaseDropInvestor: bigint;
    decayFactor: bigint;
    minThreshold: bigint;
    antiFarmingCoeff: bigint;
}

export function storeConfiguration(src: Configuration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.emissionCap);
        b_0.storeUint(src.minWalletAgeDays, 32);
        b_0.storeUint(src.targetDailyActivity, 32);
        b_0.storeCoins(src.rewardBaseActiveListener);
        b_0.storeCoins(src.rewardBaseGrowthAgent);
        b_0.storeCoins(src.rewardBaseArtistLaunch);
        b_0.storeCoins(src.rewardBaseTrendsetter);
        b_0.storeCoins(src.rewardBaseEarlyBeliever);
        b_0.storeCoins(src.rewardBaseDropInvestor);
        b_0.storeUint(src.decayFactor, 16);
        const b_1 = new Builder();
        b_1.storeCoins(src.minThreshold);
        b_1.storeUint(src.antiFarmingCoeff, 16);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadConfiguration(slice: Slice) {
    const sc_0 = slice;
    const _emissionCap = sc_0.loadCoins();
    const _minWalletAgeDays = sc_0.loadUintBig(32);
    const _targetDailyActivity = sc_0.loadUintBig(32);
    const _rewardBaseActiveListener = sc_0.loadCoins();
    const _rewardBaseGrowthAgent = sc_0.loadCoins();
    const _rewardBaseArtistLaunch = sc_0.loadCoins();
    const _rewardBaseTrendsetter = sc_0.loadCoins();
    const _rewardBaseEarlyBeliever = sc_0.loadCoins();
    const _rewardBaseDropInvestor = sc_0.loadCoins();
    const _decayFactor = sc_0.loadUintBig(16);
    const sc_1 = sc_0.loadRef().beginParse();
    const _minThreshold = sc_1.loadCoins();
    const _antiFarmingCoeff = sc_1.loadUintBig(16);
    return { $$type: 'Configuration' as const, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, rewardBaseActiveListener: _rewardBaseActiveListener, rewardBaseGrowthAgent: _rewardBaseGrowthAgent, rewardBaseArtistLaunch: _rewardBaseArtistLaunch, rewardBaseTrendsetter: _rewardBaseTrendsetter, rewardBaseEarlyBeliever: _rewardBaseEarlyBeliever, rewardBaseDropInvestor: _rewardBaseDropInvestor, decayFactor: _decayFactor, minThreshold: _minThreshold, antiFarmingCoeff: _antiFarmingCoeff };
}

export function loadTupleConfiguration(source: TupleReader) {
    const _emissionCap = source.readBigNumber();
    const _minWalletAgeDays = source.readBigNumber();
    const _targetDailyActivity = source.readBigNumber();
    const _rewardBaseActiveListener = source.readBigNumber();
    const _rewardBaseGrowthAgent = source.readBigNumber();
    const _rewardBaseArtistLaunch = source.readBigNumber();
    const _rewardBaseTrendsetter = source.readBigNumber();
    const _rewardBaseEarlyBeliever = source.readBigNumber();
    const _rewardBaseDropInvestor = source.readBigNumber();
    const _decayFactor = source.readBigNumber();
    const _minThreshold = source.readBigNumber();
    const _antiFarmingCoeff = source.readBigNumber();
    return { $$type: 'Configuration' as const, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, rewardBaseActiveListener: _rewardBaseActiveListener, rewardBaseGrowthAgent: _rewardBaseGrowthAgent, rewardBaseArtistLaunch: _rewardBaseArtistLaunch, rewardBaseTrendsetter: _rewardBaseTrendsetter, rewardBaseEarlyBeliever: _rewardBaseEarlyBeliever, rewardBaseDropInvestor: _rewardBaseDropInvestor, decayFactor: _decayFactor, minThreshold: _minThreshold, antiFarmingCoeff: _antiFarmingCoeff };
}

export function loadGetterTupleConfiguration(source: TupleReader) {
    const _emissionCap = source.readBigNumber();
    const _minWalletAgeDays = source.readBigNumber();
    const _targetDailyActivity = source.readBigNumber();
    const _rewardBaseActiveListener = source.readBigNumber();
    const _rewardBaseGrowthAgent = source.readBigNumber();
    const _rewardBaseArtistLaunch = source.readBigNumber();
    const _rewardBaseTrendsetter = source.readBigNumber();
    const _rewardBaseEarlyBeliever = source.readBigNumber();
    const _rewardBaseDropInvestor = source.readBigNumber();
    const _decayFactor = source.readBigNumber();
    const _minThreshold = source.readBigNumber();
    const _antiFarmingCoeff = source.readBigNumber();
    return { $$type: 'Configuration' as const, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, rewardBaseActiveListener: _rewardBaseActiveListener, rewardBaseGrowthAgent: _rewardBaseGrowthAgent, rewardBaseArtistLaunch: _rewardBaseArtistLaunch, rewardBaseTrendsetter: _rewardBaseTrendsetter, rewardBaseEarlyBeliever: _rewardBaseEarlyBeliever, rewardBaseDropInvestor: _rewardBaseDropInvestor, decayFactor: _decayFactor, minThreshold: _minThreshold, antiFarmingCoeff: _antiFarmingCoeff };
}

export function storeTupleConfiguration(source: Configuration) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.emissionCap);
    builder.writeNumber(source.minWalletAgeDays);
    builder.writeNumber(source.targetDailyActivity);
    builder.writeNumber(source.rewardBaseActiveListener);
    builder.writeNumber(source.rewardBaseGrowthAgent);
    builder.writeNumber(source.rewardBaseArtistLaunch);
    builder.writeNumber(source.rewardBaseTrendsetter);
    builder.writeNumber(source.rewardBaseEarlyBeliever);
    builder.writeNumber(source.rewardBaseDropInvestor);
    builder.writeNumber(source.decayFactor);
    builder.writeNumber(source.minThreshold);
    builder.writeNumber(source.antiFarmingCoeff);
    return builder.build();
}

export function dictValueParserConfiguration(): DictionaryValue<Configuration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfiguration(src)).endCell());
        },
        parse: (src) => {
            return loadConfiguration(src.loadRef().beginParse());
        }
    }
}

export type SetConfig = {
    $$type: 'SetConfig';
    config: Configuration;
}

export function storeSetConfig(src: SetConfig) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(735098709, 32);
        b_0.store(storeConfiguration(src.config));
    };
}

export function loadSetConfig(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 735098709) { throw Error('Invalid prefix'); }
    const _config = loadConfiguration(sc_0);
    return { $$type: 'SetConfig' as const, config: _config };
}

export function loadTupleSetConfig(source: TupleReader) {
    const _config = loadTupleConfiguration(source);
    return { $$type: 'SetConfig' as const, config: _config };
}

export function loadGetterTupleSetConfig(source: TupleReader) {
    const _config = loadGetterTupleConfiguration(source);
    return { $$type: 'SetConfig' as const, config: _config };
}

export function storeTupleSetConfig(source: SetConfig) {
    const builder = new TupleBuilder();
    builder.writeTuple(storeTupleConfiguration(source.config));
    return builder.build();
}

export function dictValueParserSetConfig(): DictionaryValue<SetConfig> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetConfig(src)).endCell());
        },
        parse: (src) => {
            return loadSetConfig(src.loadRef().beginParse());
        }
    }
}

export type ClaimReward = {
    $$type: 'ClaimReward';
    walletAddress: Address;
    rewardId: bigint;
    telegramId: bigint;
    walletAgeDays: bigint;
    hasVibeStreak: boolean;
    tipAmount: bigint;
    claimId: bigint;
    expiry: bigint;
    sigHigh: bigint;
    sigLow: bigint;
    referrerId: bigint;
}

export function storeClaimReward(src: ClaimReward) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4191461259, 32);
        b_0.storeAddress(src.walletAddress);
        b_0.storeUint(src.rewardId, 8);
        b_0.storeUint(src.telegramId, 64);
        b_0.storeUint(src.walletAgeDays, 32);
        b_0.storeBit(src.hasVibeStreak);
        b_0.storeCoins(src.tipAmount);
        b_0.storeUint(src.claimId, 64);
        b_0.storeUint(src.expiry, 32);
        b_0.storeUint(src.sigHigh, 256);
        const b_1 = new Builder();
        b_1.storeUint(src.sigLow, 256);
        b_1.storeUint(src.referrerId, 64);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadClaimReward(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4191461259) { throw Error('Invalid prefix'); }
    const _walletAddress = sc_0.loadAddress();
    const _rewardId = sc_0.loadUintBig(8);
    const _telegramId = sc_0.loadUintBig(64);
    const _walletAgeDays = sc_0.loadUintBig(32);
    const _hasVibeStreak = sc_0.loadBit();
    const _tipAmount = sc_0.loadCoins();
    const _claimId = sc_0.loadUintBig(64);
    const _expiry = sc_0.loadUintBig(32);
    const _sigHigh = sc_0.loadUintBig(256);
    const sc_1 = sc_0.loadRef().beginParse();
    const _sigLow = sc_1.loadUintBig(256);
    const _referrerId = sc_1.loadUintBig(64);
    return { $$type: 'ClaimReward' as const, walletAddress: _walletAddress, rewardId: _rewardId, telegramId: _telegramId, walletAgeDays: _walletAgeDays, hasVibeStreak: _hasVibeStreak, tipAmount: _tipAmount, claimId: _claimId, expiry: _expiry, sigHigh: _sigHigh, sigLow: _sigLow, referrerId: _referrerId };
}

export function loadTupleClaimReward(source: TupleReader) {
    const _walletAddress = source.readAddress();
    const _rewardId = source.readBigNumber();
    const _telegramId = source.readBigNumber();
    const _walletAgeDays = source.readBigNumber();
    const _hasVibeStreak = source.readBoolean();
    const _tipAmount = source.readBigNumber();
    const _claimId = source.readBigNumber();
    const _expiry = source.readBigNumber();
    const _sigHigh = source.readBigNumber();
    const _sigLow = source.readBigNumber();
    const _referrerId = source.readBigNumber();
    return { $$type: 'ClaimReward' as const, walletAddress: _walletAddress, rewardId: _rewardId, telegramId: _telegramId, walletAgeDays: _walletAgeDays, hasVibeStreak: _hasVibeStreak, tipAmount: _tipAmount, claimId: _claimId, expiry: _expiry, sigHigh: _sigHigh, sigLow: _sigLow, referrerId: _referrerId };
}

export function loadGetterTupleClaimReward(source: TupleReader) {
    const _walletAddress = source.readAddress();
    const _rewardId = source.readBigNumber();
    const _telegramId = source.readBigNumber();
    const _walletAgeDays = source.readBigNumber();
    const _hasVibeStreak = source.readBoolean();
    const _tipAmount = source.readBigNumber();
    const _claimId = source.readBigNumber();
    const _expiry = source.readBigNumber();
    const _sigHigh = source.readBigNumber();
    const _sigLow = source.readBigNumber();
    const _referrerId = source.readBigNumber();
    return { $$type: 'ClaimReward' as const, walletAddress: _walletAddress, rewardId: _rewardId, telegramId: _telegramId, walletAgeDays: _walletAgeDays, hasVibeStreak: _hasVibeStreak, tipAmount: _tipAmount, claimId: _claimId, expiry: _expiry, sigHigh: _sigHigh, sigLow: _sigLow, referrerId: _referrerId };
}

export function storeTupleClaimReward(source: ClaimReward) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.walletAddress);
    builder.writeNumber(source.rewardId);
    builder.writeNumber(source.telegramId);
    builder.writeNumber(source.walletAgeDays);
    builder.writeBoolean(source.hasVibeStreak);
    builder.writeNumber(source.tipAmount);
    builder.writeNumber(source.claimId);
    builder.writeNumber(source.expiry);
    builder.writeNumber(source.sigHigh);
    builder.writeNumber(source.sigLow);
    builder.writeNumber(source.referrerId);
    return builder.build();
}

export function dictValueParserClaimReward(): DictionaryValue<ClaimReward> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimReward(src)).endCell());
        },
        parse: (src) => {
            return loadClaimReward(src.loadRef().beginParse());
        }
    }
}

export type MintAuthorized = {
    $$type: 'MintAuthorized';
    recipient: Address;
    amount: bigint;
    authorizedAt: bigint;
}

export function storeMintAuthorized(src: MintAuthorized) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4196209244, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.authorizedAt, 32);
    };
}

export function loadMintAuthorized(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4196209244) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _authorizedAt = sc_0.loadUintBig(32);
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, authorizedAt: _authorizedAt };
}

export function loadTupleMintAuthorized(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _authorizedAt = source.readBigNumber();
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, authorizedAt: _authorizedAt };
}

export function loadGetterTupleMintAuthorized(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _authorizedAt = source.readBigNumber();
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, authorizedAt: _authorizedAt };
}

export function storeTupleMintAuthorized(source: MintAuthorized) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.authorizedAt);
    return builder.build();
}

export function dictValueParserMintAuthorized(): DictionaryValue<MintAuthorized> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintAuthorized(src)).endCell());
        },
        parse: (src) => {
            return loadMintAuthorized(src.loadRef().beginParse());
        }
    }
}

export type RewardClaimed = {
    $$type: 'RewardClaimed';
    rewardId: bigint;
    recipient: Address;
    amount: bigint;
}

export function storeRewardClaimed(src: RewardClaimed) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174965059, 32);
        b_0.storeUint(src.rewardId, 8);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
    };
}

export function loadRewardClaimed(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174965059) { throw Error('Invalid prefix'); }
    const _rewardId = sc_0.loadUintBig(8);
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'RewardClaimed' as const, rewardId: _rewardId, recipient: _recipient, amount: _amount };
}

export function loadTupleRewardClaimed(source: TupleReader) {
    const _rewardId = source.readBigNumber();
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'RewardClaimed' as const, rewardId: _rewardId, recipient: _recipient, amount: _amount };
}

export function loadGetterTupleRewardClaimed(source: TupleReader) {
    const _rewardId = source.readBigNumber();
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'RewardClaimed' as const, rewardId: _rewardId, recipient: _recipient, amount: _amount };
}

export function storeTupleRewardClaimed(source: RewardClaimed) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.rewardId);
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserRewardClaimed(): DictionaryValue<RewardClaimed> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRewardClaimed(src)).endCell());
        },
        parse: (src) => {
            return loadRewardClaimed(src.loadRef().beginParse());
        }
    }
}

export type UpdateReserve = {
    $$type: 'UpdateReserve';
    amount: bigint;
}

export function storeUpdateReserve(src: UpdateReserve) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3723307516, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadUpdateReserve(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3723307516) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'UpdateReserve' as const, amount: _amount };
}

export function loadTupleUpdateReserve(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UpdateReserve' as const, amount: _amount };
}

export function loadGetterTupleUpdateReserve(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UpdateReserve' as const, amount: _amount };
}

export function storeTupleUpdateReserve(source: UpdateReserve) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserUpdateReserve(): DictionaryValue<UpdateReserve> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateReserve(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateReserve(src.loadRef().beginParse());
        }
    }
}

export type UpdateRegistry = {
    $$type: 'UpdateRegistry';
    newRegistry: Address;
}

export function storeUpdateRegistry(src: UpdateRegistry) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(272637735, 32);
        b_0.storeAddress(src.newRegistry);
    };
}

export function loadUpdateRegistry(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 272637735) { throw Error('Invalid prefix'); }
    const _newRegistry = sc_0.loadAddress();
    return { $$type: 'UpdateRegistry' as const, newRegistry: _newRegistry };
}

export function loadTupleUpdateRegistry(source: TupleReader) {
    const _newRegistry = source.readAddress();
    return { $$type: 'UpdateRegistry' as const, newRegistry: _newRegistry };
}

export function loadGetterTupleUpdateRegistry(source: TupleReader) {
    const _newRegistry = source.readAddress();
    return { $$type: 'UpdateRegistry' as const, newRegistry: _newRegistry };
}

export function storeTupleUpdateRegistry(source: UpdateRegistry) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newRegistry);
    return builder.build();
}

export function dictValueParserUpdateRegistry(): DictionaryValue<UpdateRegistry> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateRegistry(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateRegistry(src.loadRef().beginParse());
        }
    }
}

export type SetGovernance = {
    $$type: 'SetGovernance';
    newGovernance: Address;
}

export function storeSetGovernance(src: SetGovernance) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3079187044, 32);
        b_0.storeAddress(src.newGovernance);
    };
}

export function loadSetGovernance(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3079187044) { throw Error('Invalid prefix'); }
    const _newGovernance = sc_0.loadAddress();
    return { $$type: 'SetGovernance' as const, newGovernance: _newGovernance };
}

export function loadTupleSetGovernance(source: TupleReader) {
    const _newGovernance = source.readAddress();
    return { $$type: 'SetGovernance' as const, newGovernance: _newGovernance };
}

export function loadGetterTupleSetGovernance(source: TupleReader) {
    const _newGovernance = source.readAddress();
    return { $$type: 'SetGovernance' as const, newGovernance: _newGovernance };
}

export function storeTupleSetGovernance(source: SetGovernance) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newGovernance);
    return builder.build();
}

export function dictValueParserSetGovernance(): DictionaryValue<SetGovernance> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetGovernance(src)).endCell());
        },
        parse: (src) => {
            return loadSetGovernance(src.loadRef().beginParse());
        }
    }
}

export type SetOracleKey = {
    $$type: 'SetOracleKey';
    newPublicKey: bigint;
}

export function storeSetOracleKey(src: SetOracleKey) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1504480982, 32);
        b_0.storeUint(src.newPublicKey, 256);
    };
}

export function loadSetOracleKey(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1504480982) { throw Error('Invalid prefix'); }
    const _newPublicKey = sc_0.loadUintBig(256);
    return { $$type: 'SetOracleKey' as const, newPublicKey: _newPublicKey };
}

export function loadTupleSetOracleKey(source: TupleReader) {
    const _newPublicKey = source.readBigNumber();
    return { $$type: 'SetOracleKey' as const, newPublicKey: _newPublicKey };
}

export function loadGetterTupleSetOracleKey(source: TupleReader) {
    const _newPublicKey = source.readBigNumber();
    return { $$type: 'SetOracleKey' as const, newPublicKey: _newPublicKey };
}

export function storeTupleSetOracleKey(source: SetOracleKey) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newPublicKey);
    return builder.build();
}

export function dictValueParserSetOracleKey(): DictionaryValue<SetOracleKey> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetOracleKey(src)).endCell());
        },
        parse: (src) => {
            return loadSetOracleKey(src.loadRef().beginParse());
        }
    }
}

export type TreasuryWithdraw = {
    $$type: 'TreasuryWithdraw';
    amount: bigint;
    recipient: Address;
}

export function storeTreasuryWithdraw(src: TreasuryWithdraw) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2043966993, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.recipient);
    };
}

export function loadTreasuryWithdraw(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2043966993) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _recipient = sc_0.loadAddress();
    return { $$type: 'TreasuryWithdraw' as const, amount: _amount, recipient: _recipient };
}

export function loadTupleTreasuryWithdraw(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'TreasuryWithdraw' as const, amount: _amount, recipient: _recipient };
}

export function loadGetterTupleTreasuryWithdraw(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'TreasuryWithdraw' as const, amount: _amount, recipient: _recipient };
}

export function storeTupleTreasuryWithdraw(source: TreasuryWithdraw) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.recipient);
    return builder.build();
}

export function dictValueParserTreasuryWithdraw(): DictionaryValue<TreasuryWithdraw> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTreasuryWithdraw(src)).endCell());
        },
        parse: (src) => {
            return loadTreasuryWithdraw(src.loadRef().beginParse());
        }
    }
}

export type UpdateIdentityWeight = {
    $$type: 'UpdateIdentityWeight';
    wallet: Address;
    weight: bigint;
}

export function storeUpdateIdentityWeight(src: UpdateIdentityWeight) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1618583010, 32);
        b_0.storeAddress(src.wallet);
        b_0.storeInt(src.weight, 257);
    };
}

export function loadUpdateIdentityWeight(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1618583010) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    const _weight = sc_0.loadIntBig(257);
    return { $$type: 'UpdateIdentityWeight' as const, wallet: _wallet, weight: _weight };
}

export function loadTupleUpdateIdentityWeight(source: TupleReader) {
    const _wallet = source.readAddress();
    const _weight = source.readBigNumber();
    return { $$type: 'UpdateIdentityWeight' as const, wallet: _wallet, weight: _weight };
}

export function loadGetterTupleUpdateIdentityWeight(source: TupleReader) {
    const _wallet = source.readAddress();
    const _weight = source.readBigNumber();
    return { $$type: 'UpdateIdentityWeight' as const, wallet: _wallet, weight: _weight };
}

export function storeTupleUpdateIdentityWeight(source: UpdateIdentityWeight) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.weight);
    return builder.build();
}

export function dictValueParserUpdateIdentityWeight(): DictionaryValue<UpdateIdentityWeight> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateIdentityWeight(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateIdentityWeight(src.loadRef().beginParse());
        }
    }
}

export type ToonVault$Data = {
    $$type: 'ToonVault$Data';
    owner: Address;
    registry: Address;
    governance: Address;
    oraclePublicKey: bigint;
    totalReserve: bigint;
    dailyEmitted: bigint;
    lastResetDay: bigint;
    halved: boolean;
    config: Configuration;
    dailyClaimCount: bigint;
    usedClaimIds: Dictionary<bigint, boolean>;
    lastClaimTimestamp: Dictionary<bigint, bigint>;
    claimCounts: Dictionary<bigint, bigint>;
    pairingCounts: Dictionary<bigint, bigint>;
    participantEntropy: Dictionary<bigint, bigint>;
    lastRewardTimestamp: Dictionary<bigint, bigint>;
    identityWeights: Dictionary<Address, bigint>;
    dailyIdentityRewards: Dictionary<bigint, bigint>;
    dailyClusterRewards: Dictionary<bigint, bigint>;
    lifetimeClaimed: Dictionary<bigint, boolean>;
}

export function storeToonVault$Data(src: ToonVault$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.governance);
        const b_1 = new Builder();
        b_1.storeUint(src.oraclePublicKey, 256);
        b_1.storeCoins(src.totalReserve);
        b_1.storeCoins(src.dailyEmitted);
        b_1.storeUint(src.lastResetDay, 32);
        b_1.storeBit(src.halved);
        const b_2 = new Builder();
        b_2.store(storeConfiguration(src.config));
        b_2.storeUint(src.dailyClaimCount, 32);
        b_2.storeDict(src.usedClaimIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_2.storeDict(src.lastClaimTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        const b_3 = new Builder();
        b_3.storeDict(src.claimCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.pairingCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.participantEntropy, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        const b_4 = new Builder();
        b_4.storeDict(src.lastRewardTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.identityWeights, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.dailyIdentityRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4));
        const b_5 = new Builder();
        b_5.storeDict(src.dailyClusterRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4));
        b_5.storeDict(src.lifetimeClaimed, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonVault$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _registry = sc_0.loadAddress();
    const _governance = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _oraclePublicKey = sc_1.loadUintBig(256);
    const _totalReserve = sc_1.loadCoins();
    const _dailyEmitted = sc_1.loadCoins();
    const _lastResetDay = sc_1.loadUintBig(32);
    const _halved = sc_1.loadBit();
    const sc_2 = sc_1.loadRef().beginParse();
    const _config = loadConfiguration(sc_2);
    const _dailyClaimCount = sc_2.loadUintBig(32);
    const _usedClaimIds = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    const _lastClaimTimestamp = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_2);
    const sc_3 = sc_2.loadRef().beginParse();
    const _claimCounts = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const _pairingCounts = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const _participantEntropy = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const sc_4 = sc_3.loadRef().beginParse();
    const _lastRewardTimestamp = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_4);
    const _identityWeights = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_4);
    const _dailyIdentityRewards = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), sc_4);
    const sc_5 = sc_4.loadRef().beginParse();
    const _dailyClusterRewards = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), sc_5);
    const _lifetimeClaimed = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_5);
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, config: _config, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, participantEntropy: _participantEntropy, lastRewardTimestamp: _lastRewardTimestamp, identityWeights: _identityWeights, dailyIdentityRewards: _dailyIdentityRewards, dailyClusterRewards: _dailyClusterRewards, lifetimeClaimed: _lifetimeClaimed };
}

export function loadTupleToonVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _registry = source.readAddress();
    const _governance = source.readAddress();
    const _oraclePublicKey = source.readBigNumber();
    const _totalReserve = source.readBigNumber();
    const _dailyEmitted = source.readBigNumber();
    const _lastResetDay = source.readBigNumber();
    const _halved = source.readBoolean();
    const _config = loadTupleConfiguration(source);
    const _dailyClaimCount = source.readBigNumber();
    const _usedClaimIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastClaimTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pairingCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    source = source.readTuple();
    const _participantEntropy = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lastRewardTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _identityWeights = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _dailyIdentityRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _dailyClusterRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lifetimeClaimed = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, config: _config, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, participantEntropy: _participantEntropy, lastRewardTimestamp: _lastRewardTimestamp, identityWeights: _identityWeights, dailyIdentityRewards: _dailyIdentityRewards, dailyClusterRewards: _dailyClusterRewards, lifetimeClaimed: _lifetimeClaimed };
}

export function loadGetterTupleToonVault$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _registry = source.readAddress();
    const _governance = source.readAddress();
    const _oraclePublicKey = source.readBigNumber();
    const _totalReserve = source.readBigNumber();
    const _dailyEmitted = source.readBigNumber();
    const _lastResetDay = source.readBigNumber();
    const _halved = source.readBoolean();
    const _config = loadGetterTupleConfiguration(source);
    const _dailyClaimCount = source.readBigNumber();
    const _usedClaimIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastClaimTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pairingCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _participantEntropy = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lastRewardTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _identityWeights = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _dailyIdentityRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _dailyClusterRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lifetimeClaimed = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, config: _config, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, participantEntropy: _participantEntropy, lastRewardTimestamp: _lastRewardTimestamp, identityWeights: _identityWeights, dailyIdentityRewards: _dailyIdentityRewards, dailyClusterRewards: _dailyClusterRewards, lifetimeClaimed: _lifetimeClaimed };
}

export function storeTupleToonVault$Data(source: ToonVault$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.registry);
    builder.writeAddress(source.governance);
    builder.writeNumber(source.oraclePublicKey);
    builder.writeNumber(source.totalReserve);
    builder.writeNumber(source.dailyEmitted);
    builder.writeNumber(source.lastResetDay);
    builder.writeBoolean(source.halved);
    builder.writeTuple(storeTupleConfiguration(source.config));
    builder.writeNumber(source.dailyClaimCount);
    builder.writeCell(source.usedClaimIds.size > 0 ? beginCell().storeDictDirect(source.usedClaimIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.lastClaimTimestamp.size > 0 ? beginCell().storeDictDirect(source.lastClaimTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.claimCounts.size > 0 ? beginCell().storeDictDirect(source.claimCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.pairingCounts.size > 0 ? beginCell().storeDictDirect(source.pairingCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.participantEntropy.size > 0 ? beginCell().storeDictDirect(source.participantEntropy, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.lastRewardTimestamp.size > 0 ? beginCell().storeDictDirect(source.lastRewardTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.identityWeights.size > 0 ? beginCell().storeDictDirect(source.identityWeights, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.dailyIdentityRewards.size > 0 ? beginCell().storeDictDirect(source.dailyIdentityRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeCell(source.dailyClusterRewards.size > 0 ? beginCell().storeDictDirect(source.dailyClusterRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeCell(source.lifetimeClaimed.size > 0 ? beginCell().storeDictDirect(source.lifetimeClaimed, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserToonVault$Data(): DictionaryValue<ToonVault$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonVault$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonVault$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonVault_init_args = {
    $$type: 'ToonVault_init_args';
    owner: Address;
    registry: Address;
    governance: Address;
    oraclePublicKey: bigint;
    totalReserve: bigint;
    dailyEmitted: bigint;
    lastResetDay: bigint;
    halved: boolean;
    dailyClaimCount: bigint;
}

function initToonVault_init_args(src: ToonVault_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.governance);
        const b_1 = new Builder();
        b_1.storeInt(src.oraclePublicKey, 257);
        b_1.storeInt(src.totalReserve, 257);
        b_1.storeInt(src.dailyEmitted, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.lastResetDay, 257);
        b_2.storeBit(src.halved);
        b_2.storeInt(src.dailyClaimCount, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function ToonVault_init(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, dailyClaimCount: bigint) {
    const __code = Cell.fromHex('b5ee9c724102810100246100022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9012902027102130201200311020120040f0201200507038db395fb513434800063acbe903e903e9035007420404075c020404075c020404075c0350c3420404075c0348020404075c00c041a441a0419c2745541f8c376cf15c417c3db3c602a2b060104db3c37020120080d020148090b038ba56bda89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e32a2b0a00045615038ba5f5da89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e32a2b0c00045619038dac1c76a268690000c7597d207d207d206a00e8408080eb80408080eb80408080eb806a1868408080eb806900408080eb801808348834083384e8aa83f186ed9e2b882f87b678c02a2b0e0004561c038db4d71da89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e302a2b1000022a038dbae4aed44d0d200018eb2fa40fa40fa40d401d0810101d700810101d700810101d700d430d0810101d700d200810101d7003010691068106709d15507e30ddb3c6ccc6ccc6c7c82a2b12003056165616561656165616561656165616561656165616561602012014240201201522020120161903f5b318fb513434800063acbe903e903e9035007420404075c020404075c020404075c0350c3420404075c0348020404075c00c041a441a0419c2745541f8c344478448044784474447c4474447044784470446c4474446c4468447044684464446c4464446044684460445c4464445c4458446044584454445c445602a2b1701641114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cdb3c57105f0f6cf118014adb3c810101530950334133f40c6fa19401d70030925b6de2206eb395206ef2d080923070e2500201481a1f03f4abe9ed44d0d200018eb2fa40fa40fa40d401d0810101d700810101d700810101d700d430d0810101d700d200810101d7003010691068106709d15507e30d111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711152a2b1b01641114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cdb3c57105f0f6cf11c01f222111f1121111f111e1120111e111d1121111d111c1120111c111b1121111b111a1120111a1119112111191118112011181117112111171116112011161115112111151114112011141113112111131112112011121111112111111110112011100f11210f0e11200e0d11210d0c11200c0b11210b0a11200a1d02fa09112109081120080711210706112006051121050411200403112103021120020111210111208101011122db3c0211200201112101714133f40c6fa19401d70030925b6de26eb3111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118111711191117111611181116111511171115351e007c1114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443003f4a8bced44d0d200018eb2fa40fa40fa40d401d0810101d700810101d700810101d700d430d0810101d700d200810101d7003010691068106709d15507e30d111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611152a2b2001581114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6cf121002e8101012b02714133f40c6fa19401d70030925b6de26eb3038db72ffda89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e302a2b230004561a0201202527038db654bda89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e302a2b2600045616038db7071da89a1a400031d65f481f481f481a803a1020203ae01020203ae01020203ae01a861a1020203ae01a401020203ae006020d220d020ce13a2aa0fc61bb678ae20be1ed9e302a2b280004561704f001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018eb2fa40fa40fa40d401d0810101d700810101d700810101d700d430d0810101d700d200810101d7003010691068106709d15507e30d1120955f0f5f0f5be070561fd74920c21f9731111fd31f1120de218210f9d49f8bbae302212a2b2d6800da6d6d6d6d6d6d6d6d6d6d82202d79883d2000778103e88212540be40082112a05f2008218746a5288008220048c2739500082182e90edd00082180ba43b74002682089896808101f40b11160b0a11150a0911140908111308071112070611110605111005104f103e4d1b55900c02fafa40fa40fa40d401d0d3fffa00fa00d31fd200d430d0db3c0cd31ff404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f40430111c111f111c111c111e111c111c111d111c1115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc571f6c2c00b4111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e01fa5b111efa40d307d33fd31fd200fa00d33fd31fd3ffd430d0d3ffd33f3082009f552ac200932ac1089170e2f2f48200aa5f8d086000000000000000000000000000000000000000000000000000000000000000000452c0c705b3f2f48200ad52547ba9547ba9547ba953ba1129113311291128113211281127113111272e01fc1126113011261125112f11251124112e11241123112d11231122112c11221121112b11211120112a1120111f1133111f111e1132111e111d1131111d111c1130111c111b112f111b111a112e111a1119112d11191118112c11181117112b11171116112a11161115113311151114113211141113113111131112113011122f02fc1111112f11111110112e11100f112d0f0e112c0e0d112b0d0c11340c0b11350bdb3c01112b01f2f481108af823562301bef2f4812bdd298101015625714133f40c6fa19401d70030925b6de26ef2f40881010156237f71216e955b59f45a3098c801cf004133f442e28109e056265616bef2f48165f35627c200f2f4f82330310054c819cb3f500acf1618cb0715cb1f13ca0001fa02cb3fcb1fcb3fc9f900c812cbff12cbffc9d0561df91003fe82015180a904112a19562adb3c561fdb3c810101545a0052304133f40c6fa19401d70030925b6de2206eb38e138140cbf82302206ef2d08081012ca012bef2f49130e2111e111f111e111d111f111d111c111f111c111b111f111b111a111f111a1119111f11191118111f11181117111f11171116111f11161115111f1115323334002c20561abc9e3b571857187020011119010a11189130e2036ac86f00016f8c6d6f8c8b363643a8db3c01db3cdb3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da115e575e02fa1114111f11141113111f11131112111f11121111111f11111110111f11100f111f0f0e111f0e0d111f0d0c111f0c0b111f0b0a111f0a09111f09111f080706554056295621db3c111e111f111e111d111f111d111c111f111c111b111f111b111a111f111a1119111f11191118111f11181117111f11171116111f111635360488c86f00016f8c6d6f8c8b56f6e63653a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c015e5e5e5103f81115111f11151114111f11141113111f11131112111f11121111111f11111110111f11100f111f0f0e111f0e0d111f0d0c111f0c0b111f0b0a111f0a09111f09111f0807065540562adb3c8e1d8200d391218101015622714133f40c6fa19401d70030925b6de26ef2f4dedb3c8200dec9561b22b9f2f470562cc001643738004a5616561ba76482238d7ea4c68000a90420c10b937f571adec21393705719de561892ab00de01fa933056148e58562cc002933056138e4d562cc003933056128e42562cc004933056118e37562cc006933056108e2c562cc00792302f8e22562cc0058e1b30812fae56288218174876e800bef2f45627810320a8812710a904dee2e2e2e2e2e220c200f2e732111e1120111e111d111f111d111c1120111c111b111f111b3901fc111a1120111a1119111f11191118112011181117111f11171116112011161115111f11151114112011141113111f11131112112011121111111f11111110112011100f111f0f0e11200e0d111f0d0c11200c0b111f0b0a11200a09111f090811200807111f070611200605111f050411200403111f030211200201111f013a02fc1120562c5624db3c81010154590052304133f40c6fa19401d70030925b6de26eb38e1c81010154590052304133f40c6fa19401d70030925b6de2206ef2d0809170e2111e1120111e111d111f111d111c1120111c111b111f111b111a1120111a1119111f11191118112011181117111f11171116112011161115111f1115503b04d21114112011141113111f11131112112011121111111f11111110112011100f111f0f0e11200e0d111f0d0c11200c0b111f0b0a11200a09111f090811200807111f070611200605111f050411200403111f030211200201111f011120562edb3ce301562d5630db3c20643c3f4102fc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e11225620db3c1122111f111e111d111c111b111a111911181117111611153d3e0058209130e120c0019730a74b8064a904e020c0029730a7328064a904e0c10a96a7198064a904e0a70a8064a90400181114111311121111111055e004e220925b70e1c86f00016f8c6d6f8c8b5706169723a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c018e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d05e5e5e400144db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da115e03f89130e30d111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e1122562bdb3c111f1126111f111e1125111e111d1124111d42474b01f881010154580052304133f40c6fa19401d70030925b6de26eb38e1c81010154580052304133f40c6fa19401d70030925b6de2206ef2d0809170e2111f1120111f111e1120111e111d1120111d111c1120111c111b1120111b111a1120111a1119112011191118112011181117112011171116112011161115112011154302e41114112011141113112011131112112011121111112011111110112011100f11200f0e11200e0d11200d0c11200c0b11200b0a11200a09112009081120080711200706112006051120050411200403112003021120020111200111245624db3c8101011125a456251049031126030211220244450040209130e120c0019730a7508064a904e0c00296a73c8064a904e0a7288064a90401fc216e955b59f45a3098c801cf004133f442e2111e1122111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10894600141078060710451034413001f098810096a88064a904de111e111f111e111d111f111d111c111f111c111b111f111b111a111f111a1119111f11191118111f11181117111f11171116111f11161115111f11151114111f11141113111f11131112111f11121111111f11111110111f11100f111f0f0e111f0e0d111f0d0c111f0c0b111f0b4802fe0a111f0a09111f09111f0807065540db3c01112001a8812710a904111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd494a004c561493812710e153aa5616bb9430812710e05615812710a801a904208103e8b994308103e8de002810bc10ab109a108910781067105610451034413001f8111c1123111c111b1122111b111a1121111a1119112011191118111f11181117111e11171116111d11161115111c11151114111b11141113111a11131112111911121111111811111110111711100f11160f0e11150e0d11140d0c11130c0b11120b0a11110a09111009108f107e55662207562f07562f0706112f064c02f805112e0504112d0403112c0302112b0201112a01112f5632db3c111e111f111e111d111f111d111c111f111c111b111f111b111a111f111a1119111f11191118111f11181117111f11171116111f11161115111f11151114111f11141113111f11131112111f11121111111f11111110111f11100f111f0f0e111f0e4d5501de5f0981010154590052304133f40c6fa19401d70030925b6de2206eb395206ef2d080923070e220c2649803a76e8064a90403de81010154590052404133f40c6fa19401d70030925b6de2206eb38e15f82301206ef2d080a1c10a9803a7328064a90403de9130e22781010b248101014e01fa4133f40a6fa19401d70030925b6de2206eb395206ef2d08093308064e214a88064a904111f1122111f111e1121111e111d1120111d111c1122111c111b1121111b111a1120111a1119112211191118112111181117112011171116112211161115112111151114112011141113112211131112112111121111112011114f03e61110112211100f11210f0e11200e0d11220d0c11210c0b11200b0a11220a0911210908112008071122070611210605112005041122040311210302112002011122015622011121db3c810101530950334133f40c6fa19401d70030925b6de26e925720e30d810101f8232110461023021123025052530486c86f00016f8c6d6f8c8b4636e743a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c015e5e5e510248db3cdb3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da11575e00488101011121a45621103702112202562359216e955b59f45a3098c801cf004133f442e20401fc216e955b59f45a3098c801cf004133f442e2111c111f111c111b111e111b111a111d111a1119111c11191118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be10ad109c108b107a10691058104754000a103644451303fe0d111f0d0c111f0c0b111f0b0a111f0a09111f09111f08070655405624562adb3c238101012259f40c6fa193fa003092306de26eb38e17238101012259f40c6fa193fa003092306de2206ef2d0809170e28218e8d4a51000215623a021bc99572211215621a111219130e25621c10093705722de01112801562a01112cdb3c565c5f0434c86f00016f8c6d6f8c8b46469643a8db3c02db3c12db3c8b13a85e575e5b0242fa44c88b111801ce028307a0a9380758cb07cbffc9d020db3c01c8cecec9d0db3c58590094c8ce8b20000801cec9d0709421c701b38e2a01d30783069320c2008e1b03aa005323b091a4de03ab0023840fbc9903840fb0811021b203dee8303101e8318307a90c01c8cb07cb07c9d001a08d10105090d1115191d2125292d3135393d4145494d5155595d61656985898d9195999da1a5a9adb1b5b9bdc1c5c9cdd1d5d9dde1e5e8c0c4c8ccd0d4d8dce0e4b57e0c89522d749c2178ae86c21c9d05a009a02d307d307d30703aa0f02aa0712b101b120ab11803fb0aa02523078d7245004ce23ab0b803fb0aa02523078d72401ce23ab05803fb0aa02523078d72401ce03803fb0aa02522078d7245003ce029adb3c018e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da115e5e04d6c86f00016f8c6d6f8c8b464636c3a8db3c038e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d013db3c8b13a8db3c018e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d05e5e5e5d03a4db3c8b13a8db3c018e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da115e5e5e00b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f0302fc5629c2008e4a228101012259f40c6fa193fa003092306de26eb38e17228101012259f40c6fa193fa003092306de2206ef2d0809170e28219d1a94a2000215623a021bc99572201112101a11120915be2de5620c10093705721de1121561aa1562021bc9257209130e2561f820186a0b994561fc2009170e2e30082008db86061000c820186a0572001fe561b5621bef2f4111a561fa11119561fa00aa4810101f82321104b102302112602216e955b59f45a3098c801cf004133f442e28101011125a4562510480311260302112202216e955b59f45a3098c801cf004133f442e28101011127561da0031123030211270201112401206e953059f45a3098c801fa024133f442e211236201fac2008e5322810101561c59f40c6fa193fa003092306de26eb38e1822810101561c59f40c6fa193fa003092306de2206ef2d0809170e281010101561ba010341201111c01206e953059f45a3098c801fa024133f442e20192571ae21117111e11171116111d11161115111c11151114111b11141112111a1112031119036302ea1111111811111110111711100f11160f0e11150e0d11140d0c11130c0b11120b0a11110a09111009108f107e106d105c104b107a1029104807111f071036102504112204031121025620db3c8e1c8101015811227f71216e955b59f45a3098c801cf004133f442e21120925721e2111f5621561fc86465002220c003917f9320c004e292307f92c006e202fc5520821081a355435004cb1f12cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb0071880311220302111f025a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00111a111e111a1119111d11191118111c11186667001e00000000746f6f6e5f726577617264018c1117111b11171116111a11161115111911151114111811141113111711131112111611121111111511111110111411100f11130f0e11120e0d11110d0c11100c553b4300db3c7e04fe8210fa1d125cbae3022182102bd0b755ba8f6c5b6caa3a3a1112db3c3c8200d906f842561dc705f2f4111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711150a11160a091115090811140807111307061112060511110504111004103f4edc106a5535db3c696c7e6d02f85b111efa40fa0030811216f842561fc705f2f482008db8561b22bef2f4111a561aa1728802111c025a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00111c111e111c111b111d111b111a111c111a1119111b11191118111a11186a6b0026000000006d696e745f617574686f72697a656401781117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c7e0060fa00d31fd31ffa00fa00fa00fa00fa00fa00d30fd401d0fa00d30f30102c102b102a102910281027102610251024102303fee0218210dded29fcbae30221821010401f27ba8eea5b571c111dfa40308200cba1f842561ec705f2f4111c111e111c111d111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c6e7e7001fe5b111efa00308200cba1f842561fc705f2f401111901a0111c111e111c111b111d111b111a111c111a1119111b1119111a1117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610356f01084430db3c7e044ee0218210b788aa64bae30221821059ac8ed6bae30221821079d47611bae30221821060799de2ba7173767901fe5b571b111dfa40308200cba1f842561ec705f2f4111c111e111c111b111d111b111c1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012720104db3c7e02fe5b571a111dd3ff308200cba1f842561ec705f2f48120d621c300f2f488c88258c000000000000000000000000101cb67ccc970fb00111c111e111c111b111d111b111a111c111a111b1118111a111811171119111711161118111611151117111511141116111411131115111311121114111211111113111111101112111074750028000000004f7261636c654b6579526f746174656401180f11110f0e11100e551ddb3c7e02f45b111efa00fa40308200cba1f8425620c705f2f482008db8561b23bef2f4111a21a1728803111c0302111c025a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00111c111e111c111b111d111b111a111c111a1119111b11197778001c000000007769746864726177616c01841118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c7e03fce302218210946a98b6bae3025720c000111fc12101111f01b08eda111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3ce05f0f5f0f30f2c0827a7c7e01fc5b111efa40810101d700308200a5b7f842561fc705917f96f8425620c705e2f2f4102381010b59810101216e955b59f4593098c801cf004133f441e2111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411127b015e1111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443302db3c7e01fc5b111ed33f30c8018210aff90f5758cb1fcb3fc9111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10797d015e10681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00db3c7e014ec87f01ca00111f111e111d111c111b111a111911181117111611151114111311121111111055e07f01f001111e01111fce01111c01ce01111a01ce1118c8cbff011117fa02011115fa0201111301cb1f01111101ca00c80c0b11100b10af109e108d0706111006105f104e103d02011110010fdb3c12cb1ff400f40002c8f40013f40013f40003c8f40015f40015f40005c8f40016f40014cd14cdcd12cdcdc9ed5480005050cbfa0219cb1f17cb1f5005fa025003fa0201fa0201fa0201fa0201fa02cb0fc85003fa02cb0fcd14b34a69');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonVault_init_args({ $$type: 'ToonVault_init_args', owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, dailyClaimCount })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonVault_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    1842: { message: "ToonVault: unknown reward ID" },
    2528: { message: "ToonVault: wallet too new" },
    4234: { message: "ToonVault: signed payload has expired" },
    4630: { message: "ToonVault: only registry can authorize minting" },
    8406: { message: "ToonVault: zero oracle key" },
    11229: { message: "ToonVault: claimId already used" },
    12206: { message: "ToonVault: tip too small" },
    16587: { message: "ToonVault: claim cooldown active" },
    26099: { message: "ToonVault: no Telegram identity" },
    36280: { message: "ToonVault: insufficient reserve" },
    40789: { message: "ToonVault: invalid rewardId" },
    42423: { message: "ToonVault: unauthorized identity weight update" },
    43615: { message: "ToonVault: invalid wallet address" },
    44370: { message: "ToonVault: invalid oracle signature" },
    52129: { message: "ToonVault: not owner" },
    54161: { message: "ToonVault: one-time reward already claimed" },
    55558: { message: "ToonVault: only registry can update config" },
    57033: { message: "ToonVault: daily emission cap reached" },
} as const

export const ToonVault_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "ToonVault: unknown reward ID": 1842,
    "ToonVault: wallet too new": 2528,
    "ToonVault: signed payload has expired": 4234,
    "ToonVault: only registry can authorize minting": 4630,
    "ToonVault: zero oracle key": 8406,
    "ToonVault: claimId already used": 11229,
    "ToonVault: tip too small": 12206,
    "ToonVault: claim cooldown active": 16587,
    "ToonVault: no Telegram identity": 26099,
    "ToonVault: insufficient reserve": 36280,
    "ToonVault: invalid rewardId": 40789,
    "ToonVault: unauthorized identity weight update": 42423,
    "ToonVault: invalid wallet address": 43615,
    "ToonVault: invalid oracle signature": 44370,
    "ToonVault: not owner": 52129,
    "ToonVault: one-time reward already claimed": 54161,
    "ToonVault: only registry can update config": 55558,
    "ToonVault: daily emission cap reached": 57033,
} as const

const ToonVault_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Configuration","header":null,"fields":[{"name":"emissionCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minWalletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetDailyActivity","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"rewardBaseActiveListener","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseGrowthAgent","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseArtistLaunch","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseTrendsetter","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseEarlyBeliever","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseDropInvestor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"decayFactor","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minThreshold","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"antiFarmingCoeff","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetConfig","header":735098709,"fields":[{"name":"config","type":{"kind":"simple","type":"Configuration","optional":false}}]},
    {"name":"ClaimReward","header":4191461259,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"rewardId","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"telegramId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"walletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"hasVibeStreak","type":{"kind":"simple","type":"bool","optional":false}},{"name":"tipAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"claimId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"expiry","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"sigHigh","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"sigLow","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"referrerId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"MintAuthorized","header":4196209244,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"authorizedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"RewardClaimed","header":2174965059,"fields":[{"name":"rewardId","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateReserve","header":3723307516,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateRegistry","header":272637735,"fields":[{"name":"newRegistry","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetGovernance","header":3079187044,"fields":[{"name":"newGovernance","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetOracleKey","header":1504480982,"fields":[{"name":"newPublicKey","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TreasuryWithdraw","header":2043966993,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateIdentityWeight","header":1618583010,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"weight","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ToonVault$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"governance","type":{"kind":"simple","type":"address","optional":false}},{"name":"oraclePublicKey","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"totalReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"dailyEmitted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"lastResetDay","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"halved","type":{"kind":"simple","type":"bool","optional":false}},{"name":"config","type":{"kind":"simple","type":"Configuration","optional":false}},{"name":"dailyClaimCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"usedClaimIds","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"lastClaimTimestamp","type":{"kind":"dict","key":"int","value":"int"}},{"name":"claimCounts","type":{"kind":"dict","key":"int","value":"int"}},{"name":"pairingCounts","type":{"kind":"dict","key":"int","value":"int"}},{"name":"participantEntropy","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lastRewardTimestamp","type":{"kind":"dict","key":"int","value":"int"}},{"name":"identityWeights","type":{"kind":"dict","key":"address","value":"int"}},{"name":"dailyIdentityRewards","type":{"kind":"dict","key":"int","value":"uint","valueFormat":"coins"}},{"name":"dailyClusterRewards","type":{"kind":"dict","key":"int","value":"uint","valueFormat":"coins"}},{"name":"lifetimeClaimed","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const ToonVault_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "SetConfig": 735098709,
    "ClaimReward": 4191461259,
    "MintAuthorized": 4196209244,
    "RewardClaimed": 2174965059,
    "UpdateReserve": 3723307516,
    "UpdateRegistry": 272637735,
    "SetGovernance": 3079187044,
    "SetOracleKey": 1504480982,
    "TreasuryWithdraw": 2043966993,
    "UpdateIdentityWeight": 1618583010,
}

const ToonVault_getters: ABIGetter[] = [
    {"name":"totalReserve","methodId":113023,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"dailyEmitted","methodId":70394,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"dailyClaimCount","methodId":75448,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isHalved","methodId":129080,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getConfig","methodId":93770,"arguments":[],"returnType":{"kind":"simple","type":"Configuration","optional":false}},
    {"name":"currentEmissionCap","methodId":119461,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"minWalletAgeDays","methodId":69813,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"effectiveDailyCap","methodId":69207,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"governance","methodId":71736,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"walletClaimCount","methodId":101475,"arguments":[{"name":"rewardId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isOneTimeClaimed","methodId":103401,"arguments":[{"name":"rewardId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"isClaimIdUsed","methodId":103612,"arguments":[{"name":"claimId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const ToonVault_getterMapping: { [key: string]: string } = {
    'totalReserve': 'getTotalReserve',
    'dailyEmitted': 'getDailyEmitted',
    'dailyClaimCount': 'getDailyClaimCount',
    'isHalved': 'getIsHalved',
    'getConfig': 'getGetConfig',
    'currentEmissionCap': 'getCurrentEmissionCap',
    'minWalletAgeDays': 'getMinWalletAgeDays',
    'effectiveDailyCap': 'getEffectiveDailyCap',
    'governance': 'getGovernance',
    'walletClaimCount': 'getWalletClaimCount',
    'isOneTimeClaimed': 'getIsOneTimeClaimed',
    'isClaimIdUsed': 'getIsClaimIdUsed',
}

const ToonVault_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimReward"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintAuthorized"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetConfig"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateReserve"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateRegistry"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetGovernance"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOracleKey"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TreasuryWithdraw"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateIdentityWeight"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export const REWARD_ACTIVE_LISTENER = 1n;
export const REWARD_GROWTH_AGENT = 2n;
export const REWARD_ARTIST_LAUNCH = 3n;
export const REWARD_TRENDSETTER = 4n;
export const REWARD_SUPERFAN = 5n;
export const REWARD_EARLY_BELIEVER = 6n;
export const REWARD_DROP_INVESTOR = 7n;
export const BASE_ACTIVE_LISTENER = 10000000000n;
export const BASE_GROWTH_AGENT = 5000000000n;
export const BASE_ARTIST_LAUNCH = 500000000000n;
export const BASE_TRENDSETTER = 5000000000000n;
export const BASE_EARLY_BELIEVER = 200000000000n;
export const BASE_DROP_INVESTOR = 50000000000n;
export const EMISSION_CAP_CEILING = 500000000000000n;
export const DEFAULT_EMISSION_CAP = 50000000000000n;
export const DEFAULT_MIN_WALLET_AGE = 7n;
export const MAX_NONCE_WINDOW_SECONDS = 300n;
export const RESERVE_HALVE_THRESHOLD = 10n;
export const RESERVE_RECOVER_THRESHOLD = 20n;
export const SUPERFAN_REBATE_BPS = 800n;
export const VIBE_MULTIPLIER_BPS = 150n;
export const CLAIM_COOLDOWN_SECONDS = 300n;

export class ToonVault implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonVault_errors_backward;
    public static readonly opcodes = ToonVault_opcodes;
    
    static async init(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, dailyClaimCount: bigint) {
        return await ToonVault_init(owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, dailyClaimCount);
    }
    
    static async fromInit(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, dailyClaimCount: bigint) {
        const __gen_init = await ToonVault_init(owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, dailyClaimCount);
        const address = contractAddress(0, __gen_init);
        return new ToonVault(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonVault(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonVault_types,
        getters: ToonVault_getters,
        receivers: ToonVault_receivers,
        errors: ToonVault_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | ClaimReward | MintAuthorized | SetConfig | UpdateReserve | UpdateRegistry | SetGovernance | SetOracleKey | TreasuryWithdraw | UpdateIdentityWeight | Deploy) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimReward') {
            body = beginCell().store(storeClaimReward(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintAuthorized') {
            body = beginCell().store(storeMintAuthorized(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetConfig') {
            body = beginCell().store(storeSetConfig(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateReserve') {
            body = beginCell().store(storeUpdateReserve(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateRegistry') {
            body = beginCell().store(storeUpdateRegistry(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetGovernance') {
            body = beginCell().store(storeSetGovernance(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetOracleKey') {
            body = beginCell().store(storeSetOracleKey(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TreasuryWithdraw') {
            body = beginCell().store(storeTreasuryWithdraw(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateIdentityWeight') {
            body = beginCell().store(storeUpdateIdentityWeight(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getTotalReserve(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('totalReserve', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getDailyEmitted(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('dailyEmitted', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getDailyClaimCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('dailyClaimCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsHalved(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isHalved', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetConfig(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getConfig', builder.build())).stack;
        const result = loadGetterTupleConfiguration(source);
        return result;
    }
    
    async getCurrentEmissionCap(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('currentEmissionCap', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getMinWalletAgeDays(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('minWalletAgeDays', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getEffectiveDailyCap(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('effectiveDailyCap', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGovernance(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('governance', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getWalletClaimCount(provider: ContractProvider, rewardId: bigint, wallet: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(rewardId);
        builder.writeAddress(wallet);
        const source = (await provider.get('walletClaimCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsOneTimeClaimed(provider: ContractProvider, rewardId: bigint, wallet: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(rewardId);
        builder.writeAddress(wallet);
        const source = (await provider.get('isOneTimeClaimed', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getIsClaimIdUsed(provider: ContractProvider, claimId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(claimId);
        const source = (await provider.get('isClaimIdUsed', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}
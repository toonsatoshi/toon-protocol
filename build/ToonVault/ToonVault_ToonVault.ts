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

export type UpdateEmissionCap = {
    $$type: 'UpdateEmissionCap';
    newCap: bigint;
}

export function storeUpdateEmissionCap(src: UpdateEmissionCap) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1272424197, 32);
        b_0.storeCoins(src.newCap);
    };
}

export function loadUpdateEmissionCap(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1272424197) { throw Error('Invalid prefix'); }
    const _newCap = sc_0.loadCoins();
    return { $$type: 'UpdateEmissionCap' as const, newCap: _newCap };
}

export function loadTupleUpdateEmissionCap(source: TupleReader) {
    const _newCap = source.readBigNumber();
    return { $$type: 'UpdateEmissionCap' as const, newCap: _newCap };
}

export function loadGetterTupleUpdateEmissionCap(source: TupleReader) {
    const _newCap = source.readBigNumber();
    return { $$type: 'UpdateEmissionCap' as const, newCap: _newCap };
}

export function storeTupleUpdateEmissionCap(source: UpdateEmissionCap) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newCap);
    return builder.build();
}

export function dictValueParserUpdateEmissionCap(): DictionaryValue<UpdateEmissionCap> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateEmissionCap(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateEmissionCap(src.loadRef().beginParse());
        }
    }
}

export type UpdateMinWalletAge = {
    $$type: 'UpdateMinWalletAge';
    newAgeDays: bigint;
}

export function storeUpdateMinWalletAge(src: UpdateMinWalletAge) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3252420305, 32);
        b_0.storeUint(src.newAgeDays, 32);
    };
}

export function loadUpdateMinWalletAge(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3252420305) { throw Error('Invalid prefix'); }
    const _newAgeDays = sc_0.loadUintBig(32);
    return { $$type: 'UpdateMinWalletAge' as const, newAgeDays: _newAgeDays };
}

export function loadTupleUpdateMinWalletAge(source: TupleReader) {
    const _newAgeDays = source.readBigNumber();
    return { $$type: 'UpdateMinWalletAge' as const, newAgeDays: _newAgeDays };
}

export function loadGetterTupleUpdateMinWalletAge(source: TupleReader) {
    const _newAgeDays = source.readBigNumber();
    return { $$type: 'UpdateMinWalletAge' as const, newAgeDays: _newAgeDays };
}

export function storeTupleUpdateMinWalletAge(source: UpdateMinWalletAge) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newAgeDays);
    return builder.build();
}

export function dictValueParserUpdateMinWalletAge(): DictionaryValue<UpdateMinWalletAge> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateMinWalletAge(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateMinWalletAge(src.loadRef().beginParse());
        }
    }
}

export type UpdateTargetActivity = {
    $$type: 'UpdateTargetActivity';
    newTarget: bigint;
}

export function storeUpdateTargetActivity(src: UpdateTargetActivity) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1210882180, 32);
        b_0.storeUint(src.newTarget, 32);
    };
}

export function loadUpdateTargetActivity(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1210882180) { throw Error('Invalid prefix'); }
    const _newTarget = sc_0.loadUintBig(32);
    return { $$type: 'UpdateTargetActivity' as const, newTarget: _newTarget };
}

export function loadTupleUpdateTargetActivity(source: TupleReader) {
    const _newTarget = source.readBigNumber();
    return { $$type: 'UpdateTargetActivity' as const, newTarget: _newTarget };
}

export function loadGetterTupleUpdateTargetActivity(source: TupleReader) {
    const _newTarget = source.readBigNumber();
    return { $$type: 'UpdateTargetActivity' as const, newTarget: _newTarget };
}

export function storeTupleUpdateTargetActivity(source: UpdateTargetActivity) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newTarget);
    return builder.build();
}

export function dictValueParserUpdateTargetActivity(): DictionaryValue<UpdateTargetActivity> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateTargetActivity(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateTargetActivity(src.loadRef().beginParse());
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
    emissionCap: bigint;
    minWalletAgeDays: bigint;
    targetDailyActivity: bigint;
    dailyClaimCount: bigint;
    usedClaimIds: Dictionary<bigint, boolean>;
    lastClaimTimestamp: Dictionary<bigint, bigint>;
    claimCounts: Dictionary<bigint, bigint>;
    pairingCounts: Dictionary<bigint, bigint>;
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
        b_1.storeCoins(src.emissionCap);
        b_1.storeUint(src.minWalletAgeDays, 32);
        b_1.storeUint(src.targetDailyActivity, 32);
        b_1.storeUint(src.dailyClaimCount, 32);
        b_1.storeDict(src.usedClaimIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeDict(src.lastClaimTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.claimCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        const b_2 = new Builder();
        b_2.storeDict(src.pairingCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_2.storeDict(src.lifetimeClaimed, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
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
    const _emissionCap = sc_1.loadCoins();
    const _minWalletAgeDays = sc_1.loadUintBig(32);
    const _targetDailyActivity = sc_1.loadUintBig(32);
    const _dailyClaimCount = sc_1.loadUintBig(32);
    const _usedClaimIds = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _lastClaimTimestamp = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_1);
    const _claimCounts = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _pairingCounts = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_2);
    const _lifetimeClaimed = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, lifetimeClaimed: _lifetimeClaimed };
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
    const _emissionCap = source.readBigNumber();
    const _minWalletAgeDays = source.readBigNumber();
    const _targetDailyActivity = source.readBigNumber();
    const _dailyClaimCount = source.readBigNumber();
    const _usedClaimIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastClaimTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    source = source.readTuple();
    const _claimCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pairingCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lifetimeClaimed = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, lifetimeClaimed: _lifetimeClaimed };
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
    const _emissionCap = source.readBigNumber();
    const _minWalletAgeDays = source.readBigNumber();
    const _targetDailyActivity = source.readBigNumber();
    const _dailyClaimCount = source.readBigNumber();
    const _usedClaimIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _lastClaimTimestamp = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pairingCounts = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lifetimeClaimed = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonVault$Data' as const, owner: _owner, registry: _registry, governance: _governance, oraclePublicKey: _oraclePublicKey, totalReserve: _totalReserve, dailyEmitted: _dailyEmitted, lastResetDay: _lastResetDay, halved: _halved, emissionCap: _emissionCap, minWalletAgeDays: _minWalletAgeDays, targetDailyActivity: _targetDailyActivity, dailyClaimCount: _dailyClaimCount, usedClaimIds: _usedClaimIds, lastClaimTimestamp: _lastClaimTimestamp, claimCounts: _claimCounts, pairingCounts: _pairingCounts, lifetimeClaimed: _lifetimeClaimed };
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
    builder.writeNumber(source.emissionCap);
    builder.writeNumber(source.minWalletAgeDays);
    builder.writeNumber(source.targetDailyActivity);
    builder.writeNumber(source.dailyClaimCount);
    builder.writeCell(source.usedClaimIds.size > 0 ? beginCell().storeDictDirect(source.usedClaimIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.lastClaimTimestamp.size > 0 ? beginCell().storeDictDirect(source.lastClaimTimestamp, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.claimCounts.size > 0 ? beginCell().storeDictDirect(source.claimCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.pairingCounts.size > 0 ? beginCell().storeDictDirect(source.pairingCounts, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
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
    emissionCap: bigint;
    minWalletAgeDays: bigint;
    targetDailyActivity: bigint;
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
        b_2.storeInt(src.emissionCap, 257);
        b_2.storeInt(src.minWalletAgeDays, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.targetDailyActivity, 257);
        b_3.storeInt(src.dailyClaimCount, 257);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function ToonVault_init(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, emissionCap: bigint, minWalletAgeDays: bigint, targetDailyActivity: bigint, dailyClaimCount: bigint) {
    const __code = Cell.fromHex('b5ee9c7241025a010015bd000228ff008e88f4a413f4bcf2c80bed5320e303ed43d901220202710210020148030e020120040602b5b395fb5134348000638efe903e903e9035007434fffe803e8034c7f4803e8034c7f4c7f4c7fd013d013d01350c343d013d010c0384444383844403843bd5c443c44403d543a3a2f6cf033455429b5b5b5b5b78b6cf15c417c3cc6023050104db3c2e020120070c020148080a02b3a56bda89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e63230900022702b3a5f5da89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e63230b00022b02b5ac1c76a268690000c71dfd207d207d206a00e869fffd007d00698fe9007d00698fe98fe98ffa027a027a026a18687a027a021807088887070888070877ab8887888807aa874745ed9e0668aa8536b6b6b6b6f16d9e2b882f8798c0230d00022e02b5b4d71da89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e630230f000225020120111d020120121b020120131502d9b318fb5134348000638efe903e903e9035007434fffe803e8034c7f4803e8034c7f4c7f4c7fd013d013d01350c343d013d010c0384444383844403843bd5c443c44403d543a3a2f6cf033455429b5b5b5b5b7884440444844403c44443c38444038437d54736cf15c417c3cc602314014adb3c810101530450334133f40c6fa19401d70030925b6de2206eb395206ef2d080923070e233020148161902d8abe9ed44d0d200018e3bfa40fa40fa40d401d0d3fffa00fa00d31fd200fa00d31fd31fd31ff404f404f404d430d0f404f404300e11110e0e11100e10ef57110f11100f550e8e8bdb3c0cd1550a6d6d6d6d6de21110111211100f11110f0e11100e10df551cdb3c57105f0f31231702f4221111111311115e3f0e11120e0d11130d0c11120c0b11130b0a11120a09111309081112080711130706111206051113050411120403111303021112020111130111128101011114db3c0211120201111301714133f40c6fa19401d70030925b6de26eb30f11110f0e11100e10df10ce10bd10ac109b108a10792d1800141068105710461035443002cca8bced44d0d200018e3bfa40fa40fa40d401d0d3fffa00fa00d31fd200fa00d31fd31fd31ff404f404f404d430d0f404f404300e11110e0e11100e10ef57110f11100f550e8e8bdb3c0cd1550a6d6d6d6d6de21110111111100f11100f550edb3c57105f0f31231a002e8101012602714133f40c6fa19401d70030925b6de26eb302b5b72ffda89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e630231c00022c0201201e2002b5b654bda89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e630231f00022802b5b7071da89a1a400031c77f481f481f481a803a1a7fff401f401a63fa401f401a63fa63fa63fe809e809e809a861a1e809e808601c22221c1c22201c21deae221e22201eaa1d1d17b67819a2aa14dadadadadbc5b678ae20be1e630232100022903f83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e3bfa40fa40fa40d401d0d3fffa00fa00d31fd200fa00d31fd31fd31ff404f404f404d430d0f404f404300e11110e0e11100e10ef57110f11100f550e8e8bdb3c0cd1550a6d6d6d6d6de21112945f0f5f03e0705611d74920c21fe300212324250080fa40fa40fa40d401d0810101d700810101d700810101d700d430d0810101d700d200810101d700810101d700d430d0810101d700810101d70030109c109b109a000e311111d31f111204f68210f9d49f8bbae302218210fa1d125cba8f5f5b1110fa40fa0030811216f8425611c705f2f482008db853d1bef2f451cca17288102e5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000e11100e551de02182104bd7a705ba2649584a01f85b1110fa40d307d33fd31fd200fa00d33fd31fd3ffd430d0d3ffd33f308200ad522b544b302b544b302b544b302b544b3a541b0b111b1123111b111a1122111a1119112111191118112011181117111f11171116111e11161115111d11151114111c11141113112311131112112211121111112111111110112011102702fe0f111f0f0e111e0e0d111d0d0c11240c0b11250bdb3c01111b01f2f481108af82301111301be01111201f2f4812bdd238101015614714133f40c6fa19401d70030925b6de26ef2f4128101010111127f71216e955b59f45a3098c801cf004133f442e28109e0111425be01111401f2f48165f35614c200f2f4f8238201518028290052c819cb3f500acf1618cb0715cb1f13ca0001fa02cb3fcb1fcb3fc9f900c812cbff12cbffc9d02ff91003fea9040d11110d0c11100c10bf10ae109d108c107b106a10591048103710260511130514433001111701db3c5616db3c81010154550052304133f40c6fa19401d70030925b6de2206eb38e138140cbf82302206ef2d08081012ca012bef2f49130e21110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a2a2b2c001e530bbc98363a3a70520550ba9130e2036ac86f00016f8c6d6f8c8b363643a8db3c01db3cdb3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da113d353d04dc091111091111080706554056155618db3c1110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a09111109111108070655405616db3c8e1d8200d391218101015614714133f40c6fa19401d70030925b6de26ef2f4dedb3c8200dec953d1b9f2f4705618c0012d452e2f0488c86f00016f8c6d6f8c8b56f6e63653a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c013d3d3d340040538ca76482238d7ea4c68000a90420c10b927f3cdec21392703bde2a92ab00de03fe8efa5618c0028e725618c0039a3057158218746a5288008e605618c0049b3057158220048c273950008e4d5618c0069a30571582182e90edd0008e3b5618c0079a30571582180ba43b74008e295618c0058e1d30812fae56168218174876e800bef2f41115810320a8812710a9041115925716e21115e2e2e2e2e30de30d20303132001230571582112a05f20000123057158212540be40002fcc200f2e7321110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a09111109111108070655405617561adb3c81010154540052304133f40c6fa19401d70030925b6de26eb38e1c81010154540052304133f40c6fa19401d70030925b6de2206ef2d0809170e21110111211105e3e0d11110d0c11120c33390486c86f00016f8c6d6f8c8b4636e743a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c013d3d3d340248db3cdb3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da11353d0242fa44c88b111801ce028307a0a9380758cb07cbffc9d020db3c01c8cecec9d0db3c36370094c8ce8b20000801cec9d0709421c701b38e2a01d30783069320c2008e1b03aa005323b091a4de03ab0023840fbc9903840fb0811021b203dee8303101e8318307a90c01c8cb07cb07c9d001a08d10105090d1115191d2125292d3135393d4145494d5155595d61656985898d9195999da1a5a9adb1b5b9bdc1c5c9cdd1d5d9dde1e5e8c0c4c8ccd0d4d8dce0e4b57e0c89522d749c2178ae86c21c9d038009a02d307d307d30703aa0f02aa0712b101b120ab11803fb0aa02523078d7245004ce23ab0b803fb0aa02523078d72401ce23ab05803fb0aa02523078d72401ce03803fb0aa02522078d7245003ce04d00b11110b0a11120a09111109081112080711110706111206051111050411120403111103021112020111110111125619db3c8e9a1110111111100f11100f550e11135612db3c11131111111055e0df1110111211100f11110f0e11100e551d01111801111adb3c20453a3b3e0058209130e120c0019730a74b8064a904e020c0029730a7328064a904e0c10a96a7198064a904e0a70a8064a90404e220925b70e1c86f00016f8c6d6f8c8b5706169723a8db3c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c018e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d03d3d3d3c0144db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da113d00b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f0303ec9130e30d1110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354014111413db3c11142ca1561421bc9257149130e25613820186a0b9945613c2009170e296820186a05714de82008db82d5615bef2f40c5613a10b5613a005a4810101f8232110461023021114023f424401fc81010154530052304133f40c6fa19401d70030925b6de26eb38e1c81010154530052304133f40c6fa19401d70030925b6de2206ef2d0809170e21111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209081112080711120706111206051112050411120403111203021112024001700111120111135613db3c8101011114a456140311150302111402216e955b59f45a3098c801cf004133f442e21110111111100f11100f550e410040209130e120c0019730a7508064a904e0c00296a73c8064a904e0a7288064a90401c698810096a88064a904de1110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a0911110911110807065540db3c01111201a8812710a9041110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103441304300462693812710e1547556bb9430812710e027812710a801a904208103e8b994308103e8de03fe216e955b59f45a3098c801cf004133f442e28101011116a4561610340311170302111502216e955b59f45a3098c801cf004133f442e20d11100d10cf10be10ad108c102b107a1069105810471036454003111103020111130111115612db3c925711e30d111156135613c85520821081a355435004cb1f12cb07ce01fa02c9454647002220c003917f9320c004e292307f92c006e200388101015811127f71216e955b59f45a3098c801cf004133f442e2111002c8c88258c000000000000000000000000101cb67ccc970fb00718803111403021113025a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000c11100c10bf10ae109d55384858001e00000000746f6f6e5f7265776172640026000000006d696e745f617574686f72697a656404e48f5d5b370ffa00308200d243f8422ec705f2f48200b9f121c2009a218221c6bf52634000bb9170e2f2f488c88258c000000000000000000000000101cb67ccc970fb000e11100e10df10ce10bd10ac109b108a107908105710461035443012e0218210c1dbfed1bae302218210482c9884ba4b584c4e002c00000000456d697373696f6e43617055706461746564029a5b360fd31f308200e503f8422ec705f2f48137462181016dbbf2f488c88258c000000000000000000000000101cb67ccc970fb000e11100e10df10ce10bd10ac109b108a1079106807104655134d58002e000000004d696e57616c6c65744167655570646174656404b68f465b350fd31f308200c565f8422ec705f2f488c88258c000000000000000000000000101cb67ccc970fb000e11100e10df10ce10bd10ac109b108a107910681057061035443012e0218210dded29fcbae30221821010401f27ba4f58505100320000000054617267657441637469766974795570646174656400e85b1110fa00308200cba1f8425611c705f2f41ba00e11100e10df10ce10bd0c109b108a107910681057104610354430c87f01ca001111111055e0011110011111ce1ece1cce0ac8cbff5009fa025007fa0215cb1f13ca0001fa02cb1fcb1fcb1ff40012f40012f40002c8f40013f400cdcdc9ed5403fe8e605b3e0ffa40308200da5ff8425610c705f2f40e11100e0f10ce551bc87f01ca001111111055e0011110011111ce1ece1cce0ac8cbff5009fa025007fa0215cb1f13ca0001fa02cb1fcb1fcb1ff40012f40012f40002c8f40013f400cdcdc9ed54e0218210b788aa64bae30221821059ac8ed6bae30221821079d47611ba52535500e65b3d0ffa40308200cba1f8425610c705f2f40e11100e10df0e10bd10ac109b108a10791068105710461035443012c87f01ca001111111055e0011110011111ce1ece1cce0ac8cbff5009fa025007fa0215cb1f13ca0001fa02cb1fcb1fcb1ff40012f40012f40002c8f40013f400cdcdc9ed5402805b3c0fd3ff308200cba1f8425610c705f2f48120d621c300f2f488c88258c000000000000000000000000101cb67ccc970fb000e11100e10df10ce0d10ac551954580028000000004f7261636c654b6579526f746174656404f88f625b1110fa00fa40308200cba1f8425612c705f2f482008db853d2bef2f451c1a17288103e102e5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000e11100e551de0218210946a98b6bae3025712c0001111c12101111101b056585759001c000000007769746864726177616c01ae5b1110d33f30c8018210aff90f5758cb1fcb3fc90f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0058008ac87f01ca001111111055e0011110011111ce1ece1cce0ac8cbff5009fa025007fa0215cb1f13ca0001fa02cb1fcb1fcb1ff40012f40012f40002c8f40013f400cdcdc9ed5400a88e4b0e11100e551dc87f01ca001111111055e0011110011111ce1ece1cce0ac8cbff5009fa025007fa0215cb1f13ca0001fa02cb1fcb1fcb1ff40012f40012f40002c8f40013f400cdcdc9ed54e05f0f5bf2c082aa823480');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonVault_init_args({ $$type: 'ToonVault_init_args', owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, emissionCap, minWalletAgeDays, targetDailyActivity, dailyClaimCount })(builder);
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
    14150: { message: "ToonVault: age > 1-year ceiling" },
    16587: { message: "ToonVault: claim cooldown active" },
    26099: { message: "ToonVault: no Telegram identity" },
    36280: { message: "ToonVault: insufficient reserve" },
    44370: { message: "ToonVault: invalid oracle signature" },
    47601: { message: "ToonVault: cap out of valid range" },
    50533: { message: "ToonVault: only governance can set target activity" },
    52129: { message: "ToonVault: not owner" },
    53827: { message: "ToonVault: only governance can update emission cap" },
    54161: { message: "ToonVault: one-time reward already claimed" },
    55903: { message: "ToonArtist: not owner" },
    57033: { message: "ToonVault: daily emission cap reached" },
    58627: { message: "ToonVault: only governance can update min wallet age" },
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
    "ToonVault: age > 1-year ceiling": 14150,
    "ToonVault: claim cooldown active": 16587,
    "ToonVault: no Telegram identity": 26099,
    "ToonVault: insufficient reserve": 36280,
    "ToonVault: invalid oracle signature": 44370,
    "ToonVault: cap out of valid range": 47601,
    "ToonVault: only governance can set target activity": 50533,
    "ToonVault: not owner": 52129,
    "ToonVault: only governance can update emission cap": 53827,
    "ToonVault: one-time reward already claimed": 54161,
    "ToonArtist: not owner": 55903,
    "ToonVault: daily emission cap reached": 57033,
    "ToonVault: only governance can update min wallet age": 58627,
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
    {"name":"ClaimReward","header":4191461259,"fields":[{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"rewardId","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"telegramId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"walletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"hasVibeStreak","type":{"kind":"simple","type":"bool","optional":false}},{"name":"tipAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"claimId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"expiry","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"sigHigh","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"sigLow","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"referrerId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"MintAuthorized","header":4196209244,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"authorizedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"RewardClaimed","header":2174965059,"fields":[{"name":"rewardId","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateEmissionCap","header":1272424197,"fields":[{"name":"newCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateMinWalletAge","header":3252420305,"fields":[{"name":"newAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"UpdateTargetActivity","header":1210882180,"fields":[{"name":"newTarget","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"UpdateReserve","header":3723307516,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateRegistry","header":272637735,"fields":[{"name":"newRegistry","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetGovernance","header":3079187044,"fields":[{"name":"newGovernance","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetOracleKey","header":1504480982,"fields":[{"name":"newPublicKey","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TreasuryWithdraw","header":2043966993,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ToonVault$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"governance","type":{"kind":"simple","type":"address","optional":false}},{"name":"oraclePublicKey","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"totalReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"dailyEmitted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"lastResetDay","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"halved","type":{"kind":"simple","type":"bool","optional":false}},{"name":"emissionCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minWalletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetDailyActivity","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"dailyClaimCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"usedClaimIds","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"lastClaimTimestamp","type":{"kind":"dict","key":"int","value":"int"}},{"name":"claimCounts","type":{"kind":"dict","key":"int","value":"int"}},{"name":"pairingCounts","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lifetimeClaimed","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const ToonVault_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ClaimReward": 4191461259,
    "MintAuthorized": 4196209244,
    "RewardClaimed": 2174965059,
    "UpdateEmissionCap": 1272424197,
    "UpdateMinWalletAge": 3252420305,
    "UpdateTargetActivity": 1210882180,
    "UpdateReserve": 3723307516,
    "UpdateRegistry": 272637735,
    "SetGovernance": 3079187044,
    "SetOracleKey": 1504480982,
    "TreasuryWithdraw": 2043966993,
}

const ToonVault_getters: ABIGetter[] = [
    {"name":"totalReserve","methodId":113023,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"dailyEmitted","methodId":70394,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"dailyClaimCount","methodId":75448,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isHalved","methodId":129080,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
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
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateEmissionCap"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateMinWalletAge"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateTargetActivity"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateReserve"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateRegistry"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetGovernance"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOracleKey"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TreasuryWithdraw"}},
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
    
    static async init(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, emissionCap: bigint, minWalletAgeDays: bigint, targetDailyActivity: bigint, dailyClaimCount: bigint) {
        return await ToonVault_init(owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, emissionCap, minWalletAgeDays, targetDailyActivity, dailyClaimCount);
    }
    
    static async fromInit(owner: Address, registry: Address, governance: Address, oraclePublicKey: bigint, totalReserve: bigint, dailyEmitted: bigint, lastResetDay: bigint, halved: boolean, emissionCap: bigint, minWalletAgeDays: bigint, targetDailyActivity: bigint, dailyClaimCount: bigint) {
        const __gen_init = await ToonVault_init(owner, registry, governance, oraclePublicKey, totalReserve, dailyEmitted, lastResetDay, halved, emissionCap, minWalletAgeDays, targetDailyActivity, dailyClaimCount);
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | ClaimReward | MintAuthorized | UpdateEmissionCap | UpdateMinWalletAge | UpdateTargetActivity | UpdateReserve | UpdateRegistry | SetGovernance | SetOracleKey | TreasuryWithdraw | Deploy) {
        
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
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateEmissionCap') {
            body = beginCell().store(storeUpdateEmissionCap(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateMinWalletAge') {
            body = beginCell().store(storeUpdateMinWalletAge(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateTargetActivity') {
            body = beginCell().store(storeUpdateTargetActivity(message)).endCell();
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
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

export type SyncParticipation = {
    $$type: 'SyncParticipation';
    fan: Address;
    tipVolume: bigint;
    investmentVolume: bigint;
}

export function storeSyncParticipation(src: SyncParticipation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1457955072, 32);
        b_0.storeAddress(src.fan);
        b_0.storeCoins(src.tipVolume);
        b_0.storeCoins(src.investmentVolume);
    };
}

export function loadSyncParticipation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1457955072) { throw Error('Invalid prefix'); }
    const _fan = sc_0.loadAddress();
    const _tipVolume = sc_0.loadCoins();
    const _investmentVolume = sc_0.loadCoins();
    return { $$type: 'SyncParticipation' as const, fan: _fan, tipVolume: _tipVolume, investmentVolume: _investmentVolume };
}

export function loadTupleSyncParticipation(source: TupleReader) {
    const _fan = source.readAddress();
    const _tipVolume = source.readBigNumber();
    const _investmentVolume = source.readBigNumber();
    return { $$type: 'SyncParticipation' as const, fan: _fan, tipVolume: _tipVolume, investmentVolume: _investmentVolume };
}

export function loadGetterTupleSyncParticipation(source: TupleReader) {
    const _fan = source.readAddress();
    const _tipVolume = source.readBigNumber();
    const _investmentVolume = source.readBigNumber();
    return { $$type: 'SyncParticipation' as const, fan: _fan, tipVolume: _tipVolume, investmentVolume: _investmentVolume };
}

export function storeTupleSyncParticipation(source: SyncParticipation) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.fan);
    builder.writeNumber(source.tipVolume);
    builder.writeNumber(source.investmentVolume);
    return builder.build();
}

export function dictValueParserSyncParticipation(): DictionaryValue<SyncParticipation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSyncParticipation(src)).endCell());
        },
        parse: (src) => {
            return loadSyncParticipation(src.loadRef().beginParse());
        }
    }
}

export type VoteOnProposal = {
    $$type: 'VoteOnProposal';
    proposalId: bigint;
    support: boolean;
}

export function storeVoteOnProposal(src: VoteOnProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3302738496, 32);
        b_0.storeUint(src.proposalId, 256);
        b_0.storeBit(src.support);
    };
}

export function loadVoteOnProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3302738496) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(256);
    const _support = sc_0.loadBit();
    return { $$type: 'VoteOnProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadTupleVoteOnProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadGetterTupleVoteOnProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnProposal' as const, proposalId: _proposalId, support: _support };
}

export function storeTupleVoteOnProposal(source: VoteOnProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    return builder.build();
}

export function dictValueParserVoteOnProposal(): DictionaryValue<VoteOnProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVoteOnProposal(src)).endCell());
        },
        parse: (src) => {
            return loadVoteOnProposal(src.loadRef().beginParse());
        }
    }
}

export type Proposal = {
    $$type: 'Proposal';
    description: string;
    votesFor: bigint;
    votesAgainst: bigint;
    deadline: bigint;
    executed: boolean;
}

export function storeProposal(src: Proposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeStringRefTail(src.description);
        b_0.storeCoins(src.votesFor);
        b_0.storeCoins(src.votesAgainst);
        b_0.storeUint(src.deadline, 32);
        b_0.storeBit(src.executed);
    };
}

export function loadProposal(slice: Slice) {
    const sc_0 = slice;
    const _description = sc_0.loadStringRefTail();
    const _votesFor = sc_0.loadCoins();
    const _votesAgainst = sc_0.loadCoins();
    const _deadline = sc_0.loadUintBig(32);
    const _executed = sc_0.loadBit();
    return { $$type: 'Proposal' as const, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadTupleProposal(source: TupleReader) {
    const _description = source.readString();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'Proposal' as const, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadGetterTupleProposal(source: TupleReader) {
    const _description = source.readString();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'Proposal' as const, description: _description, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function storeTupleProposal(source: Proposal) {
    const builder = new TupleBuilder();
    builder.writeString(source.description);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.deadline);
    builder.writeBoolean(source.executed);
    return builder.build();
}

export function dictValueParserProposal(): DictionaryValue<Proposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposal(src)).endCell());
        },
        parse: (src) => {
            return loadProposal(src.loadRef().beginParse());
        }
    }
}

export type ToonFan$Data = {
    $$type: 'ToonFan$Data';
    artist: Address;
    registry: Address;
    fanPower: Dictionary<Address, bigint>;
    totalFanPower: bigint;
    proposals: Dictionary<bigint, Proposal>;
    nextProposalId: bigint;
}

export function storeToonFan$Data(src: ToonFan$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeAddress(src.registry);
        b_0.storeDict(src.fanPower, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeCoins(src.totalFanPower);
        b_0.storeDict(src.proposals, Dictionary.Keys.BigInt(257), dictValueParserProposal());
        b_0.storeUint(src.nextProposalId, 256);
    };
}

export function loadToonFan$Data(slice: Slice) {
    const sc_0 = slice;
    const _artist = sc_0.loadAddress();
    const _registry = sc_0.loadAddress();
    const _fanPower = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const _totalFanPower = sc_0.loadCoins();
    const _proposals = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserProposal(), sc_0);
    const _nextProposalId = sc_0.loadUintBig(256);
    return { $$type: 'ToonFan$Data' as const, artist: _artist, registry: _registry, fanPower: _fanPower, totalFanPower: _totalFanPower, proposals: _proposals, nextProposalId: _nextProposalId };
}

export function loadTupleToonFan$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _registry = source.readAddress();
    const _fanPower = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalFanPower = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    return { $$type: 'ToonFan$Data' as const, artist: _artist, registry: _registry, fanPower: _fanPower, totalFanPower: _totalFanPower, proposals: _proposals, nextProposalId: _nextProposalId };
}

export function loadGetterTupleToonFan$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _registry = source.readAddress();
    const _fanPower = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalFanPower = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    return { $$type: 'ToonFan$Data' as const, artist: _artist, registry: _registry, fanPower: _fanPower, totalFanPower: _totalFanPower, proposals: _proposals, nextProposalId: _nextProposalId };
}

export function storeTupleToonFan$Data(source: ToonFan$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artist);
    builder.writeAddress(source.registry);
    builder.writeCell(source.fanPower.size > 0 ? beginCell().storeDictDirect(source.fanPower, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.totalFanPower);
    builder.writeCell(source.proposals.size > 0 ? beginCell().storeDictDirect(source.proposals, Dictionary.Keys.BigInt(257), dictValueParserProposal()).endCell() : null);
    builder.writeNumber(source.nextProposalId);
    return builder.build();
}

export function dictValueParserToonFan$Data(): DictionaryValue<ToonFan$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonFan$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonFan$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonFan_init_args = {
    $$type: 'ToonFan_init_args';
    artist: Address;
    registry: Address;
}

function initToonFan_init_args(src: ToonFan_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeAddress(src.registry);
    };
}

async function ToonFan_init(artist: Address, registry: Address) {
    const __code = Cell.fromHex('b5ee9c7241021301000407000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90106020378e00204015dbb406ed44d0d200018e10fa40fa40f404fa00f404d3ff55506c169cfa40fa405902d1016d6d7066e25505db3c6c61803004681010b25028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080e03070015db9a49ed44d0d200018e10fa40fa40f404fa00f404d3ff55506c169cfa40fa405902d1016d6d7066e25505db3c6c61805004e81010b25028101014133f40a6fa19401d70030925b6de2206eb399206ef2d080a70a23bce0307002f630eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e10fa40fa40f404fa00f404d3ff55506c169cfa40fa405902d1016d6d7066e207925f07e025d749c21fe30005f90182f032ca2c0b13694cccfdefd29871eca8792713d250bb4ac78e6a51b0e30c5599cfbae3025f06f2c082071102f005d31f21821056e6a100bae302218210c4dbca40bae302018210946a98b6ba8e55d33f30c8018210aff90f5758cb1fcb3fc910461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055505056ce13cef40001fa02f400cbffc9ed54db31e005080d04fe31fa40fa00fa0030811cd5f84228c705f2f4702581010b258101014133f40a6fa19401d70030925b6de2206eb39631206ef2d0809130e259a05033a122a01381010b542044810101216e955b59f4593098c801cf004133f441e27080408810355a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb08a8a090a0b0c00380000000046616e20546f6b656e73204d696e74656420286d6f636b2900065bcf81001a58cf8680cf8480f400f400cf81004ae2f400c901fb0010355512c87f01ca0055505056ce13cef40001fa02f400cbffc9ed54db3103fc31d3ffd20030268101012359f40d6fa192306ddf206e92306d8e13d0d401d001fa00fa00d31fd20055406c156f05e28200b320216eb3f2f4206ef2d0806f25810ecbf82323bbf2f47081010bf8422b598101014133f40a6fa19401d70030925b6de2206eb39631206ef2d0809130e282009bb821c200f2f406e30f8101010e0f1000065035a000085025a058008a5035c8554004c8ce15cd58fa0201fa0212cb1fca00c9103712206e953059f45a30944133f415e210354403c87f01ca0055505056ce13cef40001fa02f400cbffc9ed54db3101d882008985f84225c705f2f425a48d07d0da185b99d9481c9bde585b1d1e481cdc1b1a5d081c195c98d95b9d1859d9607020f8238208093a80a0700443138101015025c8554004c8ce15cd58fa0201fa0212cb1fca00c910374180206e953059f45a30944133f415e210354403120030c87f01ca0055505056ce13cef40001fa02f400cbffc9ed54339ad3c1');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonFan_init_args({ $$type: 'ToonFan_init_args', artist, registry })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonFan_errors = {
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
    3787: { message: "ToonFan: voting deadline passed" },
    7381: { message: "ToonFan: only artist contract can sync participation" },
    35205: { message: "ToonFan: only artist can create proposals" },
    39864: { message: "ToonFan: no voting weight" },
    45856: { message: "ToonFan: proposal does not exist" },
} as const

export const ToonFan_errors_backward = {
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
    "ToonFan: voting deadline passed": 3787,
    "ToonFan: only artist contract can sync participation": 7381,
    "ToonFan: only artist can create proposals": 35205,
    "ToonFan: no voting weight": 39864,
    "ToonFan: proposal does not exist": 45856,
} as const

const ToonFan_types: ABIType[] = [
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
    {"name":"SyncParticipation","header":1457955072,"fields":[{"name":"fan","type":{"kind":"simple","type":"address","optional":false}},{"name":"tipVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"investmentVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"VoteOnProposal","header":3302738496,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"Proposal","header":null,"fields":[{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"executed","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ToonFan$Data","header":null,"fields":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"fanPower","type":{"kind":"dict","key":"address","value":"int"}},{"name":"totalFanPower","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"proposals","type":{"kind":"dict","key":"int","value":"Proposal","valueFormat":"ref"}},{"name":"nextProposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
]

const ToonFan_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "SyncParticipation": 1457955072,
    "VoteOnProposal": 3302738496,
}

const ToonFan_getters: ABIGetter[] = [
    {"name":"getFanPower","methodId":111622,"arguments":[{"name":"fan","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isTopFan","methodId":121417,"arguments":[{"name":"fan","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const ToonFan_getterMapping: { [key: string]: string } = {
    'getFanPower': 'getGetFanPower',
    'isTopFan': 'getIsTopFan',
}

const ToonFan_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SyncParticipation"}},
    {"receiver":"internal","message":{"kind":"text","text":"CreateProposal: Change Split Percentage"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VoteOnProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonFan implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonFan_errors_backward;
    public static readonly opcodes = ToonFan_opcodes;
    
    static async init(artist: Address, registry: Address) {
        return await ToonFan_init(artist, registry);
    }
    
    static async fromInit(artist: Address, registry: Address) {
        const __gen_init = await ToonFan_init(artist, registry);
        const address = contractAddress(0, __gen_init);
        return new ToonFan(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonFan(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonFan_types,
        getters: ToonFan_getters,
        receivers: ToonFan_receivers,
        errors: ToonFan_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SyncParticipation | "CreateProposal: Change Split Percentage" | VoteOnProposal | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SyncParticipation') {
            body = beginCell().store(storeSyncParticipation(message)).endCell();
        }
        if (message === "CreateProposal: Change Split Percentage") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VoteOnProposal') {
            body = beginCell().store(storeVoteOnProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetFanPower(provider: ContractProvider, fan: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(fan);
        const source = (await provider.get('getFanPower', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsTopFan(provider: ContractProvider, fan: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(fan);
        const source = (await provider.get('isTopFan', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}
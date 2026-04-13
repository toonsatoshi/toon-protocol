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

export type StakeToon = {
    $$type: 'StakeToon';
    amount: bigint;
}

export function storeStakeToon(src: StakeToon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1144384149, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadStakeToon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1144384149) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'StakeToon' as const, amount: _amount };
}

export function loadTupleStakeToon(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'StakeToon' as const, amount: _amount };
}

export function loadGetterTupleStakeToon(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'StakeToon' as const, amount: _amount };
}

export function storeTupleStakeToon(source: StakeToon) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserStakeToon(): DictionaryValue<StakeToon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakeToon(src)).endCell());
        },
        parse: (src) => {
            return loadStakeToon(src.loadRef().beginParse());
        }
    }
}

export type UnstakeGovernance = {
    $$type: 'UnstakeGovernance';
    amount: bigint;
}

export function storeUnstakeGovernance(src: UnstakeGovernance) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(57173639, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadUnstakeGovernance(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 57173639) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'UnstakeGovernance' as const, amount: _amount };
}

export function loadTupleUnstakeGovernance(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UnstakeGovernance' as const, amount: _amount };
}

export function loadGetterTupleUnstakeGovernance(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UnstakeGovernance' as const, amount: _amount };
}

export function storeTupleUnstakeGovernance(source: UnstakeGovernance) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserUnstakeGovernance(): DictionaryValue<UnstakeGovernance> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnstakeGovernance(src)).endCell());
        },
        parse: (src) => {
            return loadUnstakeGovernance(src.loadRef().beginParse());
        }
    }
}

export type ProposeParameterUpdate = {
    $$type: 'ProposeParameterUpdate';
    parameter: string;
    newValue: bigint;
    description: string;
}

export function storeProposeParameterUpdate(src: ProposeParameterUpdate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3148424161, 32);
        b_0.storeStringRefTail(src.parameter);
        b_0.storeUint(src.newValue, 64);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadProposeParameterUpdate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3148424161) { throw Error('Invalid prefix'); }
    const _parameter = sc_0.loadStringRefTail();
    const _newValue = sc_0.loadUintBig(64);
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'ProposeParameterUpdate' as const, parameter: _parameter, newValue: _newValue, description: _description };
}

export function loadTupleProposeParameterUpdate(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    const _description = source.readString();
    return { $$type: 'ProposeParameterUpdate' as const, parameter: _parameter, newValue: _newValue, description: _description };
}

export function loadGetterTupleProposeParameterUpdate(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    const _description = source.readString();
    return { $$type: 'ProposeParameterUpdate' as const, parameter: _parameter, newValue: _newValue, description: _description };
}

export function storeTupleProposeParameterUpdate(source: ProposeParameterUpdate) {
    const builder = new TupleBuilder();
    builder.writeString(source.parameter);
    builder.writeNumber(source.newValue);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserProposeParameterUpdate(): DictionaryValue<ProposeParameterUpdate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposeParameterUpdate(src)).endCell());
        },
        parse: (src) => {
            return loadProposeParameterUpdate(src.loadRef().beginParse());
        }
    }
}

export type ProposeAddressUpdate = {
    $$type: 'ProposeAddressUpdate';
    parameter: string;
    newAddress: Address;
    description: string;
}

export function storeProposeAddressUpdate(src: ProposeAddressUpdate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1506838652, 32);
        b_0.storeStringRefTail(src.parameter);
        b_0.storeAddress(src.newAddress);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadProposeAddressUpdate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1506838652) { throw Error('Invalid prefix'); }
    const _parameter = sc_0.loadStringRefTail();
    const _newAddress = sc_0.loadAddress();
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'ProposeAddressUpdate' as const, parameter: _parameter, newAddress: _newAddress, description: _description };
}

export function loadTupleProposeAddressUpdate(source: TupleReader) {
    const _parameter = source.readString();
    const _newAddress = source.readAddress();
    const _description = source.readString();
    return { $$type: 'ProposeAddressUpdate' as const, parameter: _parameter, newAddress: _newAddress, description: _description };
}

export function loadGetterTupleProposeAddressUpdate(source: TupleReader) {
    const _parameter = source.readString();
    const _newAddress = source.readAddress();
    const _description = source.readString();
    return { $$type: 'ProposeAddressUpdate' as const, parameter: _parameter, newAddress: _newAddress, description: _description };
}

export function storeTupleProposeAddressUpdate(source: ProposeAddressUpdate) {
    const builder = new TupleBuilder();
    builder.writeString(source.parameter);
    builder.writeAddress(source.newAddress);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserProposeAddressUpdate(): DictionaryValue<ProposeAddressUpdate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposeAddressUpdate(src)).endCell());
        },
        parse: (src) => {
            return loadProposeAddressUpdate(src.loadRef().beginParse());
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

export type VoteOnAddressProposal = {
    $$type: 'VoteOnAddressProposal';
    proposalId: bigint;
    support: boolean;
}

export function storeVoteOnAddressProposal(src: VoteOnAddressProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2081730446, 32);
        b_0.storeUint(src.proposalId, 256);
        b_0.storeBit(src.support);
    };
}

export function loadVoteOnAddressProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2081730446) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(256);
    const _support = sc_0.loadBit();
    return { $$type: 'VoteOnAddressProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadTupleVoteOnAddressProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnAddressProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadGetterTupleVoteOnAddressProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnAddressProposal' as const, proposalId: _proposalId, support: _support };
}

export function storeTupleVoteOnAddressProposal(source: VoteOnAddressProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    return builder.build();
}

export function dictValueParserVoteOnAddressProposal(): DictionaryValue<VoteOnAddressProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVoteOnAddressProposal(src)).endCell());
        },
        parse: (src) => {
            return loadVoteOnAddressProposal(src.loadRef().beginParse());
        }
    }
}

export type ExecuteProposal = {
    $$type: 'ExecuteProposal';
    proposalId: bigint;
}

export function storeExecuteProposal(src: ExecuteProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3833516347, 32);
        b_0.storeUint(src.proposalId, 256);
    };
}

export function loadExecuteProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3833516347) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(256);
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadGetterTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function storeTupleExecuteProposal(source: ExecuteProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    return builder.build();
}

export function dictValueParserExecuteProposal(): DictionaryValue<ExecuteProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeExecuteProposal(src)).endCell());
        },
        parse: (src) => {
            return loadExecuteProposal(src.loadRef().beginParse());
        }
    }
}

export type ExecuteAddressProposal = {
    $$type: 'ExecuteAddressProposal';
    proposalId: bigint;
}

export function storeExecuteAddressProposal(src: ExecuteAddressProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2175112412, 32);
        b_0.storeUint(src.proposalId, 256);
    };
}

export function loadExecuteAddressProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2175112412) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(256);
    return { $$type: 'ExecuteAddressProposal' as const, proposalId: _proposalId };
}

export function loadTupleExecuteAddressProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteAddressProposal' as const, proposalId: _proposalId };
}

export function loadGetterTupleExecuteAddressProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteAddressProposal' as const, proposalId: _proposalId };
}

export function storeTupleExecuteAddressProposal(source: ExecuteAddressProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    return builder.build();
}

export function dictValueParserExecuteAddressProposal(): DictionaryValue<ExecuteAddressProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeExecuteAddressProposal(src)).endCell());
        },
        parse: (src) => {
            return loadExecuteAddressProposal(src.loadRef().beginParse());
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

export type UpdateMintAuthority = {
    $$type: 'UpdateMintAuthority';
    newAuthority: Address;
}

export function storeUpdateMintAuthority(src: UpdateMintAuthority) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2021444180, 32);
        b_0.storeAddress(src.newAuthority);
    };
}

export function loadUpdateMintAuthority(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2021444180) { throw Error('Invalid prefix'); }
    const _newAuthority = sc_0.loadAddress();
    return { $$type: 'UpdateMintAuthority' as const, newAuthority: _newAuthority };
}

export function loadTupleUpdateMintAuthority(source: TupleReader) {
    const _newAuthority = source.readAddress();
    return { $$type: 'UpdateMintAuthority' as const, newAuthority: _newAuthority };
}

export function loadGetterTupleUpdateMintAuthority(source: TupleReader) {
    const _newAuthority = source.readAddress();
    return { $$type: 'UpdateMintAuthority' as const, newAuthority: _newAuthority };
}

export function storeTupleUpdateMintAuthority(source: UpdateMintAuthority) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newAuthority);
    return builder.build();
}

export function dictValueParserUpdateMintAuthority(): DictionaryValue<UpdateMintAuthority> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateMintAuthority(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateMintAuthority(src.loadRef().beginParse());
        }
    }
}

export type UpdateConfigParam = {
    $$type: 'UpdateConfigParam';
    parameter: string;
    newValue: bigint;
}

export function storeUpdateConfigParam(src: UpdateConfigParam) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(243571285, 32);
        b_0.storeStringRefTail(src.parameter);
        b_0.storeUint(src.newValue, 64);
    };
}

export function loadUpdateConfigParam(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 243571285) { throw Error('Invalid prefix'); }
    const _parameter = sc_0.loadStringRefTail();
    const _newValue = sc_0.loadUintBig(64);
    return { $$type: 'UpdateConfigParam' as const, parameter: _parameter, newValue: _newValue };
}

export function loadTupleUpdateConfigParam(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    return { $$type: 'UpdateConfigParam' as const, parameter: _parameter, newValue: _newValue };
}

export function loadGetterTupleUpdateConfigParam(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    return { $$type: 'UpdateConfigParam' as const, parameter: _parameter, newValue: _newValue };
}

export function storeTupleUpdateConfigParam(source: UpdateConfigParam) {
    const builder = new TupleBuilder();
    builder.writeString(source.parameter);
    builder.writeNumber(source.newValue);
    return builder.build();
}

export function dictValueParserUpdateConfigParam(): DictionaryValue<UpdateConfigParam> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateConfigParam(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateConfigParam(src.loadRef().beginParse());
        }
    }
}

export type GlobalProposal = {
    $$type: 'GlobalProposal';
    parameter: string;
    newValue: bigint;
    description: string;
    proposer: Address;
    votesFor: bigint;
    votesAgainst: bigint;
    deadline: bigint;
    executed: boolean;
}

export function storeGlobalProposal(src: GlobalProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeStringRefTail(src.parameter);
        b_0.storeUint(src.newValue, 64);
        b_0.storeStringRefTail(src.description);
        b_0.storeAddress(src.proposer);
        b_0.storeCoins(src.votesFor);
        b_0.storeCoins(src.votesAgainst);
        b_0.storeUint(src.deadline, 32);
        b_0.storeBit(src.executed);
    };
}

export function loadGlobalProposal(slice: Slice) {
    const sc_0 = slice;
    const _parameter = sc_0.loadStringRefTail();
    const _newValue = sc_0.loadUintBig(64);
    const _description = sc_0.loadStringRefTail();
    const _proposer = sc_0.loadAddress();
    const _votesFor = sc_0.loadCoins();
    const _votesAgainst = sc_0.loadCoins();
    const _deadline = sc_0.loadUintBig(32);
    const _executed = sc_0.loadBit();
    return { $$type: 'GlobalProposal' as const, parameter: _parameter, newValue: _newValue, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadTupleGlobalProposal(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    const _description = source.readString();
    const _proposer = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'GlobalProposal' as const, parameter: _parameter, newValue: _newValue, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadGetterTupleGlobalProposal(source: TupleReader) {
    const _parameter = source.readString();
    const _newValue = source.readBigNumber();
    const _description = source.readString();
    const _proposer = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'GlobalProposal' as const, parameter: _parameter, newValue: _newValue, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function storeTupleGlobalProposal(source: GlobalProposal) {
    const builder = new TupleBuilder();
    builder.writeString(source.parameter);
    builder.writeNumber(source.newValue);
    builder.writeString(source.description);
    builder.writeAddress(source.proposer);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.deadline);
    builder.writeBoolean(source.executed);
    return builder.build();
}

export function dictValueParserGlobalProposal(): DictionaryValue<GlobalProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGlobalProposal(src)).endCell());
        },
        parse: (src) => {
            return loadGlobalProposal(src.loadRef().beginParse());
        }
    }
}

export type AddressProposal = {
    $$type: 'AddressProposal';
    parameter: string;
    newAddress: Address;
    description: string;
    proposer: Address;
    votesFor: bigint;
    votesAgainst: bigint;
    deadline: bigint;
    executed: boolean;
}

export function storeAddressProposal(src: AddressProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeStringRefTail(src.parameter);
        b_0.storeAddress(src.newAddress);
        b_0.storeStringRefTail(src.description);
        b_0.storeAddress(src.proposer);
        b_0.storeCoins(src.votesFor);
        b_0.storeCoins(src.votesAgainst);
        b_0.storeUint(src.deadline, 32);
        b_0.storeBit(src.executed);
    };
}

export function loadAddressProposal(slice: Slice) {
    const sc_0 = slice;
    const _parameter = sc_0.loadStringRefTail();
    const _newAddress = sc_0.loadAddress();
    const _description = sc_0.loadStringRefTail();
    const _proposer = sc_0.loadAddress();
    const _votesFor = sc_0.loadCoins();
    const _votesAgainst = sc_0.loadCoins();
    const _deadline = sc_0.loadUintBig(32);
    const _executed = sc_0.loadBit();
    return { $$type: 'AddressProposal' as const, parameter: _parameter, newAddress: _newAddress, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadTupleAddressProposal(source: TupleReader) {
    const _parameter = source.readString();
    const _newAddress = source.readAddress();
    const _description = source.readString();
    const _proposer = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'AddressProposal' as const, parameter: _parameter, newAddress: _newAddress, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function loadGetterTupleAddressProposal(source: TupleReader) {
    const _parameter = source.readString();
    const _newAddress = source.readAddress();
    const _description = source.readString();
    const _proposer = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _executed = source.readBoolean();
    return { $$type: 'AddressProposal' as const, parameter: _parameter, newAddress: _newAddress, description: _description, proposer: _proposer, votesFor: _votesFor, votesAgainst: _votesAgainst, deadline: _deadline, executed: _executed };
}

export function storeTupleAddressProposal(source: AddressProposal) {
    const builder = new TupleBuilder();
    builder.writeString(source.parameter);
    builder.writeAddress(source.newAddress);
    builder.writeString(source.description);
    builder.writeAddress(source.proposer);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.deadline);
    builder.writeBoolean(source.executed);
    return builder.build();
}

export function dictValueParserAddressProposal(): DictionaryValue<AddressProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddressProposal(src)).endCell());
        },
        parse: (src) => {
            return loadAddressProposal(src.loadRef().beginParse());
        }
    }
}

export type ToonGovernance$Data = {
    $$type: 'ToonGovernance$Data';
    registry: Address;
    vault: Address;
    stakes: Dictionary<Address, bigint>;
    totalStaked: bigint;
    proposals: Dictionary<bigint, GlobalProposal>;
    nextProposalId: bigint;
    addressProposals: Dictionary<bigint, AddressProposal>;
    nextAddressProposalId: bigint;
    hasVoted: Dictionary<bigint, boolean>;
    hasVotedAddress: Dictionary<bigint, boolean>;
}

export function storeToonGovernance$Data(src: ToonGovernance$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.vault);
        b_0.storeDict(src.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeCoins(src.totalStaked);
        b_0.storeDict(src.proposals, Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal());
        b_0.storeUint(src.nextProposalId, 256);
        const b_1 = new Builder();
        b_1.storeDict(src.addressProposals, Dictionary.Keys.BigInt(257), dictValueParserAddressProposal());
        b_1.storeUint(src.nextAddressProposalId, 256);
        b_1.storeDict(src.hasVoted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeDict(src.hasVotedAddress, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonGovernance$Data(slice: Slice) {
    const sc_0 = slice;
    const _registry = sc_0.loadAddress();
    const _vault = sc_0.loadAddress();
    const _stakes = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const _totalStaked = sc_0.loadCoins();
    const _proposals = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal(), sc_0);
    const _nextProposalId = sc_0.loadUintBig(256);
    const sc_1 = sc_0.loadRef().beginParse();
    const _addressProposals = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserAddressProposal(), sc_1);
    const _nextAddressProposalId = sc_1.loadUintBig(256);
    const _hasVoted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _hasVotedAddress = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, addressProposals: _addressProposals, nextAddressProposalId: _nextAddressProposalId, hasVoted: _hasVoted, hasVotedAddress: _hasVotedAddress };
}

export function loadTupleToonGovernance$Data(source: TupleReader) {
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalStaked = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    const _addressProposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserAddressProposal(), source.readCellOpt());
    const _nextAddressProposalId = source.readBigNumber();
    const _hasVoted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _hasVotedAddress = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, addressProposals: _addressProposals, nextAddressProposalId: _nextAddressProposalId, hasVoted: _hasVoted, hasVotedAddress: _hasVotedAddress };
}

export function loadGetterTupleToonGovernance$Data(source: TupleReader) {
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalStaked = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    const _addressProposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserAddressProposal(), source.readCellOpt());
    const _nextAddressProposalId = source.readBigNumber();
    const _hasVoted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _hasVotedAddress = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, addressProposals: _addressProposals, nextAddressProposalId: _nextAddressProposalId, hasVoted: _hasVoted, hasVotedAddress: _hasVotedAddress };
}

export function storeTupleToonGovernance$Data(source: ToonGovernance$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.registry);
    builder.writeAddress(source.vault);
    builder.writeCell(source.stakes.size > 0 ? beginCell().storeDictDirect(source.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.totalStaked);
    builder.writeCell(source.proposals.size > 0 ? beginCell().storeDictDirect(source.proposals, Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal()).endCell() : null);
    builder.writeNumber(source.nextProposalId);
    builder.writeCell(source.addressProposals.size > 0 ? beginCell().storeDictDirect(source.addressProposals, Dictionary.Keys.BigInt(257), dictValueParserAddressProposal()).endCell() : null);
    builder.writeNumber(source.nextAddressProposalId);
    builder.writeCell(source.hasVoted.size > 0 ? beginCell().storeDictDirect(source.hasVoted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.hasVotedAddress.size > 0 ? beginCell().storeDictDirect(source.hasVotedAddress, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserToonGovernance$Data(): DictionaryValue<ToonGovernance$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonGovernance$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonGovernance$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonGovernance_init_args = {
    $$type: 'ToonGovernance_init_args';
    registry: Address;
    vault: Address;
}

function initToonGovernance_init_args(src: ToonGovernance_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.vault);
    };
}

async function ToonGovernance_init(registry: Address, vault: Address) {
    const __code = Cell.fromHex('b5ee9c7241023a01000fb5000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90115020271020d020120030501bfb812ced44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25509db3c6ca1206e92306d99206ef2d0806f286f08e2206e92306dde8040062810101250259f40d6fa192306ddf206e92306d8e1bd0d401d001fa40d401d001fa40fa00fa00d31fd20055706c186f08e2020148060b020158070901bea86fed44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25509db3c6ca1206e92306d99206ef2d0806f286f08e2206e92306dde080062810101270259f40d6fa192306ddf206e92306d8e1bd0d401d001d33fd401d001fa40fa00fa00d31fd20055706c186f08e20192aae6ed44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25519db3c6ca10a0132db3c8101012202714133f40c6fa19401d70030925b6de26eb32b018fb36a3b51343480006388be903e903d013e803500743d0134fffd0134fffd013d010c041a841a441a0419db06a3853e903e901640b4405b5b5b5b5b5c151801815410f8b6cf1b28600c0002260201200e130201c70f110192aa84ed44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25519db3c6ca1100132db3c8101012302714133f40c6fa19401d70030925b6de26eb32b0192a8d0ed44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25509db3c6ca1120180810101270259f40d6fa192306ddf206e92306d8e1bd0d401d001d33fd401d001fa40fa00fa00d31fd20055706c186f08e2206e923070e0206ef2d0806f28db3c360193bb7cced44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e25509db3c6ca1814004881010b29028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e203f23001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e22fa40fa40f404fa00d401d0f404d3fff404d3fff404f40430106a1069106810676c1a8e14fa40fa405902d1016d6d6d6d6d70546006055043e20b925f0be009d70d1ff2e0822182104435ea95bae30221820b686687bae3022116181d01b031fa003081010bf84228598101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e281010bf8425123a0103912810101216e955b59f4593098c801cf004133f441e25056a01079106810570610354403170054c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5404fe31fa003081010bf84228598101014133f40a6fa19401d70030925b6de28200f72a216eb39821206ef2d08023be9170e2f2f4206ef2d08021a181010bf842103958810101216e955b59f4593098c801cf004133f441e25056a1f842708040885a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb08a8ae2191a1b1c002400000000556e7374616b65642024544f4f4e00065bcf81001a58cf8680cf8480f400f400cf810076f400c901fb001079106810570610354403c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed54044a8210bba923e1bae302218210c4dbca40bae302218210e47ed13bbae30221821059d0887cba1e20232601f831d401d001d33fd430d081010bf8422a598101014133f40a6fa19401d70030925b6de28200f8f3216eb39801206ef2d080c200923170e2f2f482008f7e8bb656d697373696f6e4361708524001f90101f901ba917f8e178bc6d696e57616c6c65744167658524001f90101f901bae2f2f425a4810101f8427020f8231f00dc8208127500a010685e3470c8557007c8ce18cd15cb3f03c8ce13cdce01fa0201fa0212cb1fca00c9103615206e953059f45a30944133f415e21079106810571046443512c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5402fc31d3ffd20030258101012359f40d6fa192306ddf206e92306d8e1bd0d401d001d33fd401d001fa40fa00fa00d31fd20055706c186f08e282009ad7216eb3f2f4206ef2d0806f288168e1f82323bbf2f481259621b3f2f481010bf8425611598101014133f40a6fa19401d70030925b6de28200f22c216eb39170e30df2f4292102faf8420a11130a091112090811110807111007106f105e104d103c021114020111150152b0db3c8157be2381010123714133f40c6fa19401d70030925b6de26ef2f412810101017f71216e955b59f45a3098c801cf004133f442e21112991113206ef2d0801ca09b1113206ef2d0801ba00a0be2106f105e104d103c50a22b2200d681010111121ac8557007c8ce18cd15cb3f03c8ce13cdce01fa0201fa0212cb1fca00c910364bb0206e953059f45a30944133f415e2108910681057104650550304c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5401fa31d3ff30248101012259f40d6fa192306ddf206e92306d8e1bd0d401d001d33fd401d001fa40fa00fa00d31fd20055706c186f08e282009ad7216eb3f2f4206ef2d0806f288200919cf82323bcf2f481259621b3f2f454776554776527810bb7081111111811111110111711100f11160f0e11150e0d11140d0c11130c2402fa0b11120b0a11180a0911190908111a08db3c01111301f2f47f810101c856100756100706111006105f104e03111403111550e2557007c8ce18cd15cb3f03c8ce13cdce01fa0201fa0212cb1fca00c94c301b206e953059f45a30944133f415e27008804008c85982100e849a555003cb1f01c8cecdcb3fc92349135088362500d05a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000910481067144330c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5403f88eee31d401d001fa40d430d081010bf8422a598101014133f40a6fa19401d70030925b6de28200f8f3216eb39801206ef2d080c200923170e2f2f48200d28f8bd6d696e74417574686f726974798524001f90101f901baf2f423a4810101f8427020f8238208127500a010685e3470c8e02182107c14af8ebae3022127283300c2557007c8ce18cd15ce03c8ce13cdce01fa0201fa0212cb1fca00c91413206e953059f45a30944133f415e2107910681057104610354143c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5402fc31d3ffd20030238101012359f40d6fa192306ddf206e92306d8e1bd0d401d001fa40d401d001fa40fa00fa00d31fd20055706c186f08e282008275216eb3f2f4206ef2d0806f288168e1f82323bbf2f481259621b3f2f481010bf8425611598101014133f40a6fa19401d70030925b6de28200f22c216eb39170e30df2f4292a001021206ef2d080c20002fef8420a11130a091112090811110807111007106f105e104d103c021114020111150152b0db3c8157be2281010123714133f40c6fa19401d70030925b6de26ef2f4810101017f71216e955b59f45a3098c801cf004133f442e21112991113206ef2d0801ca09b1113206ef2d0801ba00a0be2106f105e104d103c50a28101012b32047ac86f00016f8c6d6f8c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c01db3c31312c300242fa44c88b111801ce028307a0a9380758cb07cbffc9d020db3c01c8cecec9d0db3c2d2e0094c8ce8b20000801cec9d0709421c701b38e2a01d30783069320c2008e1b03aa005323b091a4de03ab0023840fbc9903840fb0811021b203dee8303101e8318307a90c01c8cb07cb07c9d001a08d10105090d1115191d2125292d3135393d4145494d5155595d61656985898d9195999da1a5a9adb1b5b9bdc1c5c9cdd1d5d9dde1e5e8c0c4c8ccd0d4d8dce0e4b57e0c89522d749c2178ae86c21c9d02f009a02d307d307d30703aa0f02aa0712b101b120ab11803fb0aa02523078d7245004ce23ab0b803fb0aa02523078d72401ce23ab05803fb0aa02523078d72401ce03803fb0aa02522078d7245003ce0144db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da113100b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f0300cc11121ac8557007c8ce18cd15ce03c8ce13cdce01fa0201fa0212cb1fca00c910344bb0206e953059f45a30944133f415e21089106810571046035045c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed540230821081a594dcbae302018210946a98b6bae3025f0bf2c082343901fa31d3ff30228101012259f40d6fa192306ddf206e92306d8e1bd0d401d001fa40d401d001fa40fa00fa00d31fd20055706c186f08e282008275216eb3f2f4206ef2d0806f288200919cf82323bcf2f481259621b3f2f454776554776527810bb7081111111811111110111711100f11160f0e11150e0d11140d0c11130c3503fe0b11120b0a11180a0911190908111a08db3c01111301f2f47f810101c856100756100706111006105f104e03111403111550e2557007c8ce18cd15ce03c8ce13cdce01fa0201fa0212cb1fca00c9103d4cb0206e953059f45a30944133f415e28bd6d696e74417574686f7269747981801f90101f901ba9135e30d50491817363738001e5b6c425210bc9427ab01bc923070e2009670804007c8018210787cca5458cb1fcec9230350885a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00005c16154330c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed5400dad33f30c8018210aff90f5758cb1fcb3fc9108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca005590509ace17ce15f4005003fa0201c8f40012cbff12f40012cbff12f40012f400cdc9ed54bdff0aa6');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonGovernance_init_args({ $$type: 'ToonGovernance_init_args', registry, vault })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonGovernance_errors = {
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
    2999: { message: "ToonGovernance: quorum not met" },
    9622: { message: "ToonGovernance: already executed" },
    22462: { message: "ToonGovernance: already voted on this proposal" },
    26849: { message: "ToonGovernance: voting closed" },
    33397: { message: "ToonGovernance: address proposal does not exist" },
    36734: { message: "ToonGovernance: unknown numeric parameter" },
    37276: { message: "ToonGovernance: voting still open" },
    39639: { message: "ToonGovernance: proposal does not exist" },
    53903: { message: "ToonGovernance: unknown address parameter" },
    61996: { message: "ToonGovernance: no voting weight" },
    63274: { message: "ToonGovernance: insufficient stake" },
    63731: { message: "ToonGovernance: must stake to propose" },
} as const

export const ToonGovernance_errors_backward = {
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
    "ToonGovernance: quorum not met": 2999,
    "ToonGovernance: already executed": 9622,
    "ToonGovernance: already voted on this proposal": 22462,
    "ToonGovernance: voting closed": 26849,
    "ToonGovernance: address proposal does not exist": 33397,
    "ToonGovernance: unknown numeric parameter": 36734,
    "ToonGovernance: voting still open": 37276,
    "ToonGovernance: proposal does not exist": 39639,
    "ToonGovernance: unknown address parameter": 53903,
    "ToonGovernance: no voting weight": 61996,
    "ToonGovernance: insufficient stake": 63274,
    "ToonGovernance: must stake to propose": 63731,
} as const

const ToonGovernance_types: ABIType[] = [
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
    {"name":"StakeToon","header":1144384149,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UnstakeGovernance","header":57173639,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ProposeParameterUpdate","header":3148424161,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"ProposeAddressUpdate","header":1506838652,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"VoteOnProposal","header":3302738496,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"VoteOnAddressProposal","header":2081730446,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ExecuteProposal","header":3833516347,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"ExecuteAddressProposal","header":2175112412,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"Configuration","header":null,"fields":[{"name":"emissionCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minWalletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetDailyActivity","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"rewardBaseActiveListener","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseGrowthAgent","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseArtistLaunch","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseTrendsetter","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseEarlyBeliever","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseDropInvestor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"decayFactor","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minThreshold","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"antiFarmingCoeff","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetConfig","header":735098709,"fields":[{"name":"config","type":{"kind":"simple","type":"Configuration","optional":false}}]},
    {"name":"UpdateMintAuthority","header":2021444180,"fields":[{"name":"newAuthority","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateConfigParam","header":243571285,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"GlobalProposal","header":null,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"executed","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"AddressProposal","header":null,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"executed","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ToonGovernance$Data","header":null,"fields":[{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"int"}},{"name":"totalStaked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"proposals","type":{"kind":"dict","key":"int","value":"GlobalProposal","valueFormat":"ref"}},{"name":"nextProposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"addressProposals","type":{"kind":"dict","key":"int","value":"AddressProposal","valueFormat":"ref"}},{"name":"nextAddressProposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"hasVoted","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"hasVotedAddress","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const ToonGovernance_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "StakeToon": 1144384149,
    "UnstakeGovernance": 57173639,
    "ProposeParameterUpdate": 3148424161,
    "ProposeAddressUpdate": 1506838652,
    "VoteOnProposal": 3302738496,
    "VoteOnAddressProposal": 2081730446,
    "ExecuteProposal": 3833516347,
    "ExecuteAddressProposal": 2175112412,
    "SetConfig": 735098709,
    "UpdateMintAuthority": 2021444180,
    "UpdateConfigParam": 243571285,
}

const ToonGovernance_getters: ABIGetter[] = [
    {"name":"totalStaked","methodId":89512,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getStake","methodId":128972,"arguments":[{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getProposal","methodId":84079,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"GlobalProposal","optional":true}},
    {"name":"getAddressProposal","methodId":65836,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"AddressProposal","optional":true}},
    {"name":"hasAddressVoted","methodId":98948,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"hasAddressVotedOnAddressProposal","methodId":85734,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"quorumMet","methodId":99536,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const ToonGovernance_getterMapping: { [key: string]: string } = {
    'totalStaked': 'getTotalStaked',
    'getStake': 'getGetStake',
    'getProposal': 'getGetProposal',
    'getAddressProposal': 'getGetAddressProposal',
    'hasAddressVoted': 'getHasAddressVoted',
    'hasAddressVotedOnAddressProposal': 'getHasAddressVotedOnAddressProposal',
    'quorumMet': 'getQuorumMet',
}

const ToonGovernance_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"StakeToon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UnstakeGovernance"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ProposeParameterUpdate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VoteOnProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecuteProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ProposeAddressUpdate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VoteOnAddressProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecuteAddressProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonGovernance implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonGovernance_errors_backward;
    public static readonly opcodes = ToonGovernance_opcodes;
    
    static async init(registry: Address, vault: Address) {
        return await ToonGovernance_init(registry, vault);
    }
    
    static async fromInit(registry: Address, vault: Address) {
        const __gen_init = await ToonGovernance_init(registry, vault);
        const address = contractAddress(0, __gen_init);
        return new ToonGovernance(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonGovernance(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonGovernance_types,
        getters: ToonGovernance_getters,
        receivers: ToonGovernance_receivers,
        errors: ToonGovernance_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: StakeToon | UnstakeGovernance | ProposeParameterUpdate | VoteOnProposal | ExecuteProposal | ProposeAddressUpdate | VoteOnAddressProposal | ExecuteAddressProposal | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'StakeToon') {
            body = beginCell().store(storeStakeToon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UnstakeGovernance') {
            body = beginCell().store(storeUnstakeGovernance(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ProposeParameterUpdate') {
            body = beginCell().store(storeProposeParameterUpdate(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VoteOnProposal') {
            body = beginCell().store(storeVoteOnProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecuteProposal') {
            body = beginCell().store(storeExecuteProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ProposeAddressUpdate') {
            body = beginCell().store(storeProposeAddressUpdate(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VoteOnAddressProposal') {
            body = beginCell().store(storeVoteOnAddressProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecuteAddressProposal') {
            body = beginCell().store(storeExecuteAddressProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getTotalStaked(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('totalStaked', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetStake(provider: ContractProvider, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(voter);
        const source = (await provider.get('getStake', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetProposal(provider: ContractProvider, proposalId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        const source = (await provider.get('getProposal', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleGlobalProposal(result_p) : null;
        return result;
    }
    
    async getGetAddressProposal(provider: ContractProvider, proposalId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        const source = (await provider.get('getAddressProposal', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleAddressProposal(result_p) : null;
        return result;
    }
    
    async getHasAddressVoted(provider: ContractProvider, proposalId: bigint, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        builder.writeAddress(voter);
        const source = (await provider.get('hasAddressVoted', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getHasAddressVotedOnAddressProposal(provider: ContractProvider, proposalId: bigint, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        builder.writeAddress(voter);
        const source = (await provider.get('hasAddressVotedOnAddressProposal', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getQuorumMet(provider: ContractProvider, proposalId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        const source = (await provider.get('quorumMet', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}
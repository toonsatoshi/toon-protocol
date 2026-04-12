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
        b_0.storeUint(3853930240, 32);
        b_0.storeStringRefTail(src.parameter);
        b_0.storeUint(src.newValue, 32);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadProposeParameterUpdate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3853930240) { throw Error('Invalid prefix'); }
    const _parameter = sc_0.loadStringRefTail();
    const _newValue = sc_0.loadUintBig(32);
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

export type VoteOnGlobalProposal = {
    $$type: 'VoteOnGlobalProposal';
    proposalId: bigint;
    support: boolean;
}

export function storeVoteOnGlobalProposal(src: VoteOnGlobalProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3380811041, 32);
        b_0.storeUint(src.proposalId, 256);
        b_0.storeBit(src.support);
    };
}

export function loadVoteOnGlobalProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3380811041) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(256);
    const _support = sc_0.loadBit();
    return { $$type: 'VoteOnGlobalProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadTupleVoteOnGlobalProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnGlobalProposal' as const, proposalId: _proposalId, support: _support };
}

export function loadGetterTupleVoteOnGlobalProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'VoteOnGlobalProposal' as const, proposalId: _proposalId, support: _support };
}

export function storeTupleVoteOnGlobalProposal(source: VoteOnGlobalProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    return builder.build();
}

export function dictValueParserVoteOnGlobalProposal(): DictionaryValue<VoteOnGlobalProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVoteOnGlobalProposal(src)).endCell());
        },
        parse: (src) => {
            return loadVoteOnGlobalProposal(src.loadRef().beginParse());
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

export type UpdateVaultAddress = {
    $$type: 'UpdateVaultAddress';
    newVault: Address;
}

export function storeUpdateVaultAddress(src: UpdateVaultAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3682064959, 32);
        b_0.storeAddress(src.newVault);
    };
}

export function loadUpdateVaultAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3682064959) { throw Error('Invalid prefix'); }
    const _newVault = sc_0.loadAddress();
    return { $$type: 'UpdateVaultAddress' as const, newVault: _newVault };
}

export function loadTupleUpdateVaultAddress(source: TupleReader) {
    const _newVault = source.readAddress();
    return { $$type: 'UpdateVaultAddress' as const, newVault: _newVault };
}

export function loadGetterTupleUpdateVaultAddress(source: TupleReader) {
    const _newVault = source.readAddress();
    return { $$type: 'UpdateVaultAddress' as const, newVault: _newVault };
}

export function storeTupleUpdateVaultAddress(source: UpdateVaultAddress) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newVault);
    return builder.build();
}

export function dictValueParserUpdateVaultAddress(): DictionaryValue<UpdateVaultAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateVaultAddress(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateVaultAddress(src.loadRef().beginParse());
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
        b_0.storeUint(src.newValue, 32);
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
    const _newValue = sc_0.loadUintBig(32);
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

export type ToonGovernance$Data = {
    $$type: 'ToonGovernance$Data';
    registry: Address;
    vault: Address;
    stakes: Dictionary<Address, bigint>;
    totalStaked: bigint;
    proposals: Dictionary<bigint, GlobalProposal>;
    nextProposalId: bigint;
    hasVoted: Dictionary<bigint, boolean>;
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
        b_0.storeDict(src.hasVoted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
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
    const _hasVoted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_0);
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, hasVoted: _hasVoted };
}

export function loadTupleToonGovernance$Data(source: TupleReader) {
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalStaked = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    const _hasVoted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, hasVoted: _hasVoted };
}

export function loadGetterTupleToonGovernance$Data(source: TupleReader) {
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalStaked = source.readBigNumber();
    const _proposals = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal(), source.readCellOpt());
    const _nextProposalId = source.readBigNumber();
    const _hasVoted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ToonGovernance$Data' as const, registry: _registry, vault: _vault, stakes: _stakes, totalStaked: _totalStaked, proposals: _proposals, nextProposalId: _nextProposalId, hasVoted: _hasVoted };
}

export function storeTupleToonGovernance$Data(source: ToonGovernance$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.registry);
    builder.writeAddress(source.vault);
    builder.writeCell(source.stakes.size > 0 ? beginCell().storeDictDirect(source.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.totalStaked);
    builder.writeCell(source.proposals.size > 0 ? beginCell().storeDictDirect(source.proposals, Dictionary.Keys.BigInt(257), dictValueParserGlobalProposal()).endCell() : null);
    builder.writeNumber(source.nextProposalId);
    builder.writeCell(source.hasVoted.size > 0 ? beginCell().storeDictDirect(source.hasVoted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
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
    const __code = Cell.fromHex('b5ee9c7241022a01000b1400022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9010f020271020702016a030501a7b21bfb513434800063873e903e903d013e803500743d0134fffd010c040dc40d840d440d1b05e7fe903e901640b4405b5b5b5c150880f89541b6cf1b1c481ba48c1b66481bbcb4201bca1bc238881ba48c1b77a0040062810101240259f40d6fa192306ddf206e92306d8e1bd0d401d001d31fd401d001fa40fa00fa00d31fd20055706c186f08e20177b36a3b513434800063873e903e903d013e803500743d0134fffd010c040dc40d840d440d1b05e7fe903e901640b4405b5b5b5c150880f8b6cf1b1c6006000223020120080d0201c7090b017aaa84ed44d0d200018e1cfa40fa40f404fa00d401d0f404d3fff4043010371036103510346c179ffa40fa405902d1016d6d6d70542203e25516db3c6c710a0132db3c8101012202714133f40c6fa19401d70030925b6de26eb31b017aa8d0ed44d0d200018e1cfa40fa40f404fa00d401d0f404d3fff4043010371036103510346c179ffa40fa405902d1016d6d6d70542203e25506db3c6c710c008c810101240259f40d6fa192306ddf206e92306d8e1bd0d401d001d31fd401d001fa40fa00fa00d31fd20055706c186f08e2206e923070e0206ef2d0806f2810375f0724ab01bc017bbb7cced44d0d200018e1cfa40fa40f404fa00d401d0f404d3fff4043010371036103510346c179ffa40fa405902d1016d6d6d70542203e25506db3c6c7180e004881010b26028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e204ec01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1cfa40fa40f404fa00d401d0f404d3fff4043010371036103510346c179ffa40fa405902d1016d6d6d70542203e208925f08e006d70d1ff2e0822182104435ea95bae30221820b686687bae302218210e5b64f00bae302211011141700e831fa003081010bf84225598101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e281010bf8425123a0103612810101216e955b59f4593098c801cf004133f441e25023a010461035443302c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed5401fe31fa003081010bf84225598101014133f40a6fa19401d70030925b6de28200f72a216eb39821206ef2d08023be9170e2f2f4206ef2d08021a1208e1d81010bf842103658810101216e955b59f4593098c801cf004133f441e28e1e3081010bf842102570810101216e955b59f4593098c801cf004133f441e2e25023a1f8421201c2708040885a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010461035443302c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed5413003200000000556e7374616b65642024544f4f4e20286d6f636b2902fe31d401d001d31fd430d081010bf84227598101014133f40a6fa19401d70030925b6de2815aab216eb39801206ef2d080c200923170e2f2f48148458bb656d697373696f6e4361708524001f90101f901ba917f8e188bd6d696e74417574686f726974798524001f90101f901bae2917fe30ef2f428a4810101f8427020f8231516002e8bc6d696e57616c6c65744167658524001f90101f901ba00b68208127500a010685e3470c8557007c8ce18cd15cb1f03c8ce13cdce01fa0201fa0212cb1fca00c918206e953059f45a30944133f415e210465513c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed5402fe8210c9831521bae302218210e47ed13bbae302018210946a98b6ba8e5cd33f30c8018210aff90f5758cb1fcb3fc91057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed54e05f08f2c082182302fe31d3ffd20030228101012359f40d6fa192306ddf206e92306d8e1bd0d401d001d31fd401d001fa40fa00fa00d31fd20055706c186f08e282009ad7216eb3f2f4206ef2d0806f28816045f82323bbf2f4815cf621b3f2f481010bf8422e598101014133f40a6fa19401d70030925b6de28200f22c216eb39170e30df2f4f842191a001021206ef2d080c20002de07111007106f105e104d103c021111020111120152b0db3c8157be2281010123714133f40c6fa19401d70030925b6de26ef2f4810101017f71216e955b59f45a3098c801cf004133f442e209991110206ef2d0801ca09b1110206ef2d0801ba00a0be2104d103c50a281010150afc81b22047ac86f00016f8c6d6f8c028e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d012db3c8b13a8db3c01db3c21211c200242fa44c88b111801ce028307a0a9380758cb07cbffc9d020db3c01c8cecec9d0db3c1d1e0094c8ce8b20000801cec9d0709421c701b38e2a01d30783069320c2008e1b03aa005323b091a4de03ab0023840fbc9903840fb0811021b203dee8303101e8318307a90c01c8cb07cb07c9d001a08d10105090d1115191d2125292d3135393d4145494d5155595d61656985898d9195999da1a5a9adb1b5b9bdc1c5c9cdd1d5d9dde1e5e8c0c4c8ccd0d4d8dce0e4b57e0c89522d749c2178ae86c21c9d01f009a02d307d307d30703aa0f02aa0712b101b120ab11803fb0aa02523078d7245004ce23ab0b803fb0aa02523078d72401ce23ab05803fb0aa02523078d72401ce03803fb0aa02522078d7245003ce0144db3c6f2201c993216eb396016f2259ccc9e831d09b9320d74a91d5e868f90400da112100b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f0300a0557007c8ce18cd15cb1f03c8ce13cdce01fa0201fa0212cb1fca00c910354880206e953059f45a30944133f415e25514c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed5401ea31d3ff30218101012259f40d6fa192306ddf206e92306d8e1bd0d401d001d31fd401d001fa40fa00fa00d31fd20055706c186f08e282009ad7216eb3f2f4206ef2d0806f288200919cf82323bcf2f481259601b3f2f481495e5dbcf2f4816b392aab015240bcf2f47f8101012851680610584843c82402d4557007c8ce18cd15cb1f03c8ce13cdce01fa0201fa0212cb1fca00c910354140206e953059f45a30944133f415e28bb656d697373696f6e4361708523001f90101f901bae30f10465513c87f01ca0055605067ce14ce12f40001fa0201c8f40012cbff12f400cdc9ed542526009a3270804002c80182104bd7a70558cb1f01fa02c92650335a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002e6318bd6d696e74417574686f726974798522001f90101f901ba8ed68bc6d696e57616c6c657441676581201f90101f901ba8ebd708040882655205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00dee30d2728004000000000676f7665726e616e63655f7570646174655f77616c6c65745f616765017c31708040882755205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0029004a00000000676f7665726e616e63655f657865637574655f6d696e745f617574686f72697479d379b5c1');
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
    9622: { message: "ToonGovernance: already executed" },
    18501: { message: "ToonGovernance: unknown parameter" },
    18782: { message: "ToonGovernance: proposal failed" },
    22462: { message: "ToonGovernance: already voted on this proposal" },
    23211: { message: "ToonGovernance: must be a staker to propose" },
    23798: { message: "ToonGovernance: proposal already executed" },
    24645: { message: "ToonGovernance: voting deadline passed" },
    27449: { message: "ToonGovernance: quorum not met (25%)" },
    37276: { message: "ToonGovernance: voting still open" },
    39639: { message: "ToonGovernance: proposal does not exist" },
    61996: { message: "ToonGovernance: no voting weight" },
    63274: { message: "ToonGovernance: insufficient stake" },
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
    "ToonGovernance: already executed": 9622,
    "ToonGovernance: unknown parameter": 18501,
    "ToonGovernance: proposal failed": 18782,
    "ToonGovernance: already voted on this proposal": 22462,
    "ToonGovernance: must be a staker to propose": 23211,
    "ToonGovernance: proposal already executed": 23798,
    "ToonGovernance: voting deadline passed": 24645,
    "ToonGovernance: quorum not met (25%)": 27449,
    "ToonGovernance: voting still open": 37276,
    "ToonGovernance: proposal does not exist": 39639,
    "ToonGovernance: no voting weight": 61996,
    "ToonGovernance: insufficient stake": 63274,
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
    {"name":"ProposeParameterUpdate","header":3853930240,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"VoteOnGlobalProposal","header":3380811041,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ExecuteProposal","header":3833516347,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"UpdateEmissionCap","header":1272424197,"fields":[{"name":"newCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateMintAuthority","header":2021444180,"fields":[{"name":"newAuthority","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateVaultAddress","header":3682064959,"fields":[{"name":"newVault","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"GlobalProposal","header":null,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"executed","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ToonGovernance$Data","header":null,"fields":[{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"int"}},{"name":"totalStaked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"proposals","type":{"kind":"dict","key":"int","value":"GlobalProposal","valueFormat":"ref"}},{"name":"nextProposalId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"hasVoted","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const ToonGovernance_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "StakeToon": 1144384149,
    "UnstakeGovernance": 57173639,
    "ProposeParameterUpdate": 3853930240,
    "VoteOnGlobalProposal": 3380811041,
    "ExecuteProposal": 3833516347,
    "UpdateEmissionCap": 1272424197,
    "UpdateMintAuthority": 2021444180,
    "UpdateVaultAddress": 3682064959,
}

const ToonGovernance_getters: ABIGetter[] = [
    {"name":"totalStaked","methodId":89512,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getStake","methodId":128972,"arguments":[{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getProposal","methodId":84079,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"GlobalProposal","optional":true}},
    {"name":"hasAddressVoted","methodId":98948,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"quorumMet","methodId":99536,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const ToonGovernance_getterMapping: { [key: string]: string } = {
    'totalStaked': 'getTotalStaked',
    'getStake': 'getGetStake',
    'getProposal': 'getGetProposal',
    'hasAddressVoted': 'getHasAddressVoted',
    'quorumMet': 'getQuorumMet',
}

const ToonGovernance_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"StakeToon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UnstakeGovernance"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ProposeParameterUpdate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VoteOnGlobalProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecuteProposal"}},
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: StakeToon | UnstakeGovernance | ProposeParameterUpdate | VoteOnGlobalProposal | ExecuteProposal | Deploy) {
        
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
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VoteOnGlobalProposal') {
            body = beginCell().store(storeVoteOnGlobalProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecuteProposal') {
            body = beginCell().store(storeExecuteProposal(message)).endCell();
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
    
    async getHasAddressVoted(provider: ContractProvider, proposalId: bigint, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        builder.writeAddress(voter);
        const source = (await provider.get('hasAddressVoted', builder.build())).stack;
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
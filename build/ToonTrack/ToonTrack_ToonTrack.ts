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

export type AuthorizeMint = {
    $$type: 'AuthorizeMint';
    recipient: Address;
    amount: bigint;
}

export function storeAuthorizeMint(src: AuthorizeMint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3725821709, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
    };
}

export function loadAuthorizeMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3725821709) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'AuthorizeMint' as const, recipient: _recipient, amount: _amount };
}

export function loadTupleAuthorizeMint(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'AuthorizeMint' as const, recipient: _recipient, amount: _amount };
}

export function loadGetterTupleAuthorizeMint(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'AuthorizeMint' as const, recipient: _recipient, amount: _amount };
}

export function storeTupleAuthorizeMint(source: AuthorizeMint) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserAuthorizeMint(): DictionaryValue<AuthorizeMint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAuthorizeMint(src)).endCell());
        },
        parse: (src) => {
            return loadAuthorizeMint(src.loadRef().beginParse());
        }
    }
}

export type RequestMint = {
    $$type: 'RequestMint';
    recipient: Address;
    amount: bigint;
}

export function storeRequestMint(src: RequestMint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(277189457, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
    };
}

export function loadRequestMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 277189457) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'RequestMint' as const, recipient: _recipient, amount: _amount };
}

export function loadTupleRequestMint(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'RequestMint' as const, recipient: _recipient, amount: _amount };
}

export function loadGetterTupleRequestMint(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'RequestMint' as const, recipient: _recipient, amount: _amount };
}

export function storeTupleRequestMint(source: RequestMint) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserRequestMint(): DictionaryValue<RequestMint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRequestMint(src)).endCell());
        },
        parse: (src) => {
            return loadRequestMint(src.loadRef().beginParse());
        }
    }
}

export type ConfirmTrackRegistration = {
    $$type: 'ConfirmTrackRegistration';
    trackId: bigint;
}

export function storeConfirmTrackRegistration(src: ConfirmTrackRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2759486958, 32);
        b_0.storeUint(src.trackId, 256);
    };
}

export function loadConfirmTrackRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2759486958) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    return { $$type: 'ConfirmTrackRegistration' as const, trackId: _trackId };
}

export function loadTupleConfirmTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'ConfirmTrackRegistration' as const, trackId: _trackId };
}

export function loadGetterTupleConfirmTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'ConfirmTrackRegistration' as const, trackId: _trackId };
}

export function storeTupleConfirmTrackRegistration(source: ConfirmTrackRegistration) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    return builder.build();
}

export function dictValueParserConfirmTrackRegistration(): DictionaryValue<ConfirmTrackRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfirmTrackRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadConfirmTrackRegistration(src.loadRef().beginParse());
        }
    }
}

export type TrackRegistrationConfirmed = {
    $$type: 'TrackRegistrationConfirmed';
    trackId: bigint;
}

export function storeTrackRegistrationConfirmed(src: TrackRegistrationConfirmed) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1780609247, 32);
        b_0.storeUint(src.trackId, 256);
    };
}

export function loadTrackRegistrationConfirmed(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1780609247) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    return { $$type: 'TrackRegistrationConfirmed' as const, trackId: _trackId };
}

export function loadTupleTrackRegistrationConfirmed(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'TrackRegistrationConfirmed' as const, trackId: _trackId };
}

export function loadGetterTupleTrackRegistrationConfirmed(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'TrackRegistrationConfirmed' as const, trackId: _trackId };
}

export function storeTupleTrackRegistrationConfirmed(source: TrackRegistrationConfirmed) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    return builder.build();
}

export function dictValueParserTrackRegistrationConfirmed(): DictionaryValue<TrackRegistrationConfirmed> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTrackRegistrationConfirmed(src)).endCell());
        },
        parse: (src) => {
            return loadTrackRegistrationConfirmed(src.loadRef().beginParse());
        }
    }
}

export type TrackRegistrationFinalized = {
    $$type: 'TrackRegistrationFinalized';
    trackId: bigint;
    trackContract: Address;
}

export function storeTrackRegistrationFinalized(src: TrackRegistrationFinalized) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2999516602, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeAddress(src.trackContract);
    };
}

export function loadTrackRegistrationFinalized(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2999516602) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    return { $$type: 'TrackRegistrationFinalized' as const, trackId: _trackId, trackContract: _trackContract };
}

export function loadTupleTrackRegistrationFinalized(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'TrackRegistrationFinalized' as const, trackId: _trackId, trackContract: _trackContract };
}

export function loadGetterTupleTrackRegistrationFinalized(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'TrackRegistrationFinalized' as const, trackId: _trackId, trackContract: _trackContract };
}

export function storeTupleTrackRegistrationFinalized(source: TrackRegistrationFinalized) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.trackContract);
    return builder.build();
}

export function dictValueParserTrackRegistrationFinalized(): DictionaryValue<TrackRegistrationFinalized> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTrackRegistrationFinalized(src)).endCell());
        },
        parse: (src) => {
            return loadTrackRegistrationFinalized(src.loadRef().beginParse());
        }
    }
}

export type ToonTrack$Data = {
    $$type: 'ToonTrack$Data';
    artist: Address;
    registry: Address;
    trackId: bigint;
    metadataUri: string;
    fingerprint: bigint;
    mintFee: bigint;
    reputation: bigint;
    isRegistered: boolean;
}

export function storeToonTrack$Data(src: ToonTrack$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeAddress(src.registry);
        b_0.storeUint(src.trackId, 256);
        b_0.storeStringRefTail(src.metadataUri);
        const b_1 = new Builder();
        b_1.storeUint(src.fingerprint, 256);
        b_1.storeCoins(src.mintFee);
        b_1.storeUint(src.reputation, 32);
        b_1.storeBit(src.isRegistered);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonTrack$Data(slice: Slice) {
    const sc_0 = slice;
    const _artist = sc_0.loadAddress();
    const _registry = sc_0.loadAddress();
    const _trackId = sc_0.loadUintBig(256);
    const _metadataUri = sc_0.loadStringRefTail();
    const sc_1 = sc_0.loadRef().beginParse();
    const _fingerprint = sc_1.loadUintBig(256);
    const _mintFee = sc_1.loadCoins();
    const _reputation = sc_1.loadUintBig(32);
    const _isRegistered = sc_1.loadBit();
    return { $$type: 'ToonTrack$Data' as const, artist: _artist, registry: _registry, trackId: _trackId, metadataUri: _metadataUri, fingerprint: _fingerprint, mintFee: _mintFee, reputation: _reputation, isRegistered: _isRegistered };
}

export function loadTupleToonTrack$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _registry = source.readAddress();
    const _trackId = source.readBigNumber();
    const _metadataUri = source.readString();
    const _fingerprint = source.readBigNumber();
    const _mintFee = source.readBigNumber();
    const _reputation = source.readBigNumber();
    const _isRegistered = source.readBoolean();
    return { $$type: 'ToonTrack$Data' as const, artist: _artist, registry: _registry, trackId: _trackId, metadataUri: _metadataUri, fingerprint: _fingerprint, mintFee: _mintFee, reputation: _reputation, isRegistered: _isRegistered };
}

export function loadGetterTupleToonTrack$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _registry = source.readAddress();
    const _trackId = source.readBigNumber();
    const _metadataUri = source.readString();
    const _fingerprint = source.readBigNumber();
    const _mintFee = source.readBigNumber();
    const _reputation = source.readBigNumber();
    const _isRegistered = source.readBoolean();
    return { $$type: 'ToonTrack$Data' as const, artist: _artist, registry: _registry, trackId: _trackId, metadataUri: _metadataUri, fingerprint: _fingerprint, mintFee: _mintFee, reputation: _reputation, isRegistered: _isRegistered };
}

export function storeTupleToonTrack$Data(source: ToonTrack$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artist);
    builder.writeAddress(source.registry);
    builder.writeNumber(source.trackId);
    builder.writeString(source.metadataUri);
    builder.writeNumber(source.fingerprint);
    builder.writeNumber(source.mintFee);
    builder.writeNumber(source.reputation);
    builder.writeBoolean(source.isRegistered);
    return builder.build();
}

export function dictValueParserToonTrack$Data(): DictionaryValue<ToonTrack$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonTrack$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonTrack$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonTrack_init_args = {
    $$type: 'ToonTrack_init_args';
    artist: Address;
    registry: Address;
    trackId: bigint;
    metadataUri: string;
    fingerprint: bigint;
    mintFee: bigint;
}

function initToonTrack_init_args(src: ToonTrack_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeAddress(src.registry);
        b_0.storeInt(src.trackId, 257);
        b_0.storeStringRefTail(src.metadataUri);
        const b_1 = new Builder();
        b_1.storeInt(src.fingerprint, 257);
        b_1.storeInt(src.mintFee, 257);
        b_0.storeRef(b_1.endCell());
    };
}

async function ToonTrack_init(artist: Address, registry: Address, trackId: bigint, metadataUri: string, fingerprint: bigint, mintFee: bigint) {
    const __code = Cell.fromHex('b5ee9c7241021a01000609000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9010f020271020d0201200308020120040601b5b6b0dda89a1a400031c41f481f481a7ffa803a003a803a1a7fff401a63fa400602090208e208c208ad8311c53f481f481020203ae01a803a003a803a1020203ae01020203ae0060204c204a204820460da2aa08e0e1c5b678d90300500022301b5b5135da89a1a400031c41f481f481a7ffa803a003a803a1a7fff401a63fa400602090208e208c208ad8311c53f481f481020203ae01a803a003a803a1020203ae01020203ae0060204c204a204820460da2aa08e0e1c5b678d903007000221020120090b01b5b483fda89a1a400031c41f481f481a7ffa803a003a803a1a7fff401a63fa400602090208e208c208ad8311c53f481f481020203ae01a803a003a803a1020203ae01020203ae0060204c204a204820460da2aa08e0e1c5b678d90300a00022401b5b6f97da89a1a400031c41f481f481a7ffa803a003a803a1a7fff401a63fa400602090208e208c208ad8311c53f481f481020203ae01a803a003a803a1020203ae01020203ae0060204c204a204820460da2aa08e0e1c5b678d90300c00022201b5bd6ed76a268690000c7107d207d2069ffea00e800ea00e869fffd00698fe900180824082388230822b60c4714fd207d20408080eb806a00e800ea00e8408080eb80408080eb801808130812881208118368aa823838716d9e3640c0e00022701f830eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e20fa40fa40d3ffd401d001d401d0d3fffa00d31fd2003010481047104610456c188e29fa40fa40810101d700d401d001d401d0810101d700810101d70030102610251024102306d155047070e209925f09e07028d74920c21f1004988f193108d31f2182106a21f0dfbae302218210946a98b6bae30209de01c00001c121b0e30207f9012082f028208bdda6b6da97d2a1534c928b42e898752fbd839be4045590daafcb220543ba1113141501e431383806d3ff30812bb8f84226c705f2f481771a5114baf2f47f708040f8285260c8598210b2c8fdba5003cb1fcbffcec92855205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00105710461035443012004cc87f01ca0055705078ce15ce13cbff01c8cecd01c8cbff58fa0212cb1f12ca00cdc9ed54db3100d0313807d33f30c8018210aff90f5758cb1fcb3fc91068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055705078ce15ce13cbff01c8cecd01c8cbff58fa0212cb1f12ca00cdc9ed54db3102e2378200944928f2f4f8416f24303222821004c4b400a0228200a80502bef2f408a401820afaf080a170882955205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb008209312d00700982103b9aca00c818190258e30282f0775fac1ca69e924416b5b310799513dc523abbb3839c6cb016e4d19ec1bd34d4bae3025f08f2c082161700fe308200e140f84227c705f2f470804025c8018210a47a6dee58cb1fcbffc92755205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010575514c87f01ca0055705078ce15ce13cbff01c8cecd01c8cbff58fa0212cb1f12ca00cdc9ed5402e08200944928f2f4f8416f24303222821004c4b400a0228200a80502bef2f408a401820afaf080a170882955205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb008209312d00700982103b9aca00c8181900200000000054697020726563656976656400e4598210108593515003cb1fce01fa02c9270350aa5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010575514c87f01ca0055705078ce15ce13cbff01c8cecd01c8cbff58fa0212cb1f12ca00cdc9ed54c9e2c476');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonTrack_init_args({ $$type: 'ToonTrack_init_args', artist, registry, trackId, metadataUri, fingerprint, mintFee })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonTrack_errors = {
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
    11192: { message: "ToonTrack: only registry can confirm registration" },
    30490: { message: "ToonTrack: invalid trackId" },
    37961: { message: "ToonTrack: track not yet registered" },
    43013: { message: "ToonTrack: tip below minimum floor (including gas)" },
    57664: { message: "ToonTrack: only artist can confirm registration" },
} as const

export const ToonTrack_errors_backward = {
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
    "ToonTrack: only registry can confirm registration": 11192,
    "ToonTrack: invalid trackId": 30490,
    "ToonTrack: track not yet registered": 37961,
    "ToonTrack: tip below minimum floor (including gas)": 43013,
    "ToonTrack: only artist can confirm registration": 57664,
} as const

const ToonTrack_types: ABIType[] = [
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
    {"name":"AuthorizeMint","header":3725821709,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"RequestMint","header":277189457,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ConfirmTrackRegistration","header":2759486958,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TrackRegistrationConfirmed","header":1780609247,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TrackRegistrationFinalized","header":2999516602,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ToonTrack$Data","header":null,"fields":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"metadataUri","type":{"kind":"simple","type":"string","optional":false}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"mintFee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"reputation","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"isRegistered","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const ToonTrack_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "AuthorizeMint": 3725821709,
    "RequestMint": 277189457,
    "ConfirmTrackRegistration": 2759486958,
    "TrackRegistrationConfirmed": 1780609247,
    "TrackRegistrationFinalized": 2999516602,
}

const ToonTrack_getters: ABIGetter[] = [
    {"name":"reputation","methodId":75930,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"artist","methodId":110042,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"metadataUri","methodId":82975,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
    {"name":"fingerprint","methodId":71046,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"mintFee","methodId":96203,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const ToonTrack_getterMapping: { [key: string]: string } = {
    'reputation': 'getReputation',
    'artist': 'getArtist',
    'metadataUri': 'getMetadataUri',
    'fingerprint': 'getFingerprint',
    'mintFee': 'getMintFee',
}

const ToonTrack_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"ConfirmRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TrackRegistrationConfirmed"}},
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"text","text":"tip"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonTrack implements Contract {
    
    public static readonly MINT_REWARD = 1000000000n;
    public static readonly GAS_FORWARD_ARTIST = 50000000n;
    public static readonly GAS_REGISTRY_FEE = 20000000n;
    public static readonly MIN_TIP_OVERHEAD = 80000000n;
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonTrack_errors_backward;
    public static readonly opcodes = ToonTrack_opcodes;
    
    static async init(artist: Address, registry: Address, trackId: bigint, metadataUri: string, fingerprint: bigint, mintFee: bigint) {
        return await ToonTrack_init(artist, registry, trackId, metadataUri, fingerprint, mintFee);
    }
    
    static async fromInit(artist: Address, registry: Address, trackId: bigint, metadataUri: string, fingerprint: bigint, mintFee: bigint) {
        const __gen_init = await ToonTrack_init(artist, registry, trackId, metadataUri, fingerprint, mintFee);
        const address = contractAddress(0, __gen_init);
        return new ToonTrack(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonTrack(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonTrack_types,
        getters: ToonTrack_getters,
        receivers: ToonTrack_receivers,
        errors: ToonTrack_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "ConfirmRegistration" | TrackRegistrationConfirmed | null | "tip" | Deploy) {
        
        let body: Cell | null = null;
        if (message === "ConfirmRegistration") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TrackRegistrationConfirmed') {
            body = beginCell().store(storeTrackRegistrationConfirmed(message)).endCell();
        }
        if (message === null) {
            body = new Cell();
        }
        if (message === "tip") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getReputation(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('reputation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getArtist(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('artist', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getMetadataUri(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('metadataUri', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
    async getFingerprint(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('fingerprint', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getMintFee(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('mintFee', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}
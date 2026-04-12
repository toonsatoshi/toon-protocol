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

export type RegisterArtist = {
    $$type: 'RegisterArtist';
    artistContract: Address;
}

export function storeRegisterArtist(src: RegisterArtist) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3754294261, 32);
        b_0.storeAddress(src.artistContract);
    };
}

export function loadRegisterArtist(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3754294261) { throw Error('Invalid prefix'); }
    const _artistContract = sc_0.loadAddress();
    return { $$type: 'RegisterArtist' as const, artistContract: _artistContract };
}

export function loadTupleRegisterArtist(source: TupleReader) {
    const _artistContract = source.readAddress();
    return { $$type: 'RegisterArtist' as const, artistContract: _artistContract };
}

export function loadGetterTupleRegisterArtist(source: TupleReader) {
    const _artistContract = source.readAddress();
    return { $$type: 'RegisterArtist' as const, artistContract: _artistContract };
}

export function storeTupleRegisterArtist(source: RegisterArtist) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artistContract);
    return builder.build();
}

export function dictValueParserRegisterArtist(): DictionaryValue<RegisterArtist> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterArtist(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterArtist(src.loadRef().beginParse());
        }
    }
}

export type RegisterTrack = {
    $$type: 'RegisterTrack';
    trackId: bigint;
    fingerprint: bigint;
    trackContract: Address;
}

export function storeRegisterTrack(src: RegisterTrack) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2360656451, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeUint(src.fingerprint, 256);
        b_0.storeAddress(src.trackContract);
    };
}

export function loadRegisterTrack(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2360656451) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _fingerprint = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    return { $$type: 'RegisterTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadTupleRegisterTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'RegisterTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadGetterTupleRegisterTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'RegisterTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function storeTupleRegisterTrack(source: RegisterTrack) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeNumber(source.fingerprint);
    builder.writeAddress(source.trackContract);
    return builder.build();
}

export function dictValueParserRegisterTrack(): DictionaryValue<RegisterTrack> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterTrack(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterTrack(src.loadRef().beginParse());
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

export type UnstakeToon = {
    $$type: 'UnstakeToon';
    amount: bigint;
}

export function storeUnstakeToon(src: UnstakeToon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3754241943, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadUnstakeToon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3754241943) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'UnstakeToon' as const, amount: _amount };
}

export function loadTupleUnstakeToon(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UnstakeToon' as const, amount: _amount };
}

export function loadGetterTupleUnstakeToon(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'UnstakeToon' as const, amount: _amount };
}

export function storeTupleUnstakeToon(source: UnstakeToon) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserUnstakeToon(): DictionaryValue<UnstakeToon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnstakeToon(src)).endCell());
        },
        parse: (src) => {
            return loadUnstakeToon(src.loadRef().beginParse());
        }
    }
}

export type UpdateMetadata = {
    $$type: 'UpdateMetadata';
    newUri: string;
}

export function storeUpdateMetadata(src: UpdateMetadata) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(293200627, 32);
        b_0.storeStringRefTail(src.newUri);
    };
}

export function loadUpdateMetadata(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 293200627) { throw Error('Invalid prefix'); }
    const _newUri = sc_0.loadStringRefTail();
    return { $$type: 'UpdateMetadata' as const, newUri: _newUri };
}

export function loadTupleUpdateMetadata(source: TupleReader) {
    const _newUri = source.readString();
    return { $$type: 'UpdateMetadata' as const, newUri: _newUri };
}

export function loadGetterTupleUpdateMetadata(source: TupleReader) {
    const _newUri = source.readString();
    return { $$type: 'UpdateMetadata' as const, newUri: _newUri };
}

export function storeTupleUpdateMetadata(source: UpdateMetadata) {
    const builder = new TupleBuilder();
    builder.writeString(source.newUri);
    return builder.build();
}

export function dictValueParserUpdateMetadata(): DictionaryValue<UpdateMetadata> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateMetadata(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateMetadata(src.loadRef().beginParse());
        }
    }
}

export type AddTrack = {
    $$type: 'AddTrack';
    trackId: bigint;
    fingerprint: bigint;
    trackContract: Address;
}

export function storeAddTrack(src: AddTrack) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(564504477, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeUint(src.fingerprint, 256);
        b_0.storeAddress(src.trackContract);
    };
}

export function loadAddTrack(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 564504477) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _fingerprint = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    return { $$type: 'AddTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadTupleAddTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'AddTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadGetterTupleAddTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'AddTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function storeTupleAddTrack(source: AddTrack) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeNumber(source.fingerprint);
    builder.writeAddress(source.trackContract);
    return builder.build();
}

export function dictValueParserAddTrack(): DictionaryValue<AddTrack> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddTrack(src)).endCell());
        },
        parse: (src) => {
            return loadAddTrack(src.loadRef().beginParse());
        }
    }
}

export type ArtistDetails = {
    $$type: 'ArtistDetails';
    reputation: bigint;
    totalTipVolume: bigint;
    stakedToon: bigint;
    isActive: boolean;
    totalTracks: bigint;
}

export function storeArtistDetails(src: ArtistDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.reputation, 32);
        b_0.storeCoins(src.totalTipVolume);
        b_0.storeCoins(src.stakedToon);
        b_0.storeBit(src.isActive);
        b_0.storeUint(src.totalTracks, 32);
    };
}

export function loadArtistDetails(slice: Slice) {
    const sc_0 = slice;
    const _reputation = sc_0.loadUintBig(32);
    const _totalTipVolume = sc_0.loadCoins();
    const _stakedToon = sc_0.loadCoins();
    const _isActive = sc_0.loadBit();
    const _totalTracks = sc_0.loadUintBig(32);
    return { $$type: 'ArtistDetails' as const, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, isActive: _isActive, totalTracks: _totalTracks };
}

export function loadTupleArtistDetails(source: TupleReader) {
    const _reputation = source.readBigNumber();
    const _totalTipVolume = source.readBigNumber();
    const _stakedToon = source.readBigNumber();
    const _isActive = source.readBoolean();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ArtistDetails' as const, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, isActive: _isActive, totalTracks: _totalTracks };
}

export function loadGetterTupleArtistDetails(source: TupleReader) {
    const _reputation = source.readBigNumber();
    const _totalTipVolume = source.readBigNumber();
    const _stakedToon = source.readBigNumber();
    const _isActive = source.readBoolean();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ArtistDetails' as const, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, isActive: _isActive, totalTracks: _totalTracks };
}

export function storeTupleArtistDetails(source: ArtistDetails) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.reputation);
    builder.writeNumber(source.totalTipVolume);
    builder.writeNumber(source.stakedToon);
    builder.writeBoolean(source.isActive);
    builder.writeNumber(source.totalTracks);
    return builder.build();
}

export function dictValueParserArtistDetails(): DictionaryValue<ArtistDetails> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeArtistDetails(src)).endCell());
        },
        parse: (src) => {
            return loadArtistDetails(src.loadRef().beginParse());
        }
    }
}

export type ToonArtist$Data = {
    $$type: 'ToonArtist$Data';
    owner: Address;
    registry: Address;
    telegramHash: bigint;
    metadataUri: string;
    reputation: bigint;
    totalTipVolume: bigint;
    stakedToon: bigint;
    tracks: Dictionary<bigint, Address>;
    totalTracks: bigint;
}

export function storeToonArtist$Data(src: ToonArtist$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.registry);
        b_0.storeUint(src.telegramHash, 256);
        b_0.storeStringRefTail(src.metadataUri);
        b_0.storeUint(src.reputation, 32);
        b_0.storeCoins(src.totalTipVolume);
        const b_1 = new Builder();
        b_1.storeCoins(src.stakedToon);
        b_1.storeDict(src.tracks, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        b_1.storeUint(src.totalTracks, 32);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonArtist$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _registry = sc_0.loadAddress();
    const _telegramHash = sc_0.loadUintBig(256);
    const _metadataUri = sc_0.loadStringRefTail();
    const _reputation = sc_0.loadUintBig(32);
    const _totalTipVolume = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _stakedToon = sc_1.loadCoins();
    const _tracks = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    const _totalTracks = sc_1.loadUintBig(32);
    return { $$type: 'ToonArtist$Data' as const, owner: _owner, registry: _registry, telegramHash: _telegramHash, metadataUri: _metadataUri, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, tracks: _tracks, totalTracks: _totalTracks };
}

export function loadTupleToonArtist$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _registry = source.readAddress();
    const _telegramHash = source.readBigNumber();
    const _metadataUri = source.readString();
    const _reputation = source.readBigNumber();
    const _totalTipVolume = source.readBigNumber();
    const _stakedToon = source.readBigNumber();
    const _tracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonArtist$Data' as const, owner: _owner, registry: _registry, telegramHash: _telegramHash, metadataUri: _metadataUri, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, tracks: _tracks, totalTracks: _totalTracks };
}

export function loadGetterTupleToonArtist$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _registry = source.readAddress();
    const _telegramHash = source.readBigNumber();
    const _metadataUri = source.readString();
    const _reputation = source.readBigNumber();
    const _totalTipVolume = source.readBigNumber();
    const _stakedToon = source.readBigNumber();
    const _tracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonArtist$Data' as const, owner: _owner, registry: _registry, telegramHash: _telegramHash, metadataUri: _metadataUri, reputation: _reputation, totalTipVolume: _totalTipVolume, stakedToon: _stakedToon, tracks: _tracks, totalTracks: _totalTracks };
}

export function storeTupleToonArtist$Data(source: ToonArtist$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.registry);
    builder.writeNumber(source.telegramHash);
    builder.writeString(source.metadataUri);
    builder.writeNumber(source.reputation);
    builder.writeNumber(source.totalTipVolume);
    builder.writeNumber(source.stakedToon);
    builder.writeCell(source.tracks.size > 0 ? beginCell().storeDictDirect(source.tracks, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeNumber(source.totalTracks);
    return builder.build();
}

export function dictValueParserToonArtist$Data(): DictionaryValue<ToonArtist$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonArtist$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonArtist$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonArtist_init_args = {
    $$type: 'ToonArtist_init_args';
    owner: Address;
    registry: Address;
    telegramHash: bigint;
    metadataUri: string;
}

function initToonArtist_init_args(src: ToonArtist_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.registry);
        b_0.storeInt(src.telegramHash, 257);
        b_0.storeStringRefTail(src.metadataUri);
    };
}

async function ToonArtist_init(owner: Address, registry: Address, telegramHash: bigint, metadataUri: string) {
    const __code = Cell.fromHex('b5ee9c7241022301000744000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90117020271020c020120030501a7ba89aed44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e2db3c6c91804000224020120060a020162070801a6ab6eed44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e2db3c6c911d01a6a91ded44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e2db3c6c910900022801a7b7217da89a1a400031c4df481f481a7ffa803a003a63ff401a803a1f401e809a63e6020722070206e206c206a2068d8331c39f481f481020203ae01a803a028866009a2aa04dae0a8e00020688261c5b678d92300b0002220201200d120201200e1001a7b48e9da89a1a400031c4df481f481a7ffa803a003a63ff401a803a1f401e809a63e6020722070206e206c206a2068d8331c39f481f481020203ae01a803a028866009a2aa04dae0a8e00020688261c5b678d92300f000a248103e8be01a7b6029da89a1a400031c4df481f481a7ffa803a003a63ff401a803a1f401e809a63e6020722070206e206c206a2068d8331c39f481f481020203ae01a803a028866009a2aa04dae0a8e00020688261c5b678d923011000220020273131501a6a9f9ed44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e2db3c6c951401305474325582db3c103c4ba02a10ad109c108b107a106910581d01aaabe6ed44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e25508db3c6c9116001c810101230259f40c6fa192306ddf02f630eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e26fa40fa40d3ffd401d001d31ffa00d401d0fa00f404d31f301039103810371036103510346c198e1cfa40fa40810101d700d401d014433004d155026d7054700010344130e20a925f0ae07029d74920c21fe30001c00001182103f43109d31f2182101179e2f3ba8e5631353803d430d08200866ff84228c705f2f48200a73d8b08522001f90101f901bdf2f410681057104644554313c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54db31e02182104435ea95bae302218210dfc52f97bae30221191a1c008e313908fa003082008175f84229c705f2f481234921c200f2f4a010685515c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54db3102b8313908fa003082008e9ef84229c705f2f48200e9d95321bef2f4a1708040882955205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00106855151b1f003200000000556e7374616b65642024544f4f4e20286d6f636b2903f6821021a5a79dba8f70313908d3ffd3fffa40308200ac8af8422bc705f2f48144698d08600000000000000000000000000000000000000000000000000000000000000000045220c705b3f2f42bc2008ea010795e3510481039489a811b530cdb3c1df2f40a107910681057104610354430de702380405143c8e0211d1e200012228218174876e800be01e4552082108cb4c2435004cb1f12cbffcbffcec92a0350445a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00102981010159206e953059f45a30944133f414e208a402a60a1068105710461035504443131f0052c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54db3100ee8210946a98b6ba8e6c313908d33f30c8018210aff90f5758cb1fcb3fc9107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54db31e00a01dec121b08e3c38f8416f24135f0312a01068105710461035443302c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54e008f90182f01bb9cd5336387bc2aaa2f0088c6feb124b79ae38f229da1812e8471232681fedbae3025f09f2c082220076f8416f24135f0312a01068105710461035443302c87f01ca0055805089ce16ce14cbff02c8ce12cdcb1f01fa02c858fa0212f40012cb1fcdc9ed54928d6dcb');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonArtist_init_args({ $$type: 'ToonArtist_init_args', owner, registry, telegramHash, metadataUri })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonArtist_errors = {
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
    6995: { message: "ToonArtist: stake required for additional tracks" },
    9033: { message: "ToonArtist: stake amount must be positive" },
    17513: { message: "ToonArtist: invalid track contract address" },
    33141: { message: "ToonArtist: only owner can stake" },
    34415: { message: "ToonArtist: only owner can update metadata" },
    36510: { message: "ToonArtist: only owner can unstake" },
    42813: { message: "ToonArtist: empty metadata URI" },
    44170: { message: "ToonArtist: only owner can add tracks" },
    59865: { message: "ToonArtist: insufficient stake" },
} as const

export const ToonArtist_errors_backward = {
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
    "ToonArtist: stake required for additional tracks": 6995,
    "ToonArtist: stake amount must be positive": 9033,
    "ToonArtist: invalid track contract address": 17513,
    "ToonArtist: only owner can stake": 33141,
    "ToonArtist: only owner can update metadata": 34415,
    "ToonArtist: only owner can unstake": 36510,
    "ToonArtist: empty metadata URI": 42813,
    "ToonArtist: only owner can add tracks": 44170,
    "ToonArtist: insufficient stake": 59865,
} as const

const ToonArtist_types: ABIType[] = [
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
    {"name":"RegisterArtist","header":3754294261,"fields":[{"name":"artistContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RegisterTrack","header":2360656451,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"StakeToon","header":1144384149,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UnstakeToon","header":3754241943,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateMetadata","header":293200627,"fields":[{"name":"newUri","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"AddTrack","header":564504477,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ArtistDetails","header":null,"fields":[{"name":"reputation","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalTipVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"stakedToon","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"isActive","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalTracks","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ToonArtist$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"telegramHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"metadataUri","type":{"kind":"simple","type":"string","optional":false}},{"name":"reputation","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalTipVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"stakedToon","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"tracks","type":{"kind":"dict","key":"int","value":"address"}},{"name":"totalTracks","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
]

const ToonArtist_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "RegisterArtist": 3754294261,
    "RegisterTrack": 2360656451,
    "StakeToon": 1144384149,
    "UnstakeToon": 3754241943,
    "UpdateMetadata": 293200627,
    "AddTrack": 564504477,
}

const ToonArtist_getters: ABIGetter[] = [
    {"name":"isActive","methodId":82798,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"canLaunchToonDrop","methodId":99444,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getDetails","methodId":121337,"arguments":[],"returnType":{"kind":"simple","type":"ArtistDetails","optional":false}},
    {"name":"getTrack","methodId":122854,"arguments":[{"name":"trackId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"reputation","methodId":75930,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"totalTracks","methodId":110612,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"stakedToon","methodId":96523,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const ToonArtist_getterMapping: { [key: string]: string } = {
    'isActive': 'getIsActive',
    'canLaunchToonDrop': 'getCanLaunchToonDrop',
    'getDetails': 'getGetDetails',
    'getTrack': 'getGetTrack',
    'reputation': 'getReputation',
    'owner': 'getOwner',
    'totalTracks': 'getTotalTracks',
    'stakedToon': 'getStakedToon',
}

const ToonArtist_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateMetadata"}},
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"text","text":"Tip received"}},
    {"receiver":"internal","message":{"kind":"typed","type":"StakeToon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UnstakeToon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AddTrack"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonArtist implements Contract {
    
    public static readonly MIN_STAKE = 100000000000n;
    public static readonly TOON_DROP_THRESHOLD = 1000n;
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonArtist_errors_backward;
    public static readonly opcodes = ToonArtist_opcodes;
    
    static async init(owner: Address, registry: Address, telegramHash: bigint, metadataUri: string) {
        return await ToonArtist_init(owner, registry, telegramHash, metadataUri);
    }
    
    static async fromInit(owner: Address, registry: Address, telegramHash: bigint, metadataUri: string) {
        const __gen_init = await ToonArtist_init(owner, registry, telegramHash, metadataUri);
        const address = contractAddress(0, __gen_init);
        return new ToonArtist(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonArtist(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonArtist_types,
        getters: ToonArtist_getters,
        receivers: ToonArtist_receivers,
        errors: ToonArtist_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: UpdateMetadata | null | "Tip received" | StakeToon | UnstakeToon | AddTrack | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateMetadata') {
            body = beginCell().store(storeUpdateMetadata(message)).endCell();
        }
        if (message === null) {
            body = new Cell();
        }
        if (message === "Tip received") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'StakeToon') {
            body = beginCell().store(storeStakeToon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UnstakeToon') {
            body = beginCell().store(storeUnstakeToon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AddTrack') {
            body = beginCell().store(storeAddTrack(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getIsActive(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isActive', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getCanLaunchToonDrop(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('canLaunchToonDrop', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetDetails(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getDetails', builder.build())).stack;
        const result = loadGetterTupleArtistDetails(source);
        return result;
    }
    
    async getGetTrack(provider: ContractProvider, trackId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(trackId);
        const source = (await provider.get('getTrack', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getReputation(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('reputation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getTotalTracks(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('totalTracks', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getStakedToon(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('stakedToon', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}
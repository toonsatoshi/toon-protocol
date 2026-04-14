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

export type StageArtistRegistration = {
    $$type: 'StageArtistRegistration';
    artistContract: Address;
    wallet: Address;
}

export function storeStageArtistRegistration(src: StageArtistRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3427790327, 32);
        b_0.storeAddress(src.artistContract);
        b_0.storeAddress(src.wallet);
    };
}

export function loadStageArtistRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3427790327) { throw Error('Invalid prefix'); }
    const _artistContract = sc_0.loadAddress();
    const _wallet = sc_0.loadAddress();
    return { $$type: 'StageArtistRegistration' as const, artistContract: _artistContract, wallet: _wallet };
}

export function loadTupleStageArtistRegistration(source: TupleReader) {
    const _artistContract = source.readAddress();
    const _wallet = source.readAddress();
    return { $$type: 'StageArtistRegistration' as const, artistContract: _artistContract, wallet: _wallet };
}

export function loadGetterTupleStageArtistRegistration(source: TupleReader) {
    const _artistContract = source.readAddress();
    const _wallet = source.readAddress();
    return { $$type: 'StageArtistRegistration' as const, artistContract: _artistContract, wallet: _wallet };
}

export function storeTupleStageArtistRegistration(source: StageArtistRegistration) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artistContract);
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserStageArtistRegistration(): DictionaryValue<StageArtistRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStageArtistRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadStageArtistRegistration(src.loadRef().beginParse());
        }
    }
}

export type ConfirmArtistRegistration = {
    $$type: 'ConfirmArtistRegistration';
    wallet: Address;
}

export function storeConfirmArtistRegistration(src: ConfirmArtistRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3360845383, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadConfirmArtistRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3360845383) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'ConfirmArtistRegistration' as const, wallet: _wallet };
}

export function loadTupleConfirmArtistRegistration(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'ConfirmArtistRegistration' as const, wallet: _wallet };
}

export function loadGetterTupleConfirmArtistRegistration(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'ConfirmArtistRegistration' as const, wallet: _wallet };
}

export function storeTupleConfirmArtistRegistration(source: ConfirmArtistRegistration) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserConfirmArtistRegistration(): DictionaryValue<ConfirmArtistRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfirmArtistRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadConfirmArtistRegistration(src.loadRef().beginParse());
        }
    }
}

export type ArtistRegistrationConfirmed = {
    $$type: 'ArtistRegistrationConfirmed';
    wallet: Address;
}

export function storeArtistRegistrationConfirmed(src: ArtistRegistrationConfirmed) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(156544760, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadArtistRegistrationConfirmed(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 156544760) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'ArtistRegistrationConfirmed' as const, wallet: _wallet };
}

export function loadTupleArtistRegistrationConfirmed(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'ArtistRegistrationConfirmed' as const, wallet: _wallet };
}

export function loadGetterTupleArtistRegistrationConfirmed(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'ArtistRegistrationConfirmed' as const, wallet: _wallet };
}

export function storeTupleArtistRegistrationConfirmed(source: ArtistRegistrationConfirmed) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserArtistRegistrationConfirmed(): DictionaryValue<ArtistRegistrationConfirmed> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeArtistRegistrationConfirmed(src)).endCell());
        },
        parse: (src) => {
            return loadArtistRegistrationConfirmed(src.loadRef().beginParse());
        }
    }
}

export type RollbackArtistRegistration = {
    $$type: 'RollbackArtistRegistration';
    wallet: Address;
}

export function storeRollbackArtistRegistration(src: RollbackArtistRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3852039363, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadRollbackArtistRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3852039363) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'RollbackArtistRegistration' as const, wallet: _wallet };
}

export function loadTupleRollbackArtistRegistration(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'RollbackArtistRegistration' as const, wallet: _wallet };
}

export function loadGetterTupleRollbackArtistRegistration(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'RollbackArtistRegistration' as const, wallet: _wallet };
}

export function storeTupleRollbackArtistRegistration(source: RollbackArtistRegistration) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserRollbackArtistRegistration(): DictionaryValue<RollbackArtistRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRollbackArtistRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadRollbackArtistRegistration(src.loadRef().beginParse());
        }
    }
}

export type StageTrackRegistration = {
    $$type: 'StageTrackRegistration';
    trackId: bigint;
    fingerprint: bigint;
    trackContract: Address;
}

export function storeStageTrackRegistration(src: StageTrackRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3230863597, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeUint(src.fingerprint, 256);
        b_0.storeAddress(src.trackContract);
    };
}

export function loadStageTrackRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3230863597) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _fingerprint = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    return { $$type: 'StageTrackRegistration' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadTupleStageTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'StageTrackRegistration' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function loadGetterTupleStageTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    return { $$type: 'StageTrackRegistration' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract };
}

export function storeTupleStageTrackRegistration(source: StageTrackRegistration) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeNumber(source.fingerprint);
    builder.writeAddress(source.trackContract);
    return builder.build();
}

export function dictValueParserStageTrackRegistration(): DictionaryValue<StageTrackRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStageTrackRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadStageTrackRegistration(src.loadRef().beginParse());
        }
    }
}

export type TrackStagingAccepted = {
    $$type: 'TrackStagingAccepted';
    trackId: bigint;
}

export function storeTrackStagingAccepted(src: TrackStagingAccepted) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3557536937, 32);
        b_0.storeUint(src.trackId, 256);
    };
}

export function loadTrackStagingAccepted(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3557536937) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    return { $$type: 'TrackStagingAccepted' as const, trackId: _trackId };
}

export function loadTupleTrackStagingAccepted(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'TrackStagingAccepted' as const, trackId: _trackId };
}

export function loadGetterTupleTrackStagingAccepted(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'TrackStagingAccepted' as const, trackId: _trackId };
}

export function storeTupleTrackStagingAccepted(source: TrackStagingAccepted) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    return builder.build();
}

export function dictValueParserTrackStagingAccepted(): DictionaryValue<TrackStagingAccepted> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTrackStagingAccepted(src)).endCell());
        },
        parse: (src) => {
            return loadTrackStagingAccepted(src.loadRef().beginParse());
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

export type RollbackTrackRegistration = {
    $$type: 'RollbackTrackRegistration';
    trackId: bigint;
}

export function storeRollbackTrackRegistration(src: RollbackTrackRegistration) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1932918785, 32);
        b_0.storeUint(src.trackId, 256);
    };
}

export function loadRollbackTrackRegistration(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1932918785) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    return { $$type: 'RollbackTrackRegistration' as const, trackId: _trackId };
}

export function loadTupleRollbackTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'RollbackTrackRegistration' as const, trackId: _trackId };
}

export function loadGetterTupleRollbackTrackRegistration(source: TupleReader) {
    const _trackId = source.readBigNumber();
    return { $$type: 'RollbackTrackRegistration' as const, trackId: _trackId };
}

export function storeTupleRollbackTrackRegistration(source: RollbackTrackRegistration) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    return builder.build();
}

export function dictValueParserRollbackTrackRegistration(): DictionaryValue<RollbackTrackRegistration> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRollbackTrackRegistration(src)).endCell());
        },
        parse: (src) => {
            return loadRollbackTrackRegistration(src.loadRef().beginParse());
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

export type SetVersion = {
    $$type: 'SetVersion';
    newVersion: bigint;
}

export function storeSetVersion(src: SetVersion) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(60132687, 32);
        b_0.storeUint(src.newVersion, 32);
    };
}

export function loadSetVersion(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 60132687) { throw Error('Invalid prefix'); }
    const _newVersion = sc_0.loadUintBig(32);
    return { $$type: 'SetVersion' as const, newVersion: _newVersion };
}

export function loadTupleSetVersion(source: TupleReader) {
    const _newVersion = source.readBigNumber();
    return { $$type: 'SetVersion' as const, newVersion: _newVersion };
}

export function loadGetterTupleSetVersion(source: TupleReader) {
    const _newVersion = source.readBigNumber();
    return { $$type: 'SetVersion' as const, newVersion: _newVersion };
}

export function storeTupleSetVersion(source: SetVersion) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.newVersion);
    return builder.build();
}

export function dictValueParserSetVersion(): DictionaryValue<SetVersion> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetVersion(src)).endCell());
        },
        parse: (src) => {
            return loadSetVersion(src.loadRef().beginParse());
        }
    }
}

export type SetTrackRewardEligibility = {
    $$type: 'SetTrackRewardEligibility';
    trackId: bigint;
    eligible: boolean;
}

export function storeSetTrackRewardEligibility(src: SetTrackRewardEligibility) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(153587645, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeBit(src.eligible);
    };
}

export function loadSetTrackRewardEligibility(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 153587645) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _eligible = sc_0.loadBit();
    return { $$type: 'SetTrackRewardEligibility' as const, trackId: _trackId, eligible: _eligible };
}

export function loadTupleSetTrackRewardEligibility(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _eligible = source.readBoolean();
    return { $$type: 'SetTrackRewardEligibility' as const, trackId: _trackId, eligible: _eligible };
}

export function loadGetterTupleSetTrackRewardEligibility(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _eligible = source.readBoolean();
    return { $$type: 'SetTrackRewardEligibility' as const, trackId: _trackId, eligible: _eligible };
}

export function storeTupleSetTrackRewardEligibility(source: SetTrackRewardEligibility) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeBoolean(source.eligible);
    return builder.build();
}

export function dictValueParserSetTrackRewardEligibility(): DictionaryValue<SetTrackRewardEligibility> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetTrackRewardEligibility(src)).endCell());
        },
        parse: (src) => {
            return loadSetTrackRewardEligibility(src.loadRef().beginParse());
        }
    }
}

export type SetArtistRewardEligibility = {
    $$type: 'SetArtistRewardEligibility';
    artist: Address;
    eligible: boolean;
}

export function storeSetArtistRewardEligibility(src: SetArtistRewardEligibility) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2631390764, 32);
        b_0.storeAddress(src.artist);
        b_0.storeBit(src.eligible);
    };
}

export function loadSetArtistRewardEligibility(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2631390764) { throw Error('Invalid prefix'); }
    const _artist = sc_0.loadAddress();
    const _eligible = sc_0.loadBit();
    return { $$type: 'SetArtistRewardEligibility' as const, artist: _artist, eligible: _eligible };
}

export function loadTupleSetArtistRewardEligibility(source: TupleReader) {
    const _artist = source.readAddress();
    const _eligible = source.readBoolean();
    return { $$type: 'SetArtistRewardEligibility' as const, artist: _artist, eligible: _eligible };
}

export function loadGetterTupleSetArtistRewardEligibility(source: TupleReader) {
    const _artist = source.readAddress();
    const _eligible = source.readBoolean();
    return { $$type: 'SetArtistRewardEligibility' as const, artist: _artist, eligible: _eligible };
}

export function storeTupleSetArtistRewardEligibility(source: SetArtistRewardEligibility) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artist);
    builder.writeBoolean(source.eligible);
    return builder.build();
}

export function dictValueParserSetArtistRewardEligibility(): DictionaryValue<SetArtistRewardEligibility> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetArtistRewardEligibility(src)).endCell());
        },
        parse: (src) => {
            return loadSetArtistRewardEligibility(src.loadRef().beginParse());
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

export type PendingArtist = {
    $$type: 'PendingArtist';
    wallet: Address;
    artistContract: Address;
    timestamp: bigint;
}

export function storePendingArtist(src: PendingArtist) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.wallet);
        b_0.storeAddress(src.artistContract);
        b_0.storeUint(src.timestamp, 32);
    };
}

export function loadPendingArtist(slice: Slice) {
    const sc_0 = slice;
    const _wallet = sc_0.loadAddress();
    const _artistContract = sc_0.loadAddress();
    const _timestamp = sc_0.loadUintBig(32);
    return { $$type: 'PendingArtist' as const, wallet: _wallet, artistContract: _artistContract, timestamp: _timestamp };
}

export function loadTuplePendingArtist(source: TupleReader) {
    const _wallet = source.readAddress();
    const _artistContract = source.readAddress();
    const _timestamp = source.readBigNumber();
    return { $$type: 'PendingArtist' as const, wallet: _wallet, artistContract: _artistContract, timestamp: _timestamp };
}

export function loadGetterTuplePendingArtist(source: TupleReader) {
    const _wallet = source.readAddress();
    const _artistContract = source.readAddress();
    const _timestamp = source.readBigNumber();
    return { $$type: 'PendingArtist' as const, wallet: _wallet, artistContract: _artistContract, timestamp: _timestamp };
}

export function storeTuplePendingArtist(source: PendingArtist) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    builder.writeAddress(source.artistContract);
    builder.writeNumber(source.timestamp);
    return builder.build();
}

export function dictValueParserPendingArtist(): DictionaryValue<PendingArtist> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePendingArtist(src)).endCell());
        },
        parse: (src) => {
            return loadPendingArtist(src.loadRef().beginParse());
        }
    }
}

export type PendingTrack = {
    $$type: 'PendingTrack';
    trackId: bigint;
    fingerprint: bigint;
    trackContract: Address;
    timestamp: bigint;
}

export function storePendingTrack(src: PendingTrack) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.trackId, 256);
        b_0.storeUint(src.fingerprint, 256);
        b_0.storeAddress(src.trackContract);
        b_0.storeUint(src.timestamp, 32);
    };
}

export function loadPendingTrack(slice: Slice) {
    const sc_0 = slice;
    const _trackId = sc_0.loadUintBig(256);
    const _fingerprint = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    const _timestamp = sc_0.loadUintBig(32);
    return { $$type: 'PendingTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, timestamp: _timestamp };
}

export function loadTuplePendingTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    const _timestamp = source.readBigNumber();
    return { $$type: 'PendingTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, timestamp: _timestamp };
}

export function loadGetterTuplePendingTrack(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    const _timestamp = source.readBigNumber();
    return { $$type: 'PendingTrack' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, timestamp: _timestamp };
}

export function storeTuplePendingTrack(source: PendingTrack) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeNumber(source.fingerprint);
    builder.writeAddress(source.trackContract);
    builder.writeNumber(source.timestamp);
    return builder.build();
}

export function dictValueParserPendingTrack(): DictionaryValue<PendingTrack> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePendingTrack(src)).endCell());
        },
        parse: (src) => {
            return loadPendingTrack(src.loadRef().beginParse());
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

export type ArtistRegistered = {
    $$type: 'ArtistRegistered';
    wallet: Address;
    artistContract: Address;
    registeredAt: bigint;
}

export function storeArtistRegistered(src: ArtistRegistered) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3803150073, 32);
        b_0.storeAddress(src.wallet);
        b_0.storeAddress(src.artistContract);
        b_0.storeUint(src.registeredAt, 32);
    };
}

export function loadArtistRegistered(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3803150073) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    const _artistContract = sc_0.loadAddress();
    const _registeredAt = sc_0.loadUintBig(32);
    return { $$type: 'ArtistRegistered' as const, wallet: _wallet, artistContract: _artistContract, registeredAt: _registeredAt };
}

export function loadTupleArtistRegistered(source: TupleReader) {
    const _wallet = source.readAddress();
    const _artistContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'ArtistRegistered' as const, wallet: _wallet, artistContract: _artistContract, registeredAt: _registeredAt };
}

export function loadGetterTupleArtistRegistered(source: TupleReader) {
    const _wallet = source.readAddress();
    const _artistContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'ArtistRegistered' as const, wallet: _wallet, artistContract: _artistContract, registeredAt: _registeredAt };
}

export function storeTupleArtistRegistered(source: ArtistRegistered) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    builder.writeAddress(source.artistContract);
    builder.writeNumber(source.registeredAt);
    return builder.build();
}

export function dictValueParserArtistRegistered(): DictionaryValue<ArtistRegistered> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeArtistRegistered(src)).endCell());
        },
        parse: (src) => {
            return loadArtistRegistered(src.loadRef().beginParse());
        }
    }
}

export type TrackRegistered = {
    $$type: 'TrackRegistered';
    trackId: bigint;
    fingerprint: bigint;
    trackContract: Address;
    registeredAt: bigint;
}

export function storeTrackRegistered(src: TrackRegistered) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1961142070, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeUint(src.fingerprint, 256);
        b_0.storeAddress(src.trackContract);
        b_0.storeUint(src.registeredAt, 32);
    };
}

export function loadTrackRegistered(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1961142070) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _fingerprint = sc_0.loadUintBig(256);
    const _trackContract = sc_0.loadAddress();
    const _registeredAt = sc_0.loadUintBig(32);
    return { $$type: 'TrackRegistered' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, registeredAt: _registeredAt };
}

export function loadTupleTrackRegistered(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'TrackRegistered' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, registeredAt: _registeredAt };
}

export function loadGetterTupleTrackRegistered(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _fingerprint = source.readBigNumber();
    const _trackContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'TrackRegistered' as const, trackId: _trackId, fingerprint: _fingerprint, trackContract: _trackContract, registeredAt: _registeredAt };
}

export function storeTupleTrackRegistered(source: TrackRegistered) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeNumber(source.fingerprint);
    builder.writeAddress(source.trackContract);
    builder.writeNumber(source.registeredAt);
    return builder.build();
}

export function dictValueParserTrackRegistered(): DictionaryValue<TrackRegistered> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTrackRegistered(src)).endCell());
        },
        parse: (src) => {
            return loadTrackRegistered(src.loadRef().beginParse());
        }
    }
}

export type MintAuthorized = {
    $$type: 'MintAuthorized';
    recipient: Address;
    amount: bigint;
    origin: Address;
    authorizedAt: bigint;
}

export function storeMintAuthorized(src: MintAuthorized) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2843103275, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.origin);
        b_0.storeUint(src.authorizedAt, 32);
    };
}

export function loadMintAuthorized(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2843103275) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _origin = sc_0.loadAddress();
    const _authorizedAt = sc_0.loadUintBig(32);
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, origin: _origin, authorizedAt: _authorizedAt };
}

export function loadTupleMintAuthorized(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _origin = source.readAddress();
    const _authorizedAt = source.readBigNumber();
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, origin: _origin, authorizedAt: _authorizedAt };
}

export function loadGetterTupleMintAuthorized(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _origin = source.readAddress();
    const _authorizedAt = source.readBigNumber();
    return { $$type: 'MintAuthorized' as const, recipient: _recipient, amount: _amount, origin: _origin, authorizedAt: _authorizedAt };
}

export function storeTupleMintAuthorized(source: MintAuthorized) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.origin);
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

export type MintSuccess = {
    $$type: 'MintSuccess';
    recipient: Address;
    amount: bigint;
    origin: Address;
}

export function storeMintSuccess(src: MintSuccess) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(464637375, 32);
        b_0.storeAddress(src.recipient);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.origin);
    };
}

export function loadMintSuccess(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 464637375) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _origin = sc_0.loadAddress();
    return { $$type: 'MintSuccess' as const, recipient: _recipient, amount: _amount, origin: _origin };
}

export function loadTupleMintSuccess(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _origin = source.readAddress();
    return { $$type: 'MintSuccess' as const, recipient: _recipient, amount: _amount, origin: _origin };
}

export function loadGetterTupleMintSuccess(source: TupleReader) {
    const _recipient = source.readAddress();
    const _amount = source.readBigNumber();
    const _origin = source.readAddress();
    return { $$type: 'MintSuccess' as const, recipient: _recipient, amount: _amount, origin: _origin };
}

export function storeTupleMintSuccess(source: MintSuccess) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.origin);
    return builder.build();
}

export function dictValueParserMintSuccess(): DictionaryValue<MintSuccess> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintSuccess(src)).endCell());
        },
        parse: (src) => {
            return loadMintSuccess(src.loadRef().beginParse());
        }
    }
}

export type ConfirmTip = {
    $$type: 'ConfirmTip';
    trackId: bigint;
    recipient: Address;
}

export function storeConfirmTip(src: ConfirmTip) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(187859005, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeAddress(src.recipient);
    };
}

export function loadConfirmTip(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 187859005) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _recipient = sc_0.loadAddress();
    return { $$type: 'ConfirmTip' as const, trackId: _trackId, recipient: _recipient };
}

export function loadTupleConfirmTip(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'ConfirmTip' as const, trackId: _trackId, recipient: _recipient };
}

export function loadGetterTupleConfirmTip(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'ConfirmTip' as const, trackId: _trackId, recipient: _recipient };
}

export function storeTupleConfirmTip(source: ConfirmTip) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.recipient);
    return builder.build();
}

export function dictValueParserConfirmTip(): DictionaryValue<ConfirmTip> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfirmTip(src)).endCell());
        },
        parse: (src) => {
            return loadConfirmTip(src.loadRef().beginParse());
        }
    }
}

export type RegisterDrop = {
    $$type: 'RegisterDrop';
    trackId: bigint;
    dropContract: Address;
}

export function storeRegisterDrop(src: RegisterDrop) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2845755895, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeAddress(src.dropContract);
    };
}

export function loadRegisterDrop(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2845755895) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _dropContract = sc_0.loadAddress();
    return { $$type: 'RegisterDrop' as const, trackId: _trackId, dropContract: _dropContract };
}

export function loadTupleRegisterDrop(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _dropContract = source.readAddress();
    return { $$type: 'RegisterDrop' as const, trackId: _trackId, dropContract: _dropContract };
}

export function loadGetterTupleRegisterDrop(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _dropContract = source.readAddress();
    return { $$type: 'RegisterDrop' as const, trackId: _trackId, dropContract: _dropContract };
}

export function storeTupleRegisterDrop(source: RegisterDrop) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.dropContract);
    return builder.build();
}

export function dictValueParserRegisterDrop(): DictionaryValue<RegisterDrop> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterDrop(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterDrop(src.loadRef().beginParse());
        }
    }
}

export type SetPaused = {
    $$type: 'SetPaused';
    paused: boolean;
}

export function storeSetPaused(src: SetPaused) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(157817343, 32);
        b_0.storeBit(src.paused);
    };
}

export function loadSetPaused(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 157817343) { throw Error('Invalid prefix'); }
    const _paused = sc_0.loadBit();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadGetterTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function storeTupleSetPaused(source: SetPaused) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.paused);
    return builder.build();
}

export function dictValueParserSetPaused(): DictionaryValue<SetPaused> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPaused(src)).endCell());
        },
        parse: (src) => {
            return loadSetPaused(src.loadRef().beginParse());
        }
    }
}

export type DropRegistered = {
    $$type: 'DropRegistered';
    trackId: bigint;
    dropContract: Address;
    registeredAt: bigint;
}

export function storeDropRegistered(src: DropRegistered) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1376189393, 32);
        b_0.storeUint(src.trackId, 256);
        b_0.storeAddress(src.dropContract);
        b_0.storeUint(src.registeredAt, 32);
    };
}

export function loadDropRegistered(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1376189393) { throw Error('Invalid prefix'); }
    const _trackId = sc_0.loadUintBig(256);
    const _dropContract = sc_0.loadAddress();
    const _registeredAt = sc_0.loadUintBig(32);
    return { $$type: 'DropRegistered' as const, trackId: _trackId, dropContract: _dropContract, registeredAt: _registeredAt };
}

export function loadTupleDropRegistered(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _dropContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'DropRegistered' as const, trackId: _trackId, dropContract: _dropContract, registeredAt: _registeredAt };
}

export function loadGetterTupleDropRegistered(source: TupleReader) {
    const _trackId = source.readBigNumber();
    const _dropContract = source.readAddress();
    const _registeredAt = source.readBigNumber();
    return { $$type: 'DropRegistered' as const, trackId: _trackId, dropContract: _dropContract, registeredAt: _registeredAt };
}

export function storeTupleDropRegistered(source: DropRegistered) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.dropContract);
    builder.writeNumber(source.registeredAt);
    return builder.build();
}

export function dictValueParserDropRegistered(): DictionaryValue<DropRegistered> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDropRegistered(src)).endCell());
        },
        parse: (src) => {
            return loadDropRegistered(src.loadRef().beginParse());
        }
    }
}

export type ToonRegistry$Data = {
    $$type: 'ToonRegistry$Data';
    artists: Dictionary<Address, Address>;
    artistContracts: Dictionary<Address, Address>;
    tracks: Dictionary<bigint, Address>;
    trackContracts: Dictionary<Address, bigint>;
    drops: Dictionary<bigint, Address>;
    fingerprints: Dictionary<bigint, boolean>;
    mintAuthority: Address;
    vault: Address;
    isPaused: boolean;
    config: Configuration;
    version: bigint;
    trackRewardEligible: Dictionary<bigint, boolean>;
    artistRewardEligible: Dictionary<Address, boolean>;
    pendingArtists: Dictionary<Address, PendingArtist>;
    pendingTracks: Dictionary<bigint, PendingTrack>;
    totalArtists: bigint;
    totalTracks: bigint;
}

export function storeToonRegistry$Data(src: ToonRegistry$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeDict(src.artists, Dictionary.Keys.Address(), Dictionary.Values.Address());
        b_0.storeDict(src.artistContracts, Dictionary.Keys.Address(), Dictionary.Values.Address());
        const b_1 = new Builder();
        b_1.storeDict(src.tracks, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        b_1.storeDict(src.trackContracts, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.drops, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        const b_2 = new Builder();
        b_2.storeDict(src.fingerprints, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_2.storeAddress(src.mintAuthority);
        b_2.storeAddress(src.vault);
        b_2.storeBit(src.isPaused);
        const b_3 = new Builder();
        b_3.store(storeConfiguration(src.config));
        b_3.storeUint(src.version, 32);
        b_3.storeDict(src.trackRewardEligible, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_3.storeDict(src.artistRewardEligible, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        const b_4 = new Builder();
        b_4.storeDict(src.pendingArtists, Dictionary.Keys.Address(), dictValueParserPendingArtist());
        b_4.storeDict(src.pendingTracks, Dictionary.Keys.BigInt(257), dictValueParserPendingTrack());
        b_4.storeUint(src.totalArtists, 32);
        b_4.storeUint(src.totalTracks, 32);
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonRegistry$Data(slice: Slice) {
    const sc_0 = slice;
    const _artists = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Address(), sc_0);
    const _artistContracts = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Address(), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _tracks = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    const _trackContracts = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _drops = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _fingerprints = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    const _mintAuthority = sc_2.loadAddress();
    const _vault = sc_2.loadAddress();
    const _isPaused = sc_2.loadBit();
    const sc_3 = sc_2.loadRef().beginParse();
    const _config = loadConfiguration(sc_3);
    const _version = sc_3.loadUintBig(32);
    const _trackRewardEligible = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_3);
    const _artistRewardEligible = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_3);
    const sc_4 = sc_3.loadRef().beginParse();
    const _pendingArtists = Dictionary.load(Dictionary.Keys.Address(), dictValueParserPendingArtist(), sc_4);
    const _pendingTracks = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserPendingTrack(), sc_4);
    const _totalArtists = sc_4.loadUintBig(32);
    const _totalTracks = sc_4.loadUintBig(32);
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, isPaused: _isPaused, config: _config, version: _version, trackRewardEligible: _trackRewardEligible, artistRewardEligible: _artistRewardEligible, pendingArtists: _pendingArtists, pendingTracks: _pendingTracks, totalArtists: _totalArtists, totalTracks: _totalTracks };
}

export function loadTupleToonRegistry$Data(source: TupleReader) {
    const _artists = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _artistContracts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _tracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _trackContracts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _drops = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _fingerprints = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _mintAuthority = source.readAddress();
    const _vault = source.readAddress();
    const _isPaused = source.readBoolean();
    const _config = loadTupleConfiguration(source);
    const _version = source.readBigNumber();
    const _trackRewardEligible = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _artistRewardEligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _pendingArtists = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserPendingArtist(), source.readCellOpt());
    source = source.readTuple();
    const _pendingTracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPendingTrack(), source.readCellOpt());
    const _totalArtists = source.readBigNumber();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, isPaused: _isPaused, config: _config, version: _version, trackRewardEligible: _trackRewardEligible, artistRewardEligible: _artistRewardEligible, pendingArtists: _pendingArtists, pendingTracks: _pendingTracks, totalArtists: _totalArtists, totalTracks: _totalTracks };
}

export function loadGetterTupleToonRegistry$Data(source: TupleReader) {
    const _artists = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _artistContracts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _tracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _trackContracts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _drops = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _fingerprints = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _mintAuthority = source.readAddress();
    const _vault = source.readAddress();
    const _isPaused = source.readBoolean();
    const _config = loadGetterTupleConfiguration(source);
    const _version = source.readBigNumber();
    const _trackRewardEligible = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _artistRewardEligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _pendingArtists = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserPendingArtist(), source.readCellOpt());
    const _pendingTracks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPendingTrack(), source.readCellOpt());
    const _totalArtists = source.readBigNumber();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, isPaused: _isPaused, config: _config, version: _version, trackRewardEligible: _trackRewardEligible, artistRewardEligible: _artistRewardEligible, pendingArtists: _pendingArtists, pendingTracks: _pendingTracks, totalArtists: _totalArtists, totalTracks: _totalTracks };
}

export function storeTupleToonRegistry$Data(source: ToonRegistry$Data) {
    const builder = new TupleBuilder();
    builder.writeCell(source.artists.size > 0 ? beginCell().storeDictDirect(source.artists, Dictionary.Keys.Address(), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.artistContracts.size > 0 ? beginCell().storeDictDirect(source.artistContracts, Dictionary.Keys.Address(), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.tracks.size > 0 ? beginCell().storeDictDirect(source.tracks, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.trackContracts.size > 0 ? beginCell().storeDictDirect(source.trackContracts, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.drops.size > 0 ? beginCell().storeDictDirect(source.drops, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.fingerprints.size > 0 ? beginCell().storeDictDirect(source.fingerprints, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeAddress(source.mintAuthority);
    builder.writeAddress(source.vault);
    builder.writeBoolean(source.isPaused);
    builder.writeTuple(storeTupleConfiguration(source.config));
    builder.writeNumber(source.version);
    builder.writeCell(source.trackRewardEligible.size > 0 ? beginCell().storeDictDirect(source.trackRewardEligible, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.artistRewardEligible.size > 0 ? beginCell().storeDictDirect(source.artistRewardEligible, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.pendingArtists.size > 0 ? beginCell().storeDictDirect(source.pendingArtists, Dictionary.Keys.Address(), dictValueParserPendingArtist()).endCell() : null);
    builder.writeCell(source.pendingTracks.size > 0 ? beginCell().storeDictDirect(source.pendingTracks, Dictionary.Keys.BigInt(257), dictValueParserPendingTrack()).endCell() : null);
    builder.writeNumber(source.totalArtists);
    builder.writeNumber(source.totalTracks);
    return builder.build();
}

export function dictValueParserToonRegistry$Data(): DictionaryValue<ToonRegistry$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonRegistry$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonRegistry$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonRegistry_init_args = {
    $$type: 'ToonRegistry_init_args';
    mintAuthority: Address;
    vault: Address;
}

function initToonRegistry_init_args(src: ToonRegistry_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.mintAuthority);
        b_0.storeAddress(src.vault);
    };
}

async function ToonRegistry_init(mintAuthority: Address, vault: Address) {
    const __code = Cell.fromHex('b5ee9c7241026201001ba200022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d90124020271021c020120030b020120040603d9b540bda89a1a400031d15f481f480b205a203b679c61a223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1db678ae20be1ed983025270500448101012702714133f40c6fa19401d70030925b6de2206eb395206ef2d08092307fe20201c7070903d7a7fdda89a1a400031d15f481f480b205a203b679c61a223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1db678ae20be1ed9832527080030810101561802714133f40c6fa19401d70030925b6de26eb3033ba7c9da89a1a400031d15f481f480b205a203b679c61bb678ae20be1ed98325270a0002260201200c1102016a0d0f03d8abb1ed44d0d200018e8afa40fa405902d101db3ce30d111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6cc125270e0022810101561b0259f40c6fa192306ddf6eb303d8aaf9ed44d0d200018e8afa40fa405902d101db3ce30d111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6cc1252710002281010b561d0259f40a6fa192306ddf6eb30201201217020120131503d9af3276a268690000c7457d207d202c816880ed9e7186888d888e088d888d088d888d088c888d088c888c088c888c088b888c088b888b088b888b088a888b088a888a088a888a0889888a088988890889888908888889088888880888888807888807aa876d9e2b882f87b660c0252714001e81010b561d0259f40a6fa192306ddf033daf2576a268690000c7457d207d202c816880ed9e7186ed9e366636663626402527160030561256125612561256125612561256125612561256125612020158181a03d8a9a0ed44d0d200018e8afa40fa405902d101db3ce30d111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6cc1252719001e810101561b0259f40c6fa192306ddf033caa9eed44d0d200018e8afa40fa405902d101db3ce30ddb3c57105f0f6cc125271b000456150201201d220201201e2003d9b76e1da89a1a400031d15f481f480b205a203b679c61a223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1db678ae20be1ed983025271f004481010b2602714133f40a6fa19401d70030925b6de2206eb395206ef2d08092307fe2033db7993da89a1a400031d15f481f480b205a203b679c61bb678ae20be1ed98302527210004561403d9b8916ed44d0d200018e8afa40fa405902d101db3ce30d111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6cc18252723001e81010156190259f40c6fa192306ddf049a01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e8afa40fa405902d101db3ce30d111d945f0f5f0ee0111bd70d1ff2e082218210cc4fedf7bae302218210c8526e47ba2527292d01f06d6d6d6d6d6d6d6d6d6d7070207182202d79883d2000778103e88212540be40082112a05f2008218746a5288008220048c2739500082182e90edd00082180ba43b74002682089896808101f41119111b11191118111a11181117111911171116111811161115111711151114111611140f11130f0b11120b2600320a11110a09111009108f107e106d105c104b103a497708050602f8f404d401d0f404f404f404d430d0f404f404fa40fa40d200d430d0db3c0cd31ff404f404d430d0f404f404d31fd31f30111b111c111b1111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078571c111a111b111a1119111a11191118111911181117111811171116111711161115111611154f2800481114111511141113111411131112111311121111111211111110111111100f11100f550e01f831fa40fa40308200d9458d08600000000000000000000000000000000000000000000000000000000000000000045230c705b3f2f4812453561c81010b2359f40a6fa192306ddf6ef2f48200deda2481010b2359f40b6fa192306ddf206e92306d9dd0fa40fa40d31f55206c136f03e26ef2f481010bf823546240c82a02fc55205023cececb1fc9103512206e953059f45930944133f413e2821005f5e100718810355a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001119111b11191118111a11181117111911171116111811161115111711151114111611142b2c00260000000053746167696e67416363657074656401481113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f02fa8ef931fa40302281010b2259f40b6fa192306ddf206e92306d9dd0fa40fa40d31f55206c136f03e28200de5b216eb3f2f4206ef2d0806f23308139d3f84222c705f2f4111c81010b22561e206e953059f4593096c8ce4133f441e2111b81010b561d23206e953059f4593096c8ce4133f441e2111da481010b6dc8e0212e3001f4216e925b6d8e1301206ef2d0806f23550255205023cececb1fc9e210364140206e953059f45930944133f413e2f8235240561d01c855208210e2af76f95004cb1f12cececb1fc9c88258c000000000000000000000000101cb67ccc970fb00821005f5e1007105c80182100954aef858cb1fcec903111d0341502f01ec5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001118111b11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d5f044a8210e59974c3bae302218210c09310edbae302218210a47a6deebae30221821073360001ba3133373b01f631fa40302281010b2259f40b6fa192306ddf206e92306d9dd0fa40fa40d31f55206c136f03e28200de5b216eb3f2f4f82321206ef2d0806f236c21810e10a0bc8112d5f84203206ef2d0806f23303113c70592307fdef2f481010b6dc8216e925b6d8e1301206ef2d0806f23550255205023cececb1fc9e21034123201d4206e953059f45930944133f413e21119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103541435f01f831d3ffd3fffa4030f842111a111d111a1119111c11191118111b11181117111d11171116111c11161115111b11151114111d11141113111c11131112111b11121111111d11111110111c11100f111b0f0e111d0e0d111c0d0c111b0c0b111d0b0a111c0a09111b0908111d0807111c0706111b0605111d0504111c043402d803111b0302111d0201111c01111e8166711120561fdb3c01112101f2f481486f561cc300f2f4813f255619810101561e59f40c6fa192306ddf6ef2f4813aa856168101015620714133f40c6fa19401d70030925b6de26ef2f48200e4d722810101561e59f40d6fa192306ddf4c3501fc206e92306d9fd0d3ffd3fffa40d31f55306c146f04e26ef2f4810101f823561d0302112002111f01c855305034cbffcbffcecb1fc91201111d01561b01206e953059f45a30944133f415e2821005f5e10071111bc8018210d40bb4a958cb1fcbffc903111e031201111b015a6d6d40037fc8cf8580ca00cf8440ce01fa023601ec8069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001116111b11161115111a11151114111911141113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c0b11100b10af109e108d107c106b105a1049103847154363145f01fa31d3ff30218101012259f40d6fa192306ddf206e92306d9fd0d3ffd3fffa40d31f55306c146f04e281427d216eb3f2f4206ef2d0806f24308139d3f84222c705f2f4111b81010123561d206e953059f45a30944133f414e2111a81010b561c24810101216e955b59f4593098c801cf004133f441e21118810101227f713801d2216e955b59f45a3098c801cf004133f442e2111fa48101016dc8216e925b6d8e1601206ef2d0806f24550355305034cbffcbffcecb1fc9e210364150206e953059f45a30944133f415e2f823544250561c5006c85530821074e4a7365005cb1f13cbffcbffcecb1fc93901f6c88258c000000000000000000000000101cb67ccc970fb00821005f5e1007102c80182106a21f0df58cb1fcbffc903111b03125a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001119111b11191118111a11181116111911163a01601114111811141115111711151113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f043ce302218210de13870dbae30221821010859351bae3022182101bb1cdbfba3c3e414301fc31d3ff30218101012259f40d6fa192306ddf206e92306d9fd0d3ffd3fffa40d31f55306c146f04e281427d216eb3f2f4f82321206ef2d0806f246c31810e10a0bc8112d5f84203206ef2d0806f24135f0313c70592307fdef2f48101016dc8216e925b6d8e1601206ef2d0806f24550355305034cbffcbffcecb1fc9e2123d01ac206e953059f45a30944133f415e21119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f02fc31fa40fa00308200984f8d08600000000000000000000000000000000000000000000000000000000000000000045230c705b3f2f4816cf2f8425617c705f2f481256c21c200f2f4821005f5e10071f828f82310351024c855308210a976502b5005cb1f13ce01fa02cecb1fc9561555205a6d6d40037fc8cf8580ca00893f4000011001e2cf16ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f01f431fa40fa0030f8428200984f8d08600000000000000000000000000000000000000000000000000000000000000000045240c705b3f2f48200c596561a81010b238101014133f40a6fa19401d70030925b6de26eb3f2f4708040f82310355e31c855308210a976502b5005cb1f13ce01fa02cecb1fc9561550334201fc5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f03fe8f7d31fa40fa0031fa40308200f5bdf8425616c705f2f4561881010b228101014133f40a6fa19401d70030925b6de2206eb3925f03e30d1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c445f4500ae821005f5e1007102206ef2d0805004c85982100b32803d5003cb1fcbffcec910235a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00044ee0218210787cca54bae302218210db77da3fbae302218210a99ec9f7bae3022182102bd0b755ba46484a4e01fc31fa4030817c1e8d08600000000000000000000000000000000000000000000000000000000000000000045220c705b3f2f4816cf2f842011116c70501111501f2f41119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211104701180f11110f0e11100e10df551c5f01fc3157131112fa40308200e26a8d08600000000000000000000000000000000000000000000000000000000000000000045220c705b3f2f4816cf2f8425615c705f2f41119111b11191118111a111811171119111711161118111611151117111511141116111411131115111311141111111311111110111211100f11110f4901380e11100e10df10ce10bd10ac109b108a1079106810571046103544035f01fe31d3fffa4030f8428200b9488d08600000000000000000000000000000000000000000000000000000000000000000045230c705b3f2f4111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11104b02fe0f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c0908111c0807111c0706111c0605111c0504111c0403111c0302111c0201111d01111e816671111fdb3c01111f01f2f48200ad1e5617810101561e59f40c6fa192306ddf6ef2f41116810101561c561e206e953059f45a30944133f414e2f82302111c024c4d002281010b561c0259f40a6fa192306ddf6eb301e201111d01c8552082105206fbd15004cb1f12cbffcecb1fc9c88258c000000000000000000000000101cb67ccc970fb001118111b11181117111a11171116111911161115111811151113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf552b125f04fe8ff6316cc6db3c3c820095eff8425615c705f2f488c88258c000000000000000000000000101cb67ccc970fb001119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311110a11120a0911110908111008557710370610354444e021820b958d4f4f505f510060fa00d31fd31ffa00fa00fa00fa00fa00fa00d30fd401d0fa00d30f30102c102b102a1029102810271026102510241023003000000000436f6e66696775726174696f6e55706461746564043ebae30221821009278fbdbae3022182109cd7d62cbae3022182100e849a55ba5255575902fe313504d31f308200bc6cf8425615c705f2f488c88258c000000000000000000000000101cb67ccc970fb001119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068535400240000000056657273696f6e5570646174656401f610570610354403c87f01ca00111c111b111a111911181117111611151114111311121111111055e001111b01111cf4001119c8f40001111801f40001111601f4001114c8f40001111301f40001111101ce1fce1dca00c855b00ddb3c12cb1f12f40012f40003c8f40014f40015cb1f15cb1f14cd13cdcdcdc9ed546001fc31d3ffd20030816e87f8425617c705f2f410258101015971216e955b59f45a3098c801cf004133f442e21119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910685601f610571046443512c87f01ca00111c111b111a111911181117111611151114111311121111111055e001111b01111cf4001119c8f40001111801f40001111601f4001114c8f40001111301f40001111101ce1fce1dca00c855b00ddb3c12cb1f12f40012f40003c8f40014f40015cb1f15cb1f14cd13cdcdcdc9ed546001fc31fa40d20030816e87f8425617c705f2f4102481010b5971216e955b59f4593098c801cf004133f441e21119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910685801fa105710461035504403c87f01ca00111c111b111a111911181117111611151114111311121111111055e001111b01111cf4001119c8f40001111801f40001111601f4001114c8f40001111301f40001111101ce1fce1dca00c855b00ddb3c12cb1f12f40012f40003c8f40014f40015cb1f15cb1f14cd13cdcdcdc9ed546004fa8f6c31d401d001d33f308bb656d697373696f6e4361708522001f90101f901ba933157118e468d041b5a5b95d85b1b195d1059d951185e5ce0522001f90101f901ba933157108e238d04dd185c99d95d11185a5b1e5058dd1a5d9a5d1e601201f90101f901ba913f9130e2e2e288e0018210946a98b6bae3025f0f5f0e5a5b5d61003a00000000436f6e66696775726174696f6e506172616d5570646174656402fcc88258c000000000000000000000000101cb67ccc970fb00708040561256125612561256125612561256125612561256125612c855b082102bd0b755500dcb1f0cdb3cc9561555205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00605c01901119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c5f01e8d33f30c8018210aff90f5758cb1fcb3fc9111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430125e0146f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb005f01e8c87f01ca00111c111b111a111911181117111611151114111311121111111055e001111b01111cf4001119c8f40001111801f40001111601f4001114c8f40001111301f40001111101ce1fce1dca00c855b00ddb3c12cb1f12f40012f40003c8f40014f40015cb1f15cb1f14cd13cdcdcdc9ed5460005050cbfa0219cb1f17cb1f5005fa025003fa0201fa0201fa0201fa0201fa02cb0fc85003fa02cb0fcd0006f2c08221da110c');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonRegistry_init_args({ $$type: 'ToonRegistry_init_args', mintAuthority, vault })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonRegistry_errors = {
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
    4821: { message: "ToonRegistry: rollback not allowed yet" },
    9299: { message: "ToonRegistry: wallet already has an artist identity" },
    9580: { message: "ToonRegistry: mint amount must be positive" },
    14803: { message: "ToonRegistry: unauthorized confirmation" },
    15016: { message: "ToonRegistry: duplicate content fingerprint detected" },
    16165: { message: "ToonRegistry: trackId already exists" },
    17021: { message: "ToonRegistry: no pending track found" },
    18543: { message: "ToonRegistry: trackId cannot be zero" },
    26225: { message: "ToonRegistry: caller is not a registered ToonArtist contract" },
    27890: { message: "ToonRegistry: caller is not the mint authority" },
    28295: { message: "ToonRegistry: only mint authority can update eligibility" },
    31774: { message: "ToonRegistry: invalid new authority address" },
    38383: { message: "ToonRegistry: only mint authority can update config" },
    38991: { message: "ToonRegistry: invalid recipient address" },
    44318: { message: "ToonRegistry: drop already exists for this track" },
    47432: { message: "ToonRegistry: invalid drop contract address" },
    48236: { message: "ToonRegistry: only mint authority can update version" },
    50582: { message: "ToonRegistry: caller is not a registered ToonTrack contract" },
    55621: { message: "ToonRegistry: invalid artist contract address" },
    56923: { message: "ToonRegistry: no pending registration found" },
    57050: { message: "ToonRegistry: registration already pending" },
    57962: { message: "ToonRegistry: invalid vault address" },
    58583: { message: "ToonRegistry: track registration already pending" },
    62909: { message: "ToonRegistry: only vault can confirm mint success" },
} as const

export const ToonRegistry_errors_backward = {
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
    "ToonRegistry: rollback not allowed yet": 4821,
    "ToonRegistry: wallet already has an artist identity": 9299,
    "ToonRegistry: mint amount must be positive": 9580,
    "ToonRegistry: unauthorized confirmation": 14803,
    "ToonRegistry: duplicate content fingerprint detected": 15016,
    "ToonRegistry: trackId already exists": 16165,
    "ToonRegistry: no pending track found": 17021,
    "ToonRegistry: trackId cannot be zero": 18543,
    "ToonRegistry: caller is not a registered ToonArtist contract": 26225,
    "ToonRegistry: caller is not the mint authority": 27890,
    "ToonRegistry: only mint authority can update eligibility": 28295,
    "ToonRegistry: invalid new authority address": 31774,
    "ToonRegistry: only mint authority can update config": 38383,
    "ToonRegistry: invalid recipient address": 38991,
    "ToonRegistry: drop already exists for this track": 44318,
    "ToonRegistry: invalid drop contract address": 47432,
    "ToonRegistry: only mint authority can update version": 48236,
    "ToonRegistry: caller is not a registered ToonTrack contract": 50582,
    "ToonRegistry: invalid artist contract address": 55621,
    "ToonRegistry: no pending registration found": 56923,
    "ToonRegistry: registration already pending": 57050,
    "ToonRegistry: invalid vault address": 57962,
    "ToonRegistry: track registration already pending": 58583,
    "ToonRegistry: only vault can confirm mint success": 62909,
} as const

const ToonRegistry_types: ABIType[] = [
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
    {"name":"AuthorizeMint","header":3725821709,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"StageArtistRegistration","header":3427790327,"fields":[{"name":"artistContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ConfirmArtistRegistration","header":3360845383,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ArtistRegistrationConfirmed","header":156544760,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RollbackArtistRegistration","header":3852039363,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"StageTrackRegistration","header":3230863597,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TrackStagingAccepted","header":3557536937,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"ConfirmTrackRegistration","header":2759486958,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TrackRegistrationConfirmed","header":1780609247,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"RollbackTrackRegistration","header":1932918785,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"UpdateMintAuthority","header":2021444180,"fields":[{"name":"newAuthority","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateVaultAddress","header":3682064959,"fields":[{"name":"newVault","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RequestMint","header":277189457,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"SetConfig","header":735098709,"fields":[{"name":"config","type":{"kind":"simple","type":"Configuration","optional":false}}]},
    {"name":"SetVersion","header":60132687,"fields":[{"name":"newVersion","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"SetTrackRewardEligibility","header":153587645,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"eligible","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetArtistRewardEligibility","header":2631390764,"fields":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}},{"name":"eligible","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"UpdateConfigParam","header":243571285,"fields":[{"name":"parameter","type":{"kind":"simple","type":"string","optional":false}},{"name":"newValue","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"PendingArtist","header":null,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"artistContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"timestamp","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"PendingTrack","header":null,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"timestamp","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"Configuration","header":null,"fields":[{"name":"emissionCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minWalletAgeDays","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetDailyActivity","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"rewardBaseActiveListener","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseGrowthAgent","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseArtistLaunch","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseTrendsetter","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseEarlyBeliever","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardBaseDropInvestor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"decayFactor","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minThreshold","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"antiFarmingCoeff","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"ArtistRegistered","header":3803150073,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"artistContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"TrackRegistered","header":1961142070,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"MintAuthorized","header":2843103275,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"origin","type":{"kind":"simple","type":"address","optional":false}},{"name":"authorizedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"MintSuccess","header":464637375,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"origin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ConfirmTip","header":187859005,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RegisterDrop","header":2845755895,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"dropContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPaused","header":157817343,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DropRegistered","header":1376189393,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"dropContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ToonRegistry$Data","header":null,"fields":[{"name":"artists","type":{"kind":"dict","key":"address","value":"address"}},{"name":"artistContracts","type":{"kind":"dict","key":"address","value":"address"}},{"name":"tracks","type":{"kind":"dict","key":"int","value":"address"}},{"name":"trackContracts","type":{"kind":"dict","key":"address","value":"int"}},{"name":"drops","type":{"kind":"dict","key":"int","value":"address"}},{"name":"fingerprints","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"mintAuthority","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"isPaused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"config","type":{"kind":"simple","type":"Configuration","optional":false}},{"name":"version","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"trackRewardEligible","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"artistRewardEligible","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"pendingArtists","type":{"kind":"dict","key":"address","value":"PendingArtist","valueFormat":"ref"}},{"name":"pendingTracks","type":{"kind":"dict","key":"int","value":"PendingTrack","valueFormat":"ref"}},{"name":"totalArtists","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalTracks","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
]

const ToonRegistry_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "RegisterArtist": 3754294261,
    "RegisterTrack": 2360656451,
    "AuthorizeMint": 3725821709,
    "StageArtistRegistration": 3427790327,
    "ConfirmArtistRegistration": 3360845383,
    "ArtistRegistrationConfirmed": 156544760,
    "RollbackArtistRegistration": 3852039363,
    "StageTrackRegistration": 3230863597,
    "TrackStagingAccepted": 3557536937,
    "ConfirmTrackRegistration": 2759486958,
    "TrackRegistrationConfirmed": 1780609247,
    "RollbackTrackRegistration": 1932918785,
    "UpdateMintAuthority": 2021444180,
    "UpdateVaultAddress": 3682064959,
    "RequestMint": 277189457,
    "SetConfig": 735098709,
    "SetVersion": 60132687,
    "SetTrackRewardEligibility": 153587645,
    "SetArtistRewardEligibility": 2631390764,
    "UpdateConfigParam": 243571285,
    "ArtistRegistered": 3803150073,
    "TrackRegistered": 1961142070,
    "MintAuthorized": 2843103275,
    "MintSuccess": 464637375,
    "ConfirmTip": 187859005,
    "RegisterDrop": 2845755895,
    "SetPaused": 157817343,
    "DropRegistered": 1376189393,
}

const ToonRegistry_getters: ABIGetter[] = [
    {"name":"getArtistContract","methodId":91748,"arguments":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"getTrackContract","methodId":96672,"arguments":[{"name":"trackId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"getDropContract","methodId":117014,"arguments":[{"name":"trackId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"isRegisteredArtist","methodId":87801,"arguments":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"isRegisteredTrack","methodId":86961,"arguments":[{"name":"trackId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"fingerprintExists","methodId":74238,"arguments":[{"name":"fingerprint","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getMintAuthority","methodId":97950,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"vault","methodId":113865,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"getConfig","methodId":93770,"arguments":[],"returnType":{"kind":"simple","type":"Configuration","optional":false}},
    {"name":"getVersion","methodId":74724,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isTrackRewardEligible","methodId":68101,"arguments":[{"name":"trackId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"isArtistRewardEligible","methodId":105328,"arguments":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const ToonRegistry_getterMapping: { [key: string]: string } = {
    'getArtistContract': 'getGetArtistContract',
    'getTrackContract': 'getGetTrackContract',
    'getDropContract': 'getGetDropContract',
    'isRegisteredArtist': 'getIsRegisteredArtist',
    'isRegisteredTrack': 'getIsRegisteredTrack',
    'fingerprintExists': 'getFingerprintExists',
    'getMintAuthority': 'getGetMintAuthority',
    'vault': 'getVault',
    'getConfig': 'getGetConfig',
    'getVersion': 'getGetVersion',
    'isTrackRewardEligible': 'getIsTrackRewardEligible',
    'isArtistRewardEligible': 'getIsArtistRewardEligible',
}

const ToonRegistry_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"StageArtistRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfirmArtistRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RollbackArtistRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"StageTrackRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfirmTrackRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RollbackTrackRegistration"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AuthorizeMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RequestMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintSuccess"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateMintAuthority"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateVaultAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterDrop"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetConfig"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetVersion"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetTrackRewardEligibility"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetArtistRewardEligibility"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateConfigParam"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonRegistry implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonRegistry_errors_backward;
    public static readonly opcodes = ToonRegistry_opcodes;
    
    static async init(mintAuthority: Address, vault: Address) {
        return await ToonRegistry_init(mintAuthority, vault);
    }
    
    static async fromInit(mintAuthority: Address, vault: Address) {
        const __gen_init = await ToonRegistry_init(mintAuthority, vault);
        const address = contractAddress(0, __gen_init);
        return new ToonRegistry(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonRegistry(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonRegistry_types,
        getters: ToonRegistry_getters,
        receivers: ToonRegistry_receivers,
        errors: ToonRegistry_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: StageArtistRegistration | ConfirmArtistRegistration | RollbackArtistRegistration | StageTrackRegistration | ConfirmTrackRegistration | RollbackTrackRegistration | AuthorizeMint | RequestMint | MintSuccess | UpdateMintAuthority | UpdateVaultAddress | RegisterDrop | SetConfig | SetVersion | SetTrackRewardEligibility | SetArtistRewardEligibility | UpdateConfigParam | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'StageArtistRegistration') {
            body = beginCell().store(storeStageArtistRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfirmArtistRegistration') {
            body = beginCell().store(storeConfirmArtistRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RollbackArtistRegistration') {
            body = beginCell().store(storeRollbackArtistRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'StageTrackRegistration') {
            body = beginCell().store(storeStageTrackRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfirmTrackRegistration') {
            body = beginCell().store(storeConfirmTrackRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RollbackTrackRegistration') {
            body = beginCell().store(storeRollbackTrackRegistration(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AuthorizeMint') {
            body = beginCell().store(storeAuthorizeMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RequestMint') {
            body = beginCell().store(storeRequestMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintSuccess') {
            body = beginCell().store(storeMintSuccess(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateMintAuthority') {
            body = beginCell().store(storeUpdateMintAuthority(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateVaultAddress') {
            body = beginCell().store(storeUpdateVaultAddress(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RegisterDrop') {
            body = beginCell().store(storeRegisterDrop(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetConfig') {
            body = beginCell().store(storeSetConfig(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetVersion') {
            body = beginCell().store(storeSetVersion(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetTrackRewardEligibility') {
            body = beginCell().store(storeSetTrackRewardEligibility(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetArtistRewardEligibility') {
            body = beginCell().store(storeSetArtistRewardEligibility(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateConfigParam') {
            body = beginCell().store(storeUpdateConfigParam(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetArtistContract(provider: ContractProvider, wallet: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(wallet);
        const source = (await provider.get('getArtistContract', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetTrackContract(provider: ContractProvider, trackId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(trackId);
        const source = (await provider.get('getTrackContract', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetDropContract(provider: ContractProvider, trackId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(trackId);
        const source = (await provider.get('getDropContract', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getIsRegisteredArtist(provider: ContractProvider, wallet: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(wallet);
        const source = (await provider.get('isRegisteredArtist', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getIsRegisteredTrack(provider: ContractProvider, trackId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(trackId);
        const source = (await provider.get('isRegisteredTrack', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getFingerprintExists(provider: ContractProvider, fingerprint: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(fingerprint);
        const source = (await provider.get('fingerprintExists', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetMintAuthority(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getMintAuthority', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getVault(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('vault', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }

    async getGetConfig(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getConfig', builder.build())).stack;
        const result = loadGetterTupleConfiguration(source);
        return result;
    }
    
    async getGetVersion(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getVersion', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsTrackRewardEligible(provider: ContractProvider, trackId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(trackId);
        const source = (await provider.get('isTrackRewardEligible', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getIsArtistRewardEligible(provider: ContractProvider, artist: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(artist);
        const source = (await provider.get('isArtistRewardEligible', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}
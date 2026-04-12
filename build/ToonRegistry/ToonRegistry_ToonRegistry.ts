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
        b_1.storeDict(src.fingerprints, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeAddress(src.mintAuthority);
        b_1.storeAddress(src.vault);
        b_1.storeUint(src.totalArtists, 32);
        b_1.storeUint(src.totalTracks, 32);
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
    const _fingerprints = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _mintAuthority = sc_1.loadAddress();
    const _vault = sc_1.loadAddress();
    const _totalArtists = sc_1.loadUintBig(32);
    const _totalTracks = sc_1.loadUintBig(32);
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, totalArtists: _totalArtists, totalTracks: _totalTracks };
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
    const _totalArtists = source.readBigNumber();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, totalArtists: _totalArtists, totalTracks: _totalTracks };
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
    const _totalArtists = source.readBigNumber();
    const _totalTracks = source.readBigNumber();
    return { $$type: 'ToonRegistry$Data' as const, artists: _artists, artistContracts: _artistContracts, tracks: _tracks, trackContracts: _trackContracts, drops: _drops, fingerprints: _fingerprints, mintAuthority: _mintAuthority, vault: _vault, totalArtists: _totalArtists, totalTracks: _totalTracks };
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
    const __code = Cell.fromHex('b5ee9c7241022301000809000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9011502027102130201200305019dba1feed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e25509db3c6ca1804002e8101012602714133f40c6fa19401d70030925b6de26eb3020120060b02016a0709019cabb1ed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e25509db3c6ca1080020810101290259f40c6fa192306ddf6eb3019caaf9ed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e25509db3c6ca10a002081010b2b0259f40a6fa192306ddf6eb30201200c0e019db1993b51343480006387fd013500743d013d013d01350c343d013d013e903e9034c7f4c7cc04269b06a3873e903e901640b4405b5b5b5b5b5b5c08041e441a0415c411840d440938954276cf1b28600d001c81010b2b0259f40a6fa192306ddf0201580f11019ca9a0ed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e25509db3c6ca110001c810101290259f40c6fa192306ddf0198aa9eed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e2db3c6ca112000223019dbe48b76a268690000c70ffa026a00e87a027a027a026a18687a027a027d207d20698fe98f98084d360d470e7d207d202c816880b6b6b6b6b6b6b810083c8834082b8823081a8812712a84ed9e3650c14001c810101270259f40c6fa192306ddf02f83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1ff404d401d0f404f404f404d430d0f404f404fa40fa40d31fd31f30109a6c1a8e1cfa40fa405902d1016d6d6d6d6d6d7020107910681057104610351024e20b925f0be009d70d1ff2e082218210dfc5fbf5bae3022182108cb4c243ba161701f631fa4030f8428124532a81010b2359f40a6fa192306ddf6ef2f40981010b53a2206e953059f4593096c8ce4133f441e20881010b532a206e953059f4593096c8ce4133f441e20aa4f8234aa0c855208210e2af76f95004cb1f12cececb1fc9c88258c000000000000000000000000101cb67ccc970fb00106955151a03fee302218210de13870dba8ef131fa40fa0030816cf2f84225c705f2f481256c21c200f2f4708040f8234430c855208210fa1d125c5004cb1f12ce01fa02cb1fc92355205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010795516e021181a1b02fe31d3ffd3fffa4030f842109b5e37106a105b104a103b4acd8166710edb3c1ef2f4813f25278101012d59f40c6fa192306ddf6ef2f4813aa8248101012c714133f40c6fa19401d70030925b6de26ef2f40681010153bc206e953059f45a30944133f414e20581010b53cb810101216e955b59f4593098c801cf004133f441e2201901b2038101012a7f71216e955b59f45a3098c801cf004133f442e20ca4f823103b4ac0c85530821074e4a7365005cb1f13cbffcbffcecb1fc9c88258c000000000000000000000000101cb67ccc970fb00105910484716403305041a0054c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed5404dc821010859351bae302218210787cca54ba8e3e31fa4030816cf2f8425004c70513f2f410795516c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed54e0218210db77da3fbae302218210a99ec9f7bae302018210946a98b6ba1c1e1f2201fc31fa40fa00308200c59681010bf84229598101014133f40a6fa19401d70030925b6de26eb3f2f4708040f8234430c855208210fa1d125c5004cb1f12ce01fa02cb1fc92355205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010791d00585516c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed54007a6c21fa4030816cf2f84223c705f2f410795516c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed5402fc31d3fffa4030f842109a108a107a106a105a104a103a4abc8166710ddb3c1df2f48200ad1e258101012c59f40c6fa192306ddf6ef2f40481010153ab206e953059f45a30944133f414e2f8234ab0c8552082105206fbd15004cb1f12cbffcecb1fc9c88258c000000000000000000000000101cb67ccc970fb00106910582021002081010b2a0259f40a6fa192306ddf6eb3005e1047034446c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed5400ea8e6dd33f30c8018210aff90f5758cb1fcb3fc9108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca005590509af40007c8f40016f40014f40002c8f400f40012ce12ce13cb1f13cb1fcdcdc9ed54e05f0bf2c082663539f5');
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
    9299: { message: "ToonRegistry: wallet already has an artist identity" },
    9580: { message: "ToonRegistry: mint amount must be positive" },
    15016: { message: "ToonRegistry: duplicate content fingerprint detected" },
    16165: { message: "ToonRegistry: trackId already exists" },
    26225: { message: "ToonRegistry: caller is not a registered ToonArtist contract" },
    27890: { message: "ToonRegistry: caller is not the mint authority" },
    44318: { message: "ToonRegistry: drop already exists for this track" },
    50582: { message: "ToonRegistry: caller is not a registered ToonTrack contract" },
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
    "ToonRegistry: wallet already has an artist identity": 9299,
    "ToonRegistry: mint amount must be positive": 9580,
    "ToonRegistry: duplicate content fingerprint detected": 15016,
    "ToonRegistry: trackId already exists": 16165,
    "ToonRegistry: caller is not a registered ToonArtist contract": 26225,
    "ToonRegistry: caller is not the mint authority": 27890,
    "ToonRegistry: drop already exists for this track": 44318,
    "ToonRegistry: caller is not a registered ToonTrack contract": 50582,
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
    {"name":"UpdateMintAuthority","header":2021444180,"fields":[{"name":"newAuthority","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateVaultAddress","header":3682064959,"fields":[{"name":"newVault","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RequestMint","header":277189457,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ArtistRegistered","header":3803150073,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"artistContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"TrackRegistered","header":1961142070,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"fingerprint","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"trackContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"MintAuthorized","header":4196209244,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"authorizedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"RegisterDrop","header":2845755895,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"dropContract","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"DropRegistered","header":1376189393,"fields":[{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"dropContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ToonRegistry$Data","header":null,"fields":[{"name":"artists","type":{"kind":"dict","key":"address","value":"address"}},{"name":"artistContracts","type":{"kind":"dict","key":"address","value":"address"}},{"name":"tracks","type":{"kind":"dict","key":"int","value":"address"}},{"name":"trackContracts","type":{"kind":"dict","key":"address","value":"int"}},{"name":"drops","type":{"kind":"dict","key":"int","value":"address"}},{"name":"fingerprints","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"mintAuthority","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalArtists","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalTracks","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
]

const ToonRegistry_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "RegisterArtist": 3754294261,
    "RegisterTrack": 2360656451,
    "AuthorizeMint": 3725821709,
    "UpdateMintAuthority": 2021444180,
    "UpdateVaultAddress": 3682064959,
    "RequestMint": 277189457,
    "ArtistRegistered": 3803150073,
    "TrackRegistered": 1961142070,
    "MintAuthorized": 4196209244,
    "RegisterDrop": 2845755895,
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
]

export const ToonRegistry_getterMapping: { [key: string]: string } = {
    'getArtistContract': 'getGetArtistContract',
    'getTrackContract': 'getGetTrackContract',
    'getDropContract': 'getGetDropContract',
    'isRegisteredArtist': 'getIsRegisteredArtist',
    'isRegisteredTrack': 'getIsRegisteredTrack',
    'fingerprintExists': 'getFingerprintExists',
    'getMintAuthority': 'getGetMintAuthority',
}

const ToonRegistry_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterArtist"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterTrack"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AuthorizeMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RequestMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateMintAuthority"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateVaultAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterDrop"}},
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: RegisterArtist | RegisterTrack | AuthorizeMint | RequestMint | UpdateMintAuthority | UpdateVaultAddress | RegisterDrop | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RegisterArtist') {
            body = beginCell().store(storeRegisterArtist(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RegisterTrack') {
            body = beginCell().store(storeRegisterTrack(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AuthorizeMint') {
            body = beginCell().store(storeAuthorizeMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RequestMint') {
            body = beginCell().store(storeRequestMint(message)).endCell();
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
    
}
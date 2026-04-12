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

export type PurchaseSlice = {
    $$type: 'PurchaseSlice';
    amount: bigint;
}

export function storePurchaseSlice(src: PurchaseSlice) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3107486065, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadPurchaseSlice(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3107486065) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'PurchaseSlice' as const, amount: _amount };
}

export function loadTuplePurchaseSlice(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'PurchaseSlice' as const, amount: _amount };
}

export function loadGetterTuplePurchaseSlice(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'PurchaseSlice' as const, amount: _amount };
}

export function storeTuplePurchaseSlice(source: PurchaseSlice) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserPurchaseSlice(): DictionaryValue<PurchaseSlice> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePurchaseSlice(src)).endCell());
        },
        parse: (src) => {
            return loadPurchaseSlice(src.loadRef().beginParse());
        }
    }
}

export type DistributeRoyalty = {
    $$type: 'DistributeRoyalty';
}

export function storeDistributeRoyalty(src: DistributeRoyalty) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3470364060, 32);
    };
}

export function loadDistributeRoyalty(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3470364060) { throw Error('Invalid prefix'); }
    return { $$type: 'DistributeRoyalty' as const };
}

export function loadTupleDistributeRoyalty(source: TupleReader) {
    return { $$type: 'DistributeRoyalty' as const };
}

export function loadGetterTupleDistributeRoyalty(source: TupleReader) {
    return { $$type: 'DistributeRoyalty' as const };
}

export function storeTupleDistributeRoyalty(source: DistributeRoyalty) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserDistributeRoyalty(): DictionaryValue<DistributeRoyalty> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDistributeRoyalty(src)).endCell());
        },
        parse: (src) => {
            return loadDistributeRoyalty(src.loadRef().beginParse());
        }
    }
}

export type Refund = {
    $$type: 'Refund';
    investor: Address;
}

export function storeRefund(src: Refund) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1045332178, 32);
        b_0.storeAddress(src.investor);
    };
}

export function loadRefund(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1045332178) { throw Error('Invalid prefix'); }
    const _investor = sc_0.loadAddress();
    return { $$type: 'Refund' as const, investor: _investor };
}

export function loadTupleRefund(source: TupleReader) {
    const _investor = source.readAddress();
    return { $$type: 'Refund' as const, investor: _investor };
}

export function loadGetterTupleRefund(source: TupleReader) {
    const _investor = source.readAddress();
    return { $$type: 'Refund' as const, investor: _investor };
}

export function storeTupleRefund(source: Refund) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.investor);
    return builder.build();
}

export function dictValueParserRefund(): DictionaryValue<Refund> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRefund(src)).endCell());
        },
        parse: (src) => {
            return loadRefund(src.loadRef().beginParse());
        }
    }
}

export type ToonDrop$Data = {
    $$type: 'ToonDrop$Data';
    artist: Address;
    trackId: bigint;
    registry: Address;
    vault: Address;
    royaltyPercentage: bigint;
    raiseTarget: bigint;
    currentRaise: bigint;
    slicePrice: bigint;
    deadline: bigint;
    isLocked: boolean;
    isSuccessful: boolean;
    investments: Dictionary<Address, bigint>;
    investorCount: bigint;
}

export function storeToonDrop$Data(src: ToonDrop$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeUint(src.trackId, 256);
        b_0.storeAddress(src.registry);
        const b_1 = new Builder();
        b_1.storeAddress(src.vault);
        b_1.storeUint(src.royaltyPercentage, 16);
        b_1.storeCoins(src.raiseTarget);
        b_1.storeCoins(src.currentRaise);
        b_1.storeCoins(src.slicePrice);
        b_1.storeUint(src.deadline, 32);
        b_1.storeBit(src.isLocked);
        b_1.storeBit(src.isSuccessful);
        b_1.storeDict(src.investments, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeUint(src.investorCount, 32);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadToonDrop$Data(slice: Slice) {
    const sc_0 = slice;
    const _artist = sc_0.loadAddress();
    const _trackId = sc_0.loadUintBig(256);
    const _registry = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _vault = sc_1.loadAddress();
    const _royaltyPercentage = sc_1.loadUintBig(16);
    const _raiseTarget = sc_1.loadCoins();
    const _currentRaise = sc_1.loadCoins();
    const _slicePrice = sc_1.loadCoins();
    const _deadline = sc_1.loadUintBig(32);
    const _isLocked = sc_1.loadBit();
    const _isSuccessful = sc_1.loadBit();
    const _investments = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _investorCount = sc_1.loadUintBig(32);
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, currentRaise: _currentRaise, slicePrice: _slicePrice, deadline: _deadline, isLocked: _isLocked, isSuccessful: _isSuccessful, investments: _investments, investorCount: _investorCount };
}

export function loadTupleToonDrop$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _trackId = source.readBigNumber();
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _royaltyPercentage = source.readBigNumber();
    const _raiseTarget = source.readBigNumber();
    const _currentRaise = source.readBigNumber();
    const _slicePrice = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _isLocked = source.readBoolean();
    const _isSuccessful = source.readBoolean();
    const _investments = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _investorCount = source.readBigNumber();
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, currentRaise: _currentRaise, slicePrice: _slicePrice, deadline: _deadline, isLocked: _isLocked, isSuccessful: _isSuccessful, investments: _investments, investorCount: _investorCount };
}

export function loadGetterTupleToonDrop$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _trackId = source.readBigNumber();
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _royaltyPercentage = source.readBigNumber();
    const _raiseTarget = source.readBigNumber();
    const _currentRaise = source.readBigNumber();
    const _slicePrice = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _isLocked = source.readBoolean();
    const _isSuccessful = source.readBoolean();
    const _investments = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _investorCount = source.readBigNumber();
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, currentRaise: _currentRaise, slicePrice: _slicePrice, deadline: _deadline, isLocked: _isLocked, isSuccessful: _isSuccessful, investments: _investments, investorCount: _investorCount };
}

export function storeTupleToonDrop$Data(source: ToonDrop$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artist);
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.registry);
    builder.writeAddress(source.vault);
    builder.writeNumber(source.royaltyPercentage);
    builder.writeNumber(source.raiseTarget);
    builder.writeNumber(source.currentRaise);
    builder.writeNumber(source.slicePrice);
    builder.writeNumber(source.deadline);
    builder.writeBoolean(source.isLocked);
    builder.writeBoolean(source.isSuccessful);
    builder.writeCell(source.investments.size > 0 ? beginCell().storeDictDirect(source.investments, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.investorCount);
    return builder.build();
}

export function dictValueParserToonDrop$Data(): DictionaryValue<ToonDrop$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeToonDrop$Data(src)).endCell());
        },
        parse: (src) => {
            return loadToonDrop$Data(src.loadRef().beginParse());
        }
    }
}

 type ToonDrop_init_args = {
    $$type: 'ToonDrop_init_args';
    artist: Address;
    trackId: bigint;
    registry: Address;
    vault: Address;
    royaltyPct: bigint;
    target: bigint;
    price: bigint;
    duration: bigint;
}

function initToonDrop_init_args(src: ToonDrop_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.artist);
        b_0.storeInt(src.trackId, 257);
        b_0.storeAddress(src.registry);
        const b_1 = new Builder();
        b_1.storeAddress(src.vault);
        b_1.storeInt(src.royaltyPct, 257);
        b_1.storeInt(src.target, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.price, 257);
        b_2.storeInt(src.duration, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function ToonDrop_init(artist: Address, trackId: bigint, registry: Address, vault: Address, royaltyPct: bigint, target: bigint, price: bigint, duration: bigint) {
    const __code = Cell.fromHex('b5ee9c7241020f01000500000262ff008e88f4a413f4bcf2c80bed53208e9c30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862e1ed43d9010501efa65778bb51343480006389be9034fffe903500743e9034c3fe803e803e8034c7f48034803d0134c7cc042b442b042adb07638ffe9020404075c03e903500743e9020404075c020404075c0350c3420404075c020404075c00c04160415c415823455419b7e08d6281c1c1c08840d840d504c38b6cf1b34600204dcc86f00016f8c6d6f8c8b87261697365643a208db3c278e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c8b12f8db3c288e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d00404040303a2db3c8be207c20696e766573746f72733a208db3c218e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c6f2201c993216eb396016f2259ccc9e831d004040400b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f0302feed44d0d200018e26fa40d3fffa40d401d0fa40d30ffa00fa00fa00d31fd200d200f404d31f3010ad10ac10ab6c1d8e3ffa40810101d700fa40d401d0fa40810101d700810101d700d430d0810101d700810101d7003010581057105608d155066df82358a070707022103610354130e20e925f0ee02cd749c21fe3000cf901060b02d80cd31f218210b9387971bae302218210ced98d9cba8e495b81311a21f2f48200b44bf84229c705f2f410ac5519c87f01ca0055c050cdce1acbff18ce06c8ce15cb0f5003fa0201fa0201fa02cb1f12ca0012ca0012f40012cb1fcdc9ed54db31e0018210946a98b6bae3020c070a02ea31fa0030816ccf23b3f2f4810edef82325bbf2f4f842702e81010b238101014133f40a6fa19401d70030925b6de2206eb39631206ef2d08094300fa40fe281010b5113a0103f12810101216e955b59f4593098c801cf004133f441e2505ca05305bee30010ac109b108a10791068105706103544300809013c10ac109b108a10791068105706103544307fdb3c0c0a0850b619175e31130d0066c87f01ca0055c050cdce1acbff18ce06c8ce15cb0f5003fa0201fa0201fa02cb1f12ca0012ca0012f40012cb1fcdc9ed54db3100f6d33f30c8018210aff90f5758cb1fcb3fc910bd10ac109b108a107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055c050cdce1acbff18ce06c8ce15cb0f5003fa0201fa0201fa02cb1f12ca0012ca0012f40012cb1fcdc9ed54db31015482f0aeed1ccdf669775eaacb65b293ce27fb10dc5d8c9e1f702d7dd1608a36d7c84dbae3025f0df2c0820c02b621b394f82323bc9170e28f195345b98e8710ac551970db3c8e8710ac55197fdb3ce20c5591de10ac5519c87f01ca0055c050cdce1acbff18ce06c8ce15cb0f5003fa0201fa0201fa02cb1f12ca0012ca0012f40012cb1fcdc9ed540d0d018a33337f228ebd708040882f55205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00de030e0028000000005261697365205375636365737366756c6af46cce');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initToonDrop_init_args({ $$type: 'ToonDrop_init_args', artist, trackId, registry, vault, royaltyPct, target, price, duration })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ToonDrop_errors = {
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
    3806: { message: "ToonDrop: offering deadline passed" },
    12570: { message: "ToonDrop: not successful, cannot distribute royalties" },
    27855: { message: "ToonDrop: offering is locked" },
    46155: { message: "ToonDrop: only vault can distribute royalties" },
} as const

export const ToonDrop_errors_backward = {
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
    "ToonDrop: offering deadline passed": 3806,
    "ToonDrop: not successful, cannot distribute royalties": 12570,
    "ToonDrop: offering is locked": 27855,
    "ToonDrop: only vault can distribute royalties": 46155,
} as const

const ToonDrop_types: ABIType[] = [
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
    {"name":"PurchaseSlice","header":3107486065,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"DistributeRoyalty","header":3470364060,"fields":[]},
    {"name":"Refund","header":1045332178,"fields":[{"name":"investor","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ToonDrop$Data","header":null,"fields":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}},{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"royaltyPercentage","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"raiseTarget","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"currentRaise","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"slicePrice","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"isLocked","type":{"kind":"simple","type":"bool","optional":false}},{"name":"isSuccessful","type":{"kind":"simple","type":"bool","optional":false}},{"name":"investments","type":{"kind":"dict","key":"address","value":"int"}},{"name":"investorCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
]

const ToonDrop_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "PurchaseSlice": 3107486065,
    "DistributeRoyalty": 3470364060,
    "Refund": 1045332178,
}

const ToonDrop_getters: ABIGetter[] = [
    {"name":"stats","methodId":89570,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
]

export const ToonDrop_getterMapping: { [key: string]: string } = {
    'stats': 'getStats',
}

const ToonDrop_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"PurchaseSlice"}},
    {"receiver":"internal","message":{"kind":"text","text":"CheckDeadline"}},
    {"receiver":"internal","message":{"kind":"typed","type":"DistributeRoyalty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonDrop implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ToonDrop_errors_backward;
    public static readonly opcodes = ToonDrop_opcodes;
    
    static async init(artist: Address, trackId: bigint, registry: Address, vault: Address, royaltyPct: bigint, target: bigint, price: bigint, duration: bigint) {
        return await ToonDrop_init(artist, trackId, registry, vault, royaltyPct, target, price, duration);
    }
    
    static async fromInit(artist: Address, trackId: bigint, registry: Address, vault: Address, royaltyPct: bigint, target: bigint, price: bigint, duration: bigint) {
        const __gen_init = await ToonDrop_init(artist, trackId, registry, vault, royaltyPct, target, price, duration);
        const address = contractAddress(0, __gen_init);
        return new ToonDrop(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ToonDrop(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ToonDrop_types,
        getters: ToonDrop_getters,
        receivers: ToonDrop_receivers,
        errors: ToonDrop_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: PurchaseSlice | "CheckDeadline" | DistributeRoyalty | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PurchaseSlice') {
            body = beginCell().store(storePurchaseSlice(message)).endCell();
        }
        if (message === "CheckDeadline") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'DistributeRoyalty') {
            body = beginCell().store(storeDistributeRoyalty(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('stats', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
}
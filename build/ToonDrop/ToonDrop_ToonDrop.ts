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

export type DepositRoyalty = {
    $$type: 'DepositRoyalty';
}

export function storeDepositRoyalty(src: DepositRoyalty) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2733497489, 32);
    };
}

export function loadDepositRoyalty(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2733497489) { throw Error('Invalid prefix'); }
    return { $$type: 'DepositRoyalty' as const };
}

export function loadTupleDepositRoyalty(source: TupleReader) {
    return { $$type: 'DepositRoyalty' as const };
}

export function loadGetterTupleDepositRoyalty(source: TupleReader) {
    return { $$type: 'DepositRoyalty' as const };
}

export function storeTupleDepositRoyalty(source: DepositRoyalty) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserDepositRoyalty(): DictionaryValue<DepositRoyalty> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDepositRoyalty(src)).endCell());
        },
        parse: (src) => {
            return loadDepositRoyalty(src.loadRef().beginParse());
        }
    }
}

export type ClaimRoyaltyShare = {
    $$type: 'ClaimRoyaltyShare';
}

export function storeClaimRoyaltyShare(src: ClaimRoyaltyShare) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3132281701, 32);
    };
}

export function loadClaimRoyaltyShare(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3132281701) { throw Error('Invalid prefix'); }
    return { $$type: 'ClaimRoyaltyShare' as const };
}

export function loadTupleClaimRoyaltyShare(source: TupleReader) {
    return { $$type: 'ClaimRoyaltyShare' as const };
}

export function loadGetterTupleClaimRoyaltyShare(source: TupleReader) {
    return { $$type: 'ClaimRoyaltyShare' as const };
}

export function storeTupleClaimRoyaltyShare(source: ClaimRoyaltyShare) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserClaimRoyaltyShare(): DictionaryValue<ClaimRoyaltyShare> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimRoyaltyShare(src)).endCell());
        },
        parse: (src) => {
            return loadClaimRoyaltyShare(src.loadRef().beginParse());
        }
    }
}

export type Refund = {
    $$type: 'Refund';
}

export function storeRefund(src: Refund) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2910599901, 32);
    };
}

export function loadRefund(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2910599901) { throw Error('Invalid prefix'); }
    return { $$type: 'Refund' as const };
}

export function loadTupleRefund(source: TupleReader) {
    return { $$type: 'Refund' as const };
}

export function loadGetterTupleRefund(source: TupleReader) {
    return { $$type: 'Refund' as const };
}

export function storeTupleRefund(source: Refund) {
    const builder = new TupleBuilder();
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

export type RecoverStuckFunds = {
    $$type: 'RecoverStuckFunds';
    recipient: Address;
}

export function storeRecoverStuckFunds(src: RecoverStuckFunds) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3538090535, 32);
        b_0.storeAddress(src.recipient);
    };
}

export function loadRecoverStuckFunds(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3538090535) { throw Error('Invalid prefix'); }
    const _recipient = sc_0.loadAddress();
    return { $$type: 'RecoverStuckFunds' as const, recipient: _recipient };
}

export function loadTupleRecoverStuckFunds(source: TupleReader) {
    const _recipient = source.readAddress();
    return { $$type: 'RecoverStuckFunds' as const, recipient: _recipient };
}

export function loadGetterTupleRecoverStuckFunds(source: TupleReader) {
    const _recipient = source.readAddress();
    return { $$type: 'RecoverStuckFunds' as const, recipient: _recipient };
}

export function storeTupleRecoverStuckFunds(source: RecoverStuckFunds) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.recipient);
    return builder.build();
}

export function dictValueParserRecoverStuckFunds(): DictionaryValue<RecoverStuckFunds> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRecoverStuckFunds(src)).endCell());
        },
        parse: (src) => {
            return loadRecoverStuckFunds(src.loadRef().beginParse());
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
    slicePrice: bigint;
    deadline: bigint;
    currentRaise: bigint;
    isLocked: boolean;
    isSuccessful: boolean;
    investorCount: bigint;
    investments: Dictionary<Address, bigint>;
    totalRoyaltiesReceived: bigint;
    claimedRoyalties: Dictionary<Address, bigint>;
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
        b_1.storeCoins(src.slicePrice);
        b_1.storeUint(src.deadline, 32);
        b_1.storeCoins(src.currentRaise);
        b_1.storeBit(src.isLocked);
        b_1.storeBit(src.isSuccessful);
        b_1.storeUint(src.investorCount, 32);
        b_1.storeDict(src.investments, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeCoins(src.totalRoyaltiesReceived);
        b_1.storeDict(src.claimedRoyalties, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
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
    const _slicePrice = sc_1.loadCoins();
    const _deadline = sc_1.loadUintBig(32);
    const _currentRaise = sc_1.loadCoins();
    const _isLocked = sc_1.loadBit();
    const _isSuccessful = sc_1.loadBit();
    const _investorCount = sc_1.loadUintBig(32);
    const _investments = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _totalRoyaltiesReceived = sc_1.loadCoins();
    const _claimedRoyalties = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, slicePrice: _slicePrice, deadline: _deadline, currentRaise: _currentRaise, isLocked: _isLocked, isSuccessful: _isSuccessful, investorCount: _investorCount, investments: _investments, totalRoyaltiesReceived: _totalRoyaltiesReceived, claimedRoyalties: _claimedRoyalties };
}

export function loadTupleToonDrop$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _trackId = source.readBigNumber();
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _royaltyPercentage = source.readBigNumber();
    const _raiseTarget = source.readBigNumber();
    const _slicePrice = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _currentRaise = source.readBigNumber();
    const _isLocked = source.readBoolean();
    const _isSuccessful = source.readBoolean();
    const _investorCount = source.readBigNumber();
    const _investments = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalRoyaltiesReceived = source.readBigNumber();
    const _claimedRoyalties = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, slicePrice: _slicePrice, deadline: _deadline, currentRaise: _currentRaise, isLocked: _isLocked, isSuccessful: _isSuccessful, investorCount: _investorCount, investments: _investments, totalRoyaltiesReceived: _totalRoyaltiesReceived, claimedRoyalties: _claimedRoyalties };
}

export function loadGetterTupleToonDrop$Data(source: TupleReader) {
    const _artist = source.readAddress();
    const _trackId = source.readBigNumber();
    const _registry = source.readAddress();
    const _vault = source.readAddress();
    const _royaltyPercentage = source.readBigNumber();
    const _raiseTarget = source.readBigNumber();
    const _slicePrice = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _currentRaise = source.readBigNumber();
    const _isLocked = source.readBoolean();
    const _isSuccessful = source.readBoolean();
    const _investorCount = source.readBigNumber();
    const _investments = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalRoyaltiesReceived = source.readBigNumber();
    const _claimedRoyalties = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'ToonDrop$Data' as const, artist: _artist, trackId: _trackId, registry: _registry, vault: _vault, royaltyPercentage: _royaltyPercentage, raiseTarget: _raiseTarget, slicePrice: _slicePrice, deadline: _deadline, currentRaise: _currentRaise, isLocked: _isLocked, isSuccessful: _isSuccessful, investorCount: _investorCount, investments: _investments, totalRoyaltiesReceived: _totalRoyaltiesReceived, claimedRoyalties: _claimedRoyalties };
}

export function storeTupleToonDrop$Data(source: ToonDrop$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.artist);
    builder.writeNumber(source.trackId);
    builder.writeAddress(source.registry);
    builder.writeAddress(source.vault);
    builder.writeNumber(source.royaltyPercentage);
    builder.writeNumber(source.raiseTarget);
    builder.writeNumber(source.slicePrice);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.currentRaise);
    builder.writeBoolean(source.isLocked);
    builder.writeBoolean(source.isSuccessful);
    builder.writeNumber(source.investorCount);
    builder.writeCell(source.investments.size > 0 ? beginCell().storeDictDirect(source.investments, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.totalRoyaltiesReceived);
    builder.writeCell(source.claimedRoyalties.size > 0 ? beginCell().storeDictDirect(source.claimedRoyalties, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
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
    const __code = Cell.fromHex('b5ee9c7241023801000dbf000262ff008e88f4a413f4bcf2c80bed53208e9c30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862e1ed43d9011f020271020b020120030601fbb97d6ed44d0d200018e2afa40d3fffa40d401d0fa40d30ffa00fa00d31ffa00d200d200d31ff404fa00f4043010cf10ce10cd6c1f8e44fa40810101d700fa40d401d0fa40810101d700810101d700d430d0810101d700810101d7003010581057105608d155066d6df8235003a070707053221057104610354403e2550e8040108db3c6cf105005c81010b24028101014133f40a6fa19401d70030925b6de2206e917f9327c000e2923070e0206ef2d08022a827a90402fbb9de2ed44d0d200018e2afa40d3fffa40d401d0fa40d30ffa00fa00d31ffa00d200d200d31ff404fa00f4043010cf10ce10cd6c1f8e44fa40810101d700fa40d401d0fa40810101d700810101d700d430d0810101d700810101d7003010581057105608d155066d6df8235003a070707053221057104610354403e2db3c8071b04dcc86f00016f8c6d6f8c8b87261697365643a208db3c278e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c8b12f8db3c2a8e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d00a0a0a08049edb3c8be207c20696e766573746f72733a208db3c248e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c8be207c20726f79616c746965733a2080a0a0a09027edb3c228e22c821c10098802d01cb0701a301de019a7aa90ca630541220c000e63068a592cb07e4da11c9d0db3c6f2201c993216eb396016f2259ccc9e831d00a0a00b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f030201200c150201200d130201200e1002fbb23f7b5134348000638abe9034fffe903500743e9034c3fe803e8034c7fe803480348034c7fd013e803d010c0433c43384335b07e3913e9020404075c03e903500743e9020404075c020404075c0350c3420404075c020404075c00c04160415c415823455419b5b7e08d400e81c1c1c14c88415c411840d5100f8b6cf200f1b00022401fbb320fb5134348000638abe9034fffe903500743e9034c3fe803e8034c7fe803480348034c7fd013e803d010c0433c43384335b07e3913e9020404075c03e903500743e9020404075c020404075c0350c3420404075c020404075c00c04160415c415823455419b5b7e08d400e81c1c1c14c88415c411840d5100f89543a0110108db3c6cf112004881010b22028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e202fbb4d5dda89a1a400031c55f481a7fff481a803a1f481a61ff401f401a63ff401a401a401a63fe809f401e80860219e219c219ad83f1c89f481020203ae01f481a803a1f481020203ae01020203ae01a861a1020203ae01020203ae006020b020ae20ac11a2aa0cdadbf046a00740e0e0e0a64420ae208c206a8807c5b6790141b000221020158161802fbb13b7b5134348000638abe9034fffe903500743e9034c3fe803e8034c7fe803480348034c7fd013e803d010c0433c43384335b07e3913e9020404075c03e903500743e9020404075c020404075c0350c3420404075c020404075c00c04160415c415823455419b5b7e08d400e81c1c1c14c88415c411840d5100f8b6cf20171b000225020166191c02f9a7b3da89a1a400031c55f481a7fff481a803a1f481a61ff401f401a63ff401a401a401a63fe809f401e80860219e219c219ad83f1c89f481020203ae01f481a803a1f481020203ae01020203ae01a861a1020203ae01020203ae006020b020ae20ac11a2aa0cdadbf046a00740e0e0e0a64420ae208c206a8807c5b6791a1b00022600046cf101f9a4f1da89a1a400031c55f481a7fff481a803a1f481a61ff401f401a63ff401a401a401a63fe809f401e80860219e219c219ad83f1c89f481020203ae01f481a803a1f481020203ae01020203ae01a861a1020203ae01020203ae006020b020ae20ac11a2aa0cdadbf046a00740e0e0e0a64420ae208c206a8807c4aa1d1d0108db3c6cf11e00d62381010b228101014133f40a6fa19401d70030925b6de2206e917f9820206ef2d080c000e2917f9328c000e2925b70e0206ef2d08023a828a90481010b5443138101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e2a1208208989680b9923070e002fced44d0d200018e2afa40d3fffa40d401d0fa40d30ffa00fa00d31ffa00d200d200d31ff404fa00f4043010cf10ce10cd6c1f8e44fa40810101d700fa40d401d0fa40810101d700810101d700d430d0810101d700810101d7003010581057105608d155066d6df8235003a070707053221057104610354403e21110e3022e202100065f0f300266d749c21fe3000ef90182f0aeed1ccdf669775eaacb65b293ce27fb10dc5d8c9e1f702d7dd1608a36d7c84dbae3025f0ff2c082223304f40ed31f218210b9387971bae302218210a2eddc91ba8f5a5b8200f682f8422bc705f2f481738a23f2f4f8416f24135f038208989680a182008ea321c200f2f41ea088c88258c000000000000000000000000101cb67ccc970fb0010ce10bd10ac109b108a10791068105710461035440302e0218210bab2d365ba2327322802f431fa003082009d5125b3f2f4820087def82328bbf2f48153d75318bef2f4f8425396a1547220bc91309131e25122a120c2008ebb71882355205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb009130e22281010b228101012425005600000000546f6f6e44726f703a20726566756e64696e672065786365737320636f6e747269627574696f6e02ea4133f40a6fa19401d70030925b6de2206e8e1f3003a41281010b541043810101216e955b59f4593098c801cf004133f441e28e2381010b01206ef2d08023a0103412810101216e955b59f4593098c801cf004133f441e2e25055a05307bee30010ce10bd10ac109b108a10791068105706103544302632014810ce10bd10ac109b108a10791068105706103544307fdb3c0e0c0a0850d61b19175e311334002800000000526f79616c74794465706f7369746564043ce302218210ad7c3addbae302218210d2e2fa27bae302018210946a98b6ba292c2f3101fe5b81738a23f2f4811bdf2ec200f2f4f8422181010b228101014133f40a6fa19401d70030925b6de28153f2216eb39821206ef2d080c2009170e2f2f4206ef2d0802fa826a904561081010b238101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e266a181567a218208989680bef2f481010b5121a02a02be02111202011112015230810101216e955b59f4593098c801cf004133f441e27288021112025a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010ce551b2b32002200000000726f79616c74795f636c61696d02fe5b8174e4249223b39170e2f2f4f8422181010b228101014133f40a6fa19401d70030925b6de28200a3a8216eb39821206ef2d080c2009170e2f2f4206ef2d0800281010b2270810101216e955b59f4593098c801cf004133f441e25162a103a5728810245a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e012d2e001e0000000064726f705f726566756e6400d06eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010ce10bd10ac109b108a1079106810571610354433c87f01ca0055e050efce1ccbff1ace08c8ce17cb0f5005fa025003fa02cb1f01fa02ca00ca0012cb1f12f40058fa0212f400cdc9ed54db3102c831fa40308200be9ff8422fc705f2f48200e13525f2f4f8276f10820afaf080a18164ec21c200f2f472885a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010ce551b3032003200000000737475636b5f66756e64735f7265636f766572656401a08eccd33f30c8018210aff90f5758cb1fcb3fc910df10ce10bd10ac109b108a107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00e00e320070c87f01ca0055e050efce1ccbff1ace08c8ce17cb0f5005fa025003fa02cb1f01fa02ca00ca0012cb1f12f40058fa0212f400cdc9ed54db3101ce23b394f82326bc9170e28ea05347be10df10ce10bd10ac109b108a107910681057104610354430db3c0e55b1de10ce551bc87f01ca0055e050efce1ccbff1ace08c8ce17cb0f5005fa025003fa02cb1f01fa02ca00ca0012cb1f12f40058fa0212f400cdc9ed543402bc35357f248f56536aa8812710a9045370a120c2008ebc7288561255205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb009130e220c2009130e30dde053536003e0000000064726f705f72616973655f7375636365656465645f617274697374017672882e55205a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0037002a0000000064726f705f70726f746f636f6c5f66656597eb5e30');
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
    7135: { message: "ToonDrop: no royalties deposited yet" },
    21463: { message: "ToonDrop: below slice price" },
    21490: { message: "ToonDrop: no investment from caller" },
    22138: { message: "ToonDrop: claimable amount below dust threshold" },
    25836: { message: "ToonDrop: no recoverable balance" },
    29578: { message: "ToonDrop: raise not successful" },
    29924: { message: "ToonDrop: refunds only available after a failed raise" },
    34782: { message: "ToonDrop: deadline passed" },
    36515: { message: "ToonDrop: deposit too small to cover gas reserve" },
    40273: { message: "ToonDrop: offering locked" },
    41896: { message: "ToonDrop: nothing to refund" },
    48799: { message: "ToonDrop: only artist can recover stuck funds" },
    57653: { message: "ToonDrop: raise must be finalized first" },
    63106: { message: "ToonDrop: only vault may deposit royalties" },
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
    "ToonDrop: no royalties deposited yet": 7135,
    "ToonDrop: below slice price": 21463,
    "ToonDrop: no investment from caller": 21490,
    "ToonDrop: claimable amount below dust threshold": 22138,
    "ToonDrop: no recoverable balance": 25836,
    "ToonDrop: raise not successful": 29578,
    "ToonDrop: refunds only available after a failed raise": 29924,
    "ToonDrop: deadline passed": 34782,
    "ToonDrop: deposit too small to cover gas reserve": 36515,
    "ToonDrop: offering locked": 40273,
    "ToonDrop: nothing to refund": 41896,
    "ToonDrop: only artist can recover stuck funds": 48799,
    "ToonDrop: raise must be finalized first": 57653,
    "ToonDrop: only vault may deposit royalties": 63106,
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
    {"name":"DepositRoyalty","header":2733497489,"fields":[]},
    {"name":"ClaimRoyaltyShare","header":3132281701,"fields":[]},
    {"name":"Refund","header":2910599901,"fields":[]},
    {"name":"RecoverStuckFunds","header":3538090535,"fields":[{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ToonDrop$Data","header":null,"fields":[{"name":"artist","type":{"kind":"simple","type":"address","optional":false}},{"name":"trackId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"vault","type":{"kind":"simple","type":"address","optional":false}},{"name":"royaltyPercentage","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"raiseTarget","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"slicePrice","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"currentRaise","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"isLocked","type":{"kind":"simple","type":"bool","optional":false}},{"name":"isSuccessful","type":{"kind":"simple","type":"bool","optional":false}},{"name":"investorCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"investments","type":{"kind":"dict","key":"address","value":"int"}},{"name":"totalRoyaltiesReceived","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"claimedRoyalties","type":{"kind":"dict","key":"address","value":"int"}}]},
]

const ToonDrop_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "PurchaseSlice": 3107486065,
    "DepositRoyalty": 2733497489,
    "ClaimRoyaltyShare": 3132281701,
    "Refund": 2910599901,
    "RecoverStuckFunds": 3538090535,
}

const ToonDrop_getters: ABIGetter[] = [
    {"name":"stats","methodId":89570,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
    {"name":"isSuccessful","methodId":100605,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"isLocked","methodId":124141,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"currentRaise","methodId":128473,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"totalRoyalties","methodId":108206,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"investorClaimable","methodId":128632,"arguments":[{"name":"investor","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"investorTotal","methodId":71638,"arguments":[{"name":"investor","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"investorClaimed","methodId":105603,"arguments":[{"name":"investor","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const ToonDrop_getterMapping: { [key: string]: string } = {
    'stats': 'getStats',
    'isSuccessful': 'getIsSuccessful',
    'isLocked': 'getIsLocked',
    'currentRaise': 'getCurrentRaise',
    'totalRoyalties': 'getTotalRoyalties',
    'investorClaimable': 'getInvestorClaimable',
    'investorTotal': 'getInvestorTotal',
    'investorClaimed': 'getInvestorClaimed',
}

const ToonDrop_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"PurchaseSlice"}},
    {"receiver":"internal","message":{"kind":"text","text":"CheckDeadline"}},
    {"receiver":"internal","message":{"kind":"typed","type":"DepositRoyalty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimRoyaltyShare"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Refund"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RecoverStuckFunds"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class ToonDrop implements Contract {
    
    public static readonly DUST_THRESHOLD = 10000000n;
    public static readonly GAS_RESERVE = 10000000n;
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: PurchaseSlice | "CheckDeadline" | DepositRoyalty | ClaimRoyaltyShare | Refund | RecoverStuckFunds | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PurchaseSlice') {
            body = beginCell().store(storePurchaseSlice(message)).endCell();
        }
        if (message === "CheckDeadline") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'DepositRoyalty') {
            body = beginCell().store(storeDepositRoyalty(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimRoyaltyShare') {
            body = beginCell().store(storeClaimRoyaltyShare(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Refund') {
            body = beginCell().store(storeRefund(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RecoverStuckFunds') {
            body = beginCell().store(storeRecoverStuckFunds(message)).endCell();
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
    
    async getIsSuccessful(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isSuccessful', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getIsLocked(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isLocked', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getCurrentRaise(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('currentRaise', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getTotalRoyalties(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('totalRoyalties', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getInvestorClaimable(provider: ContractProvider, investor: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(investor);
        const source = (await provider.get('investorClaimable', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getInvestorTotal(provider: ContractProvider, investor: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(investor);
        const source = (await provider.get('investorTotal', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getInvestorClaimed(provider: ContractProvider, investor: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(investor);
        const source = (await provider.get('investorClaimed', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}
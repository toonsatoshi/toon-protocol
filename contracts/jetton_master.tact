import "@stdlib/deploy";
import "./jetton_wallet";

message MintJetton {
    to: Address;
    amount: Int as coins;
}

message(0x7bdd97de) BurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    responseDestination: Address?;
}

message(0x178d4519) InternalTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    responseAddress: Address?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell;
}

contract JettonMaster with Deployable {
    owner: Address;
    totalSupply: Int as coins;
    metadataUri: String;

    init(owner: Address, metadataUri: String) {
        self.owner = owner;
        self.totalSupply = 0;
        self.metadataUri = metadataUri;
    }

    receive(msg: MintJetton) {
        require(sender() == self.owner, "JettonMaster: not owner");
        require(msg.amount > 0, "JettonMaster: amount must be > 0");

        let walletInit: StateInit = initOf JettonWallet(msg.to, myAddress());
        let walletAddress: Address = contractAddress(walletInit);

        self.totalSupply = self.totalSupply + msg.amount;

        send(SendParameters{
            to: walletAddress,
            value: ton("0.08"),
            mode: SendPayGasSeparately,
            body: InternalTransfer{
                queryId: 0,
                amount: msg.amount,
                from: myAddress(),
                responseAddress: self.owner,
                forwardTonAmount: 0,
                forwardPayload: emptyCell()
            }.toCell(),
            code: walletInit.code,
            data: walletInit.data
        });
    }

    receive(msg: BurnNotification) {
        let walletInit: StateInit = initOf JettonWallet(msg.owner, myAddress());
        require(sender() == contractAddress(walletInit), "JettonMaster: bad burn sender");
        require(msg.amount > 0, "JettonMaster: amount must be > 0");
        require(self.totalSupply >= msg.amount, "JettonMaster: underflow");
        self.totalSupply = self.totalSupply - msg.amount;

        if (msg.responseDestination != null) {
            send(SendParameters{to: msg.responseDestination!!, value: 0, mode: SendRemainingValue | SendIgnoreErrors});
        }
    }

    get fun get_jetton_data(): (Int, Bool, Address, Cell, Cell) {
        let content: Cell = beginCell().storeStringTail(self.metadataUri).endCell();
        let walletCode: Cell = codeOf JettonWallet;
        return (self.totalSupply, true, self.owner, content, walletCode);
    }

    get fun get_wallet_address(owner: Address): Address {
        let walletInit: StateInit = initOf JettonWallet(owner, myAddress());
        return contractAddress(walletInit);
    }
}

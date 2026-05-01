import "@stdlib/deploy";
import "./jetton_wallet";

message MintJetton {
    to: Address;
    amount: Int as coins;
}

message(0x7bdd97de) TokenBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    responseDestination: Address?;
}

message(21) ChangeAdmin {
    queryId: Int as uint64;
    newAdmin: Address;
}

message(3) ChangeMetadata {
    queryId: Int as uint64;
    content: Cell;
}

contract JettonMaster with Deployable {
    totalSupply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;

    init(owner: Address, metadataUri: String) {
        self.totalSupply = 0;
        self.owner = owner;
        self.content = beginCell().storeStringTail(metadataUri).endCell();
        self.mintable = true;
    }

    receive(msg: MintJetton) {
        require(sender() == self.owner, "JettonMaster: owner only");
        require(self.mintable, "JettonMaster: mint disabled");
        require(msg.amount > 0, "JettonMaster: invalid amount");

        let walletInit: StateInit = initOf JettonWallet(msg.to, myAddress());
        let walletAddress: Address = contractAddress(walletInit);

        send(SendParameters{
            to: walletAddress,
            value: ton("0.05"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: TokenTransferInternal{
                queryId: 0,
                amount: msg.amount,
                from: myAddress(),
                responseAddress: self.owner,
                forwardTonAmount: 0,
                forwardPayload: emptySlice()
            }.toCell(),
            code: walletInit.code,
            data: walletInit.data
        });

        self.totalSupply = self.totalSupply + msg.amount;
    }

    receive(msg: TokenBurnNotification) {
        let walletInit: StateInit = initOf JettonWallet(msg.owner, myAddress());
        require(sender() == contractAddress(walletInit), "JettonMaster: invalid burn sender");
        self.totalSupply = self.totalSupply - msg.amount;

        if (msg.responseDestination != null) {
            send(SendParameters{to: msg.responseDestination!!, value: 0, mode: SendRemainingValue, bounce: false});
        }
    }

    receive(msg: ChangeAdmin) {
        require(sender() == self.owner, "JettonMaster: owner only");
        self.owner = msg.newAdmin;
    }

    receive(msg: ChangeMetadata) {
        require(sender() == self.owner, "JettonMaster: owner only");
        self.content = msg.content;
    }

    get fun get_jetton_data(): (Int, Bool, Address, Cell, Cell) {
        return (self.totalSupply, self.mintable, self.owner, self.content, codeOf JettonWallet);
    }

    get fun get_wallet_address(owner: Address): Address {
        return contractAddress(initOf JettonWallet(owner, myAddress()));
    }
}

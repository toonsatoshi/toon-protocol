import "@stdlib/deploy";
import "./jetton_wallet";

message MintJetton {
    to: Address;
    amount: Int as coins;
}

message BurnNotification {
    owner: Address;
    amount: Int as coins;
}

message MintWalletCredit {
    amount: Int as coins;
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
            value: ton("0.05"),
            mode: SendIgnoreErrors,
            body: MintWalletCredit{ amount: msg.amount }.toCell(),
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

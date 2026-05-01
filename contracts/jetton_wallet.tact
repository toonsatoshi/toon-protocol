import "@stdlib/deploy";

message TransferJetton {
    to: Address;
    amount: Int as coins;
    forwardTonAmount: Int as coins;
}

message TransferNotification {
    from: Address;
    amount: Int as coins;
    forwardPayload: Cell;
}

message MintWalletCredit {
    amount: Int as coins;
}

contract JettonWallet with Deployable {
    owner: Address;
    master: Address;
    balance: Int as coins;

    init(owner: Address, master: Address) {
        self.owner = owner;
        self.master = master;
        self.balance = 0;
    }

    receive(msg: MintWalletCredit) {
        require(sender() == self.master, "JettonWallet: bad mint sender");
        require(msg.amount > 0, "JettonWallet: amount must be > 0");
        self.balance = self.balance + msg.amount;
    }

    receive(msg: TransferJetton) {
        require(sender() == self.owner, "JettonWallet: not owner");
        require(msg.amount > 0 && self.balance >= msg.amount, "JettonWallet: insufficient balance");
        self.balance = self.balance - msg.amount;
        send(SendParameters{
            to: msg.to,
            value: msg.forwardTonAmount,
            mode: SendIgnoreErrors,
            body: TransferNotification{from: self.owner, amount: msg.amount, forwardPayload: emptyCell()}.toCell()
        });
    }

    receive(msg: TransferNotification) {
        let expectedWalletSender: Address = contractAddress(initOf JettonWallet(msg.from, self.master));
        require(
            sender() == self.master ||
            sender() == self.owner ||
            sender() == msg.from ||
            sender() == expectedWalletSender,
            "JettonWallet: bad sender"
        );
        require(msg.amount > 0, "JettonWallet: amount must be > 0");
        self.balance = self.balance + msg.amount;
    }

    get fun balance(): Int { return self.balance; }
}

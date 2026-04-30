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

contract JettonWallet with Deployable {
    owner: Address;
    master: Address;
    balance: Int as coins;

    init(owner: Address, master: Address) {
        self.owner = owner;
        self.master = master;
        self.balance = 0;
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
        require(sender() == self.master || sender() == self.owner, "JettonWallet: bad sender");
        self.balance = self.balance + msg.amount;
    }

    get fun balance(): Int { return self.balance; }
}

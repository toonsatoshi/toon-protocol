import "@stdlib/deploy";

message(0xf8a7ea5) TransferJetton {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell;
}

message(0x7362d09c) TransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forwardPayload: Cell;
}

message(0x595f07bc) BurnJetton {
    queryId: Int as uint64;
    amount: Int as coins;
    responseDestination: Address?;
    customPayload: Cell?;
}

message(0x178d4519) InternalTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    responseAddress: Address?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell;
}

message(0x7bdd97de) BurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    responseDestination: Address?;
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

        let recipientInit: StateInit = initOf JettonWallet(msg.destination, self.master);
        let recipient: Address = contractAddress(recipientInit);

        send(SendParameters{
            to: recipient,
            value: ton("0.06"),
            mode: SendPayGasSeparately,
            body: InternalTransfer{
                queryId: msg.queryId,
                amount: msg.amount,
                from: self.owner,
                responseAddress: msg.responseDestination,
                forwardTonAmount: msg.forwardTonAmount,
                forwardPayload: msg.forwardPayload
            }.toCell(),
            code: recipientInit.code,
            data: recipientInit.data
        });
    }

    receive(msg: InternalTransfer) {
        let expectedWalletSender: Address = contractAddress(initOf JettonWallet(msg.from, self.master));
        require(sender() == self.master || sender() == expectedWalletSender, "JettonWallet: bad sender");
        require(msg.amount > 0, "JettonWallet: amount must be > 0");

        self.balance = self.balance + msg.amount;

        if (msg.forwardTonAmount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forwardTonAmount,
                mode: SendPayGasSeparately | SendIgnoreErrors,
                body: TransferNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    from: msg.from,
                    forwardPayload: msg.forwardPayload
                }.toCell()
            });
        }

        if (msg.responseAddress != null) {
            send(SendParameters{to: msg.responseAddress!!, value: 0, mode: SendRemainingValue | SendIgnoreErrors});
        }
    }

    receive(msg: BurnJetton) {
        require(sender() == self.owner, "JettonWallet: not owner");
        require(msg.amount > 0 && self.balance >= msg.amount, "JettonWallet: insufficient balance");
        self.balance = self.balance - msg.amount;
        send(SendParameters{
            to: self.master,
            value: ton("0.03"),
            mode: SendPayGasSeparately,
            body: BurnNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                owner: self.owner,
                responseDestination: msg.responseDestination
            }.toCell()
        });
    }

    get fun get_wallet_data(): (Int, Address, Address, Cell) {
        return (self.balance, self.owner, self.master, codeOf JettonWallet);
    }
}

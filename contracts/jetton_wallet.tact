import "@stdlib/deploy";

message(0xf8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0x178d4519) TokenTransferInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    responseAddress: Address?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forwardPayload: Slice as remaining;
}

message(0x595f07bc) TokenBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    responseDestination: Address?;
    customPayload: Cell?;
}

message(0x7bdd97de) TokenBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    responseDestination: Address?;
}

contract JettonWallet with Deployable {
    const MinTonsForStorage: Int = ton("0.01");
    const GasConsumption: Int = ton("0.01");

    balance: Int as coins;
    owner: Address;
    master: Address;

    init(owner: Address, master: Address) {
        self.balance = 0;
        self.owner = owner;
        self.master = master;
    }

    receive(msg: TokenTransfer) {
        require(sender() == self.owner, "JettonWallet: owner only");
        require(msg.amount > 0, "JettonWallet: invalid amount");
        require(self.balance >= msg.amount, "JettonWallet: insufficient funds");

        let ctx: Context = context();
        let fwdFee: Int = ctx.readForwardFee() + ctx.readForwardFee();
        let final: Int = 2 * self.GasConsumption + self.MinTonsForStorage + fwdFee;
        require(ctx.value > final, "JettonWallet: low ton attached");

        self.balance = self.balance - msg.amount;

        let init: StateInit = initOf JettonWallet(msg.destination, self.master);
        let toWallet: Address = contractAddress(init);

        send(SendParameters{
            to: toWallet,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenTransferInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                from: self.owner,
                responseAddress: msg.responseDestination,
                forwardTonAmount: msg.forwardTonAmount,
                forwardPayload: msg.forwardPayload
            }.toCell(),
            code: init.code,
            data: init.data
        });
    }

    receive(msg: TokenTransferInternal) {
        let expectedSender: Address = contractAddress(initOf JettonWallet(msg.from, self.master));
        require(sender() == self.master || sender() == expectedSender, "JettonWallet: invalid sender");
        require(msg.amount > 0, "JettonWallet: invalid amount");

        self.balance = self.balance + msg.amount;

        if (msg.forwardTonAmount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forwardTonAmount,
                bounce: false,
                body: TokenNotification{
                    queryId: msg.queryId,
                    amount: msg.amount,
                    from: msg.from,
                    forwardPayload: msg.forwardPayload
                }.toCell()
            });
        }
    }

    receive(msg: TokenBurn) {
        require(sender() == self.owner, "JettonWallet: owner only");
        require(msg.amount > 0, "JettonWallet: invalid amount");
        require(self.balance >= msg.amount, "JettonWallet: insufficient funds");

        let ctx: Context = context();
        let fwdFee: Int = ctx.readForwardFee();
        require(ctx.value > fwdFee + 2 * self.GasConsumption + self.MinTonsForStorage, "JettonWallet: low ton attached");

        self.balance = self.balance - msg.amount;

        send(SendParameters{
            to: self.master,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenBurnNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                owner: self.owner,
                responseDestination: msg.responseDestination
            }.toCell()
        });
    }

    bounced(msg: bounced<TokenTransferInternal>) {
        self.balance = self.balance + msg.amount;
    }

    get fun get_wallet_data(): (Int, Address, Address, Cell) {
        return (self.balance, self.owner, self.master, codeOf JettonWallet);
    }
}

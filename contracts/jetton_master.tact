import "@stdlib/deploy";

message MintJetton {
    to: Address;
    amount: Int as coins;
}

message BurnNotification {
    owner: Address;
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
        self.totalSupply = self.totalSupply + msg.amount;
        send(SendParameters{
            to: msg.to,
            value: 0,
            mode: SendRemainingValue,
            body: "jetton_mint_authorized".asComment()
        });
    }

    receive(msg: BurnNotification) {
        require(msg.amount > 0, "JettonMaster: amount must be > 0");
        require(self.totalSupply >= msg.amount, "JettonMaster: underflow");
        self.totalSupply = self.totalSupply - msg.amount;
    }

    get fun get_jetton_data(): (Int, Bool, Address, Cell, Cell) {
        let walletCode: Cell = emptyCell();
        let content: Cell = beginCell().storeStringTail(self.metadataUri).endCell();
        return (self.totalSupply, true, self.owner, content, walletCode);
    }
}

import "@stdlib/deploy";

// ── TEP-64 / TEP-74 Jetton standard structs ──────────────────────────────────

struct JettonData {
    totalSupply:  Int;
    mintable:     Bool;
    adminAddress: Address;
    content:      Cell;
    walletCode:   Cell;
}

// ── Messages ──────────────────────────────────────────────────────────────────

message(0xf8a7ea5) TokenTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    response_destination: Address?;
    customPayload: Cell?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x178d4519) TokenTransferInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    response_destination: Address?;
    forward_ton_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x7362d09c) TokenNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forward_payload: Slice as remaining;
}

message(0x595f07bc) TokenBurn {
    queryId: Int as uint64;
    amount: Int as coins;
    response_destination: Address?;
}

message(0x7bdd97de) TokenBurnNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    owner: Address;
    response_destination: Address?;
}

message(0xd53276db) TokenExcesses {
    queryId: Int as uint64;
}

message UpdateMintAuthority {
    newAuthority: Address;
}

message UpdateMetadata {
    newUri: String;
}

// ── ToonJettonMaster ──────────────────────────────────────────────────────────
//
//  TEP-74 compliant Jetton master for $TOON.
//  get_jetton_data() is the key getter — Tonkeeper reads this to display
//  the token name, symbol, decimals, and logo.
//
//  Metadata is stored as an off-chain URI (TEP-64 prefix 0x01).
//  Update metadataUri once GitHub/IPFS hosting is set up.
//
//  mintAuthority should be rotated to ToonVault after initial deploy
//  using the UpdateMintAuthority message.
//
contract ToonJettonMaster(
    owner:         Address,
    mintAuthority: Address,
    totalSupply:   Int as coins,
    metadataUri:   String,
) with Deployable {
    receive(msg: TokenBurnNotification) {
        require(sender() == self.mintAuthority, "Not authorized");
        self.totalSupply = self.totalSupply - msg.amount;
        if (msg.response_destination != null) {
            send(SendParameters{
                to:    msg.response_destination!!,
                value: 0,
                mode:  SendRemainingValue,
                body:  TokenExcesses{ queryId: msg.queryId }.toCell()
            });
        }
    }

    receive("mint") {
        require(sender() == self.mintAuthority, "Only ToonVault can mint");
        let amount: Int = ton("1000");
        self.totalSupply = self.totalSupply + amount;
        send(SendParameters{
            to:    sender(),
            value: 0,
            mode:  SendRemainingValue,
            body:  "minted".asComment()
        });
    }

    // Rotate mint authority to ToonVault after deploy
    receive(msg: UpdateMintAuthority) {
        require(sender() == self.owner, "Not owner");
        self.mintAuthority = msg.newAuthority;
    }

    // Update metadata URI (e.g. after IPFS pinning)
    receive(msg: UpdateMetadata) {
        require(sender() == self.owner, "Not owner");
        self.metadataUri = msg.newUri;
    }

    // TEP-64 off-chain metadata getter — Tonkeeper reads this
    // Content cell: byte 0x01 = off-chain URL, then snake-encoded URI
    get fun get_jetton_data(): JettonData {
        let content: Cell = beginCell()
            .storeUint(1, 8)
            .storeSlice(self.metadataUri.asSlice())
            .endCell();

        return JettonData{
            totalSupply:  self.totalSupply,
            mintable:     true,
            adminAddress: self.owner,
            content:      content,
            walletCode:   initOf ToonJettonWallet(0, myAddress(), myAddress()).code
        };
    }

    get fun totalSupply(): Int       { return self.totalSupply; }
    get fun owner(): Address         { return self.owner; }
    get fun mintAuthority(): Address { return self.mintAuthority; }
    get fun metadataUri(): String    { return self.metadataUri; }
}

// ── ToonJettonWallet ──────────────────────────────────────────────────────────

contract ToonJettonWallet(
    balance: Int as coins,
    owner:   Address,
    master:  Address,
) {
    receive(msg: TokenTransfer) {
        require(sender() == self.owner, "Not owner");
        require(self.balance >= msg.amount, "Insufficient balance");
        self.balance = self.balance - msg.amount;
        send(SendParameters{
            to:     msg.destination,
            value:  msg.forward_ton_amount,
            bounce: false,
            mode:   SendRemainingValue,
            body:   TokenTransferInternal{
                queryId:              msg.queryId,
                amount:               msg.amount,
                from:                 self.owner,
                response_destination: msg.response_destination,
                forward_ton_amount:   msg.forward_ton_amount,
                forward_payload:      msg.forward_payload
            }.toCell()
        });
    }

    receive(msg: TokenTransferInternal) {
        self.balance = self.balance + msg.amount;
    }

    receive(msg: TokenBurn) {
        require(sender() == self.owner, "Not owner");
        require(self.balance >= msg.amount, "Insufficient balance");
        self.balance = self.balance - msg.amount;
        send(SendParameters{
            to:    self.master,
            value: 0,
            mode:  SendRemainingValue,
            body:  TokenBurnNotification{
                queryId:              msg.queryId,
                amount:               msg.amount,
                owner:                self.owner,
                response_destination: msg.response_destination
            }.toCell()
        });
    }

    get fun balance(): Int   { return self.balance; }
    get fun owner(): Address { return self.owner; }
}

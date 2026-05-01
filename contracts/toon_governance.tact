import "@stdlib/deploy";

// ─────────────────────────────────────────────────────────────────────────────
//  Messages — inbound
// ─────────────────────────────────────────────────────────────────────────────

message RegisterJettonWallet {
    owner: Address;
    wallet: Address;
}

message UnstakeGovernance {
    amount: Int as coins;
}

// Jetton transfer callback (TEP-74 style).

message TransferNotification {
    from: Address;
    amount: Int as coins;
    forwardPayload: Cell;
}

message TransferJetton {
    to: Address;
    amount: Int as coins;
    forwardTonAmount: Int as coins;
}

// Numeric parameter proposals (emissionCap, minWalletAge).
message ProposeParameterUpdate {
    parameter:   String; // "emissionCap" | "minWalletAge"
    newValue:    Int as uint64; // uint64 — wide enough for nanoTOON caps
    description: String;
}

// Address parameter proposals (mintAuthority rotation).
// Kept separate because Addresses cannot be encoded into a uint32.
message ProposeAddressUpdate {
    parameter:   String; // "mintAuthority"
    newAddress:  Address;
    description: String;
}

message VoteOnProposal {
    proposalId: Int as uint256;
    support:    Bool;
}

message VoteOnAddressProposal {
    proposalId: Int as uint256;
    support:    Bool;
}

message ExecuteProposal {
    proposalId: Int as uint256;
}

message ExecuteAddressProposal {
    proposalId: Int as uint256;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Messages — outbound to Vault / Registry
// ─────────────────────────────────────────────────────────────────────────────

// Dispatched to ToonVault on emissionCap proposal execution.
message UpdateEmissionCap {
    newCap: Int as coins;
}

// Dispatched to ToonVault on minWalletAge proposal execution.
message UpdateMinWalletAge {
    newAgeDays: Int as uint32;
}

// Dispatched to ToonRegistry on mintAuthority proposal execution.
message UpdateMintAuthority {
    newAuthority: Address;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Structs
// ─────────────────────────────────────────────────────────────────────────────

// Numeric parameter proposal (emissionCap, minWalletAge, etc.)
struct GlobalProposal {
    parameter:    String;
    newValue:     Int as uint64;
    description:  String;
    proposer:     Address;
    votesFor:     Int as coins;
    votesAgainst: Int as coins;
    deadline:     Int as uint32;
    executed:     Bool;
}

// Address parameter proposal (mintAuthority rotation).
struct AddressProposal {
    parameter:    String;
    newAddress:   Address;
    description:  String;
    proposer:     Address;
    votesFor:     Int as coins;
    votesAgainst: Int as coins;
    deadline:     Int as uint32;
    executed:     Bool;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ToonGovernance
// ─────────────────────────────────────────────────────────────────────────────
//
//  $TOON holders stake → proportional vote weight.
//  One address gets ONE vote per proposal (dedup via sha256 composite key).
//
//  Execution dispatches TYPED messages to Vault or Registry — no placeholders.
//  Every parameter type maps to a concrete on-chain state change.
//
//  Proposal lifecycle:
//    1. ProposeParameterUpdate / ProposeAddressUpdate  → creates proposal
//    2. VoteOnProposal / VoteOnAddressProposal         → accumulates weight
//    3. ExecuteProposal / ExecuteAddressProposal        → dispatches typed msg
//
contract ToonGovernance with Deployable {

    owner: Address;
    registry: Address;
    vault:    Address;
    tokenMaster: Address;

    stakes:      map<Address, Int>;
    jettonWalletByOwner: map<Address, Address>;
    usedStakeNonces: map<Int, Bool>;
    totalStaked: Int as coins;

    // Numeric parameter proposals
    proposals:      map<Int, GlobalProposal>;
    nextProposalId: Int as uint256;

    // Address parameter proposals (separate namespace to avoid ID collisions)
    addressProposals:      map<Int, AddressProposal>;
    nextAddressProposalId: Int as uint256;

    // Composite vote dedup: sha256(proposalId + ":" + voterAddress) → Bool
    // Separate maps per proposal family to prevent cross-family vote reuse.
    hasVoted:        map<Int, Bool>;
    hasVotedAddress: map<Int, Bool>;

    init(owner: Address, registry: Address, vault: Address, tokenMaster: Address) {
        self.owner                 = owner;
        self.registry              = registry;
        self.vault                 = vault;
        self.tokenMaster           = tokenMaster;
        self.totalStaked           = 0;
        self.nextProposalId        = 0;
        self.nextAddressProposalId = 0;
    }

    // ─────────────────────────────────────────────────────────
    //  Internal helpers
    // ─────────────────────────────────────────────────────────

    fun voteKey(proposalId: Int, voter: Address): Int {
        return beginCell().storeUint(proposalId, 256).storeAddress(voter).endCell().hash();
    }

    // Quorum = proposer must hold stake; FOR votes must exceed 25% of total staked.
    fun quorumPassed(proposal: GlobalProposal): Bool {
        return proposal.votesFor > proposal.votesAgainst
            && proposal.votesFor > (self.totalStaked / 4);
    }

    fun quorumPassedAddr(proposal: AddressProposal): Bool {
        return proposal.votesFor > proposal.votesAgainst
            && proposal.votesFor > (self.totalStaked / 4);
    }

    // ─────────────────────────────────────────────────────────
    //  Staking via Jetton TransferNotification (TEP-74)
    // ─────────────────────────────────────────────────────────

    receive(msg: RegisterJettonWallet) {
        require(sender() == self.owner, "ToonGovernance: owner only");
        self.jettonWalletByOwner.set(msg.owner, msg.wallet);
    }

    receive(msg: TransferNotification) {
        require(msg.amount > 0, "ToonGovernance: zero transfer amount");
        let expectedWallet: Address? = self.jettonWalletByOwner.get(msg.from);
        require(expectedWallet != null, "ToonGovernance: wallet not registered");
        require(sender() == expectedWallet!!, "ToonGovernance: invalid jetton wallet sender");

        let slice = msg.forwardPayload.beginParse();
        let nonce = slice.loadUint(64);
        let claimedMaster = slice.loadAddress();
        require(claimedMaster == self.tokenMaster, "ToonGovernance: invalid token master");

        let replayKey = beginCell().storeAddress(msg.from).storeUint(nonce, 64).endCell().hash();
        require(self.usedStakeNonces.get(replayKey) == null, "ToonGovernance: stake replay");
        self.usedStakeNonces.set(replayKey, true);

        let existing: Int? = self.stakes.get(msg.from);
        let current: Int   = existing != null ? existing!! : 0;
        self.stakes.set(msg.from, current + msg.amount);
        self.totalStaked = self.totalStaked + msg.amount;
    }

    receive(msg: UnstakeGovernance) {
        require(msg.amount > 0, "ToonGovernance: zero unstake amount");

        let existing: Int? = self.stakes.get(sender());
        require(existing != null && existing!! >= msg.amount,
            "ToonGovernance: insufficient stake");

        let governanceWallet: Address? = self.jettonWalletByOwner.get(myAddress());
        require(governanceWallet != null, "ToonGovernance: governance wallet not registered");

        let recipientWallet: Address? = self.jettonWalletByOwner.get(sender());
        require(recipientWallet != null, "ToonGovernance: recipient wallet not registered");

        let newBal: Int = existing!! - msg.amount;
        self.stakes.set(sender(), newBal);
        self.totalStaked = self.totalStaked - msg.amount;

        send(SendParameters{
            to: governanceWallet!!,
            value: 0,
            mode: SendRemainingValue,
            body: TransferJetton{
                to: recipientWallet!!,
                amount: msg.amount,
                forwardTonAmount: 0
            }.toCell()
        });
    }

    // ─────────────────────────────────────────────────────────
    //  Numeric parameter proposals (emissionCap, minWalletAge)
    // ─────────────────────────────────────────────────────────

    receive(msg: ProposeParameterUpdate) {
        let weight: Int? = self.stakes.get(sender());
        require(weight != null && weight!! > 0,
            "ToonGovernance: must stake to propose");

        // Whitelist prevents governance spam for unknown parameters.
        require(
            msg.parameter == "emissionCap" ||
            msg.parameter == "minWalletAge",
            "ToonGovernance: unknown numeric parameter"
        );

        let pId: Int = self.nextProposalId;
        self.nextProposalId = self.nextProposalId + 1;

        self.proposals.set(pId, GlobalProposal{
            parameter:    msg.parameter,
            newValue:     msg.newValue,
            description:  msg.description,
            proposer:     sender(),
            votesFor:     0,
            votesAgainst: 0,
            deadline:     now() + 1209600, // 2-week voting window
            executed:     false
        });
    }

    receive(msg: VoteOnProposal) {
        let p: GlobalProposal? = self.proposals.get(msg.proposalId);
        require(p != null, "ToonGovernance: proposal does not exist");
        let proposal: GlobalProposal = p!!;

        require(now() <= proposal.deadline, "ToonGovernance: voting closed");
        require(!proposal.executed,        "ToonGovernance: already executed");

        let weight: Int? = self.stakes.get(sender());
        require(weight != null && weight!! > 0,
            "ToonGovernance: no voting weight");

        let key: Int = self.voteKey(msg.proposalId, sender());
        require(self.hasVoted.get(key) == null,
            "ToonGovernance: already voted on this proposal");

        self.hasVoted.set(key, true);

        if (msg.support) {
            proposal.votesFor     = proposal.votesFor     + weight!!;
        } else {
            proposal.votesAgainst = proposal.votesAgainst + weight!!;
        }

        self.proposals.set(msg.proposalId, proposal);
    }

    // Execute: dispatches a deterministic typed message to Vault.
    // No string placeholders — every proposal type has a concrete endpoint.
    receive(msg: ExecuteProposal) {
        let p: GlobalProposal? = self.proposals.get(msg.proposalId);
        require(p != null, "ToonGovernance: proposal does not exist");
        let proposal: GlobalProposal = p!!;

        require(now() > proposal.deadline,     "ToonGovernance: voting still open");
        require(!proposal.executed,            "ToonGovernance: already executed");
        require(self.quorumPassed(proposal),   "ToonGovernance: quorum not met");

        proposal.executed = true;
        self.proposals.set(msg.proposalId, proposal);

        if (proposal.parameter == "emissionCap") {
            // → vault.UpdateEmissionCap — vault mutates self.emissionCap
            send(SendParameters{
                to:   self.vault,
                value: 0,
                mode:  SendRemainingValue,
                body:  UpdateEmissionCap{
                    newCap: proposal.newValue
                }.toCell()
            });

        } else if (proposal.parameter == "minWalletAge") {
            // → vault.UpdateMinWalletAge — vault mutates self.minWalletAgeDays
            send(SendParameters{
                to:   self.vault,
                value: 0,
                mode:  SendRemainingValue,
                body:  UpdateMinWalletAge{
                    newAgeDays: proposal.newValue
                }.toCell()
            });
        }
        // Note: any future numeric parameters are added here with their
        // own typed message dispatch — never fall back to a string comment.
    }

    // ─────────────────────────────────────────────────────────
    //  Address parameter proposals (mintAuthority rotation)
    // ─────────────────────────────────────────────────────────

    receive(msg: ProposeAddressUpdate) {
        let weight: Int? = self.stakes.get(sender());
        require(weight != null && weight!! > 0,
            "ToonGovernance: must stake to propose");

        require(
            msg.parameter == "mintAuthority",
            "ToonGovernance: unknown address parameter"
        );

        let pId: Int = self.nextAddressProposalId;
        self.nextAddressProposalId = self.nextAddressProposalId + 1;

        self.addressProposals.set(pId, AddressProposal{
            parameter:    msg.parameter,
            newAddress:   msg.newAddress,
            description:  msg.description,
            proposer:     sender(),
            votesFor:     0,
            votesAgainst: 0,
            deadline:     now() + 1209600,
            executed:     false
        });
    }

    receive(msg: VoteOnAddressProposal) {
        let p: AddressProposal? = self.addressProposals.get(msg.proposalId);
        require(p != null, "ToonGovernance: address proposal does not exist");
        let proposal: AddressProposal = p!!;

        require(now() <= proposal.deadline, "ToonGovernance: voting closed");
        require(!proposal.executed,        "ToonGovernance: already executed");

        let weight: Int? = self.stakes.get(sender());
        require(weight != null && weight!! > 0,
            "ToonGovernance: no voting weight");

        let key: Int = self.voteKey(msg.proposalId, sender());
        require(self.hasVotedAddress.get(key) == null,
            "ToonGovernance: already voted on this proposal");

        self.hasVotedAddress.set(key, true);

        if (msg.support) {
            proposal.votesFor     = proposal.votesFor     + weight!!;
        } else {
            proposal.votesAgainst = proposal.votesAgainst + weight!!;
        }

        self.addressProposals.set(msg.proposalId, proposal);
    }

    receive(msg: ExecuteAddressProposal) {
        let p: AddressProposal? = self.addressProposals.get(msg.proposalId);
        require(p != null, "ToonGovernance: address proposal does not exist");
        let proposal: AddressProposal = p!!;

        require(now() > proposal.deadline,         "ToonGovernance: voting still open");
        require(!proposal.executed,                "ToonGovernance: already executed");
        require(self.quorumPassedAddr(proposal),   "ToonGovernance: quorum not met");

        proposal.executed = true;
        self.addressProposals.set(msg.proposalId, proposal);

        if (proposal.parameter == "mintAuthority") {
            // → registry.UpdateMintAuthority — typed cross-contract call
            send(SendParameters{
                to:   self.registry,
                value: 0,
                mode:  SendRemainingValue,
                body:  UpdateMintAuthority{
                    newAuthority: proposal.newAddress
                }.toCell()
            });
        }
    }

    // ─────────────────────────────────────────────────────────
    //  Getters
    // ─────────────────────────────────────────────────────────

    get fun totalStaked(): Int { return self.totalStaked; }

    get fun getStake(voter: Address): Int {
        let s: Int? = self.stakes.get(voter);
        return s != null ? s!! : 0;
    }

    get fun getProposal(proposalId: Int): GlobalProposal? {
        return self.proposals.get(proposalId);
    }

    get fun getAddressProposal(proposalId: Int): AddressProposal? {
        return self.addressProposals.get(proposalId);
    }

    get fun hasAddressVoted(proposalId: Int, voter: Address): Bool {
        let key: Int = self.voteKey(proposalId, voter);
        return self.hasVoted.get(key) != null;
    }

    get fun hasAddressVotedOnAddressProposal(proposalId: Int, voter: Address): Bool {
        let key: Int = self.voteKey(proposalId, voter);
        return self.hasVotedAddress.get(key) != null;
    }

    get fun quorumMet(proposalId: Int): Bool {
        let p: GlobalProposal? = self.proposals.get(proposalId);
        if (p == null) { return false; }
        return self.quorumPassed(p!!);
    }
}

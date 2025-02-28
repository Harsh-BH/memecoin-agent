use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};
use near_sdk::collections::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::NearToken;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Proposal {
    id: u64,
    description: String,
    votes_for: u128,
    votes_against: u128,
    deadline: u64,
    finalized: bool,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    /// Mapping from account to token balance (in yoctoNEAR)
    balances: LookupMap<AccountId, u128>,
    /// Overall total supply of tokens
    total_supply: u128,
    /// Admin account (set on initialization)
    admin: AccountId,
    /// Mapping from a referred account to its referrer.
    referrals: LookupMap<AccountId, AccountId>,
    /// Mapping from account to staked tokens.
    staked: LookupMap<AccountId, u128>,
    /// Governance proposals: mapping from proposal ID to proposal details.
    proposals: LookupMap<u64, Proposal>,
    /// Next proposal ID.
    next_proposal_id: u64,
    /// Cumulative tip amounts per account.
    tip_totals: LookupMap<AccountId, u128>,
    /// Account of the top tipper (based on cumulative tips given).
    top_tipper: Option<AccountId>,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract. The caller becomes the admin.
    #[init]
    pub fn new() -> Self {
        assert!(!env::state_exists(), "Contract is already initialized");
        Self {
            balances: LookupMap::new(b"b".to_vec()),
            total_supply: 0,
            admin: env::predecessor_account_id(),
            referrals: LookupMap::new(b"r".to_vec()),
            staked: LookupMap::new(b"s".to_vec()),
            proposals: LookupMap::new(b"p".to_vec()),
            next_proposal_id: 0,
            tip_totals: LookupMap::new(b"t".to_vec()),
            top_tipper: None,
        }
    }

    ////////////
    // Token Minting & Balance Management
    ////////////

    /// Mint tokens by attaching NEAR. The attached deposit is credited as tokens.
    /// If the caller has registered a referrer, a bonus of 1% is credited to that referrer.
    #[payable]
    pub fn mint(&mut self) {
        let deposit: NearToken = env::attached_deposit();
        let deposit_amount = deposit.as_yoctonear();
        
        // Require a minimum deposit (0.01 NEAR = 1e16 yoctoNEAR) to cover storage fees.
        assert!(
            deposit_amount >= 10_000_000_000_000_000,
            "Deposit too low"
        );
        let caller = env::predecessor_account_id();
        let current_balance = self.balances.get(&caller).unwrap_or(0);
        let new_balance = current_balance + deposit_amount;
        self.balances.insert(&caller, &new_balance);
        self.total_supply += deposit_amount;

        // Grant a 1% bonus to a registered referrer, if any.
        if let Some(referrer) = self.referrals.get(&caller) {
            let bonus = deposit_amount / 100;
            let ref_balance = self.balances.get(&referrer).unwrap_or(0);
            let new_ref_balance = ref_balance + bonus;
            self.balances.insert(&referrer, &new_ref_balance);
            self.total_supply += bonus;
            env::log_str(&format!(
                "Referral bonus: {} received {} tokens",
                referrer, bonus
            ));
        }

        env::log_str(&format!(
            "Mint: {} minted {} tokens. New balance: {}. Total supply: {}",
            caller, deposit_amount, new_balance, self.total_supply
        ));
    }

    /// Returns the token balance for a given account.
    pub fn get_balance(&self, account: AccountId) -> U128 {
        U128(self.balances.get(&account).unwrap_or(0))
    }

    /// Returns the overall total supply of tokens.
    pub fn get_total_supply(&self) -> U128 {
        U128(self.total_supply)
    }

    ////////////
    // Tipping & Transfers
    ////////////

    /// Transfer tokens (tip) from the caller to another account.
    pub fn tip(&mut self, receiver: AccountId, amount: U128) {
        let amount: u128 = amount.into();
        let sender = env::predecessor_account_id();
        let sender_balance = self.balances.get(&sender).unwrap_or(0);
        assert!(sender_balance >= amount, "Insufficient balance");
        self.balances.insert(&sender, &(sender_balance - amount));
        let receiver_balance = self.balances.get(&receiver).unwrap_or(0);
        self.balances.insert(&receiver, &(receiver_balance + amount));
        env::log_str(&format!(
            "Tip: {} tipped {} tokens to {}",
            sender, amount, receiver
        ));

        let total_tip = self.tip_totals.get(&sender).unwrap_or(0) + amount;
        self.tip_totals.insert(&sender, &total_tip);
        if let Some(current_top) = self.top_tipper.clone() {
            let top_amount = self.tip_totals.get(&current_top).unwrap_or(0);
            if total_tip > top_amount {
                self.top_tipper = Some(sender.clone());
            }
        } else {
            self.top_tipper = Some(sender.clone());
        }
    }

    /// Withdraw tokens from the caller's balance.
    /// The tokens are transferred back to the caller's wallet.
    pub fn withdraw(&mut self, amount: U128) {
        let amount: u128 = amount.into();
        let sender = env::predecessor_account_id();
        let sender_balance = self.balances.get(&sender).unwrap_or(0);
        assert!(sender_balance >= amount, "Insufficient balance");
        self.balances.insert(&sender, &(sender_balance - amount));
        // Wrap the amount in NearToken before transferring.
        Promise::new(sender.clone()).transfer(NearToken::from_yoctonear(amount));
        env::log_str(&format!(
            "Withdraw: {} withdrew {} tokens",
            sender, amount
        ));
    }

    /// Burn tokens from the caller's balance, reducing total supply.
    pub fn burn(&mut self, amount: U128) {
        let amount: u128 = amount.into();
        let caller = env::predecessor_account_id();
        let current_balance = self.balances.get(&caller).unwrap_or(0);
        assert!(
            current_balance >= amount,
            "Insufficient balance to burn"
        );
        self.balances.insert(&caller, &(current_balance - amount));
        self.total_supply -= amount;
        env::log_str(&format!("Burn: {} burned {} tokens", caller, amount));
    }

    ////////////
    // Staking & Rewards
    ////////////

    /// Stake tokens: Moves tokens from available balance into staked balance.
    #[payable]
    pub fn stake(&mut self, amount: U128) {
        let amount: u128 = amount.into();
        let caller = env::predecessor_account_id();
        let available = self.balances.get(&caller).unwrap_or(0);
        assert!(available >= amount, "Insufficient balance to stake");
        self.balances.insert(&caller, &(available - amount));
        let current_staked = self.staked.get(&caller).unwrap_or(0);
        self.staked.insert(&caller, &(current_staked + amount));
        env::log_str(&format!("Stake: {} staked {} tokens", caller, amount));
    }

    /// Unstake tokens: Moves tokens from staked balance back to available balance.
    pub fn unstake(&mut self, amount: U128) {
        let amount: u128 = amount.into();
        let caller = env::predecessor_account_id();
        let current_staked = self.staked.get(&caller).unwrap_or(0);
        assert!(
            current_staked >= amount,
            "Insufficient staked balance"
        );
        self.staked.insert(&caller, &(current_staked - amount));
        let available = self.balances.get(&caller).unwrap_or(0);
        self.balances.insert(&caller, &(available + amount));
        env::log_str(&format!("Unstake: {} unstaked {} tokens", caller, amount));
    }

    /// Claim staking rewards.
    /// (For demonstration, rewards are set at 5% of the staked amount.)
    pub fn claim_rewards(&mut self) {
        let caller = env::predecessor_account_id();
        let staked_amount = self.staked.get(&caller).unwrap_or(0);
        assert!(staked_amount > 0, "No staked tokens");
        let reward = staked_amount * 5 / 100;
        let available = self.balances.get(&caller).unwrap_or(0);
        self.balances.insert(&caller, &(available + reward));
        self.total_supply += reward;
        env::log_str(&format!(
            "Claim Rewards: {} claimed {} tokens as reward",
            caller, reward
        ));
    }

    ////////////
    // Referral System
    ////////////

    /// Register a referrer for the caller.
    /// (A caller can register a referrer once; future mints will grant a bonus to that referrer.)
    pub fn register_referral(&mut self, referrer: AccountId) {
        let caller = env::predecessor_account_id();
        assert_ne!(caller, referrer, "Cannot refer yourself");
        assert!(
            self.referrals.get(&caller).is_none(),
            "Referral already registered"
        );
        self.referrals.insert(&caller, &referrer);
        env::log_str(&format!(
            "Referral: {} registered referrer {}",
            caller, referrer
        ));
    }

    ////////////
    // Governance & Voting
    ////////////

    /// (Admin only) Create a new governance proposal.
    /// (For simplicity, each proposal is active for 7 days.)
    #[payable]
    pub fn propose(&mut self, description: String) {
        let caller = env::predecessor_account_id();
        assert_eq!(caller, self.admin, "Only admin can create proposals");
        let proposal = Proposal {
            id: self.next_proposal_id,
            description,
            votes_for: 0,
            votes_against: 0,
            // 7 days in nanoseconds
            deadline: env::block_timestamp() + 7 * 24 * 60 * 60 * 1_000_000_000,
            finalized: false,
        };
        self.proposals.insert(&self.next_proposal_id, &proposal);
        env::log_str(&format!(
            "Governance: Proposal {} created",
            self.next_proposal_id
        ));
        self.next_proposal_id += 1;
    }

    /// Vote on an existing proposal.
    /// (Voting power is based on the caller's current token balance.)
    pub fn vote(&mut self, proposal_id: u64, support: bool) {
        let caller = env::predecessor_account_id();
        let voter_balance = self.balances.get(&caller).unwrap_or(0);
        assert!(voter_balance > 0, "No voting power");
        let mut proposal = self.proposals.get(&proposal_id).expect("Proposal not found");
        assert!(
            env::block_timestamp() < proposal.deadline,
            "Voting period has ended"
        );
        if support {
            proposal.votes_for += voter_balance;
        } else {
            proposal.votes_against += voter_balance;
        }
        self.proposals.insert(&proposal_id, &proposal);
        env::log_str(&format!(
            "Governance: {} voted on proposal {}",
            caller, proposal_id
        ));
    }

    /// Finalize a proposal (admin only) once its voting deadline has passed.
    pub fn finalize_proposal(&mut self, proposal_id: u64) {
        let caller = env::predecessor_account_id();
        assert_eq!(caller, self.admin, "Only admin can finalize proposals");
        let mut proposal = self.proposals.get(&proposal_id).expect("Proposal not found");
        assert!(
            env::block_timestamp() >= proposal.deadline,
            "Voting period not ended"
        );
        proposal.finalized = true;
        self.proposals.insert(&proposal_id, &proposal);
        env::log_str(&format!(
            "Governance: Proposal {} finalized. Votes for: {}, Votes against: {}",
            proposal_id, proposal.votes_for, proposal.votes_against
        ));
    }

    ////////////
    // NFT Minting Stub
    ////////////

    /// NFT minting stub.
    /// (This function logs an NFT mint event along with provided metadata.)
    #[payable]
    pub fn nft_mint(&mut self, metadata: String) {
        let deposit: NearToken = env::attached_deposit();
        let deposit_amount = deposit.as_yoctonear();
        assert!(
            deposit_amount > 1,
            "Attached deposit too low for NFT minting"
        );
        let caller = env::predecessor_account_id();
        env::log_str(&format!(
            "NFT Mint: {} minted an NFT with metadata: {}",
            caller, metadata
        ));
    }

    ////////////
    // Leaderboard
    ////////////

    /// Returns the account of the top tipper (i.e. the account that has tipped the most cumulatively).
    pub fn get_top_tipper(&self) -> Option<AccountId> {
        self.top_tipper.clone()
    }
}

use near_sdk::{near, env, AccountId, Balance, BorshDeserialize, BorshSerialize, PanicOnDefault};
use near_sdk::collections::LookupMap;

#[near]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MemeCoin {
    /// A mapping from NEAR account IDs to their token balances.
    balances: LookupMap<AccountId, Balance>,
    /// The total token supply.
    total_supply: Balance,
}

#[near]
impl MemeCoin {
    /// Initializes the contract. This method is marked with #[init] so it can only be called once.
    #[init]
    pub fn new() -> Self {
        Self {
            balances: LookupMap::new(b"b".to_vec()),
            total_supply: 0,
        }
    }

    /// Mint tokens to the specified account.
    ///
    /// This function is payable—requiring the caller to attach a minimal deposit
    /// (e.g. to cover storage costs). The method increases the recipient’s balance
    /// and the total supply.
    #[payable]
    pub fn mint(&mut self, account_id: AccountId, amount: Balance) {
        // Ensure that the attached deposit is greater than a minimal amount (for example, 1 yoctoNEAR)
        let deposit = env::attached_deposit();
        assert!(deposit > 1, "Requires an attached deposit as fee");

        // Retrieve current balance (or default to 0) and add the new tokens
        let current_balance = self.balances.get(&account_id).unwrap_or(0);
        let new_balance = current_balance + amount;
        self.balances.insert(&account_id, &new_balance);

        // Update total supply
        self.total_supply += amount;

        // Log the minting event to the blockchain logs
        env::log_str(&format!("Minted {} tokens to {}", amount, account_id));
    }

    /// Returns the token balance for a given account.
    ///
    /// This is a view method (read-only) and can be called without any gas cost.
    pub fn get_balance(&self, account_id: AccountId) -> Balance {
        self.balances.get(&account_id).unwrap_or(0)
    }
}

// miniGame.ts
import { connect, Contract, keyStores, KeyPair, Account } from "near-api-js";

/** The contract that includes the `tip(...)` method. */
const CONTRACT_ID = "harsh21112005.testnet";

/** 
 * Off-chain data for free tries and purchased tries. 
 * We do NOT store any “winnings” in this simplified version.
 */
const freeTries: Record<string, number> = {};
const purchasedTries: Record<string, number> = {};

/** We'll store a reference to the Contract once we've initialized it. */
let contract: Contract | null = null;

export async function initGame(userAccountId: string, userPrivateKey: string) {
  // 1) In-memory key store for the user
  const inMemKeyStore = new keyStores.InMemoryKeyStore();
  await inMemKeyStore.setKey(
    "testnet",
    userAccountId,
    KeyPair.fromString(userPrivateKey)
  );

  // 2) Connect to NEAR
  const near = await connect({
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    keyStore: inMemKeyStore,
  });

  // 3) Retrieve the user's account object
  const userAccount = await near.account(userAccountId);

  // 4) Instantiate the contract with the user’s account
  contract = new Contract(userAccount, CONTRACT_ID, {
    viewMethods: ["get_balance", "get_total_supply", "get_top_tipper"],
    changeMethods: [
      "mint",
      "tip",
      "withdraw",
      "burn",
      "stake",
      "unstake",
      "claim_rewards",
      "register_referral",
      "propose",
      "vote",
      "finalize_proposal",
      "nft_mint",
    ],
  }) as Contract;
}

/**
 * Give the user 3 free tries if they haven't started yet.
 */
export function startGame(userId: string): string {
  if (!freeTries[userId]) {
    freeTries[userId] = 3; // 3 free tries
  }
  if (!purchasedTries[userId]) {
    purchasedTries[userId] = 0;
  }
  return `Welcome, ${userId}! You have ${freeTries[userId]} free tries. Use /play to roll!`;
}

export async function buyTries(userId: string, triesCost: string): Promise<string> {
  if (!contract) {
    throw new Error("Contract not initialized. Call initGame(...) first!");
  }

  try {
    // "receiver" can be the same contract to which we send tokens
    // We'll interpret triesCost as a string representing the token amount in yocto
    await (contract as any).tip({
      args: {
        receiver: CONTRACT_ID, 
        amount: triesCost,
      },
      gas: "300000000000000", // 300 TGas
    });

    // On success, we grant 3 purchased tries to the user
    purchasedTries[userId] = (purchasedTries[userId] || 0) + 3;
    return `You successfully tipped ${triesCost} tokens to ${CONTRACT_ID} and purchased 3 tries! You now have ${purchasedTries[userId]} purchased tries.`;
  } catch (err) {
    console.error("Error calling tip(...) in buyTries:", err);
    throw new Error(`Failed to buy tries: ${err}`);
  }
}

/**
 * The user can /play if they have free or purchased tries. 
 * If they "win," we only respond with a message—no tokens are paid out.
 */
export function playGame(userId: string): string {
  const free = freeTries[userId] || 0;
  const paid = purchasedTries[userId] || 0;
  const totalTries = free + paid;

  if (totalTries <= 0) {
    return `No tries left. Use /buyTries to purchase more tries.`;
  }

  // Use free tries first
  if (free > 0) {
    freeTries[userId] = free - 1;
  } else {
    purchasedTries[userId] = paid - 1;
  }

  // Roll a random number 1–100
  const roll = Math.floor(Math.random() * 100) + 1;
  if (roll > 80) {
    return `You rolled ${roll}. You WIN! (No token payout in this version)`;
  } else {
    return `You rolled ${roll}. Sorry, you lose.`;
  }
}


export function stopGame(userId: string): string {
  // Reset or remove user’s tries from memory
  delete freeTries[userId];
  delete purchasedTries[userId];
  return `Your game session has been stopped. All tries cleared.`;
}
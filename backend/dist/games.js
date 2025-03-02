"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payWinner = exports.playGame = exports.recordPayment = exports.initGame = void 0;
const near_api_js_1 = require("near-api-js");
const nearConfig = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    keyStore: new near_api_js_1.keyStores.InMemoryKeyStore(), // or whichever KeyStore you use
};
// The “house” account that will pay winners, if you want the house to tip
// This should be the same one that has your private key loaded.
const HOUSE_ACCOUNT_ID = "my-house-account.testnet";
const CONTRACT_ID = "harsh21112005.testnet";
// Off‐chain storage of “player credits”
const playerCredits = {};
/**
 * Initialize NEAR, create a Contract instance that references the existing contract.
 * We'll also create an Account for the "house" if you want the house to tip winners.
 */
let contract;
let houseAccount;
async function initGame() {
    const near = await (0, near_api_js_1.connect)(nearConfig);
    // 1) The “house” account that can call tip(...) from its own balance
    houseAccount = await near.account(HOUSE_ACCOUNT_ID);
    // 2) Instantiate the contract object
    contract = new near_api_js_1.Contract(houseAccount, CONTRACT_ID, {
        viewMethods: ["get_balance", "get_total_supply", "get_top_tipper"],
        changeMethods: ["tip", "withdraw", /* etc. */],
    });
}
exports.initGame = initGame;
/**
 * Let players “buy in” by calling /tip {contract} {amount} from their own wallet.
 * Then your off-chain code can watch for that transaction on NEARBlocks or
 * poll the contract to see if the user’s “tip” was successful.
 */
function recordPayment(playerId, amount) {
    // Just store it in your in-memory or DB
    // e.g. the user “tipped” the contract, so we interpret that as “bought in” to the game
    if (!playerCredits[playerId]) {
        playerCredits[playerId] = 0;
    }
    playerCredits[playerId] += amount;
}
exports.recordPayment = recordPayment;
/**
 * Example function: Let the user “play” if they have enough credits.
 */
function playGame(playerId) {
    const credits = playerCredits[playerId] || 0;
    if (credits < 10) {
        return `Not enough credits to play. Please /tip ${CONTRACT_ID} some more tokens!`;
    }
    // Deduct 10 from their “credits”
    playerCredits[playerId] -= 10;
    // Some random logic
    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll > 80) {
        // user wins
        // Maybe we store that they are owed some tokens
        return `You rolled ${roll} — you win! We owe you some tokens.`;
    }
    else {
        return `You rolled ${roll} — sorry, you lose.`;
    }
}
exports.playGame = playGame;
/**
 * If you want to "pay back" the user using the contract's tip method,
 * your “house” account can do something like:
 *    contract.tip({ receiver: userId, amount: ???, gas: ... })
 * BUT only if your "house" account has minted or received tokens in the contract.
 */
async function payWinner(winnerId, amount) {
    // The house calls the contract's tip method, sending 'amount' tokens to winnerId
    // NOTE: This only works if houseAccount has enough "balance" in the contract 
    // to do so. Otherwise the transaction will fail with “Insufficient balance.”
    await contract.tip({
        args: { receiver: winnerId, amount: amount.toString() },
        gas: "300000000000000",
    });
}
exports.payWinner = payWinner;

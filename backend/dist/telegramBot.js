"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// telegramBot.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const near_api_js_1 = require("near-api-js");
// AI / Meme imports
const huggingFaceStableDiffusion_1 = require("./huggingFaceStableDiffusion");
const aiChat_1 = require("./aiChat");
const aiFeatures_1 = require("./aiFeatures");
// Game imports
const miniGame_1 = require("./miniGame");
// ----- NEAR CONFIGURATION -----
const nearConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    keyStore: new near_api_js_1.keyStores.InMemoryKeyStore(),
};
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID;
const PRIVATE_KEY = process.env.NEAR_ACCOUNT_PRIVATE_KEY;
const DEFAULT_CONTRACT_ID = process.env.NEAR_CONTRACT_NAME;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
console.log("account id:", ACCOUNT_ID);
console.log("Default contract id:", DEFAULT_CONTRACT_ID);
// Setup NEAR key
const keyPair = near_api_js_1.KeyPair.fromString(PRIVATE_KEY);
nearConfig.keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);
// Initialize Telegram bot
const bot = new node_telegram_bot_api_1.default(BOT_TOKEN, { polling: true });
// Track whether the bot is in an “error/offline” state
let botIsOffline = false;
bot.on('polling_error', (err) => {
    console.error("Bot polling error:", err);
    botIsOffline = true;
});
bot.on('webhook_error', (err) => {
    console.error("Bot webhook error:", err);
    botIsOffline = true;
});
// We'll store user data about the last meme prompt if they want to mint it as NFT.
const pendingNftRequests = {};
// Global references so we can switch contract ID
let nearGlobal;
let accountGlobal;
let contractGlobal;
/** Step 1: NEAR init function **/
async function initNear() {
    nearGlobal = await (0, near_api_js_1.connect)(nearConfig);
    accountGlobal = await nearGlobal.account(ACCOUNT_ID);
    // Instantiate default contract
    contractGlobal = new near_api_js_1.Contract(accountGlobal, DEFAULT_CONTRACT_ID, {
        viewMethods: ['get_balance', 'get_total_supply', 'get_top_tipper'],
        changeMethods: [
            'mint', 'tip', 'withdraw', 'burn', 'stake', 'unstake',
            'claim_rewards', 'register_referral', 'propose', 'vote',
            'finalize_proposal', 'nft_mint',
        ],
    });
    console.log("NEAR + default contract initialized.");
}
/** Step 2: Re-initialize contract with a new contractId **/
async function reinitContract(newContractId) {
    contractGlobal = new near_api_js_1.Contract(accountGlobal, newContractId, {
        viewMethods: ['get_balance', 'get_total_supply', 'get_top_tipper'],
        changeMethods: [
            'mint', 'tip', 'withdraw', 'burn', 'stake', 'unstake',
            'claim_rewards', 'register_referral', 'propose', 'vote',
            'finalize_proposal', 'nft_mint',
        ],
    });
    console.log(`Switched contract to: ${newContractId}`);
}
/** Helper: simulate "typing" for a short delay **/
const simulateTyping = async (chatId, ms = 1500) => {
    await bot.sendChatAction(chatId, 'typing');
    return new Promise((resolve) => setTimeout(resolve, ms));
};
/** MAIN INIT:
 *  1) initGame(...) for the miniGame
 *  2) then initNear() for the NEAR contract
 */
(0, miniGame_1.initGame)(ACCOUNT_ID, PRIVATE_KEY)
    .then(async () => {
    console.log("Game (miniGame.ts) initialized for user:", ACCOUNT_ID);
    // Now do NEAR + contract init
    await initNear();
    botIsOffline = false; // NEAR presumably connected
    console.log("Telegram bot is running and connected to NEAR + miniGame.");
    // ---------------- TELEGRAM COMMANDS / HANDLERS ----------------
    // /startGame
    bot.onText(/^\/startGame$/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        const response = (0, miniGame_1.startGame)(userId);
        await bot.sendMessage(chatId, response);
    });
    // /play
    bot.onText(/^\/play$/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        const result = (0, miniGame_1.playGame)(userId);
        await bot.sendMessage(chatId, result);
    });
    // /buyTries <yoctoAmount>
    bot.onText(/^\/buyTries (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, "Usage: /buyTries <yoctoAmount>");
            return;
        }
        const triesCost = match[1]; // user-provided yocto-amount
        try {
            // Calls the contract’s tip(...) method, then grants tries off-chain
            const message = await (0, miniGame_1.buyTries)(userId, triesCost);
            await bot.sendMessage(chatId, message);
        }
        catch (err) {
            console.error("Error in /buyTries:", err);
            await bot.sendMessage(chatId, "⚠️ Failed to buy tries. Check logs.");
        }
    });
    // /stopGame
    bot.onText(/^\/stopGame$/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = `tg_${chatId}`;
        const response = (0, miniGame_1.stopGame)(userId);
        await bot.sendMessage(chatId, response);
    });
    // /status
    bot.onText(/^\/status$/, async (msg) => {
        const chatId = msg.chat.id;
        if (botIsOffline) {
            await bot.sendMessage(chatId, "Bot is currently marked as OFFLINE (polling/webhook error).");
        }
        else {
            await bot.sendMessage(chatId, "Bot is ONLINE and NEAR is connected.");
        }
    });
    // /setContract <contractId>
    bot.onText(/^\/setContract (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /setContract <contractId>');
            return;
        }
        const newContractId = match[1];
        try {
            await reinitContract(newContractId);
            await bot.sendMessage(chatId, `✅ Contract ID switched to: ${newContractId}`);
        }
        catch (error) {
            console.error('Error switching contract:', error);
            await bot.sendMessage(chatId, '⚠️ Failed to switch contract ID.');
        }
    });
    // /mint
    bot.onText(/^\/mint(?: (.+))?$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const depositAmount = (match && match[1]) || '10000000000000000'; // default 0.01 NEAR
        try {
            await simulateTyping(chatId, 1000);
            await contractGlobal.mint({
                args: {},
                gas: "300000000000000",
                amount: depositAmount,
            });
            await bot.sendMessage(chatId, `✨ *Mint Successful!* \nYou attached \`${depositAmount}\` yoctoNEAR.\nEnjoy your newly minted tokens!`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error minting tokens:', error);
            await bot.sendMessage(chatId, '⚠️ *Error minting tokens.*', { parse_mode: 'Markdown' });
        }
    });
    // /balance <account>
    bot.onText(/^\/balance (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /balance <account>');
            return;
        }
        const accountParam = match[1];
        try {
            await simulateTyping(chatId);
            const balance = await contractGlobal.get_balance({ account: accountParam });
            await bot.sendMessage(chatId, `💰 The token balance for *${accountParam}* is: \`${balance}\``, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error fetching balance:', error);
            await bot.sendMessage(chatId, '⚠️ Error retrieving token balance.');
        }
    });
    // /totalSupply
    bot.onText(/^\/totalSupply$/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await simulateTyping(chatId);
            const totalSupply = await contractGlobal.get_total_supply();
            await bot.sendMessage(chatId, `🏦 *Total Token Supply:* \`${totalSupply}\``, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error fetching total supply:', error);
            await bot.sendMessage(chatId, '⚠️ Error retrieving total supply.');
        }
    });
    // /topTipper
    bot.onText(/^\/topTipper$/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await simulateTyping(chatId);
            const topTipper = await contractGlobal.get_top_tipper();
            await bot.sendMessage(chatId, `🏆 The top tipper is: *${topTipper || 'No tipper yet'}*`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error fetching top tipper:', error);
            await bot.sendMessage(chatId, '⚠️ Error retrieving top tipper.');
        }
    });
    // /tip <receiver> <amount>
    bot.onText(/^\/tip (.+) (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1] || !match[2]) {
            await bot.sendMessage(chatId, 'Usage: /tip <receiver> <amount>');
            return;
        }
        const receiver = match[1];
        const amount = match[2];
        try {
            await contractGlobal.tip({
                args: { receiver, amount },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully tipped ${amount} tokens to ${receiver}`);
        }
        catch (error) {
            console.error('Error tipping tokens:', error);
            await bot.sendMessage(chatId, 'Error tipping tokens.');
        }
    });
    // /withdraw <amount>
    bot.onText(/^\/withdraw (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /withdraw <amount>');
            return;
        }
        const amount = match[1];
        try {
            await contractGlobal.withdraw({
                args: { amount },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully withdrew ${amount} tokens`);
        }
        catch (error) {
            console.error('Error withdrawing tokens:', error);
            await bot.sendMessage(chatId, 'Error withdrawing tokens.');
        }
    });
    // /burn <amount>
    bot.onText(/^\/burn (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /burn <amount>');
            return;
        }
        const amount = match[1];
        try {
            await contractGlobal.burn({
                args: { amount },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully burned ${amount} tokens`);
        }
        catch (error) {
            console.error('Error burning tokens:', error);
            await bot.sendMessage(chatId, 'Error burning tokens.');
        }
    });
    // /stake <amount>
    bot.onText(/^\/stake (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /stake <amount>');
            return;
        }
        const amount = match[1];
        try {
            await contractGlobal.stake({
                args: { amount },
                gas: "300000000000000",
                amount: "1",
            });
            await bot.sendMessage(chatId, `Successfully staked ${amount} tokens`);
        }
        catch (error) {
            console.error('Error staking tokens:', error);
            await bot.sendMessage(chatId, 'Error staking tokens.');
        }
    });
    // /unstake <amount>
    bot.onText(/^\/unstake (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /unstake <amount>');
            return;
        }
        const amount = match[1];
        try {
            await contractGlobal.unstake({
                args: { amount },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully unstaked ${amount} tokens`);
        }
        catch (error) {
            console.error('Error unstaking tokens:', error);
            await bot.sendMessage(chatId, 'Error unstaking tokens.');
        }
    });
    // /claim_rewards
    bot.onText(/^\/claim_rewards$/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await contractGlobal.claim_rewards({
                args: {},
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully claimed staking rewards`);
        }
        catch (error) {
            console.error('Error claiming rewards:', error);
            await bot.sendMessage(chatId, 'Error claiming rewards.');
        }
    });
    // /register_referral <referrer>
    bot.onText(/^\/register_referral (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /register_referral <referrer_account>');
            return;
        }
        const referrer = match[1];
        try {
            await contractGlobal.register_referral({
                args: { referrer },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Successfully registered referrer: ${referrer}`);
        }
        catch (error) {
            console.error('Error registering referral:', error);
            await bot.sendMessage(chatId, 'Error registering referral.');
        }
    });
    // /propose <proposalDescription>
    bot.onText(/^\/propose (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /propose <proposal description>');
            return;
        }
        const proposalDescription = match[1];
        try {
            await contractGlobal.propose({
                args: { description: proposalDescription },
                gas: "300000000000000",
                amount: "1",
            });
            await bot.sendMessage(chatId, `Proposal created: "${proposalDescription}"`);
        }
        catch (error) {
            console.error('Error creating proposal:', error);
            await bot.sendMessage(chatId, 'Error creating proposal.');
        }
    });
    // /vote <proposalId> <true|false>
    bot.onText(/^\/vote (\d+) (true|false)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1] || !match[2]) {
            await bot.sendMessage(chatId, 'Usage: /vote <proposal_id> <true|false>');
            return;
        }
        const proposalId = parseInt(match[1]);
        const support = match[2].toLowerCase() === 'true';
        try {
            await contractGlobal.vote({
                args: { proposal_id: proposalId, support },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Voted on proposal ${proposalId} with support=${support}`);
        }
        catch (error) {
            console.error('Error voting on proposal:', error);
            await bot.sendMessage(chatId, 'Error voting on proposal.');
        }
    });
    // /finalize_proposal <proposalId>
    bot.onText(/^\/finalize_proposal (\d+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /finalize_proposal <proposal_id>');
            return;
        }
        const proposalId = parseInt(match[1]);
        try {
            await contractGlobal.finalize_proposal({
                args: { proposal_id: proposalId },
                gas: "300000000000000",
            });
            await bot.sendMessage(chatId, `Finalized proposal ${proposalId}`);
        }
        catch (error) {
            console.error('Error finalizing proposal:', error);
            await bot.sendMessage(chatId, 'Error finalizing proposal.');
        }
    });
    // /meme <prompt>
    bot.onText(/^\/meme (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /meme <prompt>');
            return;
        }
        const prompt = match[1];
        // (Optional) AI suggestions for the meme prompt
        const suggestions = await (0, aiFeatures_1.generateMemeSuggestions)(prompt);
        if (suggestions && suggestions.length > 0) {
            await bot.sendMessage(chatId, `🤖 *AI Suggestions* for your meme prompt:\n- ${suggestions.join('\n- ')}`, { parse_mode: 'Markdown' });
        }
        try {
            await simulateTyping(chatId, 2000);
            const imageBuffer = await (0, huggingFaceStableDiffusion_1.generateMemeImage)(prompt);
            await bot.sendPhoto(chatId, imageBuffer, {
                caption: '✨ *Here is your meme image!* ✨',
                parse_mode: 'Markdown',
            });
            // Store the prompt if user wants to mint
            pendingNftRequests[chatId] = prompt;
            await bot.sendMessage(chatId, 'Do you want to mint this meme as an NFT?', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Yes, mint NFT', callback_data: 'meme_nft_yes' },
                            { text: 'No, thanks', callback_data: 'meme_nft_no' },
                        ],
                    ],
                },
            });
        }
        catch (error) {
            console.error('Error generating meme image:', error);
            await bot.sendMessage(chatId, '⚠️ *Sorry, an error occurred while generating your meme image.*', { parse_mode: 'Markdown' });
        }
    });
    // /nft_mint <metadata>
    bot.onText(/^\/nft_mint (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /nft_mint <metadata>');
            return;
        }
        const metadata = match[1];
        try {
            await simulateTyping(chatId, 1500);
            await contractGlobal.nft_mint({
                args: { metadata },
                gas: "300000000000000",
                amount: "2",
            });
            await bot.sendMessage(chatId, `🖼️ *NFT minted!* \nMetadata: \`${metadata}\``, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error minting NFT:', error);
            await bot.sendMessage(chatId, '⚠️ Error minting NFT.');
        }
    });
    // /activity <account>
    bot.onText(/^\/activity (.+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!match || !match[1]) {
            await bot.sendMessage(chatId, 'Usage: /activity <account>');
            return;
        }
        const accountParam = match[1];
        try {
            await simulateTyping(chatId);
            // 1) Fetch raw data from NEARBlocks
            const url = `https://api-testnet.nearblocks.io/v1/account/${accountParam}/txns`;
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`NEARBlocks fetch error: ${resp.status}`);
            }
            const data = await resp.json();
            const rawTxs = data.txns || [];
            // 2) Summarize with AI
            const summary = await (0, aiFeatures_1.summarizeOnChainActivity)(rawTxs);
            // 3) Return summary
            await bot.sendMessage(chatId, `🤖 *AI Summary of ${accountParam} activity:* \n${summary}`, { parse_mode: 'Markdown' });
        }
        catch (error) {
            console.error('Error retrieving activity:', error);
            await bot.sendMessage(chatId, '⚠️ Error retrieving activity or summarizing data.');
        }
    });
    // /help
    bot.onText(/^\/help$/, async (msg) => {
        const chatId = msg.chat.id;
        const helpMessage = `
*Available Commands:*

1. */help*  
   Displays this help menu.

2. */setContract <contractId>*  
   Switches the bot to use a different NEAR contract.  
   Example: \`/setContract your-other-contract.testnet\`

3. */mint [depositAmount]*  
   Mints tokens by attaching a deposit in yoctoNEAR (defaults to 0.01 NEAR).  
   Example: \`/mint 1000000000000000000000000\`

4. */balance <accountId>*  
   Shows the token balance for a given account.  
   Example: \`/balance alice.testnet\`

5. */totalSupply*  
   Shows the total supply of tokens from the current contract.

6. */topTipper*  
   Shows the account that has tipped the most cumulatively.

7. */tip <receiver> <amount>*  
   Transfers (tips) tokens from you to another account.  
   Example: \`/tip bob.testnet 1000000000000000000000000\`

8. */withdraw <amount>*  
   Withdraws tokens back to your NEAR wallet.  
   Example: \`/withdraw 500000000000000000000000\`

9. */burn <amount>*  
   Burns tokens from your balance, reducing total supply.

10. */stake <amount>*  
    Stakes your tokens (requires attaching a small deposit).  
    Example: \`/stake 100000000000000000000000\`

11. */unstake <amount>*  
    Unstakes your staked tokens.

12. */claim_rewards*  
    Claims your staking rewards.

13. */register_referral <referrer>*  
    Registers a referrer for future mint bonuses.

14. */propose <proposalDescription>*  
    (Admin only) Creates a new governance proposal.

15. */vote <proposalId> <true|false>*  
    Votes on an existing proposal.  
    Example: \`/vote 1 true\`

16. */finalize_proposal <proposalId>*  
    (Admin only) Finalizes a proposal once voting ends.

17. */nft_mint <metadata>*  
    Mints a stub NFT with the provided metadata (attaches deposit).

18. */meme <prompt>*  
    Generates a meme image from AI.  
    Example: \`/meme cat dancing in neon city\`
    You can choose to mint the resulting meme as an NFT!

19. */startGame*  
    Start the mini game (3 free tries).

20. */play*  
    Use a try to roll. If you lose all tries, see /buyTries.

21. */buyTries <yoctoAmount>*  
    Tells the contract to tip(...) that amount, then grants you 3 tries.

22. */stopGame*  
    Ends your current game session, clearing your tries.

23. *(AI Chat)*  
    If your message doesn’t start with a slash command, the bot treats it as a blockchain-related question and attempts an AI-based answer.

*Tip:* You can also call \`/help\` any time to see this menu again.
`;
        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });
    // The “catch-all” for AI chat: if it doesn't start with slash
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = (msg.text || '').trim();
        // If it starts with '/', we've already handled it above, so skip.
        if (text.startsWith('/'))
            return;
        try {
            await simulateTyping(chatId, 1500);
            const aiResponse = await (0, aiChat_1.getBlockchainAnswer)(text);
            await bot.sendMessage(chatId, `🤖 ${aiResponse}`);
        }
        catch (error) {
            console.error('Error in AI chatbot:', error);
            await bot.sendMessage(chatId, '⚠️ Error retrieving AI answer.');
        }
    });
    // ---------- “Callback query” for Meme NFT inline buttons ----------
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id;
        const data = callbackQuery.data;
        if (!chatId)
            return;
        if (data === 'meme_nft_no') {
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'NFT mint canceled.' });
            delete pendingNftRequests[chatId];
            return;
        }
        if (data === 'meme_nft_yes') {
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'Minting NFT...' });
            const prompt = pendingNftRequests[chatId];
            if (!prompt) {
                await bot.sendMessage(chatId, 'No meme prompt found to mint.');
                return;
            }
            try {
                await bot.sendChatAction(chatId, 'typing');
                await new Promise((res) => setTimeout(res, 1500));
                // Mint NFT with the prompt as metadata
                await contractGlobal.nft_mint({
                    args: { metadata: `Meme minted with prompt: ${prompt}` },
                    gas: "300000000000000",
                    amount: "2",
                });
                await bot.sendMessage(chatId, '🎉 NFT minted for your meme!');
            }
            catch (error) {
                console.error('Error minting NFT:', error);
                await bot.sendMessage(chatId, '⚠️ Error minting NFT.');
            }
            // cleanup
            delete pendingNftRequests[chatId];
        }
    });
    console.log('Telegram bot is fully ready.');
})
    .catch((err) => {
    console.error('Error initializing NEAR or game:', err);
    botIsOffline = true;
});

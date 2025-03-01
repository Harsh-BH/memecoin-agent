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
const huggingFaceStableDiffusion_1 = require("./huggingFaceStableDiffusion");
const near_api_js_1 = require("near-api-js");
const aiChat_1 = require("./aiChat");
// ----- NEAR CONFIGURATION -----
const nearConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    keyStore: new near_api_js_1.keyStores.InMemoryKeyStore(),
};
// Environment variables
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID;
console.log("account id", ACCOUNT_ID);
const PRIVATE_KEY = process.env.NEAR_ACCOUNT_PRIVATE_KEY;
const DEFAULT_CONTRACT_ID = process.env.NEAR_CONTRACT_NAME;
console.log("Default contract id", DEFAULT_CONTRACT_ID);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Setup NEAR keys
const keyPair = near_api_js_1.KeyPair.fromString(PRIVATE_KEY);
nearConfig.keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);
// Initialize Telegram bot
const bot = new node_telegram_bot_api_1.default(BOT_TOKEN, { polling: true });
// We'll store user data about the last meme prompt if they want to mint it as NFT.
const pendingNftRequests = {};
// Global references so we can switch contract ID
let nearGlobal;
let accountGlobal;
let contractGlobal; // We'll reassign this if user calls /setContract
// ----- INITIALIZE NEAR & DEFAULT CONTRACT -----
async function initNear() {
    nearGlobal = await (0, near_api_js_1.connect)(nearConfig);
    accountGlobal = await nearGlobal.account(ACCOUNT_ID);
    // Instantiate default contract
    contractGlobal = new near_api_js_1.Contract(accountGlobal, DEFAULT_CONTRACT_ID, {
        viewMethods: ['get_balance', 'get_total_supply', 'get_top_tipper'],
        changeMethods: [
            'mint',
            'tip',
            'withdraw',
            'burn',
            'stake',
            'unstake',
            'claim_rewards',
            'register_referral',
            'propose',
            'vote',
            'finalize_proposal',
            'nft_mint',
        ],
    });
}
// Re-initialize contract with a new contractId
async function reinitContract(newContractId) {
    // Reuse same account but point to new contract ID
    contractGlobal = new near_api_js_1.Contract(accountGlobal, newContractId, {
        viewMethods: ['get_balance', 'get_total_supply', 'get_top_tipper'],
        changeMethods: [
            'mint',
            'tip',
            'withdraw',
            'burn',
            'stake',
            'unstake',
            'claim_rewards',
            'register_referral',
            'propose',
            'vote',
            'finalize_proposal',
            'nft_mint',
        ],
    });
    console.log(`Switched contract to: ${newContractId}`);
}
// Helper function: simulate "typing" for a short delay
const simulateTyping = async (chatId, ms = 1500) => {
    await bot.sendChatAction(chatId, 'typing');
    return new Promise((resolve) => setTimeout(resolve, ms));
};
initNear()
    .then(() => {
    // ---------- Handle all incoming messages ----------
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = (msg.text || '').trim();
        console.log("Received command:", text);
        // NEW: /setContract <contractId> 
        // Switch to a different contract ID
        if (text.startsWith('/setContract')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /setContract <contractId>');
                return;
            }
            const newContractId = parts[1];
            try {
                await reinitContract(newContractId);
                await bot.sendMessage(chatId, `✅ Contract ID switched to: ${newContractId}`);
            }
            catch (error) {
                console.error('Error switching contract:', error);
                await bot.sendMessage(chatId, '⚠️ Failed to switch contract ID.');
            }
            return;
        }
        // 1) MINT
        if (text.startsWith('/mint')) {
            const parts = text.split(' ');
            const depositAmount = parts[1] || '10000000000000000'; // default 0.01 NEAR
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
            return;
        }
        // 2) BALANCE
        if (text.startsWith('/balance')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /balance <account>');
                return;
            }
            const accountParam = parts[1];
            try {
                await simulateTyping(chatId);
                const balance = await contractGlobal.get_balance({ account: accountParam });
                await bot.sendMessage(chatId, `💰 The token balance for *${accountParam}* is: \`${balance}\``, { parse_mode: 'Markdown' });
            }
            catch (error) {
                console.error('Error fetching balance:', error);
                await bot.sendMessage(chatId, '⚠️ Error retrieving token balance.');
            }
            return;
        }
        // 3) TOTAL SUPPLY
        if (text.startsWith('/totalSupply')) {
            try {
                await simulateTyping(chatId);
                const totalSupply = await contractGlobal.get_total_supply();
                await bot.sendMessage(chatId, `🏦 *Total Token Supply:* \`${totalSupply}\``, { parse_mode: 'Markdown' });
            }
            catch (error) {
                console.error('Error fetching total supply:', error);
                await bot.sendMessage(chatId, '⚠️ Error retrieving total supply.');
            }
            return;
        }
        // 4) TOP TIPPER
        if (text.startsWith('/topTipper')) {
            try {
                await simulateTyping(chatId);
                const topTipper = await contractGlobal.get_top_tipper();
                await bot.sendMessage(chatId, `🏆 The top tipper is: *${topTipper || 'No tipper yet'}*`, { parse_mode: 'Markdown' });
            }
            catch (error) {
                console.error('Error fetching top tipper:', error);
                await bot.sendMessage(chatId, '⚠️ Error retrieving top tipper.');
            }
            return;
        }
        // 5) TIP
        if (text.startsWith('/tip')) {
            const parts = text.split(' ');
            if (parts.length < 3) {
                await bot.sendMessage(chatId, 'Usage: /tip <receiver> <amount>');
                return;
            }
            const receiver = parts[1];
            const amount = parts[2];
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
            return;
        }
        // 6) WITHDRAW
        if (text.startsWith('/withdraw')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /withdraw <amount>');
                return;
            }
            const amount = parts[1];
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
            return;
        }
        // 7) BURN
        if (text.startsWith('/burn')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /burn <amount>');
                return;
            }
            const amount = parts[1];
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
            return;
        }
        // 8) STAKE
        if (text.startsWith('/stake')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /stake <amount>');
                return;
            }
            const amount = parts[1];
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
            return;
        }
        // 9) UNSTAKE
        if (text.startsWith('/unstake')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /unstake <amount>');
                return;
            }
            const amount = parts[1];
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
            return;
        }
        // 10) CLAIM REWARDS
        if (text.startsWith('/claim_rewards')) {
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
            return;
        }
        // 11) REGISTER REFERRAL
        if (text.startsWith('/register_referral')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /register_referral <referrer_account>');
                return;
            }
            const referrer = parts[1];
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
            return;
        }
        // 12) PROPOSE (Admin Only)
        if (text.startsWith('/propose')) {
            const proposalDescription = text.slice('/propose'.length).trim();
            if (!proposalDescription) {
                await bot.sendMessage(chatId, 'Usage: /propose <proposal description>');
                return;
            }
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
            return;
        }
        // 13) VOTE
        if (text.startsWith('/vote')) {
            const parts = text.split(' ');
            if (parts.length < 3) {
                await bot.sendMessage(chatId, 'Usage: /vote <proposal_id> <true|false>');
                return;
            }
            const proposalId = parseInt(parts[1]);
            const support = parts[2].toLowerCase() === 'true';
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
            return;
        }
        // 14) FINALIZE PROPOSAL
        if (text.startsWith('/finalize_proposal')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Usage: /finalize_proposal <proposal_id>');
                return;
            }
            const proposalId = parseInt(parts[1]);
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
            return;
        }
        // 15) Meme Generation: /meme <prompt>
        if (text.startsWith('/meme')) {
            const prompt = text.slice('/meme'.length).trim();
            if (!prompt) {
                await bot.sendMessage(chatId, 'Usage: /meme <prompt>');
                return;
            }
            try {
                await simulateTyping(chatId, 2000);
                // 1) Generate the meme image
                const imageBuffer = await (0, huggingFaceStableDiffusion_1.generateMemeImage)(prompt);
                // 2) Send the image
                await bot.sendPhoto(chatId, imageBuffer, {
                    caption: '✨ *Here is your meme image!* ✨',
                    parse_mode: 'Markdown',
                });
                // 3) Store the prompt in memory so we can mint NFT if user wants
                pendingNftRequests[chatId] = prompt;
                // 4) Ask user if they'd like to mint the meme as NFT
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
            return;
        }
        // 16) NFT MINT: /nft_mint <metadata> (Manual usage)
        if (text.startsWith('/nft_mint')) {
            const metadata = text.slice('/nft_mint'.length).trim();
            if (!metadata) {
                await bot.sendMessage(chatId, 'Usage: /nft_mint <metadata>');
                return;
            }
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
            return;
        }
        // ============= AI BLOCKCHAIN CHATBOT =============
        // If message doesn't match any slash command, treat it as a blockchain question
        if (!text.startsWith('/')) {
            try {
                await simulateTyping(chatId, 1500);
                const aiResponse = await (0, aiChat_1.getBlockchainAnswer)(text);
                await bot.sendMessage(chatId, `🤖 ${aiResponse}`);
            }
            catch (error) {
                console.error('Error in AI chatbot:', error);
                await bot.sendMessage(chatId, '⚠️ Error retrieving AI answer.');
            }
            return;
        }
    });
    // ---------- Handle Inline Keyboard Responses (for Meme NFT) ----------
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id;
        const data = callbackQuery.data;
        if (!chatId)
            return;
        if (data === 'meme_nft_no') {
            // user says "No, thanks"
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'NFT mint canceled.' });
            delete pendingNftRequests[chatId];
            return;
        }
        if (data === 'meme_nft_yes') {
            // user wants to mint the meme as NFT
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'Minting NFT...' });
            const prompt = pendingNftRequests[chatId];
            if (!prompt) {
                await bot.sendMessage(chatId, 'No meme prompt found to mint.');
                return;
            }
            try {
                // We can simulate short typing
                await bot.sendChatAction(chatId, 'typing');
                await new Promise((res) => setTimeout(res, 1500));
                // Mint NFT with the prompt as metadata
                await contractGlobal.nft_mint({
                    args: { metadata: `Meme minted with prompt: ${prompt}` },
                    gas: "300000000000000",
                    amount: "2", // 2 yocto, or more if needed
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
    console.log('Telegram bot is running and connected to NEAR.');
})
    .catch((err) => {
    console.error('Error initializing NEAR connection:', err);
});

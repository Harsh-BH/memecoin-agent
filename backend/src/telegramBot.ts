// telegramBot.ts
import * as dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { generateMemeImage } from './huggingFaceStableDiffusion';
import { connect, keyStores, KeyPair, Contract, Near, Account } from 'near-api-js';
import { getBlockchainAnswer } from './aiChat';
import { 
  userMemory, 
  generateMemeSuggestions, 
  summarizeOnChainActivity 
} from './aiFeatures';

// ----- NEAR CONFIGURATION -----
const nearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  keyStore: new keyStores.InMemoryKeyStore(),
};

const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID!;
const PRIVATE_KEY = process.env.NEAR_ACCOUNT_PRIVATE_KEY!;
const DEFAULT_CONTRACT_ID = process.env.NEAR_CONTRACT_NAME!;
const BOT_TOKEN: string = process.env.TELEGRAM_BOT_TOKEN!;

console.log("account id", ACCOUNT_ID);
console.log("Default contract id", DEFAULT_CONTRACT_ID);

// Setup NEAR keys
const keyPair = KeyPair.fromString(PRIVATE_KEY);
nearConfig.keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);

// Initialize Telegram bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Track whether the bot is in an “error/offline” state
let botIsOffline = false;

// If the bot encounters a polling error, we consider it “offline”
bot.on('polling_error', (err) => {
  console.error("Bot polling error:", err);
  botIsOffline = true;
});

// If the bot is using webhooks, we can also listen for errors:
bot.on('webhook_error', (err) => {
  console.error("Bot webhook error:", err);
  botIsOffline = true;
});

// We'll store user data about the last meme prompt if they want to mint it as NFT.
const pendingNftRequests: Record<number, string> = {};

// Global references so we can switch contract ID
let nearGlobal: Near;
let accountGlobal: Account;
let contractGlobal: Contract; // We'll reassign this if user calls /setContract

// ----- INITIALIZE NEAR & DEFAULT CONTRACT -----
async function initNear() {
  nearGlobal = await connect(nearConfig);
  accountGlobal = await nearGlobal.account(ACCOUNT_ID);

  // Instantiate default contract
  contractGlobal = new Contract(accountGlobal, DEFAULT_CONTRACT_ID, {
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
async function reinitContract(newContractId: string) {
  contractGlobal = new Contract(accountGlobal, newContractId, {
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
const simulateTyping = async (chatId: number, ms: number = 1500) => {
  await bot.sendChatAction(chatId, 'typing');
  return new Promise((resolve) => setTimeout(resolve, ms));
};

initNear()
  .then(() => {
    // If we get here, NEAR is presumably connected, so the bot is "online"
    botIsOffline = false;

    // ---------- Handle all incoming messages ----------
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();
      console.log("Received command:", text);

      // If the bot encountered a previous error, we can warn the user (optional)
      if (botIsOffline) {
        await bot.sendMessage(chatId, "⚠️ Bot recently had a polling/webhook error, but I'm still trying to respond. If commands fail, I'm partially offline.");
      }

      // A special "/status" command that shows whether the bot is offline/online
      if (text.startsWith('/status')) {
        if (botIsOffline) {
          await bot.sendMessage(chatId, "Bot is currently marked as OFFLINE (polling/webhook error).");
        } else {
          await bot.sendMessage(chatId, "Bot is ONLINE and NEAR is connected.");
        }
        return;
      }

      // /setContract <contractId> => Switch contract
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
        } catch (error) {
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
          await (contractGlobal as any).mint({
            args: {},
            gas: "300000000000000",
            amount: depositAmount,
          });
          await bot.sendMessage(
            chatId,
            `✨ *Mint Successful!* \nYou attached \`${depositAmount}\` yoctoNEAR.\nEnjoy your newly minted tokens!`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
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
          const balance = await (contractGlobal as any).get_balance({ account: accountParam });
          await bot.sendMessage(
            chatId,
            `💰 The token balance for *${accountParam}* is: \`${balance}\``,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.error('Error fetching balance:', error);
          await bot.sendMessage(chatId, '⚠️ Error retrieving token balance.');
        }
        return;
      }

      // 3) TOTAL SUPPLY
      if (text.startsWith('/totalSupply')) {
        try {
          await simulateTyping(chatId);
          const totalSupply = await (contractGlobal as any).get_total_supply();
          await bot.sendMessage(
            chatId,
            `🏦 *Total Token Supply:* \`${totalSupply}\``,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.error('Error fetching total supply:', error);
          await bot.sendMessage(chatId, '⚠️ Error retrieving total supply.');
        }
        return;
      }

      // 4) TOP TIPPER
      if (text.startsWith('/topTipper')) {
        try {
          await simulateTyping(chatId);
          const topTipper = await (contractGlobal as any).get_top_tipper();
          await bot.sendMessage(
            chatId,
            `🏆 The top tipper is: *${topTipper || 'No tipper yet'}*`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
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
          await (contractGlobal as any).tip({
            args: { receiver, amount },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully tipped ${amount} tokens to ${receiver}`);
        } catch (error) {
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
          await (contractGlobal as any).withdraw({
            args: { amount },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully withdrew ${amount} tokens`);
        } catch (error) {
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
          await (contractGlobal as any).burn({
            args: { amount },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully burned ${amount} tokens`);
        } catch (error) {
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
          await (contractGlobal as any).stake({
            args: { amount },
            gas: "300000000000000",
            amount: "1",
          });
          await bot.sendMessage(chatId, `Successfully staked ${amount} tokens`);
        } catch (error) {
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
          await (contractGlobal as any).unstake({
            args: { amount },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully unstaked ${amount} tokens`);
        } catch (error) {
          console.error('Error unstaking tokens:', error);
          await bot.sendMessage(chatId, 'Error unstaking tokens.');
        }
        return;
      }

      // 10) CLAIM REWARDS
      if (text.startsWith('/claim_rewards')) {
        try {
          await (contractGlobal as any).claim_rewards({
            args: {},
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully claimed staking rewards`);
        } catch (error) {
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
          await (contractGlobal as any).register_referral({
            args: { referrer },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Successfully registered referrer: ${referrer}`);
        } catch (error) {
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
          await (contractGlobal as any).propose({
            args: { description: proposalDescription },
            gas: "300000000000000",
            amount: "1",
          });
          await bot.sendMessage(chatId, `Proposal created: "${proposalDescription}"`);
        } catch (error) {
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
          await (contractGlobal as any).vote({
            args: { proposal_id: proposalId, support },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Voted on proposal ${proposalId} with support=${support}`);
        } catch (error) {
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
          await (contractGlobal as any).finalize_proposal({
            args: { proposal_id: proposalId },
            gas: "300000000000000",
          });
          await bot.sendMessage(chatId, `Finalized proposal ${proposalId}`);
        } catch (error) {
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
        // 1) Suggest expansions
        const suggestions = await generateMemeSuggestions(prompt);
        if (suggestions && suggestions.length > 0) {
          await bot.sendMessage(
            chatId,
            `🤖 *AI Suggestions* for your meme prompt:\n- ${suggestions.join('\n- ')}`,
            { parse_mode: 'Markdown' }
          );
        }

        try {
          await simulateTyping(chatId, 2000);

          // 1) Generate the meme image
          const imageBuffer = await generateMemeImage(prompt);

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
        } catch (error) {
          console.error('Error generating meme image:', error);
          await bot.sendMessage(
            chatId,
            '⚠️ *Sorry, an error occurred while generating your meme image.*',
            { parse_mode: 'Markdown' }
          );
        }
        return;
      }

        // ----- Context-Aware Example: "my last NFT" -----
        if (/my last nft/i.test(text)) {
          const memory = userMemory[chatId] || {};
          if (memory.lastMintedNFT) {
            await bot.sendMessage(chatId, `Your last minted NFT metadata: ${memory.lastMintedNFT}`);
          } else {
            await bot.sendMessage(chatId, "I don't see any record of your last minted NFT in memory.");
          }
          return;
        }

         // ----- Summaries of On-Chain Data: /activity <account> -----
      if (text.startsWith('/activity')) {
        const parts = text.split(' ');
        if (parts.length < 2) {
          await bot.sendMessage(chatId, 'Usage: /activity <account>');
          return;
        }
        const accountParam = parts[1];
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
          const summary = await summarizeOnChainActivity(rawTxs);

          // 3) Return summary
          await bot.sendMessage(chatId, `🤖 *AI Summary of ${accountParam} activity:* \n${summary}`, {
            parse_mode: 'Markdown',
          });
        } catch (error) {
          console.error('Error retrieving activity:', error);
          await bot.sendMessage(chatId, '⚠️ Error retrieving activity or summarizing data.');
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
          await (contractGlobal as any).nft_mint({
            args: { metadata },
            gas: "300000000000000",
            amount: "2",
          });
          await bot.sendMessage(
            chatId,
            `🖼️ *NFT minted!* \nMetadata: \`${metadata}\``,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.error('Error minting NFT:', error);
          await bot.sendMessage(chatId, '⚠️ Error minting NFT.');
        }
        return;
      }

      // In your telegramBot.ts, within the bot.on('message', ...) handler:

// ----- HELP COMMAND -----
if (text.startsWith('/help')) {
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

19. *(AI Chat)*  
    If your message doesn’t start with a slash command, the bot treats it as a blockchain-related question and attempts an AI-based answer.

*Tip:* You can also call \`/help\` any time to see this menu again.
`;

  // Send as Markdown
  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  return;
}


      // ============= AI BLOCKCHAIN CHATBOT =============
      // If message doesn't match any slash command, treat it as a blockchain question
      if (!text.startsWith('/')) {
        try {
          await simulateTyping(chatId, 1500);

          const aiResponse = await getBlockchainAnswer(text);

          await bot.sendMessage(chatId, `🤖 ${aiResponse}`);
        } catch (error) {
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
      if (!chatId) return;

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
          await (contractGlobal as any).nft_mint({
            args: { metadata: `Meme minted with prompt: ${prompt}` },
            gas: "300000000000000",
            amount: "2", // 2 yocto, or more if needed
          });

          await bot.sendMessage(chatId, '🎉 NFT minted for your meme!');
        } catch (error) {
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
    // If NEAR initialization fails, we can mark offline
    botIsOffline = true;
  });

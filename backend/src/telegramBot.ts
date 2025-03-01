// telegramBot.ts
import * as dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { generateMemeImage } from './huggingFaceStableDiffusion';
import { connect, keyStores, KeyPair, Contract } from 'near-api-js';

// ----- NEAR CONFIGURATION -----
const nearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  keyStore: new keyStores.InMemoryKeyStore(),
};

// Environment variables
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID!;
console.log("account id", ACCOUNT_ID);
const PRIVATE_KEY = process.env.NEAR_ACCOUNT_PRIVATE_KEY!; // your private key
const CONTRACT_ID = process.env.NEAR_CONTRACT_NAME!;
console.log("contract id", CONTRACT_ID); // e.g. "your-contract.testnet"
const BOT_TOKEN: string = process.env.TELEGRAM_BOT_TOKEN!;

// Save key to keyStore
const keyPair = KeyPair.fromString(PRIVATE_KEY);
nearConfig.keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);

// Initialize Telegram bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const pendingNftRequests: Record<number, string> = {};

// ----- INITIALIZE NEAR AND THE CONTRACT -----
async function initNear() {
  const near = await connect(nearConfig);
  const account = await near.account(ACCOUNT_ID);

  // Instantiate the contract; list view and change methods as needed.
  const contract = new Contract(
    account,
    CONTRACT_ID,
    {
      viewMethods: ['get_balance', 'get_total_supply', 'get_top_tipper'],
      changeMethods: ['mint', 'tip', 'withdraw', 'burn', 'stake', 'unstake', 'claim_rewards', 'register_referral', 'propose', 'vote', 'finalize_proposal', 'nft_mint'],
    }
  );
  return { account, contract };
}

initNear()
  .then(({ contract }) => {
    // Helper function to simulate a short typing delay
    const simulateTyping = async (chatId: number, ms: number = 1500) => {
      // Indicate the bot is typing
      await bot.sendChatAction(chatId, 'typing');
      // Wait the specified milliseconds
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();
      console.log("Received command:", text);
 // ============= EXAMPLE COMMANDS =============
      // 1) MINT
      if (text.startsWith('/mint')) {
        const parts = text.split(' ');
        const depositAmount = parts[1] || '10000000000000000'; // 0.01 NEAR in yocto
        try {
          // Simulate typing
          await simulateTyping(chatId, 1000);
          await (contract as any).mint({
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
          const balance = await (contract as any).get_balance({ account: accountParam });
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
          const totalSupply = await (contract as any).get_total_supply();
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
          const topTipper = await (contract as any).get_top_tipper();
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
    
    // ----- TIP -----
    if (text.startsWith('/tip')) {
      const parts = text.split(' ');
      if (parts.length < 3) {
        await bot.sendMessage(chatId, 'Usage: /tip <receiver> <amount>');
        return;
      }
      const receiver = parts[1];
      const amount = parts[2];
      try {
        await (contract as any).tip({
          args: { receiver, amount },
          gas: "300000000000000", // 300 TGas
        });
        await bot.sendMessage(chatId, `Successfully tipped ${amount} tokens to ${receiver}`);
      } catch (error) {
        console.error('Error tipping tokens:', error);
        await bot.sendMessage(chatId, 'Error tipping tokens.');
      }
      return;
    }
    
    // ----- WITHDRAW -----
    if (text.startsWith('/withdraw')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /withdraw <amount>');
        return;
      }
      const amount = parts[1];
      try {
        await (contract as any).withdraw({
          args: { amount },
          gas: "300000000000000", // adjust if necessary
        });
        await bot.sendMessage(chatId, `Successfully withdrew ${amount} tokens`);
      } catch (error) {
        console.error('Error withdrawing tokens:', error);
        await bot.sendMessage(chatId, 'Error withdrawing tokens.');
      }
      return;
    }
    
    // ----- BURN -----
    if (text.startsWith('/burn')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /burn <amount>');
        return;
      }
      const amount = parts[1];
      try {
        await (contract as any).burn({
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
    
    // ----- STAKE -----
    if (text.startsWith('/stake')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /stake <amount>');
        return;
      }
      const amount = parts[1];
      try {
        await (contract as any).stake({
          args: { amount },
          gas: "300000000000000",
          amount: "1", // if any attached deposit is required, adjust accordingly
        });
        await bot.sendMessage(chatId, `Successfully staked ${amount} tokens`);
      } catch (error) {
        console.error('Error staking tokens:', error);
        await bot.sendMessage(chatId, 'Error staking tokens.');
      }
      return;
    }
    
    // ----- UNSTAKE -----
    if (text.startsWith('/unstake')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /unstake <amount>');
        return;
      }
      const amount = parts[1];
      try {
        await (contract as any).unstake({
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
    
    // ----- CLAIM REWARDS -----
    if (text.startsWith('/claim_rewards')) {
      try {
        await (contract as any).claim_rewards({
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
    
    // ----- REGISTER REFERRAL -----
    if (text.startsWith('/register_referral')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /register_referral <referrer_account>');
        return;
      }
      const referrer = parts[1];
      try {
        await (contract as any).register_referral({
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
    
    // ----- PROPOSE (Admin Only) -----
    if (text.startsWith('/propose')) {
      // The proposal description is everything after the command.
      const proposalDescription = text.slice('/propose'.length).trim();
      if (!proposalDescription) {
        await bot.sendMessage(chatId, 'Usage: /propose <proposal description>');
        return;
      }
      try {
        await (contract as any).propose({
          args: { description: proposalDescription },
          gas: "300000000000000",
          amount: "1", // if any attached deposit is required, adjust accordingly
        });
        await bot.sendMessage(chatId, `Proposal created: "${proposalDescription}"`);
      } catch (error) {
        console.error('Error creating proposal:', error);
        await bot.sendMessage(chatId, 'Error creating proposal.');
      }
      return;
    }
    
    // ----- VOTE -----
    if (text.startsWith('/vote')) {
      const parts = text.split(' ');
      if (parts.length < 3) {
        await bot.sendMessage(chatId, 'Usage: /vote <proposal_id> <true|false>');
        return;
      }
      const proposalId = parseInt(parts[1]);
      const support = parts[2].toLowerCase() === 'true';
      try {
        await (contract as any).vote({
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
    
    // ----- FINALIZE PROPOSAL (Admin Only) -----
    if (text.startsWith('/finalize_proposal')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await bot.sendMessage(chatId, 'Usage: /finalize_proposal <proposal_id>');
        return;
      }
      const proposalId = parseInt(parts[1]);
      try {
        await (contract as any).finalize_proposal({
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


    
   //  NFT MINT
   if (text.startsWith('/nft_mint')) {
    const metadata = text.slice('/nft_mint'.length).trim();
    if (!metadata) {
      await bot.sendMessage(chatId, 'Usage: /nft_mint <metadata>');
      return;
    }
    try {
      await simulateTyping(chatId, 1500);
      // Use at least 2 yoctoNEAR to pass deposit_amount > 1
      await (contract as any).nft_mint({
        args: { metadata },
        gas: "300000000000000",
        amount: "2", // 2 yocto, or "10000000000000000000000000" for 10 NEAR
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
    
    // ============= FALLBACK: Meme Image Generation =============
    try {
      // Indicate the bot is "thinking"
      await simulateTyping(chatId, 2000);

      // 1) Generate the image from the prompt
      const imageBuffer = await generateMemeImage(text);

      // 2) Send the image
      await bot.sendPhoto(chatId, imageBuffer, {
        caption: '✨ *Here is your meme image!* ✨',
        parse_mode: 'Markdown',
      });

      // 3) Store the prompt for potential NFT mint
      pendingNftRequests[chatId] = text;

      // 4) Ask user if they want to mint as NFT
      await bot.sendMessage(chatId, 'Do you want to mint this as an NFT?', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Yes 🪄', callback_data: 'mint_yes' },
              { text: 'No 🚫', callback_data: 'mint_no' },
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
  });

  // Handle the inline keyboard responses
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data; // 'mint_yes' or 'mint_no'
    if (!chatId) return;

    if (data === 'mint_no') {
      // If user says "No," remove from pending requests
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'NFT mint canceled.' });
      delete pendingNftRequests[chatId];
      return;
    }

    if (data === 'mint_yes') {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Minting NFT...' });

      // Retrieve the prompt/metadata
      const metadata = pendingNftRequests[chatId];
      if (!metadata) {
        await bot.sendMessage(chatId, '⚠️ Sorry, I have no data to mint.');
        return;
      }

      try {
        // Simulate short typing
        await bot.sendChatAction(chatId, 'typing');
        await new Promise((res) => setTimeout(res, 1500));

        // Attach deposit to pass the "deposit_amount > 1" check
        await (contract as any).nft_mint({
          args: { metadata },
          gas: "300000000000000",
          amount: "2", // minimal pass, or more
        });

        await bot.sendMessage(
          chatId,
          `🪄 *NFT minted successfully!* \nMetadata: \`${metadata}\``,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Error minting NFT:', error);
        await bot.sendMessage(chatId, '⚠️ Error minting NFT.');
      }

      // Clean up
      delete pendingNftRequests[chatId];
    }
  });

  console.log('Telegram bot is running and connected to NEAR.');
})
.catch((err) => {
  console.error('Error initializing NEAR connection:', err);
});
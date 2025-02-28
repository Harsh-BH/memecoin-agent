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
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID!;     // e.g. "your-account.testnet"
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY!;     // your private key
const CONTRACT_ID = process.env.CONTRACT_ID!;          // e.g. "your-contract.testnet"
const BOT_TOKEN: string = process.env.TELEGRAM_BOT_TOKEN!;

// Save key to keyStore
const keyPair = KeyPair.fromString(PRIVATE_KEY);
nearConfig.keyStore.setKey(nearConfig.networkId, ACCOUNT_ID, keyPair);

// Initialize Telegram bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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

// Initialize NEAR connection and contract instance
initNear().then(({ contract }) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // If the user sends a mint command (e.g. "/mint 10000000000000000000")
    if (text.startsWith('/mint')) {
      // Extract the deposit amount from the message; default to 0.01 NEAR in yoctoNEAR if not provided.
      const parts = text.split(' ');
      const depositAmount = parts[1] || '10000000000000000';
      try {
        // Call the mint method with the attached deposit.
        // Note: The first argument is the method arguments (empty here), and the second is options.
        await (contract as any).mint({}, { attachedDeposit: depositAmount });
        await bot.sendMessage(chatId, `Successfully minted tokens with deposit: ${depositAmount}`);
      } catch (error) {
        console.error('Error minting tokens:', error);
        await bot.sendMessage(chatId, 'Error minting tokens.');
      }
      return;
    }

    // Otherwise, generate a meme image using your existing function.
    try {
      const imageBuffer = await generateMemeImage(text);
      await bot.sendPhoto(chatId, imageBuffer, { caption: 'Here is your meme image!' });
    } catch (error) {
      console.error('Error in Telegram bot:', error);
      await bot.sendMessage(chatId, 'Sorry, an error occurred while generating your meme image.');
    }
  });

  console.log('Telegram bot is running and connected to NEAR.');
}).catch((err) => {
  console.error('Error initializing NEAR connection:', err);
});

# NEAR Telegram Bot

A **Telegram Bot** that connects to a **NEAR** smart contract, allowing users to run commands like `/mint`, `/tip`, `/stake`, and more. It also features:

1. **Meme Generation**: `/meme <prompt>` to create an AI-generated meme.
2. **NFT Minting** of Memes: The bot will ask if you want to mint your generated meme as an NFT.
3. **AI Blockchain Chatbot**: For any non-command text, it responds with a GPT-based or Hugging Face–based blockchain Q&A.

## Features

### 1. NEAR Contract Commands
- `/mint <amount>`: Mint tokens by attaching NEAR deposit.  
- `/balance <account>`: Check the token balance of `<account>`.  
- `/totalSupply`: Fetch total supply of tokens.  
- `/topTipper`: Show the current top tipper.  
- `/tip <receiver> <amount>`: Transfer tokens (tip) to `<receiver>`.  
- `/withdraw <amount>`: Withdraw tokens back to your NEAR wallet.  
- `/burn <amount>`: Burn tokens from your balance.  
- `/stake <amount>`: Stake tokens.  
- `/unstake <amount>`: Unstake tokens.  
- `/claim_rewards`: Claim staking rewards.  
- `/register_referral <referrer>`: Register a referrer for your account.  
- `/propose <description>`: (Admin) Create a new governance proposal.  
- `/vote <proposal_id> <true|false>`: Vote on a proposal.  
- `/finalize_proposal <proposal_id>`: Finalize a proposal.  
- `/setContract <contractId>`: Dynamically switch to a different NEAR contract ID (optional enhancement).

### 2. Meme Generation
- `/meme <prompt>`: Generate an AI-based meme image. The bot sends the image, then asks if you’d like to mint it as an NFT.

### 3. NFT Minting
- After generating a meme, the bot asks **“Do you want to mint this meme as an NFT?”**  
- If you choose **“Yes, mint NFT,”** it calls `nft_mint` with the meme prompt as metadata.  
- You can also manually call `/nft_mint <metadata>` to mint an NFT with any arbitrary metadata.

### 4. AI Blockchain Chatbot
- If the user sends a normal message (not starting with `"/"`), the bot calls `getBlockchainAnswer(text)` to respond with a blockchain-related answer.  
- If the query isn’t blockchain-related, it politely declines.

## Prerequisites

1. **Node.js** (v14+ recommended).  
2. A **NEAR** testnet account with the **private key**.  
3. A deployed **smart contract** (the default is set in your `.env` as `NEAR_CONTRACT_NAME`).  
4. A **Telegram Bot** token from [BotFather](https://t.me/botfather).  
5. (Optional) An **OpenAI** or **Hugging Face** API key if you want advanced AI chat or meme generation.

## Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/YourRepo/near-telegram-bot.git
   cd near-telegram-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file with:**
   ```ini
   NEAR_ACCOUNT_ID=your-account.testnet
   NEAR_ACCOUNT_PRIVATE_KEY=ed25519:...
   NEAR_CONTRACT_NAME=your-contract.testnet
   TELEGRAM_BOT_TOKEN=1234567:ABC-...
   
   # If you use OpenAI or HF, set:
   # OPENAI_API_KEY=sk-...
   # HF_API_TOKEN=hf_...
   ```

4. **Build or run the bot:**
   ```bash
   npm run build
   npm start
   ```
   or directly:
   ```bash
   ts-node src/telegramBot.ts
   ```

## Usage

Once the bot is running, open Telegram and start a chat with your bot. You can use:

- `/mint <amount>`: Example: `/mint 10000000000000000` (which is 0.01 NEAR).
- `/balance <account>`: Example: `/balance your-account.testnet`.
- `/meme <prompt>`: Example: `/meme cat in a spacesuit`.

The bot sends you the meme image and asks if you want to mint it as an NFT.  
If you say **“Yes,”** it calls `nft_mint` with that meme’s prompt as metadata.  
If you type a normal text message like **“What is blockchain consensus?”**, the bot calls the AI Q&A function.

## Example Chat Flow

```vbnet
User: /balance myaccount.testnet
Bot: 💰 The token balance for myaccount.testnet is: 12345678

User: /meme doge coin moon
Bot: [Sends an AI-generated meme image]
Bot: Do you want to mint this meme as an NFT?
[Inline keyboard: Yes, mint NFT | No, thanks]

User taps "Yes, mint NFT"
Bot: 🎉 NFT minted for your meme!
```

## Code Overview

### `telegramBot.ts`
- **Main entry.** Initializes Telegram Bot + NEAR connection.
- `initNear()` sets up NEAR, accounts, and default contract.
- **Commands:** Each `if (text.startsWith('/someCommand')) { ... }` block handles a specific NEAR method or feature.
- **Meme Flow:** `/meme <prompt>` → calls `generateMemeImage()` → sends photo → stores prompt → asks for NFT mint.
- **NFT Inline Keyboard:** `callback_query` events handle “Yes” or “No” for minting.
- **AI Chat:** Non-command text → `getBlockchainAnswer(text)` → returns GPT/HF-based response.

### `huggingFaceStableDiffusion.ts` or `openAIImage.ts`
- Contains code to generate an image from a text prompt.
- Uses Hugging Face’s stable diffusion endpoint or OpenAI DALL·E.

### `aiChat.ts`
- Contains `getBlockchainAnswer(query)`.  
- If the query has no blockchain keywords, it returns **“Please ask about blockchain.”**
- Otherwise, calls GPT or Hugging Face for a response.

## Changing the Contract at Runtime

If you want to switch contract IDs at runtime:

- Add a command like `/setContract <contractId>` that re-initializes `contractGlobal` to the new ID.
- Subsequent commands will point to that contract.

Example:

```ts
if (text.startsWith('/setContract')) {
  const parts = text.split(' ');
  if (parts.length < 2) {
    await bot.sendMessage(chatId, 'Usage: /setContract <contractId>');
    return;
  }
  const newContractId = parts[1];
  // Re-init or reassign contractGlobal with newContractId
  await reinitContract(newContractId);
  await bot.sendMessage(chatId, `Switched to contract: ${newContractId}`);
}
```

## Troubleshooting

### “Attached deposit too low for NFT minting”
- Means your contract’s `nft_mint` requires more deposit. Increase amount: **"2"** or attach **0.01 NEAR** in yocto.

### AI Chat Not Working
- Ensure you set `OPENAI_API_KEY` or `HF_API_TOKEN`. Check logs for errors.

### Telegram Bot
- Make sure `TELEGRAM_BOT_TOKEN` is correct.
- If the bot doesn’t respond, check logs or verify you used the correct token from BotFather.

## License
MIT

## Contributing
Feel free to open issues or PRs for bug fixes, improvements, or new features.

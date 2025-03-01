# NEAR Telegram Bot

A **Telegram Bot** that connects to a **NEAR** smart contract, allowing users to run commands like `/mint`, `/tip`, `/stake`, and more. It also features:

1. **Meme Generation**: `/meme <prompt>` to create an AI-generated meme.
2. **NFT Minting** of Memes: The bot will ask if you want to mint your generated meme as an NFT.
3. **AI Blockchain Chatbot**: For any non-command text, it responds with a GPT-based or Hugging Face–based blockchain Q&A.

## Features

1. **NEAR Contract Commands**  
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

2. **Meme Generation**  
   - `/meme <prompt>`: Generate an AI-based meme image. The bot sends the image, then asks if you’d like to mint it as an NFT.

3. **NFT Minting**  
   - After generating a meme, the bot asks “Do you want to mint this meme as an NFT?”  
   - If you choose “Yes, mint NFT,” it calls `nft_mint` with the meme prompt as metadata.  
   - You can also manually call `/nft_mint <metadata>` to mint an NFT with any arbitrary metadata.

4. **AI Blockchain Chatbot**  
   - If the user sends a normal message (not starting with `"/"`), the bot calls `getBlockchainAnswer(text)` to respond with a blockchain-related answer.  
   - If the query isn’t blockchain-related, it politely declines.

## Prerequisites

1. **Node.js** (v14+ recommended).  
2. A **NEAR** testnet account with the **private key**.  
3. A deployed **smart contract** (the default is set in your `.env` as `NEAR_CONTRACT_NAME`).  
4. A **Telegram Bot** token from [BotFather](https://t.me/botfather).  
5. (Optional) An **OpenAI** or **Hugging Face** API key if you want advanced AI chat or meme generation.

## Installation

1. **Clone** the repo:
   ```bash
   git clone https://github.com/YourRepo/near-telegram-bot.git
   cd near-telegram-bot

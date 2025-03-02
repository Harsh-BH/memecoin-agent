# 🤖 NEAR Telegram Bot 🚀

A **Telegram Bot** that connects to a **NEAR** smart contract, allowing users to run commands like `/mint`, `/tip`, `/stake`, and more. 

Additionally, it features:

1️⃣ **Meme Generation**: `/meme <prompt>` to create an AI-generated meme.  
2️⃣ **NFT Minting** of Memes: The bot will ask if you want to mint your generated meme as an NFT.  
3️⃣ **AI Blockchain Chatbot**: For any non-command text, it responds with a **GPT-based** or **Hugging Face–based** blockchain Q&A.  
4️⃣ **Mini-Game Support**: Play a fun blockchain mini-game with `/startGame`, `/play`, and `/stopGame`.  

---

## 🌟 Features

### 🔗 1. NEAR Contract Commands
- `/mint <amount>`: 🏦 Mint tokens by attaching NEAR deposit.  
- `/balance <account>`: 💰 Check the token balance of `<account>`.  
- `/totalSupply`: 📊 Fetch total supply of tokens.  
- `/topTipper`: 🏆 Show the current top tipper.  
- `/tip <receiver> <amount>`: 🎁 Transfer tokens (tip) to `<receiver>`.  
- `/withdraw <amount>`: 💸 Withdraw tokens back to your NEAR wallet.  
- `/burn <amount>`: 🔥 Burn tokens from your balance.  
- `/stake <amount>`: 📈 Stake tokens.  
- `/unstake <amount>`: 📉 Unstake tokens.  
- `/claim_rewards`: 🎉 Claim staking rewards.  
- `/register_referral <referrer>`: 🔗 Register a referrer for your account.  
- `/propose <description>`: 🏛 (Admin) Create a new governance proposal.  
- `/vote <proposal_id> <true|false>`: ✅ Vote on a proposal.  
- `/finalize_proposal <proposal_id>`: ⚖️ Finalize a proposal.  
- `/setContract <contractId>`: 🔄 Dynamically switch to a different NEAR contract ID (optional enhancement).  

### 🎮 2. Mini-Game Features
- `/startGame`: 🎲 Start a blockchain-based mini-game.
- `/play`: 🎮 Play the game (consume a try).
- `/buyTries <yoctoAmount>`: 💰 Buy extra game tries using NEAR tokens.
- `/stopGame`: 🛑 Stop the current game session.

### 🎨 3. Meme Generation
- `/meme <prompt>`: 🎭 Generate an AI-based meme image. The bot sends the image, then asks if you’d like to mint it as an NFT.

### 🖼️ 4. NFT Minting
- After generating a meme, the bot asks **“Do you want to mint this meme as an NFT?”**  
- If you choose **“Yes, mint NFT,”** it calls `nft_mint` with the meme prompt as metadata.  
- You can also manually call `/nft_mint <metadata>` to mint an NFT with any arbitrary metadata.

### 🤖 5. AI Blockchain Chatbot
- If the user sends a normal message (not starting with `"/"`), the bot calls `getBlockchainAnswer(text)` to respond with a **blockchain-related** answer.  
- If the query isn’t blockchain-related, it politely declines.

  ## 📂 Backend Folder Structure
```
backend/
│── ai/
│   │── config/               # AI model configurations
│   │── src/                  # AI service source code
│   │── venv/                 # Virtual environment for AI service
│   │── .env                  # Environment variables for AI service
│   │── requirements.txt       # Python dependencies
│   │── pyproject.toml         # AI service project configuration
│
│── dist/                      # Compiled TypeScript files
│── node_modules/               # Project dependencies
│── src/
│   │── aiChat.ts              # AI chatbot logic
│   │── aiFeatures.ts          # AI-powered blockchain interactions
│   │── huggingFaceStableDiffusion.ts  # AI meme generation
│   │── miniGame.ts            # Blockchain mini-game logic
│   │── nearIntegration.ts     # NEAR smart contract integration
│   │── telegramBot.ts         # Main Telegram bot logic
│
│── .env                        # Backend environment variables
│── package.json                 # Project metadata & dependencies
│── package-lock.json             # Dependency lock file
│── tsconfig.json                 # TypeScript configuration
│── TelegramBot.md                # Documentation for Telegram bot
```

---

## 📌 Prerequisites

1️⃣ **Node.js** (v14+ recommended).  
2️⃣ A **NEAR** testnet account with the **private key**.  
3️⃣ A deployed **smart contract** (the default is set in your `.env` as `NEAR_CONTRACT_NAME`).  
4️⃣ A **Telegram Bot** token from [BotFather](https://t.me/botfather).  
5️⃣ (Optional) An **OpenAI** or **Hugging Face** API key for AI chat or meme generation.

---

## 🔧 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Harsh-BH/memecoin-agent.git
cd backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file within backend folder:

```ini
TELEGRAM_BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
NEAR_ACCOUNT_ID="XYZ.testnet"
NEAR_ACCOUNT_PRIVATE_KEY=
NEAR_CONTRACT_NAME=harsh21112005.testnet
HF_API_TOKEN = "Hugging face token"
PORT=3000 
OPENAI_API_KEY = "Openai api token"
```

Create a `.env` file within ai folder:
```ini
DEBUG=False
# Path to the config file for the model, agent etc
GENERAL_CONFIG_PATH=config/general.yaml
# -- APIS --
OPENAI_API_KEY="Openai Api token"

# Near
NEAR_ACCOUNT_ID="XYZ.testnet"
NEAR_ACCOUNT_PRIVATE_KEY=
NEAR_RPC_URL="https://rpc.testnet.pagoda.co"

```

### 4️⃣ Run the Bot
```bash
cd backend
npx tsc
node dist/telegramBot.js
```
Or directly:
```bash
cd backend
ts-node src/telegramBot.ts
```

---

## 🚀 Usage

### 🎯 Telegram Bot
Start a chat with the bot on Telegram and use commands:
```bash
/mint 10000000000000000  # Mint 0.01 NEAR tokens
/balance myaccount.testnet  # Check balance
/meme cat in a spacesuit  # Generate a meme
/startGame  # Start the mini-game
```

📩 **The bot sends you the meme image and asks if you want to mint it as an NFT.**  
If you say **“Yes,”** it calls `nft_mint` with that meme’s prompt as metadata.  
If you type a normal text message like **“What is blockchain consensus?”**, the bot calls the AI Q&A function.

---

## 💬 Example Chat Flow

```vbnet
User: /balance myaccount.testnet
Bot: 💰 The token balance for myaccount.testnet is: 12345678

User: /meme doge coin moon
Bot: [Sends an AI-generated meme image]
Bot: Do you want to mint this meme as an NFT?
[Inline keyboard: Yes, mint NFT | No, thanks]

User taps "Yes, mint NFT"
Bot: 🎉 NFT minted for your meme!

User: /startGame
Bot: 🎲 Mini-game started! You have 3 tries.
User: /play
Bot: 🎮 You rolled a 7! Keep going!
User: /stopGame
Bot: 🛑 Game session ended.
```

---

## 📜 Code Overview

### 🏗️ `telegramBot.ts`
- **Main entry.** Initializes Telegram Bot + NEAR connection.
- `initNear()` sets up NEAR, accounts, and default contract.
- **Mini-Game Integration:** Uses `/startGame`, `/play`, and `/stopGame` commands.
- **Commands:** Handles multiple NEAR interactions like minting, tipping, and NFT minting.
- **AI Chat:** Calls AI chatbot for blockchain-related queries.

### 🎨 `huggingFaceStableDiffusion.ts`
- Contains code to generate an image from a text prompt.
- Uses Hugging Face’s stable diffusion endpoint or OpenAI DALL·E.

### 🤖 `aiChat.ts`
- Contains `getBlockchainAnswer(query)`.  
- If the query has no blockchain keywords, it returns **“Please ask about blockchain.”**  
- Otherwise, calls GPT or Hugging Face for a response.

---

## 🤝 Collaboration
For collaboration guidelines, refer to [COLLABORATION.md](./COLLABORATION.md).

---

## 📜 License
MIT

---

## 🛠️ Contributing
Feel free to open **issues** or **PRs** for bug fixes, improvements, or new features.

🌟 **Enjoy building with NEAR Telegram Bot!** 🚀

# 🎯 Memecoin-Agent Testing Instructions

This document outlines the **testing procedures** for the **Memecoin-Agent** Telegram bot and web dashboard built on the **NEAR Blockchain**.

---

## 📌 **Prerequisites**

Before running tests, ensure the following are set up:

✅ A **NEAR testnet account** & deployed smart contract  
✅ **Telegram Bot** created via [BotFather](https://t.me/botfather)  
✅ `.env` files properly configured  
✅ **Backend & frontend installed** with dependencies  

---

## 🛠️ **Testing the Telegram Bot**

### **1️⃣ Start the Telegram Bot**

Start the bot manually using:
```bash
cd backend
npx ts-node src/telegramBot.ts
```

Or compile and run:
```bash
cd backend
npx tsc
node dist/telegramBot.js
```

---

### **2️⃣ Basic Functionality Tests**

#### ✅ **Test Minting Tokens**
**Command:**  
```bash
/mint 10000000000000000
```
✅ **Expected Result:**  
- Bot confirms minting 0.01 NEAR tokens.  
- Check blockchain explorer for transaction confirmation.

#### ✅ **Test Balance Retrieval**
**Command:**  
```bash
/balance myaccount.testnet
```
✅ **Expected Result:**  
- Bot returns the NEAR token balance of the specified account.

#### ✅ **Test Transaction History**
**Command:**  
```bash
/activity myaccount.testnet
```
✅ **Expected Result:**  
- Bot returns recent transactions for the specified account.

#### ✅ **Test Token Transfers (Tipping)**
**Command:**  
```bash
/tip receiver.testnet 5000
```
✅ **Expected Result:**  
- Bot confirms successful transfer of tokens.  
- The receiver’s balance updates.

#### ✅ **Test Staking & Unstaking**
**Commands:**  
```bash
/stake 10000
/unstake 10000
```
✅ **Expected Result:**  
- Bot confirms staking and unstaking operations.  
- Check the smart contract state to verify.

#### ✅ **Test Claiming Staking Rewards**
**Command:**  
```bash
/claim_rewards
```
✅ **Expected Result:**  
- Bot confirms successful claim of rewards.  
- Rewards should reflect in the account balance.

---

### **3️⃣ AI Chatbot Tests**

#### ✅ **Test AI Blockchain Queries**
**Example Query:**  
```bash
What is NEAR protocol?
```
✅ **Expected Result:**  
- Bot responds with a relevant AI-generated answer.

#### ✅ **Test Meme Generation**
**Command:**  
```bash
/meme doge rocket moon
```
✅ **Expected Result:**  
- Bot generates a meme and sends an image.  
- Bot asks **"Do you want to mint this as an NFT?"**  
- Clicking **"Yes, mint NFT"** should trigger an NFT mint transaction.

#### ✅ **Test AI Response for Non-Blockchain Queries**
**Example Query:**  
```bash
Tell me a joke.
```
✅ **Expected Result:**  
- Bot should say **“Please ask a blockchain-related question.”**

---

### **4️⃣ Mini-Game Testing**

#### ✅ **Test Game Start**
**Command:**  
```bash
/startGame
```
✅ **Expected Result:**  
- Bot starts the game and assigns tries.

#### ✅ **Test Playing the Game**
**Command:**  
```bash
/play
```
✅ **Expected Result:**  
- Bot generates a random game result.

#### ✅ **Test Buying Extra Game Tries**
**Command:**  
```bash
/buyTries 1000000000000000000
```
✅ **Expected Result:**  
- Bot confirms that extra tries have been purchased.

#### ✅ **Test Stopping the Game**
**Command:**  
```bash
/stopGame
```
✅ **Expected Result:**  
- Bot ends the current game session.

---

## 🖥️ **Testing the Web Dashboard**

### **1️⃣ Start the Frontend**

Run the web application:
```bash
cd client
npm run dev
```
✅ **Expected Result:**  
- The web interface is accessible at `http://localhost:3000/`

---

### **2️⃣ Web Dashboard Testing**

#### ✅ **Test Login with NEAR Wallet**
- Open the frontend in a browser.
- Click **"Connect Wallet"** and log in with NEAR Testnet.

✅ **Expected Result:**  
- User should be authenticated successfully.

#### ✅ **Test Balance & Transaction History Display**
- Navigate to the dashboard.
- Check balance and transaction history.

✅ **Expected Result:**  
- Displays real-time balance and transaction logs.

#### ✅ **Test AI Chatbot on Web**
- Open chatbot and ask:
```bash
How do I stake NEAR tokens?
```
✅ **Expected Result:**  
- AI should return an answer based on blockchain data.

---

## 🔍 **Testing Edge Cases**

### **1️⃣ Invalid Commands**
```bash
/mint abc
/balance
/tip user 10abc
```
✅ **Expected Result:**  
- Bot should return an error message.

### **2️⃣ Invalid Transactions**
```bash
/tip nonexistinguser.testnet 1000
```
✅ **Expected Result:**  
- Bot should return an error stating the user doesn’t exist.

---

## ✅ **Final Validation**

- ✅ Telegram Bot responds correctly to all commands.
- ✅ Web Dashboard displays real-time blockchain data.
- ✅ AI Chatbot answers blockchain-related queries accurately.
- ✅ Mini-Game executes transactions as expected.
- ✅ Errors are handled gracefully.

---

### 🚀 **Test Passed?**
If everything works as expected, 🎉 **Congratulations! Your Memecoin-Agent is fully functional.** 🎉


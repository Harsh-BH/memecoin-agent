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
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerMintOrTransfer = void 0;
// nearIntegration.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const nearAPI = __importStar(require("near-api-js"));
const { connect, keyStores, Contract, KeyPair } = nearAPI;
/**
 * Initializes a connection to the NEAR testnet.
 */
async function initNear() {
    const keyStore = new keyStores.InMemoryKeyStore();
    // Import your private key (for production, consider a more secure key store)
    const keyPair = KeyPair.fromString(process.env.NEAR_PRIVATE_KEY);
    await keyStore.setKey('testnet', process.env.NEAR_ACCOUNT_ID, keyPair);
    const config = {
        networkId: 'testnet',
        keyStore,
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
    };
    const near = await connect(config);
    return near;
}
/**
 * Triggers a mint or transfer operation on the NEAR blockchain.
 * For demonstration purposes, this function chooses an operation based on the caption content.
 * @param caption - The generated meme caption.
 */
async function triggerMintOrTransfer(caption) {
    const near = await initNear();
    const account = await near.account(process.env.NEAR_ACCOUNT_ID);
    // Initialize your contract instance
    const contract = new Contract(account, process.env.NEAR_CONTRACT_NAME, {
        viewMethods: [],
        changeMethods: ['mint', 'transfer'], // Methods that modify state
    });
    try {
        if (caption.toLowerCase().includes('mint')) {
            console.log('Triggering mint operation...');
            // @ts-ignore: The contract methods are dynamically provided
            const result = await contract.mint({ caption });
            console.log('Mint result:', result);
        }
        else {
            console.log('Triggering transfer operation...');
            // @ts-ignore: The contract methods are dynamically provided
            const result = await contract.transfer({ caption });
            console.log('Transfer result:', result);
        }
    }
    catch (error) {
        console.error('Error in NEAR operation:', error);
    }
}
exports.triggerMintOrTransfer = triggerMintOrTransfer;

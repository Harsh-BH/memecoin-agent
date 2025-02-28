"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractBalance = exports.initNear = void 0;
const near_api_js_1 = require("near-api-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let near = null;
async function initNear() {
    const config = {
        networkId: 'testnet',
        keyStore: new near_api_js_1.keyStores.InMemoryKeyStore(),
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org'
    };
    near = await (0, near_api_js_1.connect)(config);
    return near;
}
exports.initNear = initNear;
async function getContractBalance(accountId) {
    if (!near) {
        await initNear();
    }
    if (!near) {
        throw new Error('NEAR is not initialized');
    }
    const account = await near.account(accountId);
    const contractName = process.env.CONTRACT_NAME;
    if (!contractName) {
        throw new Error('CONTRACT_NAME is not set in environment variables');
    }
    // Create a contract instance with the view method 'get_balance'.
    const contract = new near_api_js_1.Contract(account, contractName, {
        viewMethods: ['get_balance'],
        changeMethods: []
    });
    // @ts-ignore: We assume the contract has a get_balance view method.
    const balance = await contract.get_balance({ account_id: accountId });
    return balance;
}
exports.getContractBalance = getContractBalance;

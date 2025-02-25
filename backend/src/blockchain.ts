import { connect, keyStores, Contract, Near } from 'near-api-js';
import dotenv from 'dotenv';

dotenv.config();

let near: Near | null = null;

export async function initNear(): Promise<Near> {
  const config = {
    networkId: 'testnet',
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org'
  };

  near = await connect(config);
  return near;
}

export async function getContractBalance(accountId: string): Promise<number> {
  if (!near) {
    await initNear();
  }
  
  if (!near) {
    throw new Error('NEAR is not initialized');
  }

  const account = await near!.account(accountId);
  const contractName = process.env.CONTRACT_NAME;
  if (!contractName) {
    throw new Error('CONTRACT_NAME is not set in environment variables');
  }
  
  // Create a contract instance with the view method 'get_balance'.
  const contract = new Contract(account, contractName, {
    viewMethods: ['get_balance'],
    changeMethods: []
  });
  
  // @ts-ignore: We assume the contract has a get_balance view method.
  const balance: number = await contract.get_balance({ account_id: accountId });
  return balance;
}

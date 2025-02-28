// nearIntegration.ts
import * as dotenv from 'dotenv';
dotenv.config();

import * as nearAPI from 'near-api-js';

const { connect, keyStores, Contract, KeyPair } = nearAPI;

/**
 * Initializes a connection to the NEAR testnet.
 */
async function initNear() {
  const keyStore = new keyStores.InMemoryKeyStore();
  // Import your private key (for production, consider a more secure key store)
  const keyPair = KeyPair.fromString(process.env.NEAR_PRIVATE_KEY!);
  await keyStore.setKey('testnet', process.env.NEAR_ACCOUNT_ID!, keyPair);

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
export async function triggerMintOrTransfer(caption: string): Promise<void> {
  const near = await initNear();
  const account = await near.account(process.env.NEAR_ACCOUNT_ID!);

  // Initialize your contract instance
  const contract = new Contract(account, process.env.NEAR_CONTRACT_NAME!, {
    viewMethods: [], // Add any view methods if necessary
    changeMethods: ['mint', 'transfer'], // Methods that modify state
  });

  try {
    if (caption.toLowerCase().includes('mint')) {
      console.log('Triggering mint operation...');
      // @ts-ignore: The contract methods are dynamically provided
      const result = await contract.mint({ caption });
      console.log('Mint result:', result);
    } else {
      console.log('Triggering transfer operation...');
      // @ts-ignore: The contract methods are dynamically provided
      const result = await contract.transfer({ caption });
      console.log('Transfer result:', result);
    }
  } catch (error) {
    console.error('Error in NEAR operation:', error);
  }
}

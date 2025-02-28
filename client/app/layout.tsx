"use client"
import './globals.css';

import { ReactNode } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import ContextProvider from './providers';
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { NetworkId } from './config'
import '@near-wallet-selector/modal-ui/styles.css';
const walletSelectorConfig = {
  network: {
    networkId: NetworkId, // Ensure NetworkId is a valid string like "testnet" or "mainnet"
    nodeUrl: "https://rpc.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    indexerUrl: "https://indexer.testnet.near.org",
  },
  modules: [
    setupBitteWallet(),
    setupMeteorWallet(),
    setupLedger(),
    setupNightly(),
   setupMeteorWallet(), setupBitteWallet()
  ],
}





export default  function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en">
      <body className=" min-h-screen w-full">
      <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
       
       <WalletSelectorProvider config={walletSelectorConfig}>{children} </WalletSelectorProvider>
        
        
      </body>
    </html>
  );
}

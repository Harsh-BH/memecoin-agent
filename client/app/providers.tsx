'use client';

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { createWagmiAdapter } from '@reown/appkit-adapter-wagmi';

import { createConfig, http } from 'wagmi';
import { walletConnect, injected } from 'wagmi/connectors';

// ----------------------------------
// 1) YOUR OLD NEAR CHAIN LOGIC
// ----------------------------------
import { EVMWalletChain, NetworkId } from '../config/near';

// Setup a custom chain object for NEAR-on-EVM
const nearChain = {
  id: EVMWalletChain.chainId,
  name: EVMWalletChain.name,
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: [EVMWalletChain.rpc] },
    public: { http: [EVMWalletChain.rpc] },
  },
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: EVMWalletChain.explorer,
    },
  },
  testnet: NetworkId === 'testnet',
};

// ----------------------------------
// 2) CREATE WAGMI CONFIG
// ----------------------------------
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Example Wagmi config with NEAR + injected + WalletConnect
const wagmiConfig = createConfig({
  // Wagmi 1.x or 2.x typically supports autoConnect
  autoConnect: true,
  // If you have multiple chains, pass them in an array. Example: [nearChain, mainnetChain, etc...]
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
  // “publicClient” or “transport” for the chosen chain
  publicClient: http({ chain: nearChain }),
});



// ----------------------------------
// 3) CREATE WAGMI ADAPTER
// ----------------------------------
/**
 * The createWagmiAdapter function takes your wagmiConfig and the chains you want
 * to support. You can also specify mainnet, arbitrum, etc. from @reown/appkit/networks
 * if you want them included.
 */
const wagmiAdapter = createWagmiAdapter({
  config: wagmiConfig,
  // If you want to support nearChain + additional chains like mainnet or arbitrum, list them here:
  chains: [nearChain, mainnet, arbitrum],
});

// ----------------------------------
// 4) CREATE APPKIT MODAL
// ----------------------------------
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://appkitexampleapp.com', // origin must match your domain/subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export const appKitModal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  /**
   * If you want to pass a custom array of networks, you can
   * also do networks: [nearChain, mainnet, arbitrum], etc.
   * Otherwise, you can rely on wagmiAdapter’s built-in chain logic.
   */
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet, // or nearChain if you'd like NEAR as default
  metadata,
  features: {
    analytics: true, // optional, depends on your cloud config
  },
});

// ----------------------------------
// 5) CONTEXT PROVIDER
// Wrap everything in Wagmi + React Query
// ----------------------------------
const queryClient = new QueryClient();

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  // Convert cookie to initial wagmi state (for SSR / prefetch if needed)
  const initialState = cookieToInitialState(wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;

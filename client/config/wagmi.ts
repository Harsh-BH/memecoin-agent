import { injected,walletConnect } from 'wagmi';
import { createConfig,http, reconnect } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi';

import { EVMWalletChain,NetworkId } from '../config/near';

// Config
const near = {
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

// Get your projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [near],
  transports: { [near.id]: http() },
  connectors: [walletConnect({ projectId, showQrModal: false }), injected({ shimDisconnect: true })],
});


reconnect(wagmiConfig);

// Modal for login
export const web3Modal = createWeb3Modal({ wagmiConfig, projectId });
// useNearAnalytics.ts
import { useEffect, useState } from "react";
import { connect, Contract, keyStores } from "near-api-js";

const nearConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
};

// Replace with your deployed contract ID
const CONTRACT_ID = "your-contract.testnet";

// Optionally, specify which account you want to query (for demo purposes)
const VIEWER_ACCOUNT = "harsh21112005.testnet";

export function useNearAnalytics() {
  const [balance, setBalance] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [topTipper, setTopTipper] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const near = await connect(nearConfig);
        // We use a viewer account (does not require signing for view methods)
        const account = await near.account(VIEWER_ACCOUNT);

        // Instantiate the contract with view methods only.
        const contract = new Contract(
          account,
          CONTRACT_ID,
          {
            viewMethods: ["get_balance", "get_total_supply", "get_top_tipper"],
            changeMethods: [],
          }
        ) as any;

        // Call view methods from the smart contract.
        const total = await contract.get_total_supply();
        setTotalSupply(Number(total));

        const bal = await contract.get_balance(VIEWER_ACCOUNT);
        setBalance(Number(bal));

        const top = await contract.get_top_tipper();
        setTopTipper(top);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    }

    fetchData();
  }, []);

  return { balance, totalSupply, topTipper };
}

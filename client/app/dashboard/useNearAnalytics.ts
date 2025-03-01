import { useEffect, useState } from "react";
import { connect, Contract, keyStores } from "near-api-js";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

const nearConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
};

// Replace with your deployed contract ID
const CONTRACT_ID = "harsh21112005.testnet";

export function useNearAnalyticsFromAccount(initialAccount: string = "") {
  const [account, setAccount] = useState<string>(initialAccount);
  const [balance, setBalance] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [topTipper, setTopTipper] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Detect connected wallet account using Wallet Selector if no manual account is provided.
  useEffect(() => {
    async function initWalletSelector() {
      try {
        const selector = await setupWalletSelector({
          network: "testnet",
          modules: [setupMyNearWallet()],
        });
        const wallet = await selector.wallet("my-near-wallet");
        const accounts = await wallet.getAccounts();
        // If an account is connected, update state.
        if (accounts.length > 0) {
          setAccount(accounts[0].accountId);
        }
      } catch (err) {
        console.error("Error initializing wallet selector:", err);
        setError("Error detecting connected wallet account");
      }
    }
    // Only initialize if no account is provided.
    if (!account) {
      initWalletSelector();
    }
  }, [account]);

  // Once we have a valid account, fetch analytics from the contract.
  useEffect(() => {
    if (!account || !account.includes(".testnet")) return;
    async function fetchData() {
      try {
        const near = await connect(nearConfig);
        const nearAccount = await near.account(account);

        // Instantiate the contract with view methods.
        const contract = new Contract(
          nearAccount,
          CONTRACT_ID,
          {
            viewMethods: ["get_balance", "get_total_supply", "get_top_tipper"],
            changeMethods: [],
          }
        ) as any;

        // Call get_total_supply (no parameters required).
        const total = await contract.get_total_supply();
        setTotalSupply(Number(total));

        // Call get_balance with the account wrapped in an object.
        const bal = await contract.get_balance({ account });
        setBalance(Number(bal));

        // Call get_top_tipper (no parameters required).
        const top = await contract.get_top_tipper();
        setTopTipper(top);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Error fetching analytics data");
      }
    }

    fetchData();
  }, [account]);

  return { account, balance, totalSupply, topTipper, error };
}

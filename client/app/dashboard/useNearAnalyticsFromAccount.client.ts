"use client";
import { useEffect, useState } from "react";
import {  ConnectConfig } from "near-api-js";


/** We'll define an interface for the methods we need. */
interface MyContract {
  get_balance(args: { account: string }): Promise<string>;
  get_total_supply(): Promise<string>;
  get_top_tipper(): Promise<string | null>;
}

// interface NearConfig {
//   networkId: string;
//   nodeUrl: string;
//   walletUrl: string;
//   helperUrl: string;
//   // etc. You can define the rest if needed
// }

export function useNearAnalyticsFromAccount(initialAccount: string = "") {
  const [account, setAccount] = useState<string>(initialAccount);
  const [balance, setBalance] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [topTipper, setTopTipper] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function initWalletSelector() {
      try {
        if (!account) {
          // If no manual account, detect from wallet
          // Dynamically import wallet selector
          const { setupWalletSelector } = await import("@near-wallet-selector/core");
          const { setupMyNearWallet } = await import("@near-wallet-selector/my-near-wallet");

          const selector = await setupWalletSelector({
            network: "testnet",
            modules: [setupMyNearWallet()],
          });
          const wallet = await selector.wallet("my-near-wallet");
          const accounts = await wallet.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].accountId);
          }
        }
      } catch (err) {
        console.error("Error initializing wallet selector:", err);
        setError("Error detecting connected wallet account");
      }
    }
    initWalletSelector();
  }, [account]);

  // Once we have a valid account, fetch analytics from the contract
  useEffect(() => {
    async function fetchData() {
      if (!account || !account.endsWith(".testnet")) return;

      try {
        // Dynamically import near-api-js so SSR never sees it
        const nearApi = await import("near-api-js");
        const { connect, Contract, keyStores } = nearApi;

        const nearConfig: ConnectConfig = {
          networkId: "testnet",
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
          keyStore: new keyStores.BrowserLocalStorageKeyStore(), // <--- now valid
        };

        const near = await connect(nearConfig);
        const nearAccount = await near.account(account);

        // Create contract dynamically
        const contract = new Contract(nearAccount, "harsh21112005.testnet", {
          viewMethods: ["get_balance", "get_total_supply", "get_top_tipper"],
          changeMethods: [],
          useLocalViewExecution: false,
        }) as unknown as MyContract;

        const total = await contract.get_total_supply();
        setTotalSupply(Number(total));

        const bal = await contract.get_balance({ account });
        console.log(bal)
        setBalance(Number(bal));

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

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNearAnalyticsFromAccount } from "./useNearAnalyticsFromAccount.client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// 1) near-api-js for fetching native NEAR
import { connect, keyStores } from "near-api-js";

/** Utility: convert yoctoNEAR -> NEAR */
function formatYoctoToNear(yoctoValue: string | number, fractionDigits = 5): string {
  if (!yoctoValue) return "0";
  const val = typeof yoctoValue === "number" ? yoctoValue : parseFloat(yoctoValue);
  const nearVal = val / 1e24;
  return nearVal.toFixed(fractionDigits);
}

/** Utility: get a date string (YYYY-MM-DD) from a NEAR block timestamp (ns) */
function getDateStringFromNs(blockTimestampNs: string | number): string {
  const ns = typeof blockTimestampNs === "number" ? blockTimestampNs : parseFloat(blockTimestampNs);
  const dateObj = new Date(ns / 1_000_000); // convert nanoseconds to ms
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Contract ID
const CONTRACT_ID = "harsh21112005.testnet";

// For activity feed items
interface ActivityItem {
  fullData: unknown;
  id: string | number;
  type: string;
  description: string;
  date: string;
}

// For minted chart data
interface MintChartData {
  day: string;
  minted: number;
}

// NEARBlocks transaction shape is not fully typed here
type NearBlocksTransaction = unknown;

// Helper to fetch the user’s native NEAR from RPC
async function fetchNativeNearBalance(accountId: string): Promise<string> {
  const near = await connect({
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  });
  const userAccount = await near.account(accountId);
  const state = await userAccount.state();
  // state.amount is yoctoNEAR
  return state.amount;
}

export default function MemeCoinDashboard() {
  // 1) Rely on the connected wallet from the hook, no manual account
  const { account, balance, totalSupply, topTipper, error } = useNearAnalyticsFromAccount();

  // 2) Store user’s native NEAR
  const [nativeNear, setNativeNear] = useState("0");

  // 3) Activity feed
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  // 4) Chart data for minted amounts
  const [mintChartData, setMintChartData] = useState<MintChartData[]>([]);
  // 5) Selected transaction for popup
  const [selectedTx, setSelectedTx] = useState<NearBlocksTransaction | null>(null);

  // 6) Pagination: NEARBlocks `cursor`
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 7) Dynamically import wallet selector only client-side
  async function getWallet() {
    if (typeof window === "undefined") return null;
    const { setupWalletSelector } = await import("@near-wallet-selector/core");
    const { setupMyNearWallet } = await import("@near-wallet-selector/my-near-wallet");

    const selector = await setupWalletSelector({
      network: "testnet",
      modules: [setupMyNearWallet()],
    });
    return await selector.wallet("my-near-wallet");
  }

  // 8) Example: Mint
  const handleMint = async () => {
    try {
      const wallet = await getWallet();
      if (!wallet) {
        alert("Wallet not available on server. Please try again in the browser.");
        return;
      }
      await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "mint",
              args: {},
              gas: "300000000000000",
              deposit: "10000000000000000", // 0.01 NEAR
            },
          },
        ],
      });
      alert("Mint Successful!");
    } catch (err) {
      console.error("Error minting tokens:", err);
      alert("Error minting tokens.");
    }
  };

  // 9) Example: Transfer
  const handleTransfer = async () => {
    try {
      const wallet = await getWallet();
      if (!wallet) {
        alert("Wallet not available on server. Please try again in the browser.");
        return;
      }
      await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "tip",
              args: {
                receiver: "receiver.testnet",
                amount: "10000000000000000",
              },
              gas: "300000000000000",
              deposit: "0",
            },
          },
        ],
      });
      alert("Transfer (Tip) Successful!");
    } catch (err) {
      console.error("Error transferring tokens:", err);
      alert("Error transferring tokens.");
    }
  };

  // 10) Fetch user’s native NEAR if `account` is detected
  useEffect(() => {
    async function loadNativeNear() {
      if (account) {
        try {
          const yoctoBalance = await fetchNativeNearBalance(account);
          setNativeNear(yoctoBalance);
        } catch (err) {
          console.error("Failed to fetch native NEAR balance:", err);
        }
      }
    }
    loadNativeNear();
  }, [account]);

  // 11) Helper to fetch transactions from NEARBlocks (with optional `cursor`)
  async function fetchTransactions(cursorParam?: string, isLoadMore = false) {
    if (!account) return;
    try {
      let url = `https://api-testnet.nearblocks.io/v1/account/${account}/txns`;
      if (cursorParam) {
        url += `?cursor=${cursorParam}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching txns: ${response.status}`);
      }
      const data = await response.json();
      const rawTxs = data.txns || [];

      // Next cursor if any
      const nextCursor = data.cursor || null;
      setCursor(nextCursor);

      // If not appending, we re-build minted chart data
      const mintedByDay: Record<string, number> = isLoadMore ? {} : {};

      const newFeed: ActivityItem[] = [];
      for (const tx of rawTxs) {
        const action = tx.actions?.[0];
        const actionType = action?.action || "UNKNOWN";
        const rawDeposit = action?.deposit || "0";
        const depositNear = parseFloat(formatYoctoToNear(rawDeposit, 5));

        const blockTimeNs = tx.receipt_block?.block_timestamp;
        const dateString = blockTimeNs ? getDateStringFromNs(blockTimeNs) : "N/A";

        let desc = `Action: ${actionType}, deposit: ${depositNear} NEAR`;
        if (action?.method) {
          desc += `, method: ${action.method}`;
        }

        newFeed.push({
          fullData: tx,
          id: tx.id,
          type: actionType,
          description: desc,
          date: blockTimeNs
            ? new Date(blockTimeNs / 1_000_000).toLocaleString()
            : "N/A",
        });

        // If initial load, build minted chart
        if (!isLoadMore) {
          if (actionType === "FUNCTION_CALL" && action?.method === "mint") {
            mintedByDay[dateString] = (mintedByDay[dateString] || 0) + depositNear;
          }
        }
      }

      if (isLoadMore) {
        // append
        setActivityFeed((prev) => [...prev, ...newFeed]);
      } else {
        // first load
        setActivityFeed(newFeed);

        // minted chart
        const mintedData = Object.keys(mintedByDay).map((day) => ({
          day,
          minted: Number(mintedByDay[day].toFixed(2)),
        }));
        mintedData.sort((a, b) => (a.day > b.day ? 1 : -1));
        setMintChartData(mintedData);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  // 12) On initial load or when `account` changes, fetch the first page
  useEffect(() => {
    if (account) {
      setActivityFeed([]);
      setMintChartData([]);
      setCursor(null);
      fetchTransactions(undefined, false);
    }
  }, [account]);

  // 13) “Load More” function
  const handleLoadMore = () => {
    if (!cursor) return;
    setIsLoadingMore(true);
    fetchTransactions(cursor, true);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#1E1E2F] via-[#2D2F4C] to-[#1E1E2F] text-white">
      <Navbar />

      {/* Animated BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.svg
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px]"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          viewBox="0 0 400 400"
          fill="none"
        >
          <defs>
            <radialGradient id="myGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6B21A8" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="180" fill="url(#myGradient)" fillOpacity="0.2" />
        </motion.svg>
      </div>

      <main className="relative z-10 p-2 max-w-7xl mx-auto space-y-8">
        {/* Row: Left Card (Balances) + Right Card (Minted Chart) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-28">
          {/* Left Card: Both Contract Token + Native NEAR */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CardTitle className="text-purple-300">Your Balances</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                {/* Contract Token Balance */}
                <motion.p
                  className="text-2xl font-extrabold text-purple-200 mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Contract Token:{" "}
                  {balance !== null
                    ? `${formatYoctoToNear(balance)} Tokens`
                    : "Loading..."}
                </motion.p>

                {/* Native NEAR Balance */}
                <motion.p
                  className="text-2xl font-extrabold text-orange-200 mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Native NEAR: {formatYoctoToNear(nativeNear)} NEAR
                </motion.p>

                {/* Buttons */}
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700 transform transition-transform hover:scale-105"
                    onClick={handleMint}
                  >
                    Mint Tokens
                  </Button>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 transform transition-transform hover:scale-105"
                    onClick={handleTransfer}
                  >
                    Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Card: Minted Chart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CardTitle className="text-pink-400">Minted Amount by Day</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  viewport={{ once: true }}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={mintChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4e4e4e" />
                      <XAxis
                        dataKey="day"
                        stroke="#ffb3fa"
                        tick={{ fill: "#ffb3fa", fontSize: 14, fontFamily: "Orbitron, sans-serif" }}
                        axisLine={{ stroke: "#ffb3fa" }}
                        tickLine={{ stroke: "#ffb3fa" }}
                      />
                      <YAxis
                        stroke="#ffb3fa"
                        tick={{ fill: "#ffb3fa", fontSize: 14, fontFamily: "Orbitron, sans-serif" }}
                        axisLine={{ stroke: "#ffb3fa" }}
                        tickLine={{ stroke: "#ffb3fa" }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#222", border: "none" }}
                        labelStyle={{ color: "#ffb3fa" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend wrapperStyle={{ color: "#ffb3fa" }} />
                      <Line
                        type="monotone"
                        dataKey="minted"
                        stroke="#c084fc"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        isAnimationActive={true}
                        animationBegin={100}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Total Supply */}
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-300">Total Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-300">
                {totalSupply !== null
                  ? `${formatYoctoToNear(totalSupply)} Tokens`
                  : "Loading..."}
              </p>
            </CardContent>
          </Card>

          {/* Top Tipper */}
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-300">Top Tipper</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-300">
                {topTipper || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-300">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityFeed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group hover:cursor-pointer"
                  onClick={() => setSelectedTx(item.fullData)}
                >
                  <p className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-500 to-purple-300 transition-all duration-300 ease-in-out group-hover:scale-105">
                    {item.type}
                    <span className="text-xs ml-2 align-middle text-gray-400 transition-colors duration-300 group-hover:text-gray-200">
                      {item.date}
                    </span>
                  </p>
                  <motion.p
                    className="mt-1 text-gray-300 transition-colors duration-300 group-hover:text-gray-100"
                    initial={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.description}
                  </motion.p>
                  <Separator className="my-2 bg-purple-600/40 transition-colors duration-300 group-hover:bg-purple-500" />
                </motion.div>
              ))}

              {/* Pagination / Load More */}
              {cursor && (
                <div className="text-center mt-6">
                  <Button
                    variant="default"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-purple-700 hover:bg-purple-800"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Display any errors */}
        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}
      </main>

      {/* Popup modal to show full transaction if clicked */}
      <AnimatePresence>
        {selectedTx !== null && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedTx(null)}
            />
            {/* Modal */}
            <motion.div
              className="relative bg-gray-800 text-white rounded-lg shadow-lg p-6 w-[600px] max-h-[80vh] overflow-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-400 text-xl"
                onClick={() => setSelectedTx(null)}
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
              <pre className="text-sm whitespace-pre-wrap break-all">
                {JSON.stringify(selectedTx, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

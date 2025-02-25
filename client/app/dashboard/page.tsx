"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";

// ------------------ Dummy Data ------------------
const chartData = [
  { name: "Mon", amount: 40 },
  { name: "Tue", amount: 60 },
  { name: "Wed", amount: 75 },
  { name: "Thu", amount: 90 },
  { name: "Fri", amount: 120 },
  { name: "Sat", amount: 100 },
  { name: "Sun", amount: 140 },
];

const activityFeed = [
  {
    id: 1,
    type: "Mint",
    description: "Minted 100 MemeCoins",
    date: "2025-02-21 10:15",
  },
  {
    id: 2,
    type: "Transfer",
    description: "Transferred 50 MemeCoins to user.testnet",
    date: "2025-02-22 14:03",
  },
  {
    id: 3,
    type: "Social",
    description: 'AI-generated meme caption: "Send Memes, Not Drama"',
    date: "2025-02-23 09:45",
  },
];



// ------------------ Main Dashboard Page ------------------
export default function MemeCoinDashboard() {
  const [balance, setBalance] = useState(12345);

  // Placeholder actions
  const handleMint = () => alert("Mint operation triggered!");
  const handleTransfer = () => alert("Transfer operation triggered!");

  return (
    <div className="relative min-h-screen w-full font-sans bg-gradient-to-br from-[#1E1E2F] via-[#2D2F4C] to-[#1E1E2F] text-white">
      {/* Navbar */}
      <Navbar />

      {/* Animated Background SVG (just for flair) */}
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

      {/* Content Wrapper */}
      <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 ">
        

        {/* Top row: Balance + Graph */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Display */}
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-300">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-200 mb-4">
                {balance} MemeCoins
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleMint}
                >
                  Mint Tokens
                </Button>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleTransfer}
                >
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-300">Token History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" />
                  <XAxis dataKey="name" stroke="#bbb" />
                  <YAxis stroke="#bbb" />
                  <Tooltip contentStyle={{ backgroundColor: "#222", border: "none" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#c084fc"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-300">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((item) => (
              <div key={item.id}>
                <p className="font-bold">
                  {item.type}{" "}
                  <span className="text-xs text-gray-400 ml-2">{item.date}</span>
                </p>
                <p className="text-gray-300">{item.description}</p>
                <Separator className="my-2 bg-purple-600/40" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

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
import { useNearAnalytics } from "./useNearAnalytics"; 

// ------------------ Dummy Data for Chart & Feed ------------------
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
  // Get live analytics from NEAR via our hook.
  const { balance, totalSupply, topTipper } = useNearAnalytics();

  // Placeholder actions for mint/transfer buttons
  const handleMint = () => alert("Mint operation triggered!");
  const handleTransfer = () => alert("Transfer operation triggered!");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#1E1E2F] via-[#2D2F4C] to-[#1E1E2F] text-white">
      {/* Navbar */}
      <Navbar />

      {/* Animated Background SVG (flair) */}
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
      <main className="relative z-10 p-2 max-w-7xl mx-auto space-y ">
        {/* Dashboard Navbar */}
        <Navbar />

        {/* Top row: Balance + Graph */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-24 ">
          {/* Balance Display */}
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
                  <CardTitle className="text-purple-300">
                    Current Balance
                  </CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.p
                  className="text-3xl font-extrabold text-purple-200 mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  {balance} MemeCoins
                </motion.p>
                <div className="flex space-x-2">
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

          {/* Chart Display */}
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
                  <CardTitle className="text-pink-400">Token History</CardTitle>
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
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#6B21A8" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4e4e4e" />
                      <XAxis
                        dataKey="name"
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
                      <Tooltip contentStyle={{ backgroundColor: "#222", border: "none" }} labelStyle={{ color: "#ffb3fa" }} itemStyle={{ color: "#fff" }} />
                      <Legend wrapperStyle={{ color: "#ffb3fa" }} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="url(#chartGradient)"
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

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-300">Total Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalSupply} MemeCoins</p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-300">Top Tipper</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{topTipper || "N/A"}</p>
            </CardContent>
          </Card>
          {/* You could add a third card for another analytic metric */}
          <Card className="bg-black/60 border border-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-300">Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold"> {balance} MemeCoins </p>
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
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

"use client";

import { useWalletSelector } from "@near-wallet-selector/react-hook";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Chat from "./Chat";

const Navbar: React.FC = () => {
  // State for sticky navbar on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // NEAR Wallet Selector
  const { signIn, signOut, signedAccountId } = useWalletSelector();

  // Chatbot visibility state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top navbar */}
      <nav
        className={`fixed top-0 w-full z-50 border-b border-gray-700 transition-all duration-300 ${
          isScrolled ? "bg-black bg-opacity-80 py-2 backdrop-blur-sm" : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          {/* Left side: brand / link */}
          <Link
            href="/"
            className="text-2xl font-bold text-white font-orbitron transition-all duration-500 hover:text-purple-400"
          >
            MemeCoin Agent
          </Link>

          {/* Right side: nav links + wallet + chat toggle */}
          <ul className="flex space-x-8 text-white text-lg font-orbitron items-center">
            {/* Dashboard Link */}
            <li>
              <Link
                href="/dashboard"
                className="transition-all duration-300 hover:text-purple-400 hover:scale-105"
              >
                Dashboard
              </Link>
            </li>

            {/* Chatbot Toggle Button */}
            <li>
              <button
                className="btn btn-outline-info"
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? "Close Chat" : "Open Chat"}
              </button>
            </li>

            {/* Wallet Auth Buttons */}
            {signedAccountId ? (
              <div className="flex flex-col items-center">
                <button className="btn btn-outline-danger" onClick={signOut}>
                  Logout
                </button>
                <small className="text-gray-400">{signedAccountId}</small>
              </div>
            ) : (
              <button className="btn btn-outline-primary" onClick={signIn}>
                Login
              </button>
            )}
          </ul>
        </div>
      </nav>

     {/* Chatbot Sidebar */}
<div
  className={`fixed top-0 right-0 h-full
    w-[360px] sm:w-[400px] md:w-[450px] lg:w-[500px]
    bg-white shadow-2xl z-50
    transform transition-transform duration-500 ease-in-out
    rounded-l-3xl
    ${isChatOpen ? "translate-x-0" : "translate-x-full"}
  `}
>
<motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full flex flex-col"
  >
    <Chat onClose={() => setIsChatOpen(false)} />
  </motion.div>
</div>


    </>
  );
};

export default Navbar;

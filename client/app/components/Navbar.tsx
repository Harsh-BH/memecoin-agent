"use client";

import { useWalletSelector } from "@near-wallet-selector/react-hook";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Chat from "./Chat";

const Navbar = () => {
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
      <nav
        className={`fixed top-0 w-full z-50 border-b border-gray-700 transition-all duration-300 ${
          isScrolled ? "bg-black bg-opacity-80 py-2 backdrop-blur-sm" : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <Link 
          href ="/"
           className="text-2xl font-bold text-white font-orbitron transition-all duration-500 hover:text-purple-400">
            MemeCoin Agent
         
          </Link>

          <ul className="flex space-x-8 text-white text-lg font-orbitron">
            

            {/* Dashboard Link */}
            <li>
              <Link
                href="/dashboard"
                className="transition-all duration-300 hover:text-purple-400 hover:scale-105 m-auto"
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
        className={`fixed top-0 right-0 h-full w-90  shadow-lg transition-transform transform z-50 ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-black-800 text-2xl mr-7 z-50 mt-4"
          onClick={() => setIsChatOpen(false)}
        >
          ✖
        </button>

        {/* Chat Component */}
        <div className="p-4 h-full flex flex-col">
          
          <Chat />
        </div>
      </div>

      {/* Overlay when chatbot is open */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setIsChatOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;

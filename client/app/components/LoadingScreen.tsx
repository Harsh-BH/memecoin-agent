"use client";
import React, { FC } from "react";
import { motion } from "framer-motion";

const LoadingScreen: FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white z-[9999]">
      {/* Example: animated text or spinner */}
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <div className="text-3xl font-bold">Loading...</div>
        {/* Or a fancy spinner, or any other design */}
        <div className="h-8 w-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

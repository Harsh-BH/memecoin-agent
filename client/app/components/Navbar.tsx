import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
     
        <div className="text-2xl font-bold text-white font-orbitron transition-all duration-500 hover:text-purple-400">
          MemeCoin Agent
        </div>
        <ul className="flex space-x-6 text-white text-lg font-orbitron">
          <li>
            <Link href="#home" className="transition-all duration-300 hover:text-purple-400 hover:scale-105">
              Home
            </Link>
          </li>
          <li>
            <Link href="#about" className="transition-all duration-300 hover:text-purple-400 hover:scale-105">
              About
            </Link>
          </li>
          <li>
            <Link href="#features" className="transition-all duration-300 hover:text-purple-400 hover:scale-105">
              Features
            </Link>
          </li>
          <li>
            <Link href="#contact" className="transition-all duration-300 hover:text-purple-400 hover:scale-105">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import Head from 'next/head';
import Navbar from './components/Navbar';
import CursorTrail from './components/CursorTrail';
import { FaGithub } from 'react-icons/fa';
import ScrollTimeline from "./components/Features"

export default function HomePage() {
  const features = [
    { title: "Feature One", description: "Description for feature one..." },
    { title: "Feature Two", description: "Description for feature two..." },
    { title: "Feature Three", description: "Description for feature three..." },
    { title: "Feature Three", description: "Description for feature three..." },
  ];
  return (
    <>
      <Head>
        <title>MemeCoin Agent - Sci-Fi Edition</title>
        {/* Sci-Fi fonts: Orbitron for headings and Roboto Mono for body */}
        
      </Head>
      
      <CursorTrail />
      <main className="relative min-h-screen flex flex-col items-center justify-center font-roboto bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden scroll-smooth ">
        {/* Texture Overlay */}
        <Navbar />
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-25"></div>

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full animate-[slide_30s_linear_infinite]"
            viewBox="0 0 1600 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="400" cy="300" r="150" fill="rgba(255, 0, 255, 0.05)" />
            <rect
              x="1200"
              y="500"
              width="200"
              height="200"
              fill="rgba(0, 255, 255, 0.05)"
              transform="rotate(45 1300 600)"
            />
          </svg>
        </div>

        {/* Main Hero Content */}
        <div className="relative  text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-neonGlow">
            Welcome to MemeCoin Agent
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 animate-fadeInUp">
            Where blockchain, AI, and social media merge into a futuristic dark realm.
          </p>
          <button className="group relative inline-flex items-center backdrop-blur-lg bg-white bg-opacity-10 text-white font-semibold py-3 px-8 rounded-full shadow-xl transition-transform duration-500 hover:scale-105 mr-8">
              Get Started
              <svg
                className="ml-3 h-6 w-6 transition-transform duration-500 group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <a
              href="https://github.com/your-repo-url"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center backdrop-blur-lg bg-white bg-opacity-10 text-white font-semibold py-3 px-8 rounded-full shadow-xl transition-transform duration-500 hover:scale-105"
            >
              <FaGithub className="mr-2 h-6 w-6" />
              View on GitHub
            </a>
        </div>

        {/* Top Left Lighting SVG with Extra Glow */}
        <div className="absolute top-10 left-10 opacity-90">
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <defs>
              <linearGradient id="lightGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF4500" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M70 0 L80 40 L50 40 L90 150 L80 90 L110 90 Z"
              fill="url(#lightGradient)"
              filter="url(#glow)"
            />
          </svg>
        </div>

        {/* Bottom Right Lighting SVG with Glow */}
        <div className="absolute bottom-0 right-0 mb-10 mr-10 opacity-80">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin-slow"
          >
            <defs>
              <linearGradient id="lightGradient2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#1E90FF" />
              </linearGradient>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="url(#lightGradient2)"
              strokeWidth="10"
              filter="url(#glow2)"
            />
          </svg>
        </div>
      </main>

     
      <section className="relative py-16 bg-gradient-to-br from-black via-gray-900 to-black w-full flex justify-center">
  {/* Subtle Texture Overlay */}
  <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-25"></div>

  {/* Memecoin-like glowing circles */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* You can reuse this gradient/filter for multiple coins */}
        <radialGradient id="coinGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF4500" />
        </radialGradient>
        <filter id="coinGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Coin #1 */}
      <circle
        cx="200"
        cy="200"
        r="40"
        fill="url(#coinGradient)"
        filter="url(#coinGlow)"
      >
        {/* Animate position in a smooth up/down cycle */}
        <animate
          attributeName="cy"
          values="200;160;200"
          dur="4s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.5 0 0.5 1; 0.5 0 0.5 1"
        />
      </circle>

      {/* Coin #2 */}
      <circle
        cx="900"
        cy="450"
        r="50"
        fill="url(#coinGradient)"
        filter="url(#coinGlow)"
      >
        <animate
          attributeName="cy"
          values="450;490;450"
          dur="5s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.5 0 0.5 1; 0.5 0 0.5 1"
        />
      </circle>

      {/* Coin #3 */}
      <circle
        cx="600"
        cy="100"
        r="30"
        fill="url(#coinGradient)"
        filter="url(#coinGlow)"
      >
        <animate
          attributeName="cx"
          values="600;620;600"
          dur="6s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.5 0 0.5 1; 0.5 0 0.5 1"
        />
      </circle>
      {/* Add more circles as you like */}
    </svg>
  </div>

  <div className="max-w-5xl w-full px-4">
    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
      Timeline of Features
    </h2>
    {/* Use the imported timeline component here */}
    <ScrollTimeline features={features} />
  </div>
</section>

    </>
  );
}

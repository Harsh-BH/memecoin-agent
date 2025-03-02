"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Feature {
  title: string;
  description: string;
}

interface ScrollTimelineProps {
  features: Feature[];
}

/**
 * For the animated gradient line:
 * Make sure you have a keyframe in your global CSS or Tailwind config, e.g.:
 *
 *  @keyframes flowGradient {
 *    0% { background-position: 0% 0%; }
 *    100% { background-position: 100% 100%; }
 *  }
 *
 * Then you can reference animate-[flowGradient_4s_linear_infinite] in the class.
 */

export default function ScrollTimeline({ features }: ScrollTimelineProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-10 pb-20 px-4">
      {/* Animated center vertical line */}
      <div
        className="
          absolute top-0 left-1/2 w-1 h-full -translate-x-1/2
          bg-gradient-to-b from-purple-600 via-pink-500 to-purple-300
          shadow-[0_0_15px_rgba(147,51,234,0.7)]
          animate-[flowGradient_4s_linear_infinite_alternate]
          bg-[length:200%_200%]
        "
      />

      {features.map((feature, index) => (
        <TimelineItem
          key={index}
          title={feature.title}
          description={feature.description}
          index={index}
        />
      ))}
    </div>
  );
}

function TimelineItem({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const isEven = index % 2 === 0; // for left/right alignment

  return (
    <div
      ref={ref}
      className={
        "group relative flex flex-col md:flex-row items-center mb-16 min-h-[120px] " +
        (isEven ? "md:justify-start" : "md:justify-end")
      }
    >
      {/* Dot with rotation on hover */}
      <div
        className={
          "z-10 h-10 w-10 flex items-center justify-center rounded-full font-bold mb-2 md:mb-0 shadow-xl transition-all duration-300 border-2 border-purple-500 text-purple-500 bg-transparent " +
          (isEven ? "md:mr-6" : "md:ml-6") +
          " hover:bg-purple-500 hover:text-white hover:rotate-12"
        }
      >
        {index + 1}
      </div>

      {/* Animated Content Box */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{
          opacity: isInView ? 1 : 0,
          y: isInView ? 0 : 40,
          scale: isInView ? 1 : 0.9,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={
          "rounded-2xl p-6 shadow-md w-full max-w-md text-gray-200 bg-gray-900 transition-all " +
          (isEven ? "md:ml-12" : "md:mr-12")
        }
      >
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="leading-relaxed">{description}</p>
      </motion.div>
    </div>
  );
}

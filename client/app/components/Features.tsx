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

export default function ScrollTimeline({ features }: ScrollTimelineProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-10 pb-20 px-4">
      {/* Glowing center vertical line */}
      <div className="absolute top-0 left-1/2 w-1 bg-gradient-to-b from-purple-600 to-purple-300 h-full -translate-x-1/2 shadow-[0_0_15px_rgba(147,51,234,0.7)]" />

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
      {/* Hoverable Dot / Number with fill on hover */}
      <div
        className={
          "z-10 h-10 w-10 flex items-center justify-center rounded-full font-bold mb-2 md:mb-0 shadow-xl transition-all duration-300 border-2 border-purple-500 text-purple-500 bg-transparent hover:bg-purple-500 hover:text-white " +
          (isEven ? "md:mr-6" : "md:ml-6")
        }
      >
        {index + 1}
      </div>

      {/* Animated Content: fade in + slide up */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
        transition={{ duration: 0.6 }}
        className={
          "rounded-2xl p-6 shadow-md w-full max-w-md text-gray-200 bg-gray-900 " +
          (isEven ? "md:ml-12" : "md:mr-12")
        }
      >
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="leading-relaxed">{description}</p>
      </motion.div>
    </div>
  );
}

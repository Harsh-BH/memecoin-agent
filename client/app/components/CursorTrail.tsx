"use client";
import React, { useEffect, useState } from "react";

interface Trail {
  x: number;
  y: number;
  id: number;
}

const CursorLaserTrail = () => {
  const [trails, setTrails] = useState<Trail[]>([]);

  useEffect(() => {
    let idCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const newTrail: Trail = { x: e.clientX, y: e.clientY, id: idCounter++ };
      setTrails((prev) => [...prev, newTrail]);
      setTimeout(() => {
        setTrails((prev) => prev.filter((trail) => trail.id !== newTrail.id));
      }, 500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80 "
          style={{
            width: "6px",
            height: "6px",
            top: trail.y - 3,
            left: trail.x - 3,
            boxShadow: "0 0 12px 4px rgba(192, 38, 211, 0.8)",
          }}
        />
      ))}
    </div>
  );
};

export default CursorLaserTrail;

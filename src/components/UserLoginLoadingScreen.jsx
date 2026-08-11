"use client";

import React from "react";
import { motion } from "framer-motion";

export default function UserLoginLoadingScreen({ 
  title = "Checking session", 
  message = "Verifying account access and preparing your experience.",
  showProgress = true 
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#08090d] text-white min-h-screen overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">

        {/* 🔥 Rocket Icon Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center w-32 h-32 mb-6"
        >
          {/* Outer Glow Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cyan-500/20"
          />
          
          {/* Inner Pulsing Ring */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full border border-purple-500/10"
          />

          {/* SVG Rocket */}
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16 relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rocket Body */}
            <motion.path
              d="M50 10 C40 30, 30 50, 30 65 L70 65 C70 50, 60 30, 50 10 Z"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            {/* Rocket Window */}
            <circle cx="50" cy="45" r="8" fill="none" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="50" cy="45" r="4" fill="#22d3ee" />
            {/* Left Fin */}
            <path d="M30 55 L15 75 L30 65 Z" fill="#8b5cf6" />
            {/* Right Fin */}
            <path d="M70 55 L85 75 L70 65 Z" fill="#8b5cf6" />
            {/* Flame */}
            <motion.path
              d="M40 65 Q50 85 60 65 Z"
              fill="#fbbf24"
              animate={{ scaleY: [1, 1.15, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.path
              d="M44 65 Q50 75 56 65 Z"
              fill="#f97316"
              animate={{ scaleY: [1, 1.2, 1] }}
              transition={{ duration: 0.25, repeat: Infinity, delay: 0.1 }}
            />
          </svg>
        </motion.div>

        {/* Text Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl"
        >
          <h2 className="text-xl font-semibold text-center text-white mb-1">
            {title}
          </h2>
          <p className="text-center text-zinc-400 text-sm mb-6">
            {message}
          </p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-6">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          )}

          {/* Dots indicator */}
          <div className="flex justify-center gap-2.5">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-2.5 h-2.5 rounded-full bg-cyan-400"
            />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-2.5 h-2.5 rounded-full bg-purple-400"
            />
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-2.5 h-2.5 rounded-full bg-teal-400"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
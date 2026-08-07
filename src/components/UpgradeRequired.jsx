"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  ArrowRight 
} from "lucide-react";

export default function UpgradeRequired({ 
  type = "applications",      // "applications" or "jobs"
  currentUsage,              // Number (e.g. 55)
  planLimit,                 // Number (e.g. 3)
  planName = "Free",         // String
  isPremium = false,         // Boolean
  viewPlansLink = "/pricing",
}) {
  // Helper to get title and message based on type
  const getContent = () => {
    const typeLabel = type === "applications" ? "application" : "job posting";
    const typeLabelPlural = type === "applications" ? "applications" : "job postings";
    
    return {
      title: `${type === "applications" ? "Application" : "Posting"} Limit Reached`,
      message: `You've used ${currentUsage} out of ${planLimit} ${typeLabelPlural} this month.`,
      actionText: isPremium 
        ? "Please wait until next month for more." 
        : "Upgrade your plan to continue."
    };
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="bg-[#111214] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
        
        {/* Icon Header */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Title & Message */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {content.title}
        </h2>
        <p className="text-zinc-400 text-center max-w-sm mx-auto mb-2">
          {content.message}
        </p>
        <div className="text-zinc-500 text-center text-sm mb-6">
          <span className="text-white font-medium">{currentUsage}</span> / <span className="text-zinc-400">{planLimit}</span> Used
        </div>
        <p className="text-zinc-500 text-center text-sm mb-8">
          {content.actionText}
        </p>

        {/* Action Buttons */}
        {!isPremium ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={viewPlansLink}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                View Upgrade Plans
              </motion.button>
            </Link>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>
        ) : (
          // If the user is Premium but still hit a limit (shouldn't happen but just in case)
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-4">
              You are on a Premium plan. If you believe this is an error, please contact support.
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
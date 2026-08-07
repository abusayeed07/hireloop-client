"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Zap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card } from "@heroui/react";

export default function SeekerApplicationTracker({
  user,
  applications = [],
  title = "Applications This Month",
}) {
  const [stats, setStats] = useState({
    total: 0,
    max: 30,
    planName: "Pro",
    remaining: 30,
    isLimitReached: false,
    percentage: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Seeker plan limits for applications
  const planLimits = {
    seeker_free: 3,
    free: 3,
    seeker_pro: 30,
    pro: 30,
    seeker_premium: 100,
    premium: 100,
  };

  const getPlanName = (plan) => {
    const planMap = {
      seeker_free: "Free",
      free: "Free",
      seeker_pro: "Pro",
      pro: "Pro",
      seeker_premium: "Premium",
      premium: "Premium",
    };
    return planMap[plan] || "Free";
  };

  const getMaxApplications = (plan) => {
    return planLimits[plan] || planLimits.seeker_free;
  };

  const getPlanColor = (planName) => {
    const planColors = {
      free: "from-zinc-500 to-zinc-600",
      pro: "from-blue-500 to-purple-500",
      premium: "from-amber-500 to-yellow-500",
    };
    return planColors[planName.toLowerCase()] || planColors.free;
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      free: <Briefcase size={14} />,
      pro: <TrendingUp size={14} />,
      premium: <Zap size={14} />,
    };
    return planIcons[planName.toLowerCase()] || planIcons.free;
  };

  useEffect(() => {
    setIsLoading(true);
    const totalApplications = applications?.length || 0;
    const userPlan = user?.plan || "seeker_free";
    const planName = getPlanName(userPlan);
    const max = getMaxApplications(userPlan);
    
    // 🟢 FIX: Handle over-limit gracefully
    const remainingCount = Math.max(0, max - totalApplications);
    const percentage = max > 0 ? Math.min((totalApplications / max) * 100, 100) : 0;
    const isLimitReached = totalApplications >= max;

    setStats({
      total: totalApplications,
      max: max,
      planName: planName,
      remaining: remainingCount,
      isLimitReached: isLimitReached,
      percentage: isLimitReached ? 100 : percentage, // Force bar to 100% if over limit
    });

    setIsLoading(false);
  }, [applications, user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center py-4"
      >
        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
      </motion.div>
    );
  }

  const isPremium = stats.planName === "Premium";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-purple-500/40 hover:shadow-purple-500/20">
        
        {/* 🎨 Animated background */}
        <motion.div
          animate={{
            x: [-80, 80, -80],
            y: [-30, 20, -30],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl"
        />

        <motion.div
          animate={{
            x: [80, -60, 80],
            y: [40, -30, 40],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
        />

        {/* ✨ Shine effect */}
        <motion.div
          animate={{
            x: ["-120%", "220%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear",
          }}
          className="absolute top-0 left-0 h-full w-24 rotate-12 bg-white/10 blur-xl"
        />

        <div className="relative z-10 p-7">
          
          {/* Top Section: Title & Icon */}
          <div className="flex items-center justify-between">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-zinc-400 text-sm"
              >
                {title}
              </motion.h2>

              <motion.h1
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                }}
                className="mt-2 text-5xl font-black tracking-tight text-white"
              >
                {stats.total}
              </motion.h1>

              <p className="mt-1 text-sm text-zinc-500">
                {stats.remaining} applications remaining
              </p>
            </div>

            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className={`rounded-2xl p-4 bg-gradient-to-r ${getPlanColor(stats.planName)}`}
            >
              {isPremium ? (
                <Sparkles className="text-white" />
              ) : (
                getPlanIcon(stats.planName)
              )}
            </motion.div>
          </div>

          {/* Middle Section: Progress Bar */}
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs text-zinc-500">
              <span>Monthly Usage</span>
              <span>
                {stats.total}/{stats.max}
              </span>
            </div>

            <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${stats.percentage}%`,
                }}
                transition={{
                  duration: 1,
                }}
                className={`h-full rounded-full ${
                  stats.isLimitReached
                    ? "bg-red-500"
                    : "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"
                }`}
              />

              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute top-0 h-full w-20 bg-white/30 blur-sm"
              />
            </div>
          </div>

          {/* Bottom Section: Plan Status & Upgrade Button */}
          <div className="mt-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className={`h-2.5 w-2.5 rounded-full ${
                  stats.isLimitReached ? "bg-red-500" : "bg-emerald-400"
                }`}
              />

              <span className="text-sm font-medium text-zinc-300">
                {stats.planName} Plan
              </span>

              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                {stats.max} Apps
              </span>
            </div>

            {/* ✅ ADDED: Upgrade Button - Only shows if limit reached and not Premium */}
            {stats.isLimitReached && !isPremium && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => {
                    // Redirect to pricing page
                    window.location.href = "/pricing?tab=seeker";
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Apply
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
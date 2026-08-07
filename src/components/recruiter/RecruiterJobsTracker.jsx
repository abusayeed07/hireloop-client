"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Zap,
  Loader2,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import {  Card } from "@heroui/react";

export default function RecruiterJobsTracker({
  user,
  jobs = [],
  title = "Jobs This Month",
}) {
  const [stats, setStats] = useState({
    total: 0,
    max: 10,
    planName: "Growth",
    remaining: 10,
    isLimitReached: false,
    percentage: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Recruiter plan limits for jobs
  const planLimits = {
    recruiter_free: 3,
    free: 3,
    recruiter_growth: 10,
    growth: 10,
    recruiter_enterprise: 50,
    enterprise: 50,
  };

  const getPlanName = (plan) => {
    const planMap = {
      recruiter_free: "Free",
      free: "Free",
      recruiter_growth: "Growth",
      growth: "Growth",
      recruiter_enterprise: "Enterprise",
      enterprise: "Enterprise",
    };
    return planMap[plan] || "Free";
  };

  const getMaxJobs = (plan) => {
    return planLimits[plan] || planLimits.recruiter_free;
  };

  const getPlanColor = (planName) => {
    const planColors = {
      free: "from-zinc-500 to-zinc-600",
      growth: "from-blue-500 to-purple-500",
      enterprise: "from-amber-500 to-yellow-500",
    };
    return planColors[planName.toLowerCase()] || planColors.free;
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      free: <Briefcase size={14} />,
      growth: <TrendingUp size={14} />,
      enterprise: <Zap size={14} />,
    };
    return planIcons[planName.toLowerCase()] || planIcons.free;
  };

  useEffect(() => {
    setIsLoading(true);
    const totalJobs = jobs?.length || 0;
    const userPlan = user?.plan || "recruiter_free";
    const planName = getPlanName(userPlan);
    const max = getMaxJobs(userPlan);

    // 🟢 FIX: Handle over-limit gracefully
    const remainingCount = Math.max(0, max - totalJobs);
    const percentage = max > 0 ? Math.min((totalJobs / max) * 100, 100) : 0;
    const isLimitReached = totalJobs >= max;

    setStats({
      total: totalJobs,
      max: max,
      planName: planName,
      remaining: remainingCount,
      isLimitReached: isLimitReached,
      percentage: isLimitReached ? 100 : percentage, // Force bar to 100% if over limit
    });

    setIsLoading(false);
  }, [jobs, user]);

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

  const isEnterprise = stats.planName === "Enterprise";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-blue-500/40 hover:shadow-blue-500/20">
        {/* 🎨 Animated background orbs */}
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
          className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl"
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
          className="absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
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
          className="absolute left-0 top-0 h-full w-24 rotate-12 bg-white/10 blur-xl"
        />

        <div className="relative z-10 p-7">
          {/* TOP SECTION: Icon & Big Number */}
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
                {stats.remaining} jobs remaining
              </p>
            </div>

            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className={`rounded-2xl p-4 bg-gradient-to-r ${getPlanColor(stats.planName)}`}
            >
              {isEnterprise ? (
                <Sparkles className="text-white" />
              ) : (
                getPlanIcon(stats.planName)
              )}
            </motion.div>
          </div>

          {/* MIDDLE SECTION: Progress Bar */}
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

          {/* BOTTOM SECTION: Plan & Actions */}
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
                {stats.max} Jobs
              </span>
            </div>

            {/* ✅ ADDED: Upgrade Button - Only shows if limit reached and not Enterprise */}
            {stats.isLimitReached && !isEnterprise && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => {
                    // Redirect to pricing page
                    window.location.href = "/pricing?tab=recruiter";
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Post Jobs
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

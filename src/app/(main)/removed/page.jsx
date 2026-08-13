"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Building2, 
  Briefcase, 
  Trash2, 
  ArrowLeft, 
  Home, 
  Search, 
  AlertCircle 
} from "lucide-react";

export default function RemovedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const type = searchParams.get("type") || "resource";
  const name = searchParams.get("name") || "";
  const redirect = searchParams.get("redirect") || "/";

  // Determine messages based on type
  const isJob = type === "job";
  const isCompany = type === "company";

  const title = isJob 
    ? "Job No Longer Available" 
    : isCompany 
      ? "Company Removed" 
      : "Page Not Found";

  const description = isJob 
    ? "This job posting has been removed or closed by the recruiter." 
    : isCompany 
      ? "This company profile has been removed from the platform." 
      : "The page you are looking for does not exist.";

  const icon = isJob 
    ? <Briefcase className="w-16 h-16 text-zinc-500" /> 
    : <Building2 className="w-16 h-16 text-zinc-500" />;

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect when timer hits 0
  useEffect(() => {
    if (countdown === 0) {
      router.push(redirect);
    }
  }, [countdown, router, redirect]);

  // Animation variants for the floating orbs
  const orbVariants = {
    animate1: {
      x: [0, 60, -30, 0],
      y: [0, -40, 20, 0],
      transition: { duration: 15, repeat: Infinity, ease: "easeInOut" },
    },
    animate2: {
      x: [0, -50, 40, 0],
      y: [0, 50, -20, 0],
      transition: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 },
    },
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* 🔮 Animated Background Orbs */}
      <motion.div
        variants={orbVariants}
        animate="animate1"
        className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        variants={orbVariants}
        animate="animate2"
        className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* ✨ Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* 🌀 Animated Ring behind the card */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          
          {/* Glow overlay inside card */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />

          {/* Icon Container */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="relative flex justify-center mb-6 z-10"
          >
            <div className="relative">
              {/* Pulsing background behind icon */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-zinc-600/20 rounded-full blur-2xl"
              />
              
              <div className="relative w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center border-2 border-zinc-700/50">
                {icon}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2 z-10 relative"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 text-center leading-relaxed mb-6 z-10 relative"
          >
            {description}
            {name && (
              <span className="block text-zinc-500 text-sm mt-2">
                <span className="text-zinc-300 font-medium">"{name}"</span> was removed.
              </span>
            )}
          </motion.p>

          {/* Auto Redirect Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-6 z-10 relative"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Redirecting in <strong className="text-white">{countdown}</strong> seconds</span>
          </motion.div>

          <div className="border-t border-zinc-800 my-6 z-10 relative" />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 z-10 relative"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Link
                href={redirect}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-blue-600/20"
              >
                <Home className="w-4 h-4" />
                Homepage
              </Link>
            </motion.div>
          </motion.div>

          {/* Browse alternatives */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 z-10 relative"
          >
            <Link
              href={isJob ? "/browse-jobs" : "/companies"}
              className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Browse {isJob ? "other jobs" : "other companies"}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
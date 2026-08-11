"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  ArrowLeft,
  Home,
  Lock,
  Mail,
} from "lucide-react";

const UnauthorizedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read dynamic params from URL
  const customMessage = searchParams.get('message');
  const redirectUrl = searchParams.get('redirect');
  
  // Dynamic UI States
  const title = customMessage ? "Access Restricted" : "Access Denied";
  const subtitle = customMessage ? "Unauthorized" : "Unauthorized";
  const description = customMessage || 
    "You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.";

  const [countdown, setCountdown] = useState(5);

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

  // Handle automatic redirect after countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    }
  }, [countdown, redirectUrl, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-red-600/5 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2,
              }}
              className="relative flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-full flex items-center justify-center border-2 border-red-500/30 shadow-xl shadow-red-600/10">
                  <Shield className="w-12 h-12 text-red-500" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  >
                    !
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-2"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-500" />
              <span className="text-sm text-red-400 font-medium uppercase tracking-wider">
                {subtitle}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500" />
            </motion.div>

            {/* Dynamic Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-400 text-center leading-relaxed mb-8"
            >
              {description}
            </motion.p>

            {/* Auto Redirect Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-6"
            >
              <Lock className="w-4 h-4" />
              <span>Redirecting in <strong className="text-white">{countdown}</strong> seconds</span>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-zinc-800 my-6" />

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => {
                  if (redirectUrl) {
                    router.push(redirectUrl);
                  } else {
                    router.back();
                  }
                }}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all duration-200 hover:scale-105 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>

              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-105 text-sm font-medium shadow-lg shadow-blue-600/20"
              >
                <Home className="w-4 h-4" />
                Homepage
              </Link>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <Link
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@hireloop.com'}`}
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Support
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-zinc-600 mt-6"
        >
          Need help? Contact our{" "}
          <Link href="/support" className="text-blue-400 hover:text-blue-300 transition">
            support team
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
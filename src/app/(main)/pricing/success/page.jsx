// src/app/pricing/success/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -30 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.2,
    },
  },
};

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const handleSuccess = async () => {
      if (!sessionId) {
        setStatus("error");
        toast.error("Missing session ID");
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        
        const response = await fetch(`${baseUrl}/api/verify-payment-and-upgrade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          toast.success("Payment successful! Your plan has been upgraded.");
          
          setTimeout(() => {
            router.push("/dashboard/billing");
          }, 2000);
        } else {
          setStatus("error");
          toast.error(data.error || "Failed to verify payment");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
        toast.error("Something went wrong. Please contact support.");
      }
    };

    handleSuccess();
  }, [sessionId, router]);

  // ============================================================
  // 🎨 PROCESSING STATE
  // ============================================================
  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#08090B] overflow-hidden px-4">
        {/* Background Ambient Orbs - lighter in light mode */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-500/20 blur-[120px] rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-2xl p-10 shadow-2xl max-w-md w-full text-center"
        >
          <div className="flex flex-col items-center space-y-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-blue-300/50 dark:border-blue-500/30 border-t-blue-500 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-300/20 dark:bg-blue-500/20 animate-pulse" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Processing Payment</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                Please wait while we securely verify your transaction and upgrade your plan.
              </p>
            </div>

            <div className="w-full max-w-xs h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // 🎨 SUCCESS STATE
  // ============================================================
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#08090B] overflow-hidden px-4 relative">
        {/* Background Ambient Orbs - lighter in light mode */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-300/15 dark:bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-blue-300/15 dark:bg-blue-500/15 blur-[140px] rounded-full pointer-events-none"
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -300, null],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-md w-full"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle Glow inside card */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-300/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-300/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Success Icon */}
              <motion.div
                variants={iconVariants}
                className="w-20 h-20 rounded-full bg-emerald-300/20 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 dark:border-emerald-500/30 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              >
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="space-y-2 mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  Payment Successful!
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Your plan has been upgraded. Redirecting you in a moment...
                </p>
              </motion.div>

              {/* Loading Bar Timer */}
              <motion.div
                variants={itemVariants}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-8"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="w-full space-y-3">
                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="w-full group flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-950/30 transition-all duration-300"
                >
                  Go to Billing Dashboard
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </button>

                <button
                  onClick={() => router.push("/browse-jobs")}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 py-3 px-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all duration-200"
                >
                  <span className="text-lg">🚀</span>
                  Browse Jobs
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-[11px] text-zinc-500 dark:text-zinc-600"
          >
            A confirmation receipt has been sent to your email address.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // 🎨 ERROR STATE
  // ============================================================
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#08090B] overflow-hidden px-4 relative">
        {/* Error Background Orbs - lighter in light mode */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-[500px] h-[500px] bg-red-300/20 dark:bg-red-500/20 blur-[120px] rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-2xl p-10 shadow-2xl max-w-md w-full text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-20 h-20 rounded-full bg-red-300/20 dark:bg-red-500/20 flex items-center justify-center border border-red-400/30 dark:border-red-500/30"
            >
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Verification Failed</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                We couldn't verify your payment. Please try again or contact support.
              </p>
            </div>

            <Link
              href="/pricing"
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300"
            >
              Back to Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { getRecruiterCompany } from "@/lib/api/companies";
import CompanyProfile from "./CompanyProfile";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function CompanyPage() {
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching company for user:", session.user.id);
        const data = await getRecruiterCompany(session.user.id);
        console.log("🏢 Company data:", data);
        setCompany(data);
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Failed to load company profile");
      } finally {
        setLoading(false);
      }
    };

    if (!isPending) {
      fetchCompany();
    }
  }, [session?.user?.id, isPending]);

  // 🎨 Loading State with Animation
  if (isPending || loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[85vh] flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium tracking-wide">
            Loading your workspace...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // 🚫 Unauthenticated State
  if (!session?.user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[85vh] flex items-center justify-center"
      >
        <div className="text-zinc-900 dark:text-white text-center max-w-md">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-200/50 dark:border-zinc-800">
            <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Waiting for authentication</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Please sign in to manage your company profile.
          </p>
        </div>
      </motion.div>
    );
  }

  // ✅ Success State
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="container mx-auto px-4 py-6"
    >
      <CompanyProfile 
        recruiter={session.user} 
        recruiterCompany={company} 
      />
    </motion.div>
  );
}
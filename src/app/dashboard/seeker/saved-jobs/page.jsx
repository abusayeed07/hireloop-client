"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import JobCard from "@/components/jobs/JobCard";
import { Loader2, Heart, Trash2, Search, Sparkles } from "lucide-react";
import { getSavedJobs, unsaveJob } from "@/lib/api/jobs";
import Link from "next/link";
import Pagination from "@/components/Pagination";

export default function SavedJobsPage() {
  const { data: session } = useSession();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  
  // 🟢 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ Fetch saved jobs on load
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await getSavedJobs(session.user.id);
        setSavedJobs(Array.isArray(data) ? data.filter(job => job !== null) : []);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        toast.error("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedJobs();
  }, [session]);

  // ✅ Handle removing a job
  const handleRemoveJob = async (jobId) => {
    if (!jobId) return;

    setRemovingIds(prev => new Set(prev).add(jobId));
    const originalJobs = [...savedJobs];
    setSavedJobs(prev => prev.filter(job => job._id !== jobId));

    try {
      const result = await unsaveJob(jobId, session.user.id);
      if (result && result.success === true) {
        toast.success("Job removed from saved");
        const remainingJobs = savedJobs.filter(job => job._id !== jobId);
        const totalPages = Math.ceil(remainingJobs.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } else {
        toast.error(result?.error || "Failed to remove job");
        setSavedJobs(originalJobs);
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Something went wrong. Please try again.");
      setSavedJobs(originalJobs);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // 🟢 Pagination Calculations
  const totalItems = savedJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = savedJobs.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] py-8 px-4 md:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  // ---------- NOT LOGGED IN ----------
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] py-8 px-4 md:px-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-200/50 dark:border-white/10">
            <Heart className="w-10 h-10 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Sign in to view saved jobs</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Please sign in to see your saved jobs.
          </p>
        </motion.div>
      </div>
    );
  }

  // ---------- 🎨 ANIMATED EMPTY STATE ----------
  if (savedJobs.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] py-12 px-4 md:px-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 text-zinc-200 dark:text-zinc-800/30"
          >
            <Heart className="w-24 h-24 fill-current" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-12 -right-12 text-zinc-200 dark:text-zinc-800/30"
          >
            <Heart className="w-32 h-32 fill-current" />
          </motion.div>

          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto border border-zinc-200/50 dark:border-white/10 backdrop-blur-sm shadow-2xl">
              <Heart className="w-12 h-12 text-blue-400" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">No saved jobs yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-lg">
            Start browsing and save jobs you're interested in.
          </p>

          <Link
            href="/browse-jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Browse Jobs
          </Link>
        </motion.div>
      </div>
    );
  }

  // ---------- 🎨 STYLISH MAIN CONTENT ----------
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              Saved Jobs 
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-medium px-3 py-1 rounded-full border border-zinc-200/50 dark:border-white/10">
                {savedJobs.length}
              </span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Jobs you've bookmarked for later</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {currentJobs.map((job, index) => (
              <motion.div
                layout
                key={job._id || index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: index * 0.05 
                }}
                className="relative group"
              >
                <div className="relative rounded-2xl bg-white dark:bg-[#121316] border border-zinc-200/50 dark:border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/5 overflow-hidden">
                  <JobCard job={job} index={index} />
                  
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveJob(job._id);
                    }}
                    disabled={removingIds.has(job._id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-red-500/80 hover:border-red-500/50 text-zinc-400 hover:text-white transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg"
                    title="Remove from saved"
                  >
                    {removingIds.has(job._id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              size="md"
              color="primary"
              showTotal={true}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
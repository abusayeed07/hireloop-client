"use client";

import React, { useState, useEffect } from "react";
import PostJobForm from "./PostJobForm";
import RecruiterJobsTracker from "@/components/recruiter/RecruiterJobsTracker";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getMyJobs } from "@/lib/api/jobs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Metadata from "@/components/Metadata";
import { Zap, Sparkles } from "lucide-react";

// ✅ Plan Limits Configuration
const planLimits = {
  recruiter_free: 3,
  free: 3,
  recruiter_growth: 10,
  growth: 10,
  recruiter_enterprise: 50,
  enterprise: 50,
};

export default function PostJobPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [companyStatus, setCompanyStatus] = useState(null);
  const [stats, setStats] = useState({ total: 0, max: 0, isLimitReached: false });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setLoading(false);
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace('/signin');
          }
        }
        return;
      }

      try {
        console.log('🔍 Fetching company for user:', session.user.id);
        const companyData = await getLoggedInRecruiterCompany();
        console.log('🔍 Company data received:', companyData);

        // ✅ Check if company exists - show toast and redirect
        if (!companyData || Object.keys(companyData).length === 0 || !companyData._id) {
          console.log('❌ No company found for this recruiter.');
          
          toast.error('⚠️ Please create a company profile first before posting jobs!', {
            duration: 5000,
            position: 'top-right',
          });
          
          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              setTimeout(() => {
                router.replace('/dashboard/recruiter/company');
              }, 1000);
            }
          }
          return;
        }

        // ✅ Set company status
        setCompanyStatus(companyData.status || 'approved');

        let jobsData = [];
        // ✅ Company exists, fetch jobs (only if approved)
        if (companyData.status === 'approved') {
          jobsData = await getMyJobs() || [];
          console.log('🔍 Jobs data received:', jobsData.length, 'jobs');
        } else {
          // ✅ If pending or rejected, set jobs to empty
          jobsData = [];
        }
        
        if (isMounted) {
          setJobs(jobsData);
          
          // ✅ Calculate and set the limit stats
          const userPlan = session?.user?.plan || "recruiter_free";
          const maxJobs = planLimits[userPlan] || planLimits.recruiter_free;
          const totalJobs = jobsData.length;
          
          setStats({
            total: totalJobs,
            max: maxJobs,
            isLimitReached: totalJobs >= maxJobs
          });

          // ✅ Ensure adminRejectionReason is passed to company
          setCompany({
            ...companyData,
            adminRejectionReason: companyData.adminRejectionReason || null
          });
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        if (isMounted) {
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace('/dashboard/recruiter/company');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!isPending) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, isPending, router, isRedirecting]);

  // Show loading state
  if (isPending || loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading your workspace...</p>
        </div>
      </motion.div>
    );
  }

  // If redirecting, return null
  if (isRedirecting) {
    return null;
  }

  // If no session, return null
  if (!session?.user) {
    return null;
  }

  // ✅ If no company (shouldn't happen due to redirect, but just in case)
  if (!company) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[85vh] flex items-center justify-center p-8"
      >
        <div className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Company Required</h3>
          <p className="text-zinc-400 text-sm mb-6">
            You need to set up your company profile before you can post jobs.
          </p>
          <button
            onClick={() => router.push('/dashboard/recruiter/company')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 py-2.5 transition-all"
          >
            Set Up Company
          </button>
        </div>
      </motion.div>
    );
  }

  // ✅ Main render with all conditions properly handled
  return (
    <>
      <Metadata page="recruiter-post-job" />
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <div className="max-w-5xl mx-auto">
          {/* ✅ Show tracker only if company is approved */}
          {companyStatus === 'approved' && (
            <div className="mb-8">
              <RecruiterJobsTracker 
                user={session.user} 
                jobs={jobs} 
                title="Active Job Postings" 
                viewPlansLink="/pricing" 
              />
            </div>
          )}

          {/* ✅ For non-approved companies, show PostJobForm which handles pending/rejected UI */}
          {companyStatus !== 'approved' ? (
            <PostJobForm user={session.user} company={company} />
          ) : (
            /* ✅ For approved companies, check limit */
            stats.isLimitReached ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121214]/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-2xl shadow-red-500/5"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <Zap className="w-10 h-10 text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Job Limit Reached</h2>
                <p className="text-zinc-400 mb-2">
                  You have posted <span className="text-white font-bold">{stats.total}</span> out of your <span className="text-white font-bold">{stats.max}</span> available jobs.
                </p>
                <p className="text-zinc-500 text-sm mb-8">
                  To continue posting new job opportunities, please upgrade your plan.
                </p>
                
                <button
                  onClick={() => router.push('/pricing?tab=recruiter')}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl px-8 py-3 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Upgrade Plan
                </button>
              </motion.div>
            ) : (
              /* ✅ Show form for approved company within limit */
              <PostJobForm user={session.user} company={company} />
            )
          )}
        </div>
      </div>
    </>
  );
}
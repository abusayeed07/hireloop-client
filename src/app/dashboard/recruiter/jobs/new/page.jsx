// src/app/dashboard/recruiter/jobs/new/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import PostJobForm from "./PostJobForm";
import RecruiterJobsTracker from "@/components/recruiter/RecruiterJobsTracker";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getMyJobs } from "@/lib/api/jobs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // ✅ Import toast
import Metadata from "@/components/Metadata";

export default function PostJobPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
          
          // ✅ Show toast message
          toast.error('⚠️ Please create a company profile first before posting jobs!', {
            duration: 5000,
            position: 'top-right',
          });
          
          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              // ✅ Redirect to company profile page after a short delay
              setTimeout(() => {
                router.replace('/dashboard/recruiter/company');
              }, 1000);
            }
          }
          return;
        }

        // ✅ Company exists, fetch jobs
        const jobsData = await getMyJobs() || [];
        console.log('🔍 Jobs data received:', jobsData.length, 'jobs');
        
        if (isMounted) {
          setCompany(companyData);
          setJobs(jobsData);
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

  return (
    <>
      <Metadata page="recruiter-post-job" />
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <RecruiterJobsTracker 
              user={session.user} 
              jobs={jobs} 
              title="Active Job Postings" 
              viewPlansLink="/pricing" 
            />
          </div>
          <PostJobForm user={session.user} company={company} />
        </div>
      </div>
    </>
  );
}
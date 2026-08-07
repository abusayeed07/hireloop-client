// src/app/dashboard/recruiter/jobs/new/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import PostJobForm from "./PostJobForm";
import RecruiterJobsTracker from "@/components/recruiter/RecruiterJobsTracker";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getMyJobs } from "@/lib/api/jobs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
        const companyData = await getLoggedInRecruiterCompany();
        
        if (!companyData || Object.keys(companyData).length === 0) {
          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              router.replace('/dashboard/recruiter/company');
            }
          }
          return;
        }

        const jobsData = await getMyJobs() || [];
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

  if (isRedirecting) {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Metadata page="recruiter-post-job" />
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <RecruiterJobsTracker user={session.user} jobs={jobs} title="Active Job Postings" viewPlansLink="/pricing" />
          </div>
          <PostJobForm user={session.user} company={company} />
        </div>
      </div>
    </>
  );
}
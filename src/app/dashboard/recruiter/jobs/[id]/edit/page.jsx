// src/app/dashboard/recruiter/jobs/[id]/edit/page.jsx
"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getJobById } from "@/lib/api/jobs";
import PostJobForm from "../../../jobs/new/PostJobForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import Metadata from "@/components/Metadata";

export default function EditJobPage({ params }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Unwrap the async params using React.use()
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

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
        // 1. Fetch the Company
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

        // 2. Validate job ID
        if (!jobId || typeof jobId !== 'string') {
          toast.error("Invalid job ID format");
          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              router.replace('/dashboard/recruiter/jobs');
            }
          }
          return;
        }

        // 3. Fetch the specific Job by ID
        const jobData = await getJobById(jobId);
        if (!jobData) {
          toast.error("Job not found");
          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              router.replace('/dashboard/recruiter/jobs');
            }
          }
          return;
        }

        if (isMounted) {
          setCompany(companyData);
          setJob(jobData);
        }
      } catch (error) {
        console.error("❌ Error fetching edit data:", error);
        if (isMounted) {
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace('/dashboard/recruiter/jobs');
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
  }, [session?.user?.id, isPending, jobId, router, isRedirecting]);

  if (isPending || loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-[85vh] flex items-center justify-center bg-zinc-50 dark:bg-[#0d0d0e]"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium tracking-wide">Loading Job Data...</p>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen bg-zinc-50 dark:bg-[#0d0d0e] p-8"
      >
        <div className="max-w-5xl mx-auto">
          
          {/* Header with Back Button */}
          <div className="mb-8 flex items-center gap-4">
            <Link 
              href="/dashboard/recruiter/jobs" 
              className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Manage Jobs</span>
            </Link>
            <div className="h-4 w-px bg-zinc-300/50 dark:bg-zinc-700" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Edit Job Posting</h1>
          </div>

          {/* Render the existing PostJobForm */}
          <div className="border border-zinc-200/50 dark:border-white/5 rounded-2xl p-6 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
            <PostJobForm 
              user={session.user} 
              company={company} 
              initialData={job}
              isEditing={true}
            />
          </div>

        </div>
      </motion.div>
    </>
  );
}
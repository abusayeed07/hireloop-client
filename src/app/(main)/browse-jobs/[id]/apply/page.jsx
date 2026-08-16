// src/app/(main)/browse-jobs/[id]/apply/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getJobById } from "@/lib/api/jobs";
import { Card } from "@heroui/react";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { getPlanById } from "@/lib/api/plans";
import SeekerApplicationTracker from "@/components/seeker/SeekerApplicationTracker";
import JobApplyForm from "./JobApply";
import Link from "next/link";

export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  const { data: session, isPending } = useSession();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || isPending) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        
        const jobData = await getJobById(jobId);
        setJob(jobData);

        const appsRes = await fetch(`${baseUrl}/api/applications`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const appsData = appsRes.ok ? await appsRes.json() : [];
        setApplications(Array.isArray(appsData) ? appsData : []);

        const planId = session?.user?.plan || "seeker_free";
        const planData = await getPlanById(planId);
        setPlan(planData);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, isPending, session?.user?.plan]);

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <Card className="p-8 bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-center max-w-md">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Job Not Found</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">This job listing may have been removed.</p>
          <button onClick={() => router.push("/browse-jobs")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Jobs</button>
        </Card>
      </div>
    );
  }

  const maxApplicationsPerMonth = plan?.maxApplicationsPerMonth ?? 3;
  const planName = plan?.name ?? "Free";
  const hasReachedLimit = applications.length >= maxApplicationsPerMonth;
  const remainingApplications = maxApplicationsPerMonth - applications.length;
  const isPremium = session?.user?.plan === "seeker_premium";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 md:px-8 mt-15">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={() => router.push(`/browse-jobs/${jobId}`)} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Job
        </button>

        {/* Seeker Application Tracker */}
        <div className="mb-6">
          <SeekerApplicationTracker 
            user={session?.user} 
            applications={applications}
            title="Applications This Month"
          />
        </div>

        {/* Plan Upgrade Card - Fixed for theme */}
        {!isPremium && (hasReachedLimit || remainingApplications <= 3) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/10 dark:to-purple-600/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold">
                    {hasReachedLimit ? `You've used all your ${planName} applications` : `${remainingApplications} application${remainingApplications > 1 ? "s" : ""} remaining`}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    {hasReachedLimit ? "Upgrade to a premium plan to apply for more positions" : "Upgrade to unlock more applications and premium features"}
                  </p>
                </div>
              </div>
              <Link
                href="/pricing?tab=recruiter"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4" />
                View Plans
              </Link>
            </div>
          </div>
        )}

        {/* Application Form */}
        {!hasReachedLimit ? (
          <JobApplyForm job={job} applicant={session?.user} />
        ) : (
          <div className="bg-white/80 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-12 text-center backdrop-blur-sm">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Application Limit Reached</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              You've applied to {applications.length} out of {maxApplicationsPerMonth} jobs this month.
              {!isPremium && " Upgrade your plan to continue applying for more positions."}
              {isPremium && " Please wait until next month for more applications."}
            </p>
            {!isPremium && (
              <Link href="/pricing" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                <Zap className="w-4 h-4" />
                Upgrade Plan
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
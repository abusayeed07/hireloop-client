"use client";

import { authClient } from "@/lib/auth-client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Eye,
  Envelope,
  Bookmark,
  ArrowUp,
  ArrowDown,
} from "@gravity-ui/icons";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Activity,
  Sparkles,
  MoreHorizontal,
  MapPin,
  Loader2,
  User,
  Lock,
  Building2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getMyJobs } from "@/lib/api/jobs";
import { getApplicationsByCompany } from "@/lib/api/applications";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import LoadingPage from "@/app/loading";
import toast from "react-hot-toast";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const statsVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Glowing Background Orbs
const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
  </div>
);

// Stat Card Component
const StatCard = ({ stat, index, trend }) => {
  const Icon = stat.icon;
  const isPositive = trend?.positive !== undefined ? trend.positive : true;

  return (
    <motion.div
      variants={statsVariants}
      whileHover={{
        y: -6,
        borderColor: "rgba(59, 130, 246, 0.4)",
        boxShadow: "0 10px 40px -10px rgba(59, 130, 246, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-xl shadow-black/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {stat.title}
            </p>
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="text-3xl font-bold text-white mt-2 tracking-tight"
            >
              {stat.value}
            </motion.p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
            <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={`flex items-center gap-1 text-xs font-medium ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{trend.value}%</span>
            </motion.div>
            <span className="text-xs text-zinc-500">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Recent Activity Item
const ActivityItem = ({ icon: Icon, title, time, type }) => {
  const colors = {
    application: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    interview: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    message: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    status: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  };

  const color = colors[type] || colors.application;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/40 hover:border-zinc-700/60 transition-all duration-300"
    >
      <div className={`p-2 rounded-lg border ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 font-medium truncate">{title}</p>
        <p className="text-xs text-zinc-500">{time}</p>
      </div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
      </motion.div>
    </motion.div>
  );
};

// Recent Application Card
const ApplicationCard = ({ applicant }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        borderColor: "rgba(59, 130, 246, 0.3)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
      className="flex items-center gap-4 p-3 bg-zinc-900/20 rounded-xl border border-zinc-800/40 transition-all duration-300"
    >
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center shrink-0 border border-white/10">
        {applicant.avatar ? (
          <Image
            src={applicant.avatar}
            alt={applicant.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">
            {applicant.name?.charAt(0) || "?"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">
            {applicant.name || "Unknown Applicant"}
          </p>
          {applicant.isNew && (
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
              New
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 truncate">{applicant.position || "Position"}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {applicant.appliedDate || "N/A"}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {applicant.location || "N/A"}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
            applicant.status === "reviewing"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
              : applicant.status === "shortlisted"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
              : applicant.status === "rejected"
              ? "bg-red-500/20 text-red-400 border border-red-500/20"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
          }`}
        >
          {applicant.status || "Pending"}
        </span>
      </div>
    </motion.div>
  );
};

// ✅ Company Rejected Component
const CompanyRejected = ({ company, onRefresh }) => {
  const router = useRouter();

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.05, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-gradient-to-br from-[#1a0d0d] via-[#1a0f0f] to-[#0d0d0e] border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-500/10">
          {/* Animated Warning Icon */}
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <XCircle size={48} className="text-red-400" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Company Rejected</h2>
            <p className="text-zinc-400 text-sm">
              Your company profile has been rejected by the admin.
            </p>
          </div>

          {/* Rejection Reason */}
          {company.adminRejectionReason && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">
                <span className="font-semibold">Reason:</span>{" "}
                {company.adminRejectionReason}
              </p>
            </div>
          )}

          {/* Company Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Company Name</p>
              <p className="text-sm font-medium text-zinc-200 truncate">
                {company.name}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm font-medium text-red-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Rejected
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Submitted</p>
              <p className="text-sm font-medium text-zinc-200">
                {company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Last Updated</p>
              <p className="text-sm font-medium text-zinc-200">
                {company.updatedAt
                  ? new Date(company.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* What to do next */}
          <div className="mt-6 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              What to do next?
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                Review the rejection reason above
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                Update your company information based on the feedback
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                Request a re-review once you've made the changes
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <button
                onClick={() => router.push('/dashboard/recruiter/company')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Building2 size={16} />
                Update Company Info
              </button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <button
                onClick={async () => {
                  try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
                    const response = await fetch(
                      `${baseUrl}/api/companies/${company._id}/request-re-review`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          message: "I have updated the company information. Please review again.",
                        }),
                      }
                    );
                    const result = await response.json();
                    if (result.success) {
                      toast.success("Re-review request sent! Admin will review your company.");
                      setTimeout(() => {
                        if (onRefresh) onRefresh();
                      }, 1500);
                    } else {
                      toast.error(result.error || "Failed to send request");
                    }
                  } catch (error) {
                    console.error("Error requesting re-review:", error);
                    toast.error("Something went wrong. Please try again.");
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-4 py-3 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                Request Re-Review
              </button>
            </motion.div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-zinc-600">
              Need help? Contact our support team at support@hireloop.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ✅ Company Pending Component
const CompanyPending = ({ company }) => {
  const router = useRouter();

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] flex items-center justify-center p-8 relative overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-gradient-to-br from-[#1a1a0d] via-[#1a1a0f] to-[#0d0d0e] border border-yellow-500/30 rounded-3xl p-8 shadow-2xl shadow-yellow-500/10 text-center">
          {/* Animated Loading Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full mx-auto mb-6"
          />

          <h2 className="text-3xl font-bold text-white mb-2">Company Pending Approval</h2>
          <p className="text-zinc-400 text-sm">
            Your company profile is currently under review by our admin team.
          </p>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-400 flex items-center justify-center gap-2">
              <Clock size={16} />
              <span>Estimated review time: 24-48 hours</span>
            </p>
          </div>

          <div className="mt-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => router.push('/dashboard/recruiter/company')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl px-6 py-3 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Building2 size={16} />
                View Company Profile
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    activeJobs: 0,
    closedJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [company, setCompany] = useState(null);
  const [companyStatus, setCompanyStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Redirect if no session
  useEffect(() => {
    if (mounted && !isPending && !session?.user) {
      router.push('/signin?redirect=/dashboard/recruiter');
    }
  }, [mounted, isPending, session, router]);

  const fetchData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // ✅ Fetch company first
      const companyData = await getLoggedInRecruiterCompany();
      setCompany(companyData);

      if (!companyData || Object.keys(companyData).length === 0) {
        setCompanyStatus('no-company');
        setLoading(false);
        return;
      }

      // ✅ Check company status
      if (companyData.status === 'rejected' || companyData.status === 'pending') {
        setCompanyStatus(companyData.status);
        // ✅ Reset stats to zero
        setStats({ totalJobs: 0, totalApplicants: 0, activeJobs: 0, closedJobs: 0 });
        setRecentApplications([]);
        setRecentActivities([]);
        setLoading(false);
        return;
      }

      // ✅ Only fetch jobs if company is approved
      setCompanyStatus('approved');
      
      const jobs = await getMyJobs();
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter((j) => j.status === "active").length || 0;
      const closedJobs = jobs?.filter((j) => j.status === "inactive" || j.status === "closed").length || 0;

      const allApplications = companyData?._id 
          ? await getApplicationsByCompany(companyData._id) 
          : [];

      const totalApplicants = allApplications?.length || 0;

      setStats({
        totalJobs,
        totalApplicants,
        activeJobs,
        closedJobs,
      });

      const recentApps = (allApplications || []).slice(0, 4).map((app) => ({
        id: app._id,
        name: app.applicantName || app.fullName || "Unknown",
        position: app.jobTitle || "Position",
        appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
        location: app.location || "N/A",
        status: app.status || "pending",
        isNew: true, 
        avatar: app.avatar || null,
      }));
      setRecentApplications(recentApps);

      const activities = [];
      if (recentApps.length > 0) {
        activities.push({
          icon: Envelope,
          title: `New application from ${recentApps[0].name} - ${recentApps[0].position}`,
          time: "Just now",
          type: "application",
        });
      }
      if (activeJobs > 0) {
        activities.push({
          icon: CheckCircle2,
          title: `You have ${activeJobs} active job posting${activeJobs > 1 ? 's' : ''}`,
          time: "Ongoing",
          type: "status",
        });
      }
      if (totalJobs > 0) {
        activities.push({
          icon: Briefcase,
          title: `You've posted ${totalJobs} job${totalJobs > 1 ? 's' : ''} in total`,
          time: "All time",
          type: "status",
        });
      }
      if (activities.length === 0) {
        activities.push({
          icon: Activity,
          title: "Start posting jobs to see your activity here.",
          time: "Get started",
          type: "message",
        });
      }
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // ✅ Show loading while checking session
  if (!mounted || isPending) {
    return (
      <LoadingPage 
        title="Loading Dashboard"
        message="Verifying your session..."
        customStats={[
          { icon: Lock, label: "Checking authentication", animate: "spin" },
          { icon: User, label: "Loading profile", animate: "pulse" },
          { icon: Briefcase, label: "Preparing dashboard", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-400 to-teal-400"
      />
    );
  }

  // ✅ If no session, return null
  if (!session?.user) {
    return null;
  }

  // ✅ Show loading while fetching data
  if (loading) {
    return (
      <LoadingPage 
        title="Loading Dashboard"
        message="Fetching your recruiter data..."
        customStats={[
          { icon: Briefcase, label: "Loading jobs", animate: "spin" },
          { icon: Users, label: "Loading applicants", animate: "pulse" },
          { icon: Sparkles, label: "Preparing insights", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-400 to-teal-400"
      />
    );
  }

  // ✅ Company Pending
  if (companyStatus === 'pending' && company) {
    return <CompanyPending company={company} />;
  }

  // ✅ Company Rejected
  if (companyStatus === 'rejected' && company) {
    return <CompanyRejected company={company} onRefresh={handleRefresh} />;
  }

  // ✅ No Company
  if (companyStatus === 'no-company') {
    return (
      <div className="min-h-[85vh] bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={40} className="text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Company Found</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Please set up your company profile to start posting jobs and managing applications.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => router.push('/dashboard/recruiter/company')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 py-3 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 mx-auto"
            >
              <Building2 size={18} />
              Set Up Company
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ✅ Company Approved - Show full dashboard
  // This will ONLY render when companyStatus === 'approved'
  const user = session?.user;

  const recruiterStats = [
    {
      title: "Total Job Posts",
      value: stats.totalJobs.toLocaleString(),
      icon: Briefcase,
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants.toLocaleString(),
      icon: Users,
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: Eye,
    },
    {
      title: "Jobs Closed",
      value: stats.closedJobs,
      icon: Bookmark,
    },
  ];

  const trends = [
    { positive: true, value: 12 },
    { positive: true, value: 8 },
    { positive: false, value: 3 },
    { positive: true, value: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white relative overflow-hidden pt-20">
      <BackgroundOrbs />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6"
      >
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Welcome back, {user?.name || "Recruiter"}
              </h2>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, delay: 1 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </motion.div>
            <p className="text-zinc-400 text-sm mt-1">
              Here's an overview of your job posting performance and recent activity.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl border border-zinc-700/50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <Briefcase className="w-4 h-4" />
              Post New Job
            </Link>
          </motion.div>
        </motion.div>

        {/* ✅ Stats Grid - ONLY shown when company is approved */}
        {/* Since we already returned early for rejected/pending/no-company, 
            this code only runs when companyStatus === 'approved' */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        >
          {recruiterStats.map((stat, index) => (
            <StatCard
              key={stat.title}
              stat={stat}
              index={index}
              trend={trends[index]}
            />
          ))}
        </motion.div>

        {/* Recent Activity & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-xl shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Recent Activity
              </h3>
              <Link
                href="/dashboard/recruiter/jobs"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-xl shadow-black/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Recent Applications
              </h3>
              <Link
                href="/dashboard/recruiter/applications"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {recentApplications.map((applicant) => (
                  <ApplicationCard key={applicant.id} applicant={applicant} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getMyJobs } from "@/lib/api/jobs";
import { getApplicationsByCompany } from "@/lib/api/applications";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import LoadingPage from "@/app/loading";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      try {
        const jobs = await getMyJobs();
        const company = await getLoggedInRecruiterCompany(); 

        const totalJobs = jobs?.length || 0;
        const activeJobs = jobs?.filter((j) => j.status === "active").length || 0;
        const closedJobs = jobs?.filter((j) => j.status === "inactive" || j.status === "closed").length || 0;

        const allApplications = company?._id 
            ? await getApplicationsByCompany(company._id) 
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
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  // ✅ Show loading while checking session - FIXED with proper icons
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

  // ✅ If no session, return null (redirect will happen in useEffect)
  if (!session?.user) {
    return null;
  }

  // ✅ Show loading while fetching data - FIXED with proper icons
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
          >
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <Briefcase className="w-4 h-4" />
              Post New Job
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
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
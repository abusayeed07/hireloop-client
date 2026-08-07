// frontend/src/app/dashboard/seeker/page.jsx
"use client";

import { authClient } from "@/lib/auth-client";
import React, { useState, useEffect, useMemo } from "react";
import { Briefcase, Envelope, Bookmark, Clock } from "@gravity-ui/icons";
import {
  Search,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Bell,
  TrendingUp,
  Loader2,
  ArrowRight,
  FileText,
  Calendar,
  Building2,
  UserCircle,
  Sparkles,
  User,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getApplicationsByApplicant } from "@/lib/api/applications";
import { getJobs } from "@/lib/api/jobs";
import { getSavedJobs } from "@/lib/api/jobs";
import Pagination from "@/components/Pagination";
import LoadingPage from "@/app/loading";
import toast from "react-hot-toast";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

const statsVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
};

// 🎨 Chart Colors
const CHART_COLORS = {
  savedJobs: "#3b82f6",
  applications: "#22c55e",
  interviews: "#eab308",
  offers: "#8b5cf6",
};

const SeekerDashboardPage = () => {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  
  // State for dynamic data
  const [stats, setStats] = useState({
    savedJobs: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
  });
  const [applications, setApplications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState({
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    rejected: 0,
    offered: 0,
  });

  // Pagination State
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 3;

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Chart data for the 4 stats - like admin dashboard
  const statsChartData = useMemo(() => {
    const data = [
      { name: "Saved Jobs", value: stats.savedJobs, color: CHART_COLORS.savedJobs },
      { name: "Applications", value: stats.applications, color: CHART_COLORS.applications },
      { name: "Interviews", value: stats.interviews, color: CHART_COLORS.interviews },
      { name: "Offers", value: stats.offers, color: CHART_COLORS.offers },
    ];
    return data;
  }, [stats]);

  const statsChartDataWithValues = useMemo(() => {
    return statsChartData.filter(item => item.value > 0);
  }, [statsChartData]);

  const hasStatsData = useMemo(() => statsChartDataWithValues.length > 0, [statsChartDataWithValues]);

  // Application status chart data
  const chartData = useMemo(() => {
    const data = [
      { name: "Applied", value: applicationStatus.applied, color: "#3b82f6" },
      { name: "Under Review", value: applicationStatus.underReview, color: "#eab308" },
      { name: "Shortlisted", value: applicationStatus.shortlisted, color: "#8b5cf6" },
      { name: "Rejected", value: applicationStatus.rejected, color: "#ef4444" },
      { name: "Offered", value: applicationStatus.offered, color: "#22c55e" },
    ];
    return data;
  }, [applicationStatus]);

  const chartDataWithValues = useMemo(() => {
    return chartData.filter(item => item.value > 0);
  }, [chartData]);

  const hasData = useMemo(() => chartDataWithValues.length > 0, [chartDataWithValues]);

  // 🔍 DEBUG: Track applicationStatus changes
  useEffect(() => {
    console.log('🔍 DEBUG - applicationStatus updated:', applicationStatus);
    console.log('🔍 DEBUG - Total applications:', Object.values(applicationStatus).reduce((a, b) => a + b, 0));
  }, [applicationStatus]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Verify session and redirect if needed
  useEffect(() => {
    if (mounted && !isPending) {
      if (error) {
        console.error('Session error:', error);
        setSessionError(true);
        toast.error('Session error. Please sign in again.');
        router.push('/signin?redirect=/dashboard/seeker');
        return;
      }
      
      if (!session?.user) {
        console.log('No session found, redirecting to signin');
        router.push('/signin?redirect=/dashboard/seeker');
      } else {
        console.log('✅ Session found for user:', session.user.email);
        setSessionError(false);
      }
    }
  }, [mounted, isPending, session, error, router]);

  // ✅ Fetch real data
  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session, session?.user?.id]);

  // ✅ Function to refresh session
  const refreshSession = async () => {
    try {
      const newSession = await authClient.getSession();
      console.log('🔄 Session refreshed:', newSession);
      return newSession;
    } catch (err) {
      console.error('❌ Failed to refresh session:', err);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const freshSession = await refreshSession();
      const userId = freshSession?.user?.id || session?.user?.id;
      
      if (!userId) {
        console.error('❌ No user ID found');
        router.push('/signin?redirect=/dashboard/seeker');
        setLoading(false);
        return;
      }

      console.log('🔍 DEBUG - Fetching data for userId:', userId);

      const [apps, jobs, saved] = await Promise.all([
        getApplicationsByApplicant(userId), 
        getJobs(),
        getSavedJobs(userId)
      ]);

      let applicationsData = [];
      if (apps && typeof apps === 'object') {
        if (Array.isArray(apps)) {
          applicationsData = apps;
        } else if (apps.data && Array.isArray(apps.data)) {
          applicationsData = apps.data;
        } else {
          const values = Object.values(apps);
          if (values.length > 0 && typeof values[0] === 'object') {
            applicationsData = values;
          }
        }
      }

      console.log('🔍 DEBUG - applicationsData length:', applicationsData.length);
      console.log('🔍 DEBUG - applicationsData sample:', applicationsData.slice(0, 2));

      const jobsData = Array.isArray(jobs) ? jobs : [];
      const savedJobsData = Array.isArray(saved) ? saved : [];

      setApplications([...applicationsData]);
      setAllJobs([...jobsData]);

      const submitted = applicationsData.filter(
        (app) => app.status === "pending" || app.status === "applied" || app.status === "submitted"
      ).length;
      
      const interviews = applicationsData.filter(
        (app) => app.status === "interview" || app.status === "under_review"
      ).length;

      const offers = applicationsData.filter(
        (app) => app.status === "offered" || app.status === "hired"
      ).length;

      setStats({
        savedJobs: savedJobsData.length,
        applications: submitted,
        interviews: interviews,
        offers: offers,
      });

      const statusCounts = {
        applied: applicationsData.filter(app => 
          app.status === "applied" || app.status === "pending" || app.status === "submitted"
        ).length,
        underReview: applicationsData.filter(app => 
          app.status === "under_review" || app.status === "reviewing"
        ).length,
        shortlisted: applicationsData.filter(app => 
          app.status === "shortlisted"
        ).length,
        rejected: applicationsData.filter(app => 
          app.status === "rejected"
        ).length,
        offered: applicationsData.filter(app => 
          app.status === "offered" || app.status === "hired"
        ).length,
      };

      console.log('🔍 DEBUG - statusCounts calculated:', statusCounts);
      setApplicationStatus(statusCounts);

      const activities = generateRecentActivity(applicationsData);
      setRecentActivity([...activities]);
      
      setActivityPage(1);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      toast.error('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // 📋 Helper: Create Activity Feed
  const generateRecentActivity = (apps) => {
    const activities = [];
    
    apps.slice(0, 20).forEach((app) => {
      if (app.status) {
        const statusMessages = {
          applied: `Application for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'} submitted`,
          under_review: `Application for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'} updated to 'Under Review'`,
          shortlisted: `You've been shortlisted for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'}`,
          interview: `Interview scheduled for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'}`,
          rejected: `Application for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'} was not selected`,
          offered: `You received an offer from ${app.companyName || 'Company'} for "${app.jobTitle || 'Position'}"! 🎉`,
        };
        
        const message = statusMessages[app.status.toLowerCase()] || 
          `Application for "${app.jobTitle || 'Position'}" at ${app.companyName || 'Company'} updated to ${app.status}`;
        
        activities.push({
          id: `app-${app.id || app._id}`,
          title: message,
          time: app.updatedAt || app.createdAt ? 
            timeAgo(new Date(app.updatedAt || app.createdAt)) : 
            "Recently",
          type: "application",
          status: app.status,
        });
      }
    });

    activities.sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeB - timeA;
    });

    if (activities.length === 0) {
      activities.push({
        id: "empty-1",
        title: "Start applying to jobs to see your activity here!",
        time: "Just now",
        type: "alert",
      });
    }
    return activities;
  };

  // ⏱️ Helper: Time ago formatter
  const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // 🎨 Helper: Status Colors & Icons
  const getStatusConfig = (status) => {
    const configs = {
      applied: { color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: <Clock className="w-3 h-3" /> },
      submitted: { color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: <Clock className="w-3 h-3" /> },
      pending: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
      under_review: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: <MessageSquare className="w-3 h-3" /> },
      reviewing: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: <MessageSquare className="w-3 h-3" /> },
      shortlisted: { color: "text-purple-400 bg-purple-500/10 border-purple-500/30", icon: <Star className="w-3 h-3" /> },
      rejected: { color: "text-red-400 bg-red-500/10 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
      offered: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle className="w-3 h-3" /> },
      hired: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle className="w-3 h-3" /> },
      interview: { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", icon: <Envelope className="w-3 h-3" /> },
      saved: { color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: <Bookmark className="w-3 h-3" /> },
    };
    return configs[status?.toLowerCase()] || configs.applied;
  };

  const formatStatus = (status) => {
    if (!status) return "Applied";
    return status.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  // ✅ Pagination Calculations
  const totalActivities = recentActivity.length;
  const totalActivityPages = Math.ceil(totalActivities / activitiesPerPage);
  const startIndex = (activityPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = recentActivity.slice(startIndex, endIndex);

  const user = session?.user;
  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || "A";

  // ✅ Show loading while checking session - AFTER ALL HOOKS ARE CALLED
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

  if (!session?.user || sessionError) {
    return null;
  }

  if (loading) {
    return (
      <LoadingPage 
        title="Loading Dashboard"
        message="Fetching your personalized dashboard data..."
        customStats={[
          { icon: Briefcase, label: "Loading applications", animate: "spin" },
          { icon: UserCircle, label: "Loading profile", animate: "pulse" },
          { icon: Sparkles, label: "Preparing insights", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-400 to-teal-400"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 🔍 Search Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 pt-15"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for your next career opportunity..."
              className="w-full pl-12 pr-4 py-4 bg-[#111214] border border-white/5 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-lg shadow-black/20"
              onClick={() => router.push("/browse-jobs")}
              readOnly
            />
          </div>
        </motion.div>

        {/* 📊 Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Saved Jobs", value: stats.savedJobs, icon: <Bookmark className="w-5 h-5" />, color: "blue" },
            { label: "Applications Submitted", value: stats.applications, icon: <Briefcase className="w-5 h-5" />, color: "emerald" },
            { label: "Interviews Scheduled", value: stats.interviews, icon: <Envelope className="w-5 h-5" />, color: "yellow" },
            { label: "Offers Received", value: stats.offers, icon: <Star className="w-5 h-5" />, color: "purple" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statsVariants}
              whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.2)" }}
              className="bg-[#111214] border border-white/5 rounded-2xl p-5 hover:shadow-lg hover:shadow-black/40 transition-all cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
                  <motion.p 
                    key={stat.value}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white mt-1"
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/20`}>
                  <span className={`text-${stat.color}-400`}>{stat.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 📊 Stats Overview Chart - Like Admin Dashboard (Single Chart with 4 bars) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-[#111214] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Dashboard Overview
              </h3>
              <span className="text-xs text-zinc-500">
                {stats.savedJobs + stats.applications + stats.interviews + stats.offers} total activities
              </span>
            </div>
            
            {/* Single Chart - Like Admin Dashboard Job Posts by Category */}
            <div className="w-full" style={{ height: '220px' }}>
              {hasStatsData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsChartDataWithValues}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2128" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      }}
                      formatter={(value) => [`${value}`, "Count"]}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {statsChartDataWithValues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 🎯 Application Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-[#111214] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Application Status
              </h3>
              <span className="text-xs text-zinc-500">
                Total: {Object.values(applicationStatus).reduce((a, b) => a + b, 0)} applications
              </span>
            </div>
            
            {/* Application Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Applied", value: applicationStatus.applied, color: "blue" },
                { label: "Under Review", value: applicationStatus.underReview, color: "yellow" },
                { label: "Shortlisted", value: applicationStatus.shortlisted, color: "purple" },
                { label: "Rejected", value: applicationStatus.rejected, color: "red" },
                { label: "Offered", value: applicationStatus.offered, color: "emerald" },
              ].map((status, idx) => {
                const colorMap = {
                  blue: "border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10",
                  yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10",
                  purple: "border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10",
                  red: "border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10",
                  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10",
                };

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.8, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`p-3 rounded-xl border ${colorMap[status.color]} text-center transition-all cursor-default`}
                  >
                    <span className="text-lg font-bold">{status.value}</span>
                    <p className="text-[10px] uppercase tracking-wider opacity-70">{status.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 📝 Recent Applications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Recent Applications 
                <span className="text-sm font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5">
                  {applications.length}
                </span>
              </h2>
            </div>
            <button 
              onClick={() => router.push("/dashboard/seeker/applications")} 
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 bg-[#111214] border border-white/5 rounded-xl text-center">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">You haven't applied to any jobs yet.</p>
              <button 
                onClick={() => router.push("/browse-jobs")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {applications.slice(0, 3).map((app, idx) => (
                <motion.div
                  key={app._id || idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="p-4 bg-[#111214] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => router.push("/dashboard/seeker/applications")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white truncate">{app.jobTitle || "Job Title"}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusConfig(app.status).color}`}>
                      {formatStatus(app.status)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> {app.companyName || "Company"}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-2">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 👤 Profile & Activity Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-[#111214] border border-white/5 rounded-2xl p-6 shadow-lg h-full">
              <div className="flex flex-col items-center text-center border-b border-white/5 pb-6">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 overflow-hidden shadow-lg shadow-blue-500/20">
                  {user?.image ? (
                    <Image src={user.image} alt={user.name || "User"} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                  <div className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#111214]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{user?.name || "Welcome back!"}</h3>
                <p className="text-sm text-zinc-400">{user?.email || "user@example.com"}</p>
                <button
                  onClick={() => router.push("/profile")}
                  className="mt-4 px-5 py-2 bg-zinc-800/50 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/5 hover:border-white/10"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-[#111214] border border-white/5 rounded-2xl p-6 shadow-lg h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-zinc-400" />
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {recentActivity.length}
                  </span>
                </div>
                <button
                  onClick={() => router.push("/dashboard/seeker/applications")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {currentActivities.length === 1 && currentActivities[0].id === "empty-1" ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium">No recent activity</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {currentActivities.map((activity, idx) => (
                      <motion.div
                        key={activity.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.03)" }}
                        className="flex items-start gap-3 p-4 bg-zinc-800/10 rounded-xl hover:border-white/5 border border-transparent transition-all cursor-pointer"
                        onClick={() => router.push("/dashboard/seeker/applications")}
                      >
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          activity.type === 'application' ? 'bg-blue-500/10 text-blue-400' : 
                          activity.status === 'offered' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {activity.status === 'offered' ? <Star className="w-4 h-4" /> :
                           activity.type === "application" ? <Briefcase className="w-4 h-4" /> : 
                           <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-snug">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-zinc-500">{activity.time}</span>
                            {activity.status && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusConfig(activity.status).color}`}>
                                  {formatStatus(activity.status)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {totalActivityPages > 1 && (
                <div className="pt-6 mt-4 border-t border-white/5 flex justify-center">
                  <Pagination
                    currentPage={activityPage}
                    totalPages={totalActivityPages}
                    onPageChange={setActivityPage}
                    size="md"
                    color="primary"
                    showTotal={false}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SeekerDashboardPage;
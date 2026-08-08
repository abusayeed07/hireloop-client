"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bell,
  Mail,
  Download,
  Briefcase,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  Building2,
  ChevronRight,
  FolderArchive,
  Sparkles,
  FileSearch,
  Filter,
  X,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@heroui/react";
import { ArrowDownToSquare } from "@gravity-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { getMyApplications } from "@/lib/api/applications";
import { authClient } from "@/lib/auth-client";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import LoadingPage from "@/app/loading";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

const statsVariants = {
  hidden: { scale: 0.9, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

const ApplicationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams?.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams?.get("status") || "",
    jobType: searchParams?.get("jobType") || "",
    dateRange: searchParams?.get("dateRange") || "",
  });

  const [currentTab, setCurrentTab] = useState(searchParams?.get("tab") || "active");
  const tab = currentTab;

  const page = parseInt(searchParams?.get("page")) || 1;
  const itemsPerPage = 5;

  // ✅ NEW: State for notes modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications();
        console.log("📋 Fetched applications:", data);
        
        const sortedData = (data || []).sort((a, b) => {
          const dateA = new Date(a.appliedAt || a.createdAt || 0);
          const dateB = new Date(b.appliedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        
        setApplications(sortedData);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Enhanced filtering logic
  const filteredApplications = useMemo(() => {
    let result = applications || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((app) => {
        const searchableFields = [
          app.jobTitle,
          app.companyName,
          app.jobType,
          app.location,
          app.jobCategory,
          app.status,
          app.description,
        ].filter(Boolean);
        
        if (app.skills) {
          if (Array.isArray(app.skills)) {
            searchableFields.push(app.skills.join(" "));
          } else if (typeof app.skills === "string") {
            searchableFields.push(app.skills);
          }
        }
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(query)
        );
      });
    }

    if (filters.status) {
      result = result.filter((app) => 
        app.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.jobType) {
      result = result.filter((app) => 
        app.jobType?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      result = result.filter((app) => {
        const appDate = new Date(app.appliedAt || app.createdAt);
        return appDate >= cutoff;
      });
    }

    const archivedStatuses = ["rejected", "closed", "withdrawn"];
    if (tab === "archived") {
      result = result.filter((app) => 
        archivedStatuses.includes(app.status?.toLowerCase())
      );
    } else {
      result = result.filter((app) => 
        !archivedStatuses.includes(app.status?.toLowerCase())
      );
    }

    return result;
  }, [applications, searchQuery, filters, tab]);

  // Calculate pagination
  const totalItems = filteredApplications?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredApplications?.slice(startIndex, endIndex) || [];

  // Stats calculations
  const totalApplied = applications?.length || 0;
  const pending = applications?.filter(
    (item) => item.status === "pending" || item.status === "applied"
  ).length || 0;
  const rejected = applications?.filter(
    (item) => item.status === "rejected"
  ).length || 0;
  const successRate = totalApplied === 0 ? 0 : Math.round(((totalApplied - rejected) / totalApplied) * 100);

  // Helper functions
  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
      applied: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
      review: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      reviewed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      shortlisted: "bg-green-500/15 text-green-400 border-green-500/20",
      interview: "bg-purple-500/15 text-purple-400 border-purple-500/20",
      interviewing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
      accepted: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
      offered: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
      rejected: "bg-red-500/15 text-red-400 border-red-500/20",
      hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const getStatusBadge = (status) => {
    if (status === "success" || status === "hired" || status === "accepted" || status === "offered") {
      return {
        label: "Success",
        icon: <CheckCircle2 className="w-3 h-3" />,
        color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      };
    } else if (status === "rejected") {
      return {
        label: "Rejected",
        icon: <XCircle className="w-3 h-3" />,
        color: "bg-red-500/15 text-red-400 border-red-500/20"
      };
    } else if (status === "shortlisted") {
      return {
        label: "Shortlisted",
        icon: <CheckCircle2 className="w-3 h-3" />,
        color: "bg-green-500/15 text-green-400 border-green-500/20"
      };
    } else if (status === "review" || status === "reviewed") {
      return {
        label: "Under Review",
        icon: <Clock className="w-3 h-3" />,
        color: "bg-blue-500/15 text-blue-400 border-blue-500/20"
      };
    } else if (status === "interview" || status === "interviewing") {
      return {
        label: "Interview",
        icon: <CalendarDays className="w-3 h-3" />,
        color: "bg-purple-500/15 text-purple-400 border-purple-500/20"
      };
    } else {
      return {
        label: "Pending",
        icon: <Clock className="w-3 h-3" />,
        color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build URL with all params
  const buildUrl = (newParams) => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("search", searchQuery);
    if (filters.status) params.set("status", filters.status);
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.dateRange) params.set("dateRange", filters.dateRange);
    if (tab) params.set("tab", tab);
    if (newParams.page) params.set("page", newParams.page);
    
    return `/dashboard/seeker/applications?${params.toString()}`;
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(searchInput);
    const url = buildUrl({ page: 1 });
    router.push(url);
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (value === "") {
      setSearchQuery("");
      const url = buildUrl({ page: 1 });
      router.push(url);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      jobType: "",
      dateRange: "",
    });
    setSearchQuery("");
    setSearchInput("");
    const url = buildUrl({ page: 1 });
    router.push(url);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const url = buildUrl({ page: 1 });
    router.push(url);
  };

  const handlePageChange = (newPage) => {
    const url = buildUrl({ page: newPage });
    router.push(url);
  };

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    const url = buildUrl({ tab: newTab, page: 1 });
    router.push(url);
  };

  const handleViewJobDetails = (application) => {
    const jobId = application?.jobId || 
                  application?.job_id || 
                  application?.job?._id || 
                  application?.job?.id ||
                  application?.jobID;
    
    if (jobId) {
      router.push(`/browse-jobs/${jobId}`);
    } else {
      toast.error("Job ID not found for this application");
    }
  };

  // ✅ NEW: Handle opening notes modal
  const handleOpenNotes = (application) => {
    setSelectedApplication(application);
    setShowNotesModal(true);
  };

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set();
    applications?.forEach(app => {
      if (app.status) statuses.add(app.status);
    });
    return Array.from(statuses);
  }, [applications]);

  // Get unique job types for filter
  const uniqueJobTypes = useMemo(() => {
    const types = new Set();
    applications?.forEach(app => {
      if (app.jobType) types.add(app.jobType);
    });
    return Array.from(types);
  }, [applications]);

  if (loading) {
    return (
      <LoadingPage 
        title="Loading Applications"
        message="Fetching your application history..."
        customStats={[
          { icon: Briefcase, label: "Loading applications", animate: "spin" },
          { icon: TrendingUp, label: "Calculating stats", animate: "pulse" },
          { icon: Sparkles, label: "Preparing insights", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-xl sticky top-0 z-20 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="w-full max-w-sm relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors z-10" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, company, skills..."
              className="w-full bg-[#111214] border border-white/5 rounded-xl pl-10 pr-20 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all relative z-10 shadow-lg shadow-black/20"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    const url = buildUrl({ page: 1 });
                    router.push(url);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${
                  Object.values(filters).some(f => f) 
                    ? "text-cyan-400 bg-cyan-500/10" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="p-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white transition-all"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <Mail className="w-5 h-5" />
            </motion.button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden relative shrink-0 shadow-lg shadow-cyan-500/20">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user?.name || "Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4 bg-[#0a0b0d]/50">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Status:</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="bg-[#111214] border border-white/5 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Type:</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange("jobType", e.target.value)}
                    className="bg-[#111214] border border-white/5 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Types</option>
                    {uniqueJobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Date:</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                    className="bg-[#111214] border border-white/5 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 3 Months</option>
                  </select>
                </div>

                {(searchQuery || Object.values(filters).some(f => f)) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                )}

                <span className="text-xs text-zinc-500 ml-auto">
                  {totalItems} result{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              My Applications
              <span className="text-sm font-medium text-zinc-400 bg-zinc-800/50 border border-white/5 px-3 py-1 rounded-full">
                {totalApplied}
              </span>
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Track your job applications and interview progress in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative bg-[#111214] border border-white/5 rounded-xl p-1 flex gap-1 shadow-lg shadow-black/20">
              <button
                onClick={() => handleTabChange("active")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  tab === "active"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/25"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleTabChange("archived")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  tab === "archived"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/25"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Archived
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl py-2.5 shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 transition-all font-medium"
              >
                <ArrowDownToSquare className="w-4 h-4" /> Export PDF
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid - Updated: Total Applied, Pending, Rejected, Success Rate */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Total Applied",
              value: totalApplied,
              icon: Briefcase,
              color: "cyan",
            },
            {
              label: "Pending",
              value: pending,
              icon: Clock,
              color: "yellow",
            },
            {
              label: "Rejected",
              value: rejected,
              icon: XCircle,
              color: "red",
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              icon: TrendingUp,
              color: "emerald",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={statsVariants}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(255,255,255,0.1)",
                  boxShadow: `0 10px 30px -10px rgba(6, 182, 212, 0.1)`,
                }}
                className="bg-[#111214] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center border border-${stat.color}-500/20`}
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111214] border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
        >
          {totalItems === 0 ? (
            <div className="py-24 text-center relative overflow-hidden">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-10 -left-10 text-zinc-800/30"
              >
                <FolderArchive className="w-32 h-32 fill-current" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -bottom-10 -right-10 text-zinc-800/30"
              >
                <Briefcase className="w-32 h-32 fill-current" />
              </motion.div>

              {tab === "archived" ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10"
                >
                  <div className="w-20 h-20 bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 backdrop-blur-sm">
                    <FolderArchive className="w-10 h-10 text-zinc-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Archive is Empty
                  </h2>
                  <p className="text-zinc-400 max-w-sm mx-auto text-sm">
                    Applications only appear here if their current tracking
                    status is updated to rejected or closed.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10"
                >
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                    <FileSearch className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No Active Applications
                  </h2>
                  <p className="text-zinc-400 max-w-sm mx-auto text-sm mb-6">
                    You haven't applied to any jobs yet or your filters returned
                    no hits.
                  </p>
                  <Link href="/browse-jobs">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        color="primary"
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-600/20"
                      >
                        Browse Jobs
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#0a0b0d] border-b border-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="text-left px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="text-left px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="text-left px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {currentItems.map((application, index) => {
                        const logoUrl =
                          application.logo ||
                          application.companyLogo ||
                          application.company?.logo ||
                          application.companyImage ||
                          application.image;

                        const badge = getStatusBadge(application.status);

                        return (
                          <motion.tr
                            key={application._id || index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{
                              backgroundColor: "rgba(255,255,255,0.02)",
                            }}
                            className="transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800/30 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 relative">
                                  {logoUrl ? (
                                    <Image
                                      src={logoUrl}
                                      alt={
                                        application.companyName ||
                                        "Company logo"
                                      }
                                      className="w-full h-full object-contain p-1"
                                      width={40}
                                      height={40}
                                      unoptimized
                                    />
                                  ) : (
                                    <Building2 className="w-5 h-5 text-zinc-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                                    {application.jobTitle ||
                                      "Untitled Position"}
                                  </div>
                                  <div className="text-sm text-zinc-500 flex items-center gap-2 mt-0.5">
                                    <span>
                                      {application.jobType || "Full-time"}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span>
                                      {application.location || "Remote"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-white font-medium">
                                {application.companyName ||
                                  application.name ||
                                  "Unknown Company"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-white text-sm">
                                {formatDate(
                                  application.appliedAt ||
                                    application.createdAt,
                                )}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${badge.color}`}
                                >
                                  {badge.icon}
                                  {badge.label}
                                </span>
                                {/* ✅ NEW: Show recruiter notes if they exist */}
                                {application.recruiterNotes && (
                                  <button
                                    onClick={() => handleOpenNotes(application)}
                                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors hover:underline w-fit"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Note from recruiter</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewJobDetails(application)}
                                className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                              >
                                <span>View Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="px-6 py-5 border-t border-white/5 flex justify-center"
                >
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    size="md"
                    color="primary"
                    showTotal={true}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* ✅ NEW: Notes Modal */}
      <AnimatePresence>
        {showNotesModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recruiter's Note
                </h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Job:</span> {selectedApplication.jobTitle}
                </p>
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Company:</span> {selectedApplication.companyName}
                </p>
                <p className="text-sm text-zinc-400 mb-3">
                  <span className="text-zinc-500">Status:</span> {getStatusBadge(selectedApplication.status).label}
                </p>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {selectedApplication.recruiterNotes || "No notes from recruiter yet."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationPage;
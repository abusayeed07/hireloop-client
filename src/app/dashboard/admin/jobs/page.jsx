"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  TrendingUp,
  Calendar,
  ChevronDown,
  Laptop,
  Palette,
  Megaphone,
  DollarSign,
  Users,
  TrendingUp as TrendingUpIcon,
  Stethoscope,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import LoadingPage from "@/app/loading";
import { 
    getAdminJobs, 
    getAdminJobStats, 
    deleteAdminJob,
    adminApproveJob,
    adminRejectJob 
} from "@/lib/api/jobs";

// ==========================================
// CATEGORY ICONS & COLORS
// ==========================================
const CATEGORY_ICONS = {
  'Technology': <Laptop className="w-4 h-4" />,
  'Design': <Palette className="w-4 h-4" />,
  'Marketing': <Megaphone className="w-4 h-4" />,
  'Sales': <DollarSign className="w-4 h-4" />,
  'Human Resources': <Users className="w-4 h-4" />,
  'Finance': <TrendingUpIcon className="w-4 h-4" />,
  'Healthcare': <Stethoscope className="w-4 h-4" />,
  'Education': <GraduationCap className="w-4 h-4" />,
};

const CATEGORY_COLORS = {
  'Technology': 'text-blue-400',
  'Design': 'text-orange-400',
  'Marketing': 'text-pink-400',
  'Sales': 'text-yellow-400',
  'Human Resources': 'text-zinc-400',
  'Finance': 'text-green-400',
  'Healthcare': 'text-rose-400',
  'Education': 'text-indigo-400',
};

// ✅ Approval status configs
const APPROVAL_STATUS = {
    pending: { 
        label: 'Pending Approval', 
        className: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/20',
        icon: <Clock className="w-3 h-3" />
    },
    approved: { 
        label: 'Approved', 
        className: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20',
        icon: <CheckCircle className="w-3 h-3" />
    },
    rejected: { 
        label: 'Rejected', 
        className: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/20',
        icon: <XCircle className="w-3 h-3" />
    },
};

export default function JobsPage() {
  const router = useRouter();

  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [stats, setStats] = useState({
    engagementRate: 0,
    avgTimeToFill: 0,
    totalApplications: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    pendingApproval: 0,
    rejectedJobs: 0,
    newJobs3Days: 0,
  });

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const itemsPerPage = pageSize;

  // ==========================================
  // FETCH DATA - Only fetch on mount, NOT on filter changes
  // ==========================================
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsData = await getAdminJobs({});
        const statsData = await getAdminJobStats();

        // Normalize jobs and SORT BY DATE (newest first)
        const normalizedJobs = jobsData.map(job => ({
          ...job,
          id: job._id || job.id,
          status: (job.status || 'active').toLowerCase(),
          adminApproval: job.adminApproval || 'pending',
          adminRejectionReason: job.adminRejectionReason || '',
          jobTitle: job.jobTitle || job.title || 'Untitled Job',
          company: job.companyName || job.company || 'Unknown Company',
          companyLogo: job.companyLogo || job.logo || null,
          category: job.jobCategory || job.category || 'Other',
          jobType: job.jobType || 'Full-time',
          datePosted: job.createdAt || job.datePosted || new Date().toISOString(),
        })).sort((a, b) => {
          // ✅ Sort by datePosted - newest first
          const dateA = new Date(a.datePosted);
          const dateB = new Date(b.datePosted);
          return dateB - dateA;
        });

        setJobs(normalizedJobs);

        // Set stats
        setStats({
          engagementRate: statsData.engagementRate || 0,
          avgTimeToFill: statsData.avgTimeToFill || 0,
          totalApplications: statsData.totalApplications || 0,
          totalJobs: statsData.totalJobs || 0,
          activeJobs: statsData.activeJobs || 0,
          pendingJobs: statsData.pendingJobs || 0,
          pendingApproval: statsData.pendingApproval || 0,
          rejectedJobs: statsData.rejectedJobs || 0,
          newJobs3Days: statsData.newJobs3Days || 0,
        });
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error(error.message || "Failed to load jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ==========================================
  // LOGIC
  // ==========================================
  const uniqueCategories = useMemo(() => {
    return ["all", ...new Set(jobs.map(job => job.category).filter(Boolean))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.jobTitle?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query) ||
          job.category?.toLowerCase().includes(query)
      );
    }

    // Apply approval filter
    if (approvalFilter !== "all") {
      result = result.filter((job) => job.adminApproval === approvalFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((job) => job.category === categoryFilter);
    }

    return result;
  }, [jobs, searchTerm, statusFilter, approvalFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  // ✅ Reset to page 1 only when filters change, don't reload page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, approvalFilter, categoryFilter, pageSize]);

  // ==========================================
  // ACTIONS
  // ==========================================
  
  const handleApprove = useCallback(async (jobId) => {
    if (updating) return; 
    setUpdating(true);
    try {
      const result = await adminApproveJob(jobId);
      if (result.success) {
        toast.success("Job approved and published to Browse Jobs!");
        setShowConfirmModal(false);
        setSelectedJob(null);
        // Update the job in state without full reload
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId ? { ...job, adminApproval: 'approved' } : job
        ));
      } else {
        toast.error(result.error || "Failed to approve job");
      }
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  const handleReject = useCallback(async (jobId, reason) => {
    if (updating) return;
    if (!reason || reason.trim() === "") {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setUpdating(true);
    try {
      const result = await adminRejectJob(jobId, reason);
      if (result.success) {
        toast.success("Job rejected. Reason sent to recruiter.");
        setShowConfirmModal(false);
        setSelectedJob(null);
        setRejectReason("");
        // Update the job in state without full reload
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId ? { ...job, adminApproval: 'rejected', adminRejectionReason: reason } : job
        ));
      } else {
        toast.error(result.error || "Failed to reject job");
      }
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  const handleDelete = useCallback(async (jobId) => {
    if (updating) return;
    setUpdating(true);
    try {
      const result = await deleteAdminJob(jobId);
      if (result.success) {
        toast.success("Job deleted successfully");
        setShowConfirmModal(false);
        setSelectedJob(null);
        // Remove the job from state without full reload
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      } else {
        toast.error(result.error || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  const handleJobAction = useCallback((jobId, action) => {
    if (showConfirmModal || updating) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) {
      toast.error("Job not found");
      return;
    }
    setSelectedJob(job);
    setActionType(action);
    setRejectReason("");
    setShowConfirmModal(true);
  }, [jobs, showConfirmModal, updating]);

  const handleConfirmAction = useCallback(() => {
    if (!selectedJob || updating) return;
    if (actionType === 'approve') {
      handleApprove(selectedJob.id);
    } else if (actionType === 'reject') {
      handleReject(selectedJob.id, rejectReason);
    } else if (actionType === 'delete') {
      handleDelete(selectedJob.id);
    }
  }, [selectedJob, actionType, rejectReason, updating, handleApprove, handleReject, handleDelete]);

  const closeModal = useCallback(() => {
    if (!updating) {
      setShowConfirmModal(false);
      setSelectedJob(null);
      setActionType(null);
      setRejectReason("");
    }
  }, [updating]);

  // ==========================================
  // HELPERS
  // ==========================================
  const getStatusConfig = (job) => {
    // ✅ OVERRIDE: If Admin Approval is rejected, we MUST show Rejected
    if (job.adminApproval === 'rejected') {
      return { 
        label: "Rejected", 
        className: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20",
        icon: <XCircle className="w-3 h-3" />
      };
    }

    // Otherwise, check the regular status
    if (job.status === "active") {
      return { 
        label: "Active", 
        className: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20",
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
    if (job.status === "pending") {
      return { 
        label: "Pending", 
        className: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-500/20",
        icon: <Clock className="w-3 h-3" />
      };
    }
    if (job.status === "rejected") {
      return { 
        label: "Rejected", 
        className: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20",
        icon: <XCircle className="w-3 h-3" />
      };
    }
    return { 
      label: "Pending", 
      className: "bg-zinc-200/50 dark:bg-zinc-800/50 text-yellow-700 dark:text-yellow-400 border border-zinc-200/50 dark:border-zinc-700/60",
      icon: <XCircle className="w-3 h-3" />
    };
  };

  const getApprovalStatus = (approval) => {
    return APPROVAL_STATUS[approval] || APPROVAL_STATUS.pending;
  };

  const getCompanyInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // ==========================================
  // CATEGORY DROPDOWN - Updated for theme
  // ==========================================
  const CategoryDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCategory = value === 'all' ? 'All Categories' : value;
    const selectedIcon = value !== 'all' ? CATEGORY_ICONS[value] : null;
    const selectedColor = value !== 'all' ? CATEGORY_COLORS[value] : 'text-zinc-300 dark:text-zinc-300';

    return (
      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 lg:px-3 lg:py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-lg lg:rounded-xl text-xs lg:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <div className="flex items-center gap-2 truncate">
            {selectedIcon && <span className={selectedColor}>{selectedIcon}</span>}
            <span className="truncate">{selectedCategory}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full min-w-[180px] bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-1"
            >
              <button
                onClick={() => { onChange('all'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors ${value === 'all' ? 'bg-cyan-100 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
              >
                All Categories
              </button>
              {uniqueCategories.filter(c => c !== 'all').map((cat) => (
                <button
                  key={cat}
                  onClick={() => { onChange(cat); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors ${value === cat ? 'bg-cyan-100 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                >
                  <span className={CATEGORY_COLORS[cat] || 'text-zinc-400'}>
                    {CATEGORY_ICONS[cat] || <Briefcase className="w-4 h-4" />}
                  </span>
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <LoadingPage 
        title="Loading Jobs"
        message="Fetching job data from the server..."
        customStats={[
          { icon: Briefcase, label: "Loading jobs", animate: "spin" },
          { icon: Users, label: "Finding matches", animate: "pulse" },
          { icon: TrendingUp, label: "Preparing analytics", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Manage Jobs</h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">
              Oversee all active listings, pending approvals, and historical job posts across the platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm transition-all duration-300 border border-zinc-200/50 dark:border-white/5 hover:border-zinc-300/50 dark:hover:border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Total Jobs</h3>
              <Briefcase className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">{stats.totalJobs || 0}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-500">All time listings</div>
          </div>

          <div className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">New (3 Days)</h3>
              <Plus className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{stats.newJobs3Days || 0}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-500">Posted recently</div>
          </div>

          <div className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Active Jobs</h3>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{stats.activeJobs || 0}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-500">Currently open</div>
          </div>

          <div className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Pending</h3>
              <Clock className="w-3.5 h-3.5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-0.5">{stats.pendingApproval || 0}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-500">Awaiting approval</div>
          </div>

          <div className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Rejected</h3>
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-0.5">{stats.rejectedJobs || 0}</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-500">Not approved</div>
          </div>
        </div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-[#111214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 mb-6 hover:border-zinc-300/50 dark:hover:border-white/10 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3 lg:gap-4">
            <div className="flex-1 min-w-[150px] lg:min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 lg:py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg lg:rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="px-3 py-2 lg:px-3 lg:py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-lg lg:rounded-xl text-xs lg:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <option value="all">All Jobs</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 lg:px-3 lg:py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-lg lg:rounded-xl text-xs lg:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>

              <CategoryDropdown value={categoryFilter} onChange={setCategoryFilter} />

              <div className="flex items-center gap-2 ml-auto lg:ml-2">
                <label className="text-[10px] lg:text-xs text-zinc-500 dark:text-zinc-500 whitespace-nowrap">Show:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 lg:px-3 lg:py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-lg lg:rounded-xl text-xs lg:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-100/50 dark:bg-[#16181c] border-b border-zinc-200/50 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Title</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Company</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Category</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Type</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Date Posted</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Approval</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500">Status</th>
                  <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
                <AnimatePresence mode="wait">
                  {currentJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="w-10 h-10 opacity-30" />
                          <p>No jobs found matching your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentJobs.map((job) => {
                      const status = getStatusConfig(job);
                      const approval = getApprovalStatus(job.adminApproval);
                      return (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900 dark:text-white">{job.jobTitle}</span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">Ref: {job.id}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {job.companyLogo ? (
                                <Image
                                  src={job.companyLogo}
                                  alt={job.company}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-md object-contain border border-zinc-200/50 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                                  {getCompanyInitials(job.company)}
                                </div>
                              )}
                              <span className="text-zinc-700 dark:text-zinc-300">{job.company}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{job.category}</td>
                          <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{job.jobType}</td>
                          <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{formatDate(job.datePosted)}</td>
                          
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${approval.className}`}>
                              {approval.icon}
                              {approval.label}
                            </span>
                            {job.adminRejectionReason && (
                              <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 truncate max-w-[120px] flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {job.adminRejectionReason}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${status.className}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {job.adminApproval === 'pending' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleJobAction(job.id, 'approve')}
                                    className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs transition-all border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Approve
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleJobAction(job.id, 'reject')}
                                    className="px-2.5 py-1 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs transition-all border border-red-200/50 dark:border-red-500/20 flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </motion.button>
                                </>
                              )}

                              {job.adminApproval === 'rejected' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleJobAction(job.id, 'approve')}
                                  className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs transition-all border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Approve
                                </motion.button>
                              )}

                              {job.adminApproval === 'approved' && (
                                <span className="px-2.5 py-1 bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-500 rounded-lg text-xs border border-zinc-200/50 dark:border-white/5 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Published
                                </span>
                              )}
                              
                              <motion.button 
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }} 
                                onClick={() => router.push(`/browse-jobs/${job.id}`)}
                                className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.1 }} 
                                whileTap={{ scale: 0.9 }} 
                                onClick={() => handleJobAction(job.id, 'delete')}
                                className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-zinc-200/50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Showing <span className="text-zinc-900 dark:text-zinc-300">{currentJobs.length}</span> of {filteredJobs.length} results
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              size="sm"
              color="primary"
              showTotal={false}
            />
          </div>
        </motion.div>
      </div>

      {/* ✅ Confirmation Modal - Updated for theme */}
      <AnimatePresence>
        {showConfirmModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl shadow-cyan-500/5 mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              {actionType === 'reject' ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 shrink-0">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Reject Job Post</h3>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        Provide a reason why this job is being rejected. This will be sent to the recruiter.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-100/50 dark:bg-zinc-800/30 rounded-xl p-3 sm:p-4 mb-4 border border-zinc-200/50 dark:border-white/5">
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Job Details:</p>
                    <p className="text-sm sm:text-base text-zinc-900 dark:text-white font-medium">{selectedJob.jobTitle}</p>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">{selectedJob.company}</p>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1.5">Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Example: Missing specific job requirements, incomplete company details..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 transition-all resize-none min-h-[80px]"
                    />
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1.5">
                      The recruiter will see this message on their dashboard.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-all duration-300 border border-zinc-200/50 dark:border-white/5 order-2 sm:order-1"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmAction}
                      disabled={updating || !rejectReason.trim()}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 order-1 sm:order-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Rejection"
                      )}
                    </motion.button>
                  </div>
                </>
              ) : actionType === 'approve' ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 shrink-0">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Approve & Publish</h3>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        This job will be published immediately and visible to all job seekers on the Browse Jobs page.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-100/50 dark:bg-zinc-800/30 rounded-xl p-3 sm:p-4 mb-4 border border-zinc-200/50 dark:border-white/5">
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Job Details:</p>
                    <p className="text-sm sm:text-base text-zinc-900 dark:text-white font-medium">{selectedJob.jobTitle}</p>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">{selectedJob.company}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-all duration-300 border border-zinc-200/50 dark:border-white/5 order-2 sm:order-1"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmAction}
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 order-1 sm:order-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Yes, Approve"
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 shrink-0">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Delete Job</h3>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        Are you sure you want to permanently delete this job? This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-100/50 dark:bg-zinc-800/30 rounded-xl p-3 sm:p-4 mb-4 border border-zinc-200/50 dark:border-white/5">
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Job Details:</p>
                    <p className="text-sm sm:text-base text-zinc-900 dark:text-white font-medium">{selectedJob.jobTitle}</p>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">{selectedJob.company}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-all duration-300 border border-zinc-200/50 dark:border-white/5 order-2 sm:order-1"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmAction}
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 order-1 sm:order-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Yes, Delete"
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
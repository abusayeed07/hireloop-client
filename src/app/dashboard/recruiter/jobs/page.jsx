"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, Chip, Tooltip, Modal } from "@heroui/react";
import { Briefcase, Plus, Eye, Pencil, TrashBin } from "@gravity-ui/icons";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getMyJobs } from "@/lib/api/jobs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Loader2,
  Search,
  Sparkles,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import Metadata from "@/components/Metadata";

// ✅ Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function RecruiterJobs() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Rejected Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectedJob, setRejectedJob] = useState(null);
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setLoading(false);
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace("/signin");
          }
        }
        return;
      }

      try {
        console.log("🔍 Fetching company for user:", session.user.id);
        const companyData = await getLoggedInRecruiterCompany();
        console.log("🔍 Company data received:", companyData);

        if (
          !companyData ||
          Object.keys(companyData).length === 0 ||
          !companyData._id
        ) {
          console.log("❌ No company found for this recruiter.");

          toast.error(
            "⚠️ Please create a company profile first before managing jobs!",
            {
              duration: 5000,
              position: "top-right",
            },
          );

          if (isMounted) {
            if (!isRedirecting) {
              setIsRedirecting(true);
              setTimeout(() => {
                router.replace("/dashboard/recruiter/company");
              }, 1000);
            }
          }
          return;
        }

        console.log("🔍 Fetching jobs for company:", companyData._id);
        const jobsResponse = await getMyJobs();
        console.log("🔍 Jobs response:", jobsResponse);

        let jobsData = [];
        if (Array.isArray(jobsResponse)) {
          jobsData = jobsResponse;
        } else if (jobsResponse && typeof jobsResponse === "object") {
          if (jobsResponse.success === false) {
            console.error("❌ Error fetching jobs:", jobsResponse.error);
            toast.error(jobsResponse.error || "Failed to fetch jobs");
            jobsData = [];
          } else if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
            jobsData = jobsResponse.data;
          } else {
            jobsData = [];
          }
        } else {
          jobsData = [];
        }

        console.log(`📊 Found ${jobsData.length} jobs`);

        jobsData = jobsData.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return dateB - dateA;
        });

        if (isMounted) {
          setCompany(companyData);
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error("Failed to load data. Please refresh the page.");
        if (isMounted) {
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace("/dashboard/recruiter/company");
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

  // Filter Jobs based on Search Query & Status
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // ✅ Status filter
    if (statusFilter !== "all") {
      result = result.filter((job) => {
        const status = job.status?.toLowerCase() || "";
        const adminApproval = job.adminApproval?.toLowerCase() || "";

        if (statusFilter === "pending") {
          return status === "pending" || adminApproval === "pending";
        }
        if (statusFilter === "approved") {
          return adminApproval === "approved" && status === "active";
        }
        if (statusFilter === "rejected") {
          return adminApproval === "rejected" || status === "rejected";
        }
        if (statusFilter === "active") {
          return status === "active" && adminApproval === "approved";
        }
        if (statusFilter === "inactive") {
          return status === "inactive" || status === "closed";
        }
        return true;
      });
    }

    // ✅ Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((job) => {
        return (
          job.jobTitle?.toLowerCase().includes(query) ||
          job.companyName?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.jobCategory?.toLowerCase().includes(query) ||
          job.jobType?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [jobs, searchQuery, statusFilter]);

  // Pagination Calculations
  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  // ✅ OPEN REJECT MODAL
  const openRejectModal = (job) => {
    setRejectedJob(job);
    setRejectModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

      const response = await fetch(`${baseUrl}/api/jobs/${jobToDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = `Failed to delete job (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Job deleted successfully!");
        setJobs((prevJobs) =>
          prevJobs.filter((job) => job._id !== jobToDelete._id),
        );
        setDeleteModalOpen(false);
        setJobToDelete(null);
        if (currentJobs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error(result.error || "Failed to delete job.");
      }
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ HANDLE RE-REVIEW REQUEST
  const handleRequestReReview = async () => {
    if (!rejectedJob) return;
    setIsRequestingReview(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

      const response = await fetch(
        `${baseUrl}/api/jobs/${rejectedJob._id}/re-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: "Recruiter has updated the job and requests a re-review.",
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Re-review requested! Admin will review your job soon.");
        setRejectModalOpen(false);
        setRejectedJob(null);
        // Refresh the jobs list
        const updatedJobs = jobs.map((job) => {
          if (job._id === rejectedJob._id) {
            return { ...job, adminApproval: "pending", status: "pending" };
          }
          return job;
        });
        setJobs(updatedJobs);
      } else {
        toast.error(result.error || "Failed to request re-review");
      }
    } catch (error) {
      console.error("❌ Error requesting re-review:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsRequestingReview(false);
    }
  };

  const handleEditJob = (jobId) => {
    router.push(`/dashboard/recruiter/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId) => {
    router.push(`/browse-jobs/${jobId}`);
  };

  // ✅ UPDATED: getStatusColor (Now uses entire Job object)
  const getStatusColor = (job) => {
    const status = job.status?.toLowerCase();
    const adminApproval = job.adminApproval?.toLowerCase();

    // 1. Highest Priority: Admin Approval
    if (adminApproval === "rejected") return "danger";
    if (adminApproval === "pending" && status !== "active") return "warning";

    // 2. Regular Status Logic
    switch (status) {
      case "active":
        return "success";
      case "closed":
      case "inactive":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "warning";
    }
  };

  // ✅ UPDATED: getStatusText (Now uses entire Job object)
  const getStatusText = (job) => {
    const status = job.status?.toLowerCase();
    const adminApproval = job.adminApproval?.toLowerCase();

    // 1. Highest Priority: Admin Approval
    if (adminApproval === "rejected") return "Rejected";
    if (adminApproval === "pending") return "Pending Approval";

    // 2. Regular Status Logic
    switch (status) {
      case "active":
        return "Active";
      case "closed":
        return "Closed";
      case "inactive":
        return "Inactive";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status || "Unknown";
    }
  };

  // Show loading state with animation
  if (isPending || loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-400 text-sm font-medium tracking-wide">
            Loading your workspace...
          </p>
        </div>
      </motion.div>
    );
  }

  // If redirecting, return null
  if (isRedirecting) {
    return null;
  }

  // If no session, show nothing
  if (!session?.user) {
    return null;
  }

  // If no company
  if (!company) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[85vh] flex items-center justify-center p-8 bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e]"
      >
        <div className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Company Required
          </h3>
          <p className="text-zinc-400 text-sm mb-6">
            You need to set up your company profile before you can manage jobs.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard/recruiter/company")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 py-2.5 transition-all shadow-lg shadow-purple-500/20"
          >
            Set Up Company
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // No jobs state with animation
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return (
      <>
        <Metadata page="recruiter-manage-jobs" />
        <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Company Jobs
                  </h1>
                  <p className="text-zinc-400 text-sm mt-1">
                    Manage and monitor all your job postings
                  </p>
                </div>
                <Link href="/dashboard/recruiter/jobs/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11 shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  >
                    <Plus size={18} /> Post New Job
                  </motion.button>
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No jobs yet
              </h3>
              <p className="text-zinc-400 mb-6">
                Get started by posting your first job opening
              </p>
              <Link href="/dashboard/recruiter/jobs/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11 shadow-lg shadow-purple-500/20"
                >
                  Post a Job
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Metadata page="recruiter-manage-jobs" />
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 max-w-7xl mx-auto space-y-6"
        >
          {/* Header Section */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"
              >
                Manage All Jobs
                <Sparkles className="w-5 h-5 text-purple-400" />
              </motion.h2>
              <p className="text-sm text-zinc-400">
                View, update, and manage your current job postings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link
                href="/dashboard/recruiter/jobs/new"
                className="w-full sm:w-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-10 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Post New Job
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Search & Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by title, location, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 focus:border-purple-500/50 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Status Filter - Native Select with Custom Styling */}
            <div className="relative min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 focus:border-purple-500/50 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-zinc-500 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="all" className="bg-zinc-900">
                  📋 All Status
                </option>
                <option value="pending" className="bg-zinc-900">
                  ⏳ Pending
                </option>
                <option value="approved" className="bg-zinc-900">
                  ✅ Approved
                </option>
                <option value="rejected" className="bg-zinc-900">
                  ❌ Rejected
                </option>
                <option value="active" className="bg-zinc-900">
                  🟢 Active
                </option>
                <option value="inactive" className="bg-zinc-900">
                  🔴 Inactive
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all") && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="text-zinc-400 hover:text-white text-sm font-medium transition-colors px-3 py-2 hover:bg-zinc-800/50 rounded-lg whitespace-nowrap"
              >
                Clear Filters ✕
              </motion.button>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="flex justify-between items-center text-sm text-zinc-500">
            <span>
              Showing {totalItems} job{totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#121214]/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden"
          >
            <Table aria-label="Company jobs management table" className="dark">
              <Table.ScrollContainer className="max-h-[70vh]">
                <Table.Content className="min-w-[800px]">
                  <Table.Header className="bg-[#1a1a1e]/90 sticky top-0 z-10 backdrop-blur-sm">
                    <Table.Column
                      isRowHeader
                      className="text-zinc-300 font-medium"
                    >
                      Job Title
                    </Table.Column>
                    <Table.Column className="text-zinc-300 font-medium">
                      Type & Category
                    </Table.Column>
                    <Table.Column className="text-zinc-300 font-medium">
                      Location
                    </Table.Column>
                    <Table.Column className="text-zinc-300 font-medium">
                      Deadline
                    </Table.Column>
                    <Table.Column className="text-zinc-300 font-medium">
                      Status
                    </Table.Column>
                    <Table.Column className="text-zinc-300 font-medium">
                      Actions
                    </Table.Column>
                  </Table.Header>
                  <Table.Body>
                    <AnimatePresence mode="wait">
                      {currentJobs.map((job, index) => (
                        <Table.Row
                          key={job._id}
                          className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-all duration-300 group"
                        >
                          <Table.Cell className="py-4">
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="font-medium text-white group-hover:text-purple-400 transition-colors"
                            >
                              {job.jobTitle || "N/A"}
                            </motion.div>
                          </Table.Cell>
                          <Table.Cell className="py-4">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 + 0.05 }}
                              className="flex flex-col gap-0.5"
                            >
                              <span className="text-sm capitalize font-medium text-zinc-300">
                                {job.jobType || "N/A"}
                              </span>
                              <span className="text-xs text-zinc-500 capitalize">
                                {job.jobCategory || "N/A"}
                              </span>
                            </motion.div>
                          </Table.Cell>
                          <Table.Cell className="py-4">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 + 0.1 }}
                            >
                              {job.isRemote ? (
                                <span className="flex items-center gap-1 text-zinc-300">
                                  <span>🌍</span> Remote
                                </span>
                              ) : (
                                <span className="text-zinc-300">
                                  {job.location || "N/A"}
                                </span>
                              )}
                            </motion.div>
                          </Table.Cell>
                          <Table.Cell className="py-4">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 + 0.15 }}
                              className="text-zinc-300"
                            >
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString()
                                : "N/A"}
                            </motion.div>
                          </Table.Cell>
                          <Table.Cell className="py-4 text-center">
                            {/* ✅ Centered status chip */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 + 0.2 }}
                              className="flex justify-center"
                            >
                              <Chip
                                color={getStatusColor(job)}
                                size="sm"
                                variant="flat"
                                className="capitalize font-medium flex items-center gap-1"
                              >
                                {getStatusText(job)}
                              </Chip>
                            </motion.div>
                          </Table.Cell>
                          <Table.Cell className="py-4 text-center">
                            {/* ✅ Centered action buttons (Rejected button tightly grouped with others) */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 + 0.25 }}
                              className="flex items-center justify-center gap-2 flex-wrap"
                            >
                              {/* ✅ If Job is Rejected, Show the Rejected Action Button */}
                              {job.adminApproval?.toLowerCase() ===
                                "rejected" && (
                                <Tooltip content="View rejected status actions">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-red-400 hover:text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                                    onClick={() => openRejectModal(job)}
                                  >
                                    <X size={14} />
                                    Rejected
                                  </motion.button>
                                </Tooltip>
                              )}

                              <Tooltip content="View Details">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/50 transition-all"
                                  onClick={() => handleViewJob(job._id)}
                                >
                                  <Eye size={16} />
                                </motion.button>
                              </Tooltip>

                              <Tooltip content="Edit Job">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-zinc-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-purple-500/10 transition-all"
                                  onClick={() => handleEditJob(job._id)}
                                >
                                  <Pencil size={16} />
                                </motion.button>
                              </Tooltip>

                              <Tooltip content="Delete Job">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                  onClick={() => openDeleteModal(job)}
                                >
                                  <TrashBin size={16} />
                                </motion.button>
                              </Tooltip>
                            </motion.div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </AnimatePresence>
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 flex justify-center"
            >
              <Pagination
                currentPage={currentPage}
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

          {/* Delete Modal */}
          <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <Modal.Backdrop>
              <Modal.Container>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="sm:max-w-[420px] bg-gradient-to-br from-zinc-900 to-[#1a1a1e] border border-zinc-800 rounded-2xl p-6"
                >
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Icon className="bg-red-500/10 text-red-400 rounded-full p-2">
                      <AlertTriangle className="size-5" />
                    </Modal.Icon>
                    <Modal.Heading className="text-white text-lg font-semibold">
                      Delete Job Posting
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="space-y-4">
                    <p className="text-zinc-300">
                      Are you sure you want to delete the job posting{" "}
                      <span className="font-semibold text-white">
                        "{jobToDelete?.jobTitle || "Unknown"}"
                      </span>
                      ?
                    </p>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>
                          This action cannot be undone. All applications
                          associated with this job will also be permanently
                          removed.
                        </span>
                      </p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="flex gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium px-4 py-2 transition-all"
                      onClick={() => setDeleteModalOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium px-4 py-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Deleting...
                        </>
                      ) : (
                        "Yes, Delete"
                      )}
                    </motion.button>
                  </Modal.Footer>
                </motion.div>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>

          {/* ✅ Rejected Action Modal - SIMPLEST WORKING VERSION */}
          {rejectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-[#0d0d0e] border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 relative">
                {/* Close Button */}
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Large Red X Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <X className="w-10 h-10 text-red-500" strokeWidth={3} />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Job Rejected
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Your job posting has been rejected by the admin.
                  </p>
                </div>

                {/* Admin Note Box */}
                <div className="bg-[#1c1010] border border-red-500/30 rounded-xl p-4 mb-6 flex gap-3 items-start">
                  <div className="mt-0.5 shrink-0 text-red-400">
                    <span className="text-sm">📄</span>
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-semibold mb-0.5">
                      Admin Note:
                    </p>
                    <p className="text-zinc-300 text-sm">
                      {rejectedJob?.adminRejectionReason ||
                        rejectedJob?.rejectionReason ||
                        "No specific reason provided by the admin."}
                    </p>
                  </div>
                </div>

                {/* Instruction Text */}
                <p className="text-zinc-500 text-sm text-center mb-6">
                  Please update your job information and request a re-review.
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setRejectModalOpen(false);
                      if (rejectedJob?._id) handleEditJob(rejectedJob._id);
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl py-3 transition-all flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} /> Update Job
                  </button>

                  <button
                    onClick={handleRequestReReview}
                    disabled={isRequestingReview}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl py-3 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRequestingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={16} /> Request Re-Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
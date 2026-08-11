"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import {
    getRecruiterApplications,
    updateApplicationStatus,
    getApplicationStats,
} from "@/lib/api/applications";
// ✅ We need to import this to check if a company exists
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import {
    Briefcase,
    Building2,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    Hourglass,
    Eye,
    TrendingUp,
    Users,
    Search,
    ChevronDown,
    User,
    Mail,
    MessageSquare,
    Filter,
    X,
    RefreshCw,
    Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import Metadata from "@/components/Metadata";

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

const statusColors = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    applied: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    reviewed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    review: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    shortlisted: "bg-green-500/15 text-green-400 border-green-500/20",
    interview: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    interviewing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    hired: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    offered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/15 text-red-400 border-red-500/20",
    closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const statusLabels = {
    pending: "Pending",
    applied: "Pending",
    reviewed: "Under Review",
    review: "Under Review",
    shortlisted: "Shortlisted",
    interview: "Interview",
    interviewing: "Interviewing",
    hired: "Hired",
    accepted: "Accepted",
    offered: "Offered",
    rejected: "Rejected",
    closed: "Closed",
};

const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Under Review" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview", label: "Interview" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
    { value: "closed", label: "Closed" },
];

const ManageAllApplications = () => {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;

    // ✅ Add a state for redirection
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesText, setNotesText] = useState("");

    const page = 1;
    const itemsPerPage = 10;

    // ✅ Updated Fetch logic: Check Company FIRST
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                // 1. FIRST: Check if the recruiter actually has a company!
                const company = await getLoggedInRecruiterCompany();
                
                if (!company || Object.keys(company).length === 0) {
                    // Show a toast and redirect them immediately
                    toast.error('⚠️ No company found. Please create a company profile first!', {
                        duration: 4000,
                        position: 'top-right',
                    });
                    
                    setIsRedirecting(true);
                    setTimeout(() => {
                        router.push('/dashboard/recruiter/company');
                    }, 1000);
                    return; 
                }

                // 2. If company exists, proceed with fetching applications
                const [appsData, statsData] = await Promise.all([
                    getRecruiterApplications(),
                    getApplicationStats(),
                ]);
                setApplications(appsData || []);
                setStats(statsData || {});

            } catch (error) {
                console.error("❌ Error fetching data:", error);
                // Check if the 404 might be related to a missing company
                if (error.message?.includes("404")) {
                    toast.error("Company profile not found. Redirecting...");
                    setIsRedirecting(true);
                    setTimeout(() => {
                        router.push('/dashboard/recruiter/company');
                    }, 1000);
                } else {
                    toast.error("Failed to load applications");
                }
            } finally {
                setLoading(false);
            }
        };

        if (!isPending) {
            fetchData();
        }
    }, [user?.id, isPending, router]);

    // Filter applications
    const filteredApplications = useMemo(() => {
        let result = applications || [];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((app) => {
                const searchableFields = [
                    app.jobTitle,
                    app.companyName,
                    app.applicantName,
                    app.applicantEmail,
                    app.location,
                ].filter(Boolean);
                return searchableFields.some(field =>
                    field.toLowerCase().includes(query)
                );
            });
        }

        if (statusFilter !== "all") {
            result = result.filter((app) =>
                app.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        return result;
    }, [applications, searchQuery, statusFilter]);

    // Pagination
    const totalItems = filteredApplications.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredApplications.slice(startIndex, endIndex);

    // Stats
    const statsData = [
        { label: "Total", value: stats.total || 0, icon: Briefcase, color: "cyan" },
        { label: "Pending", value: stats.pending || 0, icon: Hourglass, color: "yellow" },
        { label: "Shortlisted", value: stats.shortlisted || 0, icon: CheckCircle, color: "green" },
        { label: "Rejected", value: stats.rejected || 0, icon: XCircle, color: "red" },
        { label: "Hired", value: stats.hired || 0, icon: Users, color: "emerald" },
    ];

    // Handle status update
    const handleStatusUpdate = async (applicationId, newStatus) => {
        setUpdatingId(applicationId);
        try {
            const result = await updateApplicationStatus(applicationId, newStatus);
            if (result.success) {
                toast.success(`Application ${newStatus} successfully`);
                setApplications(prev =>
                    prev.map(app =>
                        app._id === applicationId
                            ? { ...app, status: newStatus }
                            : app
                    )
                );
                // Refresh stats
                const updatedStats = await getApplicationStats();
                setStats(updatedStats);
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("❌ Error updating status:", error);
            toast.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    // Handle notes update
    const handleOpenNotes = (application) => {
        setSelectedApplication(application);
        setNotesText(application.recruiterNotes || "");
        setShowNotesModal(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedApplication) return;

        try {
            const result = await updateApplicationStatus(
                selectedApplication._id,
                selectedApplication.status,
                notesText
            );
            if (result.success) {
                toast.success("Notes updated successfully");
                setApplications(prev =>
                    prev.map(app =>
                        app._id === selectedApplication._id
                            ? { ...app, recruiterNotes: notesText }
                            : app
                    )
                );
                setShowNotesModal(false);
            } else {
                toast.error(result.error || "Failed to update notes");
            }
        } catch (error) {
            console.error("❌ Error updating notes:", error);
            toast.error("Something went wrong");
        }
    };

    // Refresh data
    const handleRefresh = async () => {
        setLoading(true);
        try {
            const [appsData, statsData] = await Promise.all([
                getRecruiterApplications(),
                getApplicationStats(),
            ]);
            setApplications(appsData || []);
            setStats(statsData || {});
            toast.success("Data refreshed");
        } catch (error) {
            console.error("❌ Error refreshing data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setLoading(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
    };

    // Get unique statuses for filter
    const uniqueStatuses = useMemo(() => {
        const statuses = new Set();
        applications?.forEach(app => {
            if (app.status) statuses.add(app.status);
        });
        return Array.from(statuses);
    }, [applications]);

    // Show empty loading state only if we are not redirecting
    if ((loading || isPending) && !isRedirecting) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading applications...</p>
                </div>
            </div>
        );
    }

    // If redirecting, don't render the page
    if (isRedirecting) {
        return null;
    }

    return (
        <>
            <Metadata page="recruiter-applications" />
            <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:pt-10 "
                    >
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                Job Applications
                            </h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                Review and manage applications for your job postings.
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg text-sm transition-all border border-white/5"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    >
                        {statsData.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    variants={statsVariants}
                                    whileHover={{
                                        y: -4,
                                        borderColor: "rgba(255,255,255,0.1)",
                                    }}
                                    className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                                            {stat.label}
                                        </span>
                                        <div className={`w-8 h-8 bg-${stat.color}-500/10 rounded-lg flex items-center justify-center border border-${stat.color}-500/20`}>
                                            <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 mb-6"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by job title, applicant, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-zinc-600 transition-all cursor-pointer min-w-[150px]"
                            >
                                <option value="all">All Status</option>
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status}>
                                        {statusLabels[status] || status}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                        {(searchQuery || statusFilter !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg text-sm transition-all flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                        <span className="text-xs text-zinc-500 flex items-center">
                            {totalItems} result{totalItems !== 1 ? 's' : ''}
                        </span>
                    </motion.div>

                    {/* Applications Table */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl overflow-hidden"
                    >
                        {totalItems === 0 ? (
                            <div className="p-12 text-center">
                                <Briefcase className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No applications</h3>
                                <p className="text-zinc-400 text-sm">
                                    {searchQuery || statusFilter !== "all"
                                        ? "No applications match your filters"
                                        : "You haven't received any applications yet"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                        <tr>
                                            <th className="px-4 py-3 text-zinc-400 font-medium">Applicant</th>
                                            <th className="px-4 py-3 text-zinc-400 font-medium">Job</th>
                                            <th className="px-4 py-3 text-zinc-400 font-medium">Applied</th>
                                            <th className="px-4 py-3 text-zinc-400 font-medium">Status</th>
                                            <th className="px-4 py-3 text-zinc-400 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        <AnimatePresence mode="popLayout">
                                            {currentItems.map((app, index) => (
                                                <motion.tr
                                                    key={app._id || index}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -20 }}
                                                    whileHover={{
                                                        backgroundColor: "rgba(255,255,255,0.02)",
                                                    }}
                                                    className="transition-colors"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-white font-medium">{app.applicantName || 'Unknown'}</p>
                                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                                <Mail className="w-3 h-3" />
                                                                {app.applicantEmail || 'No email'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-zinc-300">{app.jobTitle || 'Unknown Job'}</p>
                                                        <p className="text-xs text-zinc-500">{app.companyName}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-zinc-400 text-xs">
                                                                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-500">
                                                                {app.appliedAt ? new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[app.status] || statusColors.pending}`}>
                                                            {statusLabels[app.status] || app.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <select
                                                                value={app.status || 'pending'}
                                                                onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                                                disabled={updatingId === app._id}
                                                                className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-zinc-500 transition-all disabled:opacity-50 min-w-[100px]"
                                                            >
                                                                {statusOptions.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => handleOpenNotes(app)}
                                                                className="p-1.5 hover:bg-zinc-700/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                                title="Add Notes"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => router.push(`/browse-jobs/${app.jobId}`)}
                                                                className="p-1.5 hover:bg-zinc-700/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                                title="View Job"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Notes Modal */}
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
                                    className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">
                                            Recruiter Notes
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
                                            <span className="text-zinc-500">Applicant:</span> {selectedApplication.applicantName}
                                        </p>
                                        <p className="text-sm text-zinc-400">
                                            <span className="text-zinc-500">Job:</span> {selectedApplication.jobTitle}
                                        </p>
                                        <p className="text-sm text-zinc-400">
                                            <span className="text-zinc-500">Status:</span> {statusLabels[selectedApplication.status] || selectedApplication.status}
                                        </p>
                                    </div>
                                    <textarea
                                        value={notesText}
                                        onChange={(e) => setNotesText(e.target.value)}
                                        placeholder="Add your notes about this candidate..."
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-500 outline-none focus:border-zinc-600 transition-all resize-none min-h-[120px]"
                                    />
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={() => setShowNotesModal(false)}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all"
                                        >
                                            Save Notes
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default ManageAllApplications;
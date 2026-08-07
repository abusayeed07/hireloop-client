"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; // ✅ Added for navigation
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  Building2,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  TrendingUp,
  UserPlus,
  Briefcase,
  Award,
  BarChart3,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Clock,
  Shield,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import Image from "next/image";
import LoadingPage from "@/app/loading";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// 🎨 Animation Variants
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

const backgroundOrbVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ✅ Industry mapping - convert codes to full names
const industryMap = {
  'Technology': 'Technology',
  'Design': 'Design', 
  'Marketing': 'Marketing',
  'Finance': 'Finance',
  'Healthcare': 'Healthcare',
  'Education': 'Education',
  'Manufacturing': 'Manufacturing',
  'Quorum Computing': 'Quorum Computing',
  'Venture Capital': 'Venture Capital',
  'E-commerce': 'E-commerce',
  'Automotive': 'Automotive',
  'Robotics': 'Robotics',
  't': 'Technology',
  'd': 'Design',
  'm': 'Marketing',
  'f': 'Finance',
  'h': 'Healthcare',
  'e': 'Education',
  'man': 'Manufacturing',
};

// ✅ Get full industry name from code
const getFullIndustry = (industry) => {
  if (!industry) return 'Other';
  const trimmed = industry.trim();
  return industryMap[trimmed] || trimmed;
};

const CompaniesPage = () => {
  const router = useRouter(); // ✅ Initialize router

  // ✅ Remove `debouncedSearchTerm` and `setIsSearching` entirely to match Users page
  const [allCompanies, setAllCompanies] = useState([]); // ✅ Stores ALL fetched companies
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const itemsPerPage = pageSize;

  // ✅ Get companies from API - Fetch ALL for instant client side filtering
  const getCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000'); // Fetch large batch

      console.log(`📡 Fetching: ${API_BASE_URL}/api/companies/admin/companies?${params}`);

      const response = await fetch(`${API_BASE_URL}/api/companies/admin/companies?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', error);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      throw error;
    }
  }, []);

  // ✅ Update company status
  const updateCompanyStatus = useCallback(async (companyId, action) => {
    try {
      console.log(`📡 Updating company ${companyId} with action: ${action}`);
      console.log(`📡 URL: ${API_BASE_URL}/api/companies/admin/companies/${companyId}`);

      const response = await fetch(`${API_BASE_URL}/api/companies/admin/companies/${companyId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Update response:', data);
      return data;
    } catch (error) {
      console.error("❌ Error updating company:", error);
      throw error;
    }
  }, []);

  // ✅ Delete company
  const deleteCompany = useCallback(async (companyId) => {
    try {
      console.log(`📡 Deleting company ${companyId}`);
      console.log(`📡 URL: ${API_BASE_URL}/api/companies/admin/companies/${companyId}`);

      const response = await fetch(`${API_BASE_URL}/api/companies/admin/companies/${companyId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Delete response:', data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting company:", error);
      throw error;
    }
  }, []);

  // ✅ Fetch companies from API - Only on Mount & Refresh
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await getCompanies();
      
      let companyData = [];
      
      if (response.success) {
        if (response.data && Array.isArray(response.data)) {
          companyData = response.data;
        } else if (response.companies && Array.isArray(response.companies)) {
          companyData = response.companies;
        } else if (Array.isArray(response)) {
          companyData = response;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          companyData = response.data.data;
        } else if (response.data && response.data.companies && Array.isArray(response.data.companies)) {
          companyData = response.data.companies;
        }
      }
      
      // Normalize company data
      const normalizedCompanies = companyData.map(company => {
        let status = (company.status || 'pending').toLowerCase();
        if (status === 'pending' || status === 'Pending') status = 'pending';
        if (status === 'approved' || status === 'Approved' || status === 'active') status = 'approved';
        if (status === 'rejected' || status === 'Rejected' || status === 'inactive') status = 'rejected';
        
        return {
          ...company,
          id: company._id || company.id,
          status: status,
          name: company.name || company.companyName || 'Unnamed Company',
          recruiterEmail: company.recruiterEmail || company.email || 'No email',
          industry: getFullIndustry(company.industry),
          industryCode: company.industry,
          dateSubmitted: company.dateSubmitted || company.createdAt || company.created_at || new Date().toISOString(),
          logo: company.logo || null,
          description: company.description || '',
        };
      });
      
      setAllCompanies(normalizedCompanies);
      
      // Update Stats
      const pending = normalizedCompanies.filter(c => c.status === 'pending').length;
      const approved = normalizedCompanies.filter(c => c.status === 'approved').length;
      const rejected = normalizedCompanies.filter(c => c.status === 'rejected').length;
      
      setStats({
        pending,
        approved,
        rejected,
        total: normalizedCompanies.length,
      });
      
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
      toast.error(error.message || "Failed to load companies");
      setAllCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ CLIENT-SIDE FILTERING (Instant no-reload)
  const filteredCompanies = useMemo(() => {
    let result = [...allCompanies];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (company) =>
          company.name?.toLowerCase().includes(query) ||
          company.recruiterEmail?.toLowerCase().includes(query) ||
          company.industry?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((company) => company.status === statusFilter);
    }

    if (industryFilter !== "all") {
      result = result.filter((company) => company.industry === industryFilter);
    }

    return result;
  }, [allCompanies, searchTerm, statusFilter, industryFilter]);

  // ✅ Calculate total pages based on filtered companies
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / itemsPerPage));

  // ✅ Reset page to 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, industryFilter]);

  // ✅ Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log(`🔄 Changing to page ${page}`);
      setCurrentPage(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // ✅ Calculate display range for "Showing X to Y of Z"
  const getDisplayRange = () => {
    if (filteredCompanies.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredCompanies.length);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  // ✅ CURRENT PAGE SLICE (THE FIX!)
  const currentCompanies = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  // Handle company actions
  const handleCompanyAction = (companyId, action) => {
    const company = allCompanies.find((c) => c._id === companyId || c.id === companyId);
    if (!company) {
      toast.error("Company not found");
      return;
    }

    setSelectedCompany(company);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !actionType) return;
    
    const companyId = selectedCompany._id || selectedCompany.id;
    setUpdating(true);

    try {
      let result;
      
      if (actionType === 'delete') {
        result = await deleteCompany(companyId);
      } else {
        result = await updateCompanyStatus(companyId, actionType);
      }

      if (result && result.success) {
        if (actionType === 'delete') {
          toast.success(result.message || "Company deleted successfully");
        } else {
          toast.success(result.message || `Company ${actionType.replace('_', ' ')}d successfully`);
        }

        await fetchCompanies(); // Re-fetch list to sync changes
      } else {
        toast.error(result?.error || "Failed to update company");
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error.message || "Failed to update company");
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
      setSelectedCompany(null);
      setActionType(null);
    }
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    const statusKey = status?.toLowerCase() || 'pending';
    return {
      className: styles[statusKey] || styles.pending,
      icon: icons[statusKey] || icons.pending,
      label: labels[statusKey] || "Pending",
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Get company initials
  const getCompanyInitials = (name) => {
    if (!name) return "C";
    return name
      .split(" ")
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join("");
  };

  // ✅ Get unique industries from all companies
  const getUniqueIndustries = useMemo(() => {
    const industries = new Set();
    allCompanies.forEach(company => {
      if (company.industry && company.industry !== 'Other') {
        industries.add(company.industry);
      }
    });
    return Array.from(industries).sort();
  }, [allCompanies]);

  // ✅ Use LoadingPage component
  if (loading) {
    return (
      <LoadingPage 
        title="Loading Companies"
        message="Fetching company data from the server..."
        customStats={[
          { icon: Building2, label: "Loading companies", animate: "spin" },
          { icon: Users, label: "Checking registrations", animate: "pulse" },
          { icon: BarChart3, label: "Preparing dashboard", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-500 to-purple-600"
      />
    );
  }

  // ✅ CHANGE IN RETURN: Map over currentCompanies instead of companies
  return (
    <div className="relative min-h-screen bg-[#090a0f] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={backgroundOrbVariants}
          animate="animate"
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={backgroundOrbVariants}
          animate="animate"
          transition={{ delay: 1, duration: 6 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
        />
        <motion.div
          variants={backgroundOrbVariants}
          animate="animate"
          transition={{ delay: 2, duration: 7 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"
        />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, -100, 100, -50, 50],
              x: [null, 50, -50, 30, -30],
              opacity: [0, 0.5, 0.3, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen text-white p-3 sm:p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3"
                  >
                    <motion.div 
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    Company Registrations
                    <motion.span
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </motion.span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-xs sm:text-sm mt-1"
                  >
                    Review and manage corporate entity access requests for the HireLoop ecosystem.
                  </motion.p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { fetchCompanies(); }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              {[
                {
                  label: "Pending Review",
                  value: stats.pending,
                  icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
                  color: "from-yellow-500 to-orange-500",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/20",
                  text: "text-yellow-400",
                  change: `${stats.pending > 0 ? `${stats.pending} companies need review` : 'All clear'}`,
                },
                {
                  label: "Approved Partners",
                  value: stats.approved,
                  icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
                  color: "from-emerald-500 to-teal-500",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                  text: "text-emerald-400",
                  change: `${stats.approved > 0 ? `${stats.approved} active partners` : 'No approvals yet'}`,
                },
                {
                  label: "Total Rejections",
                  value: stats.rejected,
                  icon: <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
                  color: "from-red-500 to-orange-500",
                  bg: "bg-red-500/10",
                  border: "border-red-500/20",
                  text: "text-red-400",
                  change: `${stats.rejected > 0 ? `${stats.rejected} rejected applications` : 'No rejections'}`,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={statsVariants}
                  whileHover={{ 
                    y: -4, 
                    borderColor: "rgba(255,255,255,0.15)",
                    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)"
                  }}
                  className="bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:bg-[#16181c]"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] sm:text-[10px] text-zinc-500 font-medium uppercase tracking-wider truncate">
                        {stat.label}
                      </p>
                      <motion.p 
                        key={stat.value}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1"
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-[8px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">{stat.change}</p>
                    </div>
                    <motion.div 
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className={`p-1.5 sm:p-2 ${stat.bg} rounded-lg sm:rounded-xl border ${stat.border} shrink-0 ml-2`}
                    >
                      <span className={stat.text}>{stat.icon}</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: idx * 0.1 + 0.5, duration: 0.8 }}
                    className="mt-2 sm:mt-3 h-[2px] rounded-full bg-gradient-to-r"
                    style={{
                      background: `linear-gradient(90deg, ${stat.color.split(' ')[0].replace('from-', '') || '#6366f1'}, ${stat.color.split(' ')[1]?.replace('to-', '') || '#8b5cf6'})`,
                      opacity: 0.3
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-[150px] sm:min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:border-white/10"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:border-white/10"
                  >
                    <option value="all">All Industries</option>
                    {getUniqueIndustries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <label className="text-[10px] sm:text-xs text-zinc-500">Show:</label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:border-white/10"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Companies Table - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
            >
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/5 bg-zinc-900/30">
                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Company Name</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Recruiter Email</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Industry</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Status</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Date Submitted</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="wait">
                      {currentCompanies.length === 0 ? ( // ✅ Changed to currentCompanies
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                              className="flex flex-col items-center gap-2"
                            >
                              <Building2 className="w-12 h-12 text-zinc-600" />
                              <p className="text-zinc-400">No companies found</p>
                              <p className="text-xs text-zinc-500">
                                Try adjusting your filters
                              </p>
                            </motion.div>
                          </td>
                        </motion.tr>
                      ) : (
                        currentCompanies.map((company, idx) => { // ✅ Changed to currentCompanies
                          const companyId = company._id || company.id;
                          const statusBadge = getStatusBadge(company.status);
                          return (
                            <motion.tr
                              key={companyId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                              className="border-b border-white/5 transition-colors duration-200"
                            >
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {company.logo ? (
                                    <Image
                                      src={company.logo}
                                      alt={company.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <motion.div 
                                      whileHover={{ rotate: 15 }}
                                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20"
                                    >
                                      {getCompanyInitials(company.name)}
                                    </motion.div>
                                  )}
                                  <span className="text-sm font-medium text-white truncate max-w-[150px]">
                                    {company.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-zinc-500 hidden sm:block" />
                                  <span className="text-xs sm:text-sm text-zinc-300 truncate max-w-[150px]">
                                    {company.recruiterEmail}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <span className="text-xs sm:text-sm text-zinc-300">
                                  {company.industry}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${statusBadge.className}`}
                                >
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-zinc-500 hidden sm:block" />
                                  <span className="text-xs sm:text-sm text-zinc-300">
                                    {formatDate(company.dateSubmitted)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                                  {company.status !== 'approved' && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleCompanyAction(companyId, "approve")}
                                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 whitespace-nowrap flex items-center gap-1"
                                    >
                                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      Approve
                                    </motion.button>
                                  )}
                                  {company.status !== 'rejected' && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleCompanyAction(companyId, "reject")}
                                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/20 hover:border-red-500/40 whitespace-nowrap flex items-center gap-1"
                                    >
                                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      Reject
                                    </motion.button>
                                  )}
                                  
                                  {/* ✅ FIX: Make Eye button navigate to Company Details */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => router.push(`/companies/${companyId}`)}
                                    className="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 text-zinc-500 hover:text-white"
                                    title="View Details"
                                  >
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </motion.button>

                                  {company.status === 'rejected' && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleCompanyAction(companyId, "delete")}
                                      className="p-1 sm:p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-red-400 hover:text-red-300"
                                      title="Delete Company"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </motion.button>
                                  )}
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/5">
                {currentCompanies.length === 0 ? ( // ✅ Changed to currentCompanies
                  <div className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No companies found</p>
                    <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  currentCompanies.map((company, idx) => { // ✅ Changed to currentCompanies
                    const companyId = company._id || company.id;
                    const statusBadge = getStatusBadge(company.status);
                    return (
                      <motion.div
                        key={companyId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover border border-white/10"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                              {getCompanyInitials(company.name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {company.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              {company.recruiterEmail}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusBadge.className}`}
                          >
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-zinc-500">Industry</p>
                            <p className="text-zinc-300">{company.industry}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Date Submitted</p>
                            <p className="text-zinc-300">{formatDate(company.dateSubmitted)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                          {company.status !== 'approved' && (
                            <button
                              onClick={() => handleCompanyAction(companyId, "approve")}
                              className="flex-1 px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                          )}
                          {company.status !== 'rejected' && (
                            <button
                              onClick={() => handleCompanyAction(companyId, "reject")}
                              className="flex-1 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/20 hover:border-red-500/40 flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          )}
                          {/* ✅ FIX: Make Eye button navigate to Company Details on Mobile */}
                          <button
                            onClick={() => router.push(`/companies/${companyId}`)}
                            className="p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 text-zinc-500 hover:text-white"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {company.status === 'rejected' && (
                            <button
                              onClick={() => handleCompanyAction(companyId, "delete")}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-red-400 hover:text-red-300"
                              title="Delete Company"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* ✅ Pagination - Mobile Responsive */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/20"
              >
                <p className="text-xs sm:text-sm text-zinc-500 text-center sm:text-left">
                  Showing {currentCompanies.length === 0 ? 0 : start} to {end} of {filteredCompanies.length} companies
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  size="sm"
                  color="primary"
                  showTotal={false}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal - Mobile Responsive */}
      <AnimatePresence>
        {showConfirmModal && selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111214] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl shadow-cyan-500/5 mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Confirm Action</h3>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    {actionType === 'delete' 
                      ? `Are you sure you want to permanently delete ${selectedCompany.name}? This action cannot be undone.`
                      : `Are you sure you want to ${actionType} ${selectedCompany.name}?`
                    }
                  </p>
                </div>
              </div>

              <div className="bg-zinc-800/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/5">
                <p className="text-xs sm:text-sm text-zinc-400">Company Details:</p>
                <p className="text-sm sm:text-base text-white font-medium">{selectedCompany.name}</p>
                <p className="text-xs sm:text-sm text-zinc-500">{selectedCompany.recruiterEmail}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                  Industry: {selectedCompany.industry} • Status: {getStatusBadge(selectedCompany.status).label}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-white rounded-xl text-sm font-medium transition-all duration-300 border border-white/5 order-2 sm:order-1"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmAction}
                  disabled={updating}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg order-1 sm:order-2 ${
                    actionType === 'approve'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
                      : actionType === 'delete'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-red-500/20'
                  }`}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Yes, ${actionType}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompaniesPage;
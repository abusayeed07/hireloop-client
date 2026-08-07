"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  User,
  Building2,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  RefreshCw,
  Users,
  TrendingUp,
  UserPlus,
  Briefcase,
  Award,
  BarChart3,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalActive: 0,
    recruiterGrowth: 0,
    suspended: 0,
    totalUsers: 0,
    seekerCount: 0,
  });
  const [pageSize, setPageSize] = useState(5);

  const itemsPerPage = pageSize;

  // ✅ Get all users (Admin only) - Fetch ALL users for instant client side filtering
  const getUsers = async () => {
    try {
      // We remove pagination here to fetch all users for the dashboard
      const params = new URLSearchParams();
      params.append('limit', '1000'); // Fetch large batch

      console.log(`📡 Fetching: ${API_BASE_URL}/api/users/admin/users?${params}`);

      const response = await fetch(`${API_BASE_URL}/api/users/admin/users?${params}`, {
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
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  };

  // ✅ Update user (Admin only)
  const updateUser = async (userId, action) => {
    try {
      console.log(`📡 Updating user ${userId} with action: ${action}`);
      console.log(`📡 URL: ${API_BASE_URL}/api/users/admin/users/${userId}`);

      const response = await fetch(`${API_BASE_URL}/api/users/admin/users/${userId}`, {
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
      console.error("❌ Error updating user:", error);
      throw error;
    }
  };

  // ✅ Delete user (Admin only)
  const deleteUser = async (userId) => {
    try {
      console.log(`📡 Deleting user ${userId}`);
      console.log(`📡 URL: ${API_BASE_URL}/api/users/admin/users/${userId}`);

      const response = await fetch(`${API_BASE_URL}/api/users/admin/users/${userId}`, {
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
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  };

  // ✅ Get user stats (Admin only)
  const getUserStats = async () => {
    try {
      console.log(`📡 Fetching stats: ${API_BASE_URL}/api/users/admin/stats`);

      const response = await fetch(`${API_BASE_URL}/api/users/admin/stats`, {
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
      console.log('📡 Stats received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      throw error;
    }
  };

  // ✅ Fetch users from API - Only on Mount & Refresh
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      
      let userData = [];
      
      if (response.success) {
        if (response.data && Array.isArray(response.data)) {
          userData = response.data;
        } else if (response.users && Array.isArray(response.users)) {
          userData = response.users;
        } else if (Array.isArray(response)) {
          userData = response;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          userData = response.data.data;
        } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
          userData = response.data.users;
        }
      }
      
      // Normalize user data
      const normalizedUsers = userData.map(user => ({
        ...user,
        id: user._id || user.id,
        status: user.status || 'active',
        role: user.role || 'seeker',
        name: user.name || user.fullName || 'Unnamed User',
        email: user.email || 'No email',
        createdAt: user.createdAt || user.created_at || user.joinDate || new Date().toISOString(),
        image: user.image || null,
      }));
      
      setUsers(normalizedUsers);
      
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error(error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch stats - UPDATED to use real data from API
  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      if (response.success && response.data) {
        // ✅ Use ALL the data from the API, no hardcoding
        setStats({
          totalActive: response.data.activeUsers || 0,
          recruiterGrowth: response.data.recruiterCount || 0,
          seekerCount: response.data.seekerCount || 0,
          suspended: response.data.suspendedCount || 0,
          totalUsers: response.data.totalUsers || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ✅ Only fetch stats and users on mount
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  // ✅ CLIENT-SIDE FILTERING (Instant no-reload)
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => (user.role || 'seeker').toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => (user.status || 'active').toLowerCase() === statusFilter.toLowerCase());
    }

    return result;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // ✅ Calculate total pages based on filtered users
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  // ✅ Reset page to 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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
    if (filteredUsers.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredUsers.length);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  // ✅ CURRENT PAGE SLICE (THE FIX!)
  const currentUsers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Handle user actions
  const handleUserAction = (userId, action) => {
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      toast.error("User not found");
      return;
    }

    setSelectedUser(user);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return;
    
    const userId = selectedUser._id || selectedUser.id;
    setUpdating(true);

    try {
      let result;
      
      if (actionType === "delete") {
        result = await deleteUser(userId);
      } else {
        result = await updateUser(userId, actionType);
      }

      if (result && result.success) {
        if (actionType === "delete") {
          toast.success(result.message || "User deleted successfully");
        } else {
          toast.success(result.message || `User ${actionType.replace('_', ' ')}d successfully`);
        }

        await fetchStats();
        await fetchUsers(); // Re-fetch user list to sync changes
      } else {
        toast.error(result?.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  // Get role badge styles
  const getRoleBadge = (role) => {
    const styles = {
      seeker: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      recruiter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      admin: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };
    const labels = {
      seeker: "Seeker",
      recruiter: "Recruiter",
      admin: "Admin",
    };
    const key = (role || 'seeker').toLowerCase();
    return {
      className: styles[key] || styles.seeker,
      label: labels[key] || role || "Unknown",
    };
  };

  // Get status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      suspended: "bg-red-500/10 text-red-400 border-red-500/30",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      inactive: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      suspended: <XCircle className="w-3 h-3" />,
      pending: <AlertCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
    };
    const statusKey = (status || 'active').toLowerCase();
    return {
      className: styles[statusKey] || styles.active,
      icon: icons[statusKey] || icons.active,
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Active",
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

  // ✅ Get user avatar with fallback
  const getUserAvatar = (user) => {
    if (user?.image) {
      return user.image;
    }
    return null;
  };

  // ✅ Use LoadingPage component
  if (loading) {
    return (
      <LoadingPage 
        title="Loading Users"
        message="Fetching user data from the server..."
        customStats={[
          { icon: Users, label: "Loading user list", animate: "spin" },
          { icon: UserCheck, label: "Checking permissions", animate: "pulse" },
          { icon: BarChart3, label: "Preparing dashboard", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-500 to-purple-600"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#090a0f] text-white p-3 sm:p-4 md:p-6"
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
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                User Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-xs sm:text-sm mt-1"
              >
                Review, filter, and manage platform access for all users.
              </motion.p>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => { fetchUsers(); fetchStats(); }}
              className="w-full sm:w-auto px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          {[
            {
              label: "Total Users",
              value: stats.totalUsers || 0,
              icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
              color: "from-purple-500 to-pink-500",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
              text: "text-purple-400",
              change: "All users",
            },
            {
              label: "Active Users",
              value: stats.totalActive || 0,
              icon: <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
              color: "from-emerald-500 to-teal-500",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
              text: "text-emerald-400",
              change: "Active users",
            },
            {
              label: "Seekers",
              value: stats.seekerCount || 0,
              icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
              color: "from-emerald-500 to-cyan-500",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
              text: "text-emerald-400",
              change: "Job seekers",
            },
            {
              label: "Recruiters",
              value: stats.recruiterGrowth || 0,
              icon: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
              color: "from-blue-500 to-cyan-500",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              text: "text-blue-400",
              change: "Hiring companies",
            },
            {
              label: "Suspended",
              value: stats.suspended || 0,
              icon: <Ban className="w-4 h-4 sm:w-5 sm:h-5" />,
              color: "from-red-500 to-orange-500",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
              text: "text-red-400",
              change: "Suspended accounts",
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
              className="bg-[#111214] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:bg-[#16181c]"
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
                <div className={`p-1.5 sm:p-2 ${stat.bg} rounded-lg sm:rounded-xl border ${stat.border} shrink-0 ml-2`}>
                  <span className={stat.text}>{stat.icon}</span>
                </div>
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
          className="bg-[#111214] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 hover:border-white/10 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-[150px] sm:min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:border-white/10"
                >
                  <option value="all">All Roles</option>
                  <option value="seeker">Seekers</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-zinc-800/50 border border-white/5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:border-white/10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
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

        {/* Users Table - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111214] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
        >
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5 bg-zinc-900/30">
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">User</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Email</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Role</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Join Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {currentUsers.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-12 h-12 text-zinc-600" />
                          <p className="text-zinc-400">No users found</p>
                          <p className="text-xs text-zinc-500">
                            Try adjusting your filters
                          </p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    currentUsers.map((user, idx) => {
                      const userId = user._id || user.id;
                      const roleBadge = getRoleBadge(user.role);
                      const statusBadge = getStatusBadge(user.status);
                      const avatar = getUserAvatar(user);
                      return (
                        <motion.tr
                          key={userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                          className="border-b border-white/5 transition-colors duration-200"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {avatar ? (
                                <Image
                                  src={avatar}
                                  alt={user.name || "User"}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
                                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm font-medium text-white truncate max-w-[100px] sm:max-w-none">
                                {user.name || "Unnamed User"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-zinc-500 hidden sm:block" />
                              <span className="text-xs sm:text-sm text-zinc-300 truncate max-w-[120px] sm:max-w-none">
                                {user.email || "No email"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${roleBadge.className}`}
                            >
                              {user.role === "seeker" && <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              {user.role === "recruiter" && <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              {user.role === "admin" && <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              <span className="hidden xs:inline">{roleBadge.label}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-zinc-500 hidden sm:block" />
                              <span className="text-xs sm:text-sm text-zinc-300">
                                {formatDate(user.createdAt || user.joinDate || user.created_at)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${statusBadge.className}`}
                            >
                              {statusBadge.icon}
                              <span className="hidden xs:inline">{statusBadge.label}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                              {(user.role || '').toLowerCase() !== "seeker" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUserAction(userId, "make_seeker")}
                                  className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[8px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 whitespace-nowrap"
                                >
                                  Make Seeker
                                </motion.button>
                              )}
                              {(user.role || '').toLowerCase() !== "recruiter" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUserAction(userId, "make_recruiter")}
                                  className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[8px] sm:text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 whitespace-nowrap"
                                >
                                  Make Recruiter
                                </motion.button>
                              )}
                              {(user.role || '').toLowerCase() !== "admin" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUserAction(userId, "make_admin")}
                                  className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[8px] sm:text-[10px] bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 whitespace-nowrap"
                                >
                                  Make Admin
                                </motion.button>
                              )}
                              {(user.status || '').toLowerCase() === "active" ? (
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUserAction(userId, "suspend")}
                                  className="p-1 sm:p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-red-400 hover:text-red-300"
                                  title="Suspend User"
                                >
                                  <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: -5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUserAction(userId, "activate")}
                                  className="p-1 sm:p-1.5 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 text-emerald-400 hover:text-emerald-300"
                                  title="Activate User"
                                >
                                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
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
            {currentUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No users found</p>
                <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              currentUsers.map((user, idx) => {
                const userId = user._id || user.id;
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.status);
                const avatar = getUserAvatar(user);
                return (
                  <motion.div
                    key={userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 space-y-3"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-500/20">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {user.email || "No email"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${roleBadge.className}`}>
                          {roleBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusBadge.className}`}>
                          {statusBadge.icon}
                          <span className="hidden xs:inline">{statusBadge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-zinc-500">Join Date</p>
                        <p className="text-zinc-300">{formatDate(user.createdAt || user.joinDate || user.created_at)}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {(user.role || '').toLowerCase() !== "seeker" && (
                          <button
                            onClick={() => handleUserAction(userId, "make_seeker")}
                            className="px-2 py-1 text-[8px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 whitespace-nowrap"
                          >
                            Make Seeker
                          </button>
                        )}
                        {(user.role || '').toLowerCase() !== "recruiter" && (
                          <button
                            onClick={() => handleUserAction(userId, "make_recruiter")}
                            className="px-2 py-1 text-[8px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 whitespace-nowrap"
                          >
                            Make Recruiter
                          </button>
                        )}
                        {(user.role || '').toLowerCase() !== "admin" && (
                          <button
                            onClick={() => handleUserAction(userId, "make_admin")}
                            className="px-2 py-1 text-[8px] bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 whitespace-nowrap"
                          >
                            Make Admin
                          </button>
                        )}
                        {(user.status || '').toLowerCase() === "active" ? (
                          <button
                            onClick={() => handleUserAction(userId, "suspend")}
                            className="p-1 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-red-400 hover:text-red-300"
                            title="Suspend User"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(userId, "activate")}
                            className="p-1 rounded-lg hover:bg-emerald-500/10 transition-all duration-300 text-emerald-400 hover:text-emerald-300"
                            title="Activate User"
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
              Showing {currentUsers.length === 0 ? 0 : start} to {end} of {filteredUsers.length} users
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

      {/* Confirmation Modal - Mobile Responsive */}
      <AnimatePresence>
        {showConfirmModal && selectedUser && (
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
                    Are you sure you want to {actionType?.replace(/_/g, " ")} {selectedUser.name || selectedUser.email}?
                  </p>
                </div>
              </div>

              <div className="bg-zinc-800/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/5">
                <p className="text-xs sm:text-sm text-zinc-400">User Details:</p>
                <p className="text-sm sm:text-base text-white font-medium">{selectedUser.name || "Unnamed User"}</p>
                <p className="text-xs sm:text-sm text-zinc-500">{selectedUser.email || "No email"}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                  Current Role: {getRoleBadge(selectedUser.role).label} • Status:{" "}
                  {getStatusBadge(selectedUser.status).label}
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 order-1 sm:order-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersPage;
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Calendar,
  Users,
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  CreditCard,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import LoadingPage from "@/app/loading";
import { getAdminTransactions, getAdminStats } from "@/lib/api/billing";

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const timeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

// Helper: normalize any date to a "YYYY-MM-DD" key in local time
// (avoids toLocaleDateString mismatches and timezone drift)
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toDisplayLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Plan Constants
const SEEKER_PLANS = ["Free", "Pro", "Premium"];
const RECRUITER_PLANS = ["Free", "Growth", "Enterprise"];

// Explicit Filter Option Config
const PLAN_FILTER_OPTIONS = [
  { label: "Seeker Free", value: "seeker_free" },
  { label: "Seeker Pro", value: "seeker_pro" },
  { label: "Seeker Premium", value: "seeker_premium" },
  { label: "Recruiter Free", value: "recruiter_free" },
  { label: "Recruiter Growth", value: "recruiter_growth" },
  { label: "Recruiter Enterprise", value: "recruiter_enterprise" },
];

// How many trailing days the Daily Revenue Trend chart should always show
const CHART_DAYS_RANGE = 12;

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function PaymentPage() {
  const router = useRouter();

  // State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeProUsers: 0,
    activeEnterpriseUsers: 0,
  });

  // Toggle State for Seeker / Recruiter plan distribution view
  const [planViewMode, setPlanViewMode] = useState("seeker"); // 'seeker' | 'recruiter'

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const txnData = await getAdminTransactions();
      const statsData = await getAdminStats();

      let finalTxns = [];
      if (txnData) {
        if (Array.isArray(txnData)) {
          finalTxns = txnData;
        } else if (txnData.data && Array.isArray(txnData.data)) {
          finalTxns = txnData.data;
        } else if (
          txnData.transactions &&
          Array.isArray(txnData.transactions)
        ) {
          finalTxns = txnData.transactions;
        } else {
          finalTxns = [txnData];
        }
      }

      const normalized = finalTxns.map((txn) => ({
        ...txn,
        id: txn._id || txn.id,
        status: (txn.status || "paid").toLowerCase(),
        plan: txn.plan || "Free",
        userType:
          txn.userType ||
          (txn.plan?.toLowerCase().includes("recruiter")
            ? "recruiter"
            : "seeker"),
        amount: txn.amount || 0,
        userEmail: txn.userEmail || txn.userId || "unknown@email.com",
        transactionId: txn.transactionId || "TXN-0000",
        createdAt: txn.createdAt || txn.date || new Date().toISOString(),
      }));

      setTransactions(normalized);

      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        monthlyRevenue: statsData.monthlyRevenue || 0,
        activeProUsers: statsData.activeProUsers || 0,
        activeEnterpriseUsers: statsData.activeEnterpriseUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // FILTER & PAGINATION LOGIC
  // ==========================================
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (txn) =>
          txn.userEmail?.toLowerCase().includes(query) ||
          txn.transactionId?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((txn) => txn.status === statusFilter);
    }

    if (planFilter !== "all") {
      const [filterRole, filterPlan] = planFilter.split("_");
      result = result.filter((txn) => {
        const txnPlan = (txn.plan || "").toLowerCase();
        const txnType = (txn.userType || "").toLowerCase();

        const matchesPlan = txnPlan.includes(filterPlan);
        const matchesRole = txnType ? txnType === filterRole : true;

        return matchesPlan && matchesRole;
      });
    }

    return result;
  }, [transactions, searchTerm, statusFilter, planFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentTxns = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter, pageSize]);

  // ==========================================
  // CHART DATA — FIXED LAST 12 DAYS (always shows every day, even $0)
  // ==========================================
  const dailyChartData = useMemo(() => {
    // 1. Sum revenue per calendar day from actual transactions (paid/success only)
    const revenueByDateKey = {};
    transactions.forEach((txn) => {
      const rawDate = txn.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      if (txn.status !== "paid" && txn.status !== "success") return;

      const key = toDateKey(date);
      revenueByDateKey[key] = (revenueByDateKey[key] || 0) + Number(txn.amount || 0);
    });

    // 2. Build a fixed trailing window of CHART_DAYS_RANGE days ending today,
    //    so every day appears on the axis regardless of whether a transaction exists for it.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = [];
    for (let i = CHART_DAYS_RANGE - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const key = toDateKey(d);
      result.push({
        date: toDisplayLabel(d),
        fullDate: d,
        revenue: revenueByDateKey[key] || 0,
      });
    }

    return result;
  }, [transactions]);

  // ==========================================
  // PLAN DISTRIBUTION COMPUTATION
  // ==========================================
  const planDistribution = useMemo(() => {
    const targetCategories =
      planViewMode === "seeker" ? SEEKER_PLANS : RECRUITER_PLANS;
    const counts = {};
    targetCategories.forEach((cat) => (counts[cat] = 0));

    let totalCount = 0;

    transactions.forEach((txn) => {
      const p = (txn.plan || "").toLowerCase();
      targetCategories.forEach((cat) => {
        if (p.includes(cat.toLowerCase())) {
          counts[cat] += 1;
          totalCount += 1;
        }
      });
    });

    return targetCategories.map((planName) => {
      const count = counts[planName] || 0;
      const percentage =
        totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { plan: planName, count, percentage };
    });
  }, [transactions, planViewMode]);

  // ==========================================
  // STATUS BADGE HELPER
  // ==========================================
  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      success:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      failed: "bg-red-500/10 text-red-400 border border-red-500/20",
      cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
      pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    };
    const icons = {
      paid: <CheckCircle className="w-3 h-3" />,
      success: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
    };
    const key = status?.toLowerCase() || "pending";
    return {
      className: styles[key] || styles.pending,
      icon: icons[key] || icons.pending,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    };
  };

  if (loading) {
    return (
      <LoadingPage
        title="Loading Payments"
        message="Analyzing platform revenue and active subscriptions..."
        customStats={[
          {
            icon: CreditCard,
            label: "Processing transactions",
            animate: "spin",
          },
          { icon: TrendingUp, label: "Calculating revenue", animate: "pulse" },
          { icon: BarChart3, label: "Preparing analytics", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#090a0f] overflow-hidden text-zinc-300">
      {/* Background Lighting */}
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
      </div>

      <div className="relative z-10 p-4 md:p-8 pt-6 sm:pt-8">
        <div className="max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Payment Analytics
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Comprehensive overview of platform revenue and active
                subscriptions.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg text-sm border border-white/5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
          </div>

          {/* Stats Grid - Mobile Responsive (1/2/4 Columns) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <motion.div
              variants={statsVariants}
              className="bg-[#111214] border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-xs font-medium">
                  Total Revenue
                </h3>
                <Wallet className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-xs text-emerald-400">
                +12.4% <span className="text-zinc-500">vs last month</span>
              </div>
            </motion.div>

            <motion.div
              variants={statsVariants}
              className="bg-[#111214] border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-xs font-medium">
                  Monthly Revenue
                </h3>
                <Calendar className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <div className="text-xs text-emerald-400">
                +8.1% <span className="text-zinc-500">this month</span>
              </div>
            </motion.div>

            <motion.div
              variants={statsVariants}
              className="bg-[#111214] border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-xs font-medium">
                  Active Pro Users
                </h3>
                <Users className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.activeProUsers}
              </div>
              <div className="text-xs text-emerald-400">
                +2.3% <span className="text-zinc-500">new signups</span>
              </div>
            </motion.div>

            <motion.div
              variants={statsVariants}
              className="bg-[#111214] border border-white/5 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-xs font-medium">
                  Active Enterprise
                </h3>
                <Building2 className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.activeEnterpriseUsers}
              </div>
              <div className="text-xs text-emerald-400">
                +15.7% <span className="text-zinc-500">growth</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Unified Filter Bar - Mobile responsive */}
          <div className="bg-[#111214]/80 border border-white/5 rounded-xl p-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-white/5 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800/50 border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-800/50 border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="all">All Plans</option>
                  {PLAN_FILTER_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-xs text-zinc-500">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-zinc-800/50 border border-white/5 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table - Scrollable on Mobile */}
          <div className="bg-[#111214] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-[#16181c] border-b border-white/5 text-zinc-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {currentTxns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-zinc-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CreditCard className="w-10 h-10 opacity-30" />
                            <p>No transactions found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentTxns.map((txn) => {
                        const statusBadge = getStatusBadge(txn.status);
                        return (
                          <motion.tr
                            key={txn.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4 text-zinc-300">
                              {txn.userEmail}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-zinc-800/50 border border-zinc-700/60 rounded text-[10px] text-zinc-300">
                                {txn.plan}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-white">
                              {formatCurrency(txn.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-zinc-300">
                                  {formatDate(txn.createdAt)}
                                </span>
                                <span className="text-[9px] text-zinc-500">
                                  {timeAgo(txn.createdAt)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-500 text-[10px]">
                              {txn.transactionId}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusBadge.className}`}
                              >
                                {statusBadge.icon} {statusBadge.label}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-zinc-500">
                Showing{" "}
                <span className="text-zinc-300">{currentTxns.length}</span> of{" "}
                {filteredTransactions.length} transactions
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
          </div>

          {/* ==========================================
              BOTTOM ROW: CHART + PLAN DISTRIBUTION
             ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT CARD: Grouped Date Revenue Curve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111214] border border-white/5 rounded-xl p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Daily Revenue Trend
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Last {CHART_DAYS_RANGE} days of revenue
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-500">USD ($)</span>
              </div>

              <div className="h-[220px] w-full">
                {dailyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={dailyChartData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#1f2128"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
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
                        cursor={{
                          stroke: "#3b82f6",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "#27272a",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        }}
                        formatter={(value) => [
                          `$${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                    No transaction data available to plot.
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT CARD: Plan Distribution with Seeker / Recruiter Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111214] border border-white/5 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header & Toggle Controls */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-white">
                    Plan Distribution
                  </h3>

                  {/* Toggle Pill */}
                  <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setPlanViewMode("seeker")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                        planViewMode === "seeker"
                          ? "bg-zinc-700 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Seeker
                    </button>
                    <button
                      onClick={() => setPlanViewMode("recruiter")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                        planViewMode === "recruiter"
                          ? "bg-zinc-700 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>

                {/* Progress Bars Stack */}
                <div className="space-y-5">
                  {planDistribution.map((item) => (
                    <div key={item.plan} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium">
                          {item.plan}
                        </span>
                        <span className="text-zinc-400 font-mono">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            item.plan === "Enterprise" ||
                            item.plan === "Premium"
                              ? "bg-purple-500"
                              : item.plan === "Growth" || item.plan === "Pro"
                                ? "bg-blue-500"
                                : "bg-zinc-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <button className="text-xs text-zinc-400 hover:text-white transition-colors">
                  View detailed report
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
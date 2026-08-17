"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  UserPlus,
  Mail,
  Users,
  Clock,
  Globe,
  DollarSign,
  Briefcase,
  Power,
  Save,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import LoadingPage from "@/app/loading";
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

export default function AdminSettingsPage() {
  const router = useRouter();

  // ✅ Verify this is an Admin
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin & Role State
  const [adminLogs, setAdminLogs] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");

  // Platform Config State
  const [settings, setSettings] = useState({
    siteName: "HireLoop",
    siteLogo: null,
    currency: "USD",
    maxFreeJobs: 3,
    maxFreeApplications: 10,
    isMaintenanceMode: false,
  });

  // ==========================================
  // API HELPERS
  // ==========================================
  const fetchAdminLogs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/activity-log`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      if (data.success) setAdminLogs(data.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setAdminLogs([]);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (data.success) setSettings(data.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAdminLogs(), fetchSettings()]);
    setLoading(false);
  }, [fetchAdminLogs, fetchSettings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error("Please enter an email address");

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Admin invited successfully!");
        setInviteEmail("");
      } else {
        toast.error(data.error || "Failed to invite admin");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (isPending || loading) {
    return <LoadingPage title="Loading Admin Settings" message="Preparing admin configuration panel..." />;
  }

  // Safety check: Stop non-admins from accessing this page
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] flex items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-800 dark:text-zinc-300 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Admin Settings</h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">Manage platform configuration, admin roles, and system preferences.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm border border-zinc-200/50 dark:border-white/5 transition-all">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-200/50 dark:border-white/5 pb-4 overflow-x-auto scrollbar-hide">
          {[
            { id: "admin", label: "Admin & Roles", icon: Shield },
            { id: "general", label: "General Config", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: ADMIN & ROLE MANAGEMENT */}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              {/* Left: Admin Activity Log */}
              <motion.div variants={itemVariants} className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 h-[500px] sm:h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                    Admin Activity Log
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {adminLogs.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center py-10">No admin activity recorded yet.</p>
                  ) : (
                    adminLogs.map((log, idx) => (
                      <div key={idx} className="bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-white/5 rounded-lg p-3 flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700/50 shrink-0">
                          <Users className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{log.action || "Unknown Action"}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">by {log.adminEmail || "Unknown Admin"}</p>
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500 whitespace-nowrap mt-1">{formatTimeAgo(log.createdAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Right: Invite New Admin */}
              <motion.div variants={itemVariants} className="bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 h-[500px] sm:h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                    Invite New Admin
                  </h3>
                </div>
                <div className="bg-zinc-100/50 dark:bg-zinc-800/20 border border-zinc-200/50 dark:border-white/5 rounded-lg p-5 mb-6">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Enter the email of an existing platform user below to grant them full <span className="text-cyan-600 dark:text-cyan-400 font-medium">Admin</span> permissions.
                  </p>
                </div>
                <form onSubmit={handleInviteAdmin} className="space-y-4 flex-1 flex flex-col">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="email"
                      placeholder="admin@hireloop.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-auto w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {saving ? "Processing..." : "Grant Admin Access"}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* TAB 2: GENERAL PLATFORM CONFIG */}
          {activeTab === "general" && (
            <motion.div
              key="general"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* LEFT: Brand & General */}
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Brand & General Settings</h3>
                
                {/* Site Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Platform Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={settings.siteName || "HireLoop"}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Default Currency */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Default Currency</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <select
                      value={settings.currency || "USD"}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Platform Logo</label>
                  <div className="flex items-center gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/20 border border-zinc-200/50 dark:border-white/5 border-dashed rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-white/10">
                      {settings.siteLogo ? (
                        <Image src={settings.siteLogo} alt="Logo" width={48} height={48} className="rounded-lg object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Click to upload a new logo</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Recommended size: 128x128px</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT: Limits & Controls */}
              <motion.div variants={itemVariants} className="lg:col-span-1 bg-white/80 dark:bg-[#111214] border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Platform Limits & Controls</h3>

                {/* Job Defaults */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Max Active Jobs (Free Recruiter)</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="number"
                        value={settings.maxFreeJobs || 3}
                        onChange={(e) => setSettings({ ...settings, maxFreeJobs: parseInt(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Max Monthly Apps (Free Seeker)</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="number"
                        value={settings.maxFreeApplications || 10}
                        onChange={(e) => setSettings({ ...settings, maxFreeApplications: parseInt(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div className="pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.isMaintenanceMode ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                        <Power className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Maintenance Mode</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Blocks public access when enabled</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.isMaintenanceMode ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Configuration"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
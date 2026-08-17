// src/app/admin/companies/[id]/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Link2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  Target,
  Eye,
  Heart,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingPage from "@/app/loading";
import { getAdminCompanyById } from "@/lib/api/companies";
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// Animation variants
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

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 80,
      duration: 0.5,
    },
  },
};

export default function AdminCompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch company details using the dedicated admin function
  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;

      try {
        console.log('📡 Fetching company with ID:', companyId);
        const data = await getAdminCompanyById(companyId);
        console.log('📡 Company data:', data);
        
        if (!data) {
          toast.error("Company not found");
          router.push("/admin/companies");
          return;
        }

        setCompany(data);
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load company details");
        router.push("/admin/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, router]);

  // Handle approve
  const handleApprove = async () => {
    if (!company) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/admin/companies/${company._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Company approved successfully!");
        setCompany({ ...company, status: "approved" });
        setTimeout(() => {
          router.push("/admin/companies");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to approve company");
      }
    } catch (error) {
      console.error("Error approving company:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!company || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/admin/companies/${company._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "reject",
          reason: rejectReason 
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Company rejected successfully");
        setCompany({ ...company, status: "rejected" });
        setShowRejectModal(false);
        setRejectReason("");
        setTimeout(() => {
          router.push("/admin/companies");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to reject company");
      }
    } catch (error) {
      console.error("Error rejecting company:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <LoadingPage
        title="Loading Company Details"
        message="Fetching company information..."
        customStats={[
          { icon: Building2, label: "Loading company", animate: "spin" },
          { icon: Users, label: "Checking details", animate: "pulse" },
          { icon: ShieldCheck, label: "Reviewing application", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-500 to-purple-600"
      />
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Company Not Found</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">The company you're looking for doesn't exist.</p>
          <Link href="/admin/companies">
            <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all">
              Back to Companies
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/30",
      approved: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30",
      rejected: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/30",
    };
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };
    const statusKey = status?.toLowerCase() || 'pending';
    return {
      className: styles[statusKey] || styles.pending,
      icon: icons[statusKey] || icons.pending,
      label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
    };
  };

  const statusBadge = getStatusBadge(company.status);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/admin/companies">
            <button className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Companies</span>
            </button>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white/80 dark:bg-[#111214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-200/50 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 flex items-center justify-center overflow-hidden">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={64}
                      height={64}
                      className="object-contain p-2"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{company.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{company.industry || "General"}</span>
                    <span className="text-zinc-400 dark:text-zinc-600">•</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show for pending companies */}
              {company.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={updating}
                    className="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-lg border border-red-200/50 dark:border-red-500/20 hover:border-red-400/50 dark:hover:border-red-500/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={updating}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve Company
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Company Details Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Industry</span>
                </div>
                <p className="text-zinc-900 dark:text-white font-medium">{company.industry || "Not specified"}</p>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Location</span>
                </div>
                <p className="text-zinc-900 dark:text-white font-medium">{company.location || "Not specified"}</p>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Employee Count</span>
                </div>
                <p className="text-zinc-900 dark:text-white font-medium">{company.employeeCount || "Not specified"}</p>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Link2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Website</span>
                </div>
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {company.websiteUrl || "Not specified"}
                </a>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Founded Year</span>
                </div>
                <p className="text-zinc-900 dark:text-white font-medium">{company.foundedYear || "Not specified"}</p>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Company Type</span>
                </div>
                <p className="text-zinc-900 dark:text-white font-medium">{company.companyType || "Not specified"}</p>
              </div>
            </motion.div>

            {/* Description */}
            {company.description && (
              <motion.div
                variants={itemVariants}
                className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Description</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{company.description}</p>
              </motion.div>
            )}

            {/* Mission, Vision, Values */}
            {(company.mission || company.vision || company.values) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {company.mission && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium uppercase tracking-wider">Mission</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">{company.mission}</p>
                  </motion.div>
                )}
                {company.vision && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium uppercase tracking-wider">Vision</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">{company.vision}</p>
                  </motion.div>
                )}
                {company.values && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium uppercase tracking-wider">Values</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">{company.values}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                variants={itemVariants}
                className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Contact</span>
                </div>
                <div className="space-y-2">
                  {company.email && (
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                      <span className="text-zinc-500">Email:</span> {company.email}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                      <span className="text-zinc-500">Phone:</span> {company.phone}
                    </p>
                  )}
                  {!company.email && !company.phone && (
                    <p className="text-zinc-500 text-sm">No contact information provided</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Social Links</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.twitter && (
                    <a href={company.twitter} target="_blank" rel="noreferrer" className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700/50 transition-all">
                      <FaTwitter className="w-4 h-4 text-blue-400" />
                    </a>
                  )}
                  {company.linkedin && (
                    <a href={company.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700/50 transition-all">
                      <FaLinkedin className="w-4 h-4 text-blue-600" />
                    </a>
                  )}
                  {company.instagram && (
                    <a href={company.instagram} target="_blank" rel="noreferrer" className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700/50 transition-all">
                      <FaInstagram className="w-4 h-4 text-pink-500" />
                    </a>
                  )}
                  {company.youtube && (
                    <a href={company.youtube} target="_blank" rel="noreferrer" className="p-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700/50 transition-all">
                      <FaYoutube className="w-4 h-4 text-red-600" />
                    </a>
                  )}
                  {!company.twitter && !company.linkedin && !company.instagram && !company.youtube && (
                    <p className="text-zinc-500 text-sm">No social links provided</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Recruiter Info */}
            <motion.div
              variants={itemVariants}
              className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-zinc-500 mb-3">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Recruiter Information</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                  <span className="text-zinc-500">Email:</span> {company.recruiterEmail || "Not provided"}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                  <span className="text-zinc-500">Submitted:</span> {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "N/A"}
                </p>
                {company.reReviewRequestedAt && (
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm col-span-2">
                    <span className="text-yellow-600 dark:text-yellow-400">🔄 Re-review requested:</span> {new Date(company.reReviewRequestedAt).toLocaleDateString()}
                  </p>
                )}
                {company.adminRejectionReason && (
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm col-span-2">
                    <span className="text-red-600 dark:text-red-400">❌ Rejection reason:</span> {company.adminRejectionReason}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-[#111214] border border-red-200/50 dark:border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Reject Company</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Provide a reason for rejecting <span className="text-zinc-900 dark:text-white font-medium">{company?.name}</span>
                </p>
              </div>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-800/30 rounded-xl p-4 mb-4 border border-red-200/50 dark:border-red-500/10">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Rejection Reason:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-lg p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20 transition-all duration-300 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">
                This reason will be sent to the recruiter for review.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700/50 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-all duration-300 border border-zinc-200/50 dark:border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={updating || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-xl text-sm transition-all duration-300 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
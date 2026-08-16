"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Mail,
  Phone,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Users,
  Sparkles,
} from "lucide-react";
import { Card } from "@heroui/react";
import { getCompanyById } from "@/lib/api/companies";
import { getCompanyJobs } from "@/lib/api/jobs";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import LoadingPage from "@/app/loading";

// ==========================================
// HELPERS
// ==========================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatSalary = (min, max, currency) => {
  if (!min || !max) return "Salary not specified";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(Number(min))} – ${formatter.format(Number(max))}`;
};

const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SocialLink = ({ icon: Icon, href, label, color = "text-zinc-500 dark:text-zinc-400" }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-10 h-10 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-blue-500/40 flex items-center justify-center transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:scale-105 group"
    >
      <Icon
        className={`w-4 h-4 ${color} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
      />
      <span className="sr-only">{label}</span>
    </a>
  );
};

const JobCard = ({ job, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link href={`/browse-jobs/${job._id}`}>
        <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-5 hover:border-blue-500/40 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-blue-500/5 group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-zinc-900 dark:text-white font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 tracking-tight">
                {job.jobTitle}
              </h4>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/50">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  {job.isRemote ? "Remote" : job.location || "N/A"}
                </span>
                <span className="capitalize bg-white/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/50">
                  {job.jobType || "Full-time"}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-500/10">
                  {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.isRemote && (
                  <span className="px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 rounded-md uppercase tracking-wider">
                    Remote
                  </span>
                )}
                {job.jobCategory && (
                  <span className="px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 rounded-md uppercase tracking-wider">
                    {job.jobCategory}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 px-2.5 py-1 rounded-md shadow-sm">
              <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              {formatDateShort(job.createdAt)}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
export default function CompanyDetailPage({ params }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams?.id || unwrappedParams?.companyId;

  return <CompanyDetailContent key={companyId} companyId={companyId} />;
}

// ==========================================
// INTERNAL CONTENT COMPONENT
// ==========================================
function CompanyDetailContent({ companyId }) {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        setError("No company ID provided");
        setLoading(false);
        return;
      }

      try {
        const companyData = await getCompanyById(companyId);
        if (!companyData) throw new Error("No company data received");

        setCompany(companyData);
        
        const jobsData = await getCompanyJobs(companyId);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (error) {
        setError(error.message || "Failed to load company data");
        toast.error("Failed to load company data");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20";
      case "rejected":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20";
      default:
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "rejected":
        return <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const openJobs = jobs.filter((job) => job.status !== "closed").length;

  const currentJobs = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return jobs.slice(indexOfFirstItem, indexOfLastItem);
  }, [jobs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  if (loading) {
    return (
      <LoadingPage 
        title="Loading Company Details"
        message="Fetching company details and opportunities..."
        customStats={[
          { icon: Building, label: "Loading company", animate: "spin" },
          { icon: Users, label: "Finding team", animate: "pulse" },
          { icon: Sparkles, label: "Preparing job listings", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-cyan-400 to-teal-400"
      />
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <Building2 className="w-20 h-20 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Company Not Found</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">The company you are looking for does not exist or has been removed.</p>
        <Link href="/companies" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-4 md:px-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.div initial="hidden" animate="visible" variants={slideInLeft}>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 mt-20 px-3.5 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 rounded-xl transition-all duration-200 mb-6 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Companies
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ===== HEADER CARD ===== */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm dark:shadow-none p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center p-2 shadow-inner">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <Building2 size={32} className="text-zinc-400 dark:text-zinc-500" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {company.name}
                      </h1>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-md font-medium border flex items-center gap-1.5 shadow-sm capitalize ${getStatusStyles(company.status)}`}
                      >
                        {getStatusIcon(company.status)}
                        {company.status || "Pending"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-zinc-900 dark:text-zinc-300 font-medium">
                        {company.industry || "General Operations"}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-zinc-400 dark:text-zinc-500" />
                        {company.location || "Location not specified"}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Briefcase size={14} className="text-blue-500/70 dark:text-blue-400/70" />
                        {openJobs} Open Positions
                      </span>
                    </div>
                  </div>
                </div>

                {company.websiteUrl && (
                  <a
                    href={
                      company.websiteUrl.startsWith("http")
                        ? company.websiteUrl
                        : `https://${company.websiteUrl}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 hover:shadow-blue-500/20 whitespace-nowrap"
                  >
                    <Globe size={16} className="mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </Card>
          </motion.div>

          {/* ===== TABS SECTION ===== */}
          <div className="flex gap-1.5 mb-6 bg-white/50 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 max-w-fit">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "about"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "jobs"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Jobs ({openJobs})
            </button>
          </div>

          {/* ===== TAB PANELS ===== */}
          {activeTab === "about" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {company.description && (
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm dark:shadow-none">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
                        About the Company
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                        {company.description}
                      </p>
                    </Card>
                  </motion.div>
                )}

                {(company.mission || company.vision || company.values) && (
                  <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {company.mission && (
                        <Card className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 shadow-sm dark:shadow-none">
                          <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                            Mission
                          </h4>
                          <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                            {company.mission}
                          </p>
                        </Card>
                      )}
                      {company.vision && (
                        <Card className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 shadow-sm dark:shadow-none">
                          <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                            Vision
                          </h4>
                          <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                            {company.vision}
                          </p>
                        </Card>
                      )}
                      {company.values && (
                        <Card className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 shadow-sm dark:shadow-none">
                          <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                            Values
                          </h4>
                          <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                            {company.values}
                          </p>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4">
                      Corporate Profiles
                    </h3>
                    <div className="space-y-3.5 text-sm">
                      {company.foundedYear && (
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2">
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs">Founded</span>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {company.foundedYear}
                          </span>
                        </div>
                      )}
                      {company.employeeCount && (
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2">
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Company Size
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {company.employeeCount} employees
                          </span>
                        </div>
                      )}
                      {company.companyType && (
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2">
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Firm Classification
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {company.companyType}
                          </span>
                        </div>
                      )}
                      {company.createdAt && (
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Ecosystem Member Since
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {formatDate(company.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                {(company.phone ||
                  company.email ||
                  company.twitter ||
                  company.linkedin ||
                  company.instagram ||
                  company.youtube) && (
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none">
                      <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4">
                        Contact Channels
                      </h3>
                      <div className="space-y-3">
                        {company.phone && (
                          <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 text-xs">
                            <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 text-xs group">
                            <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            <a
                              href={`mailto:${company.email}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-all"
                            >
                              {company.email}
                            </a>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                          <SocialLink
                            icon={FaTwitter}
                            href={company.twitter}
                            label="Twitter"
                            color="text-sky-500 dark:text-sky-400"
                          />
                          <SocialLink
                            icon={FaLinkedin}
                            href={company.linkedin}
                            label="LinkedIn"
                            color="text-blue-600 dark:text-blue-400"
                          />
                          <SocialLink
                            icon={FaInstagram}
                            href={company.instagram}
                            label="Instagram"
                            color="text-pink-500 dark:text-pink-400"
                          />
                          <SocialLink
                            icon={FaYoutube}
                            href={company.youtube}
                            label="YouTube"
                            color="text-rose-600 dark:text-rose-400"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            // ===== JOBS TAB PANEL =====
            <motion.div variants={itemVariants}>
              <div className="space-y-3.5">
                {jobs.length === 0 ? (
                  <Card className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-12 text-center backdrop-blur-sm shadow-sm dark:shadow-none">
                    <Briefcase className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3.5" />
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                      No vacancies open
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1.5 max-w-xs mx-auto">
                      {company.name} is not evaluating any outside placements at
                      this moment. Check back soon.
                    </p>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        Aggregated results:{" "}
                        <span className="text-zinc-900 dark:text-white font-semibold">
                          {jobs.length} open position
                          {jobs.length > 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>

                    {currentJobs.map((job, index) => (
                      <JobCard key={job._id || index} job={job} index={index} />
                    ))}

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                      totalItems={jobs.length}
                      itemsPerPage={itemsPerPage}
                      showTotal={true}
                      color="primary"
                      size="md"
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
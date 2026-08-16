"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { getApplicationById } from "@/lib/api/applications";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase as BriefcaseIcon,
  Award,
  Globe,
  FileText,
  FileCheck,
  MessageSquare,
  CheckCircle,
  XCircle,
  Hourglass,
  Clock,
  Building2,
  GraduationCap,
  Linkedin,
  ExternalLink,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import toast from "react-hot-toast";
import Metadata from "@/components/Metadata";
import LoadingPage from "@/app/loading";

const statusColors = {
  pending: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/20",
  applied: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/20",
  reviewed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20",
  review: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20",
  shortlisted: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-500/20",
  interview: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/20",
  interviewing: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/20",
  hired: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
  accepted: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
  offered: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/20",
  closed: "bg-zinc-100 dark:bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-500/20",
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

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id;
  
  const { data: session, isPending } = authClient.useSession();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const company = await getLoggedInRecruiterCompany();
        if (!company || Object.keys(company).length === 0) {
          toast.error("Please create a company profile first");
          router.push("/dashboard/recruiter/company");
          return;
        }

        const data = await getApplicationById(applicationId);
        setApplication(data);
      } catch (error) {
        console.error("❌ Error fetching application:", error);
        setError(error.message || "Failed to load application");
        toast.error("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    if (!isPending) {
      fetchApplication();
    }
  }, [applicationId, session?.user?.id, isPending, router]);

  const handleStatusUpdate = async (newStatus) => {
    if (!application) return;
    
    setUpdatingStatus(true);
    try {
      const { updateApplicationStatus } = await import("@/lib/api/applications");
      const result = await updateApplicationStatus(application._id, newStatus);
      
      if (result.success) {
        toast.success(`Application ${newStatus} successfully`);
        setApplication({ ...application, status: newStatus });
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || isPending) {
    return (
      <LoadingPage 
        title="Loading Application Details"
        message="Please wait while we fetch the application details..."
        step="loading"
        showProgress={true}
        showStats={true}
        showTips={true}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
        customStats={[
          { icon: User, label: "Loading applicant data", animate: "spin" },
          { icon: BriefcaseIcon, label: "Fetching job details", animate: "pulse" },
          { icon: FileText, label: "Loading documents", animate: "bounce" },
        ]}
        estimatedTime="~2 seconds"
      />
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-8">
        <div className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Application Not Found
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
            {error || "The application you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <button
            onClick={() => router.push("/dashboard/recruiter/applications")}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 rounded-xl px-6 py-2.5 transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metadata page="recruiter-application-detail" />
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-[#0d0d0e] dark:via-[#0f0f11] dark:to-[#0d0d0e] p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/recruiter/applications")}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                  Application Details
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {application.jobTitle} at {application.companyName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[application.status] || statusColors.pending}`}
              >
                {statusLabels[application.status] || application.status || "Pending"}
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Status Update Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Update Application Status
                  </label>
                  <select
                    value={application.status || "pending"}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full sm:w-auto bg-white/80 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all disabled:opacity-50"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${application.applicantName}'s Application`,
                          text: `Application for ${application.jobTitle}`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-zinc-900 dark:text-white font-medium text-lg">
                    {application.applicantName || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    {application.applicantEmail || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Phone Number</p>
                  <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    {application.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Location</p>
                  <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    {application.location || "Not provided"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Professional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Current Company</p>
                  <p className="text-zinc-900 dark:text-white">
                    {application.currentCompany || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Current Role</p>
                  <p className="text-zinc-900 dark:text-white">
                    {application.currentRole || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Years of Experience</p>
                  <p className="text-zinc-900 dark:text-white">
                    {application.yearsOfExperience || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Highest Education</p>
                  <p className="text-zinc-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    {application.highestEducation || "Not provided"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            {application.skills && application.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(application.skills) ? (
                    application.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200/50 dark:border-cyan-500/20 rounded-xl text-cyan-700 dark:text-cyan-400 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{application.skills}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Links & Social Profiles */}
            {(application.linkedin || application.portfolio || application.website) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Links & Social Profiles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.linkedin && (
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">LinkedIn Profile</p>
                      <a
                        href={application.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm flex items-center gap-2 transition-colors"
                      >
                        <FaLinkedin className="w-5 h-5" />
                        {application.linkedin.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {application.portfolio && (
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Portfolio / Website</p>
                      <a
                        href={application.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm flex items-center gap-2 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        {application.portfolio.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Cover Letter
                </h2>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {application.coverLetter}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Additional Information */}
            {application.additionalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Additional Information
                </h2>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {application.additionalInfo}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Recruiter Notes */}
            {application.recruiterNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-cyan-200/50 dark:border-cyan-500/20 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Recruiter Notes
                </h2>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {application.recruiterNotes}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Application Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/80 dark:bg-[#121214]/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Application Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-cyan-600 dark:bg-cyan-500 rounded-full" />
                  <span className="text-zinc-600 dark:text-zinc-400">Applied</span>
                  <span className="text-zinc-500 dark:text-zinc-500">
                    {application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "N/A"}
                  </span>
                </div>
                {application.status === "reviewed" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
                    <span className="text-zinc-600 dark:text-zinc-400">Under Review</span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {application.reviewedAt ? new Date(application.reviewedAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                )}
                {application.status === "shortlisted" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full" />
                    <span className="text-zinc-600 dark:text-zinc-400">Shortlisted</span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {application.shortlistedAt ? new Date(application.shortlistedAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                )}
                {application.status === "interview" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-500 rounded-full" />
                    <span className="text-zinc-600 dark:text-zinc-400">Interview Scheduled</span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {application.interviewAt ? new Date(application.interviewAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                )}
                {application.status === "hired" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                    <span className="text-zinc-600 dark:text-zinc-400">Hired</span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {application.hiredAt ? new Date(application.hiredAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                )}
                {application.status === "rejected" && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-red-600 dark:bg-red-500 rounded-full" />
                    <span className="text-zinc-600 dark:text-zinc-400">Rejected</span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {application.rejectedAt ? new Date(application.rejectedAt).toLocaleString() : "Recently"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
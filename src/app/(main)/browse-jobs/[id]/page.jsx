"use client";

import { getJobById, checkJobSaved, saveJob, unsaveJob } from "@/lib/api/jobs";
import { getApplicationsByApplicant } from "@/lib/api/applications";
import React, { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter, usePathname } from "next/navigation";
import { Briefcase, FileDollar, Globe, House, MapPin } from "@gravity-ui/icons";
import {
  ArrowLeft,
  Users,
  Target,
  Award,
  Building2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  LayoutDashboard,
  Briefcase as BriefcaseIcon,
  Sparkles,
} from "lucide-react";
import { Card, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import LoadingPage from "@/app/loading"; // ✅ Import dynamic loading page

// Helper functions...
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
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

const renderListFromString = (text) => {
  if (!text) return null;
  if (Array.isArray(text))
    return text.map((item) => String(item).trim()).filter(Boolean);
  return String(text)
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const getSkillsArray = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export default function JobDetailsPage({ params }) {
  // ✅ FIX: Unwrap the async params using React.use()
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  
  return <JobDetailsContent key={jobId} jobId={jobId} />;
}

function JobDetailsContent({ jobId }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const isInDashboard = pathname?.includes("/dashboard/");

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      try {
        const jobData = await getJobById(jobId);
        if (!jobData) {
          notFound();
          return;
        }
        setJob(jobData);

        // ✅ CRITICAL FIX: Pass the userId as the 2nd argument!
        if (session?.user?.id) {
          try {
            const saved = await checkJobSaved(jobId.toString(), session.user.id);
            setIsSaved(saved);
          } catch (e) {
            setIsSaved(false);
          }

          try {
            const apps = await getApplicationsByApplicant(session.user.id);
            const alreadyApplied = (apps || []).some(
              (app) => app.jobId === jobId,
            );
            setHasApplied(alreadyApplied);
          } catch (e) {
            setHasApplied(false);
          }
        } else {
          setIsSaved(false);
          setHasApplied(false);
        }
      } catch (error) {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, session?.user?.id]);

  const handleSaveToggle = async () => {
    if (!job) return;
    if (!session?.user?.id) {
      toast.error("Please log in to save jobs");
      router.push('/signin');
      return;
    }

    if (isSaving || isSaved) return;
    setIsSaving(true);

    try {
      // ✅ CORRECT: Passing 2 args (jobId, userId)
      const result = await saveJob(job._id.toString(), session.user.id);

      // ✅ Check result.success === false (handles 401 and 400 errors)
      if (result && result.success === false) {
        if (result.error?.toLowerCase().includes('already saved')) {
          toast.error("You have already saved this job!");
          setIsSaved(true);
        } else {
          toast.error(result.error || "Failed to save job.");
        }
      } 
      else if (result && result.success === true) {
        setIsSaved(true);
        toast.success("Job saved successfully!");
      } 
      else {
        toast.error("Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const containerClasses = isInDashboard
    ? "py-6 px-4 md:px-8"
    : "min-h-screen bg-[#08090B] py-6 px-4 md:px-8";

  // ✅ USE DYNAMIC LOADING PAGE INSTEAD OF SKELETON
  if (loading) {
    return (
      <LoadingPage 
        title="Loading Job Details"
        message="Fetching job details for you..."
        customStats={[
          { icon: BriefcaseIcon, label: "Loading job details", animate: "spin" },
          { icon: Building2, label: "Finding company", animate: "pulse" },
          { icon: Sparkles, label: "Preparing application", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-indigo-400 to-purple-400"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={containerClasses}
    >
      <div className="max-w-6xl mx-auto">
        {/* BACK BUTTON & BREADCRUMB */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { type: "spring", damping: 20 },
            },
          }}
          className="pt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={
                  isInDashboard
                    ? "/dashboard/seeker/applications"
                    : "/browse-jobs"
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 group shadow-lg shadow-black/20"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">
                  {isInDashboard
                    ? "Back to Applications"
                    : "Back to Browse Jobs"}
                </span>
              </Link>
            </motion.div>

            {isInDashboard && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/dashboard/seeker"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* JOB HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#111214] border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              {/* Logo */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800/50 border border-white/10">
                {job?.jobsLogo ? (
                  <Image
                    src={job.jobsLogo}
                    alt={job.companyName}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                ) : job?.companyLogo ? (
                  <Image
                    src={job.companyLogo}
                    alt={job.companyName}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <House size={28} className="text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Title & Company */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                    {job?.jobTitle}
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-zinc-400">
                  <span className="text-base font-medium text-white">
                    {job?.companyName}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-sm text-zinc-400 flex items-center gap-1">
                    <Globe size={14} /> Verified Employer
                  </span>
                </div>
              </div>

              {/* BUTTONS: Save & Apply */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {session?.user?.role === "seeker" && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      isIconOnly
                      variant="bordered"
                      className="border-zinc-700 hover:border-zinc-500 bg-zinc-800/30 hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-all duration-300 rounded-xl w-10 h-10"
                      onPress={handleSaveToggle}
                      isLoading={isSaving}
                      isDisabled={isSaving || isSaved}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </Button>
                  </motion.div>
                )}

                {session?.user?.role === "seeker" ? (
                  hasApplied ? (
                    <Button
                      isDisabled
                      className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl px-6 py-2.5 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Already Applied
                    </Button>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href={`/browse-jobs/${job?._id}/apply`}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 whitespace-nowrap"
                      >
                        Apply Now
                      </Link>
                    </motion.div>
                  )
                ) : (
                  <div className="px-6 py-2.5 bg-zinc-800/30 border border-white/10 rounded-xl text-zinc-500 text-sm font-medium">
                    {!session
                      ? "Sign in as a Seeker to Apply"
                      : "Only Seekers can apply for jobs"}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* MAIN CONTENT + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "SALARY",
                    value: formatSalary(
                      job?.minSalary,
                      job?.maxSalary,
                      job?.currency,
                    ),
                    icon: FileDollar,
                  },
                  {
                    label: "LOCATION",
                    value: job?.isRemote ? "Remote" : job?.location,
                    icon: MapPin,
                  },
                  { label: "TYPE", value: job?.jobType, icon: Briefcase },
                  {
                    label: "EXPERIENCE",
                    value: job?.experienceLevel,
                    icon: Award,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={idx}
                      className="bg-[#111214] border border-white/5 rounded-xl p-4"
                    >
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Icon size={12} className="text-zinc-600" />{" "}
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-white truncate">
                        {item.value}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#111214] border border-white/5 rounded-2xl p-6 space-y-6">
                {job?.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Target size={18} className="text-blue-400" /> Job
                      Description
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                )}
                {job?.responsibilities && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Responsibilities
                    </h3>
                    <ul className="space-y-2 text-zinc-400">
                      {renderListFromString(job.responsibilities)?.map(
                        (item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-blue-400 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                            {item}
                          </motion.li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {job?.requirements && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Requirements
                    </h3>
                    <ul className="space-y-2 text-zinc-400">
                      {renderListFromString(job.requirements)?.map(
                        (item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-amber-400 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            {item}
                          </motion.li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {job?.benefits && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {renderListFromString(job.benefits)?.map(
                        (item, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="bg-zinc-800/50 text-zinc-300 text-sm px-3 py-1.5 rounded-full border border-zinc-700/50"
                          >
                            {item}
                          </motion.span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-[#111214] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 size={14} /> Company Overview
                </h3>
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-zinc-800/30 border border-white/5 mb-4">
                  {job?.companyLogo ? (
                    <Image
                      src={job.companyLogo}
                      alt={job.companyName}
                      fill
                      className="object-cover p-0.5"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <House size={48} className="text-zinc-500" />
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {job?.companyName}
                </h4>
                <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Industry</span>
                    <span className="text-sm font-medium text-white">
                      {job?.jobCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-500">Vacancies</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1">
                      <Users size={14} className="text-zinc-500" />{" "}
                      {job?.vacancies || 1}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {getSkillsArray(job?.skills).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-[#111214] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSkillsArray(job?.skills).map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-zinc-800/40 text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-700/50 hover:bg-zinc-700/50 transition-colors"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
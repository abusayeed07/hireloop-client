"use client";

import { getJobById } from "@/lib/api/jobs";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  FileDollar,
  Globe,
  House,
  MapPin,
} from "@gravity-ui/icons";
import { Button, Chip, Card } from "@heroui/react";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper to format salary
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

// Helper to render list items from string
const renderListFromString = (text) => {
  if (!text) return null;
  return text.split("\n").filter((item) => item.trim().length > 0);
};

export default function JobDetailsPage({ params }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { id } = await params;
        const data = await getJobById(id);
        if (!data) {
          notFound();
        }
        setJob(data);
      } catch (error) {
        console.error("Error fetching job:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const {
    jobTitle = "Untitled Position",
    companyName = "Unknown Company",
    companyLogo,
    location = "Location not specified",
    jobType = "Not specified",
    minSalary,
    maxSalary,
    currency = "USD",
    deadline,
    experienceLevel = "Not specified",
    vacancies = "Not specified",
    skills = "",
    responsibilities = "",
    requirements = "",
    benefits = "",
    description = "",
    isRemote = false,
    jobCategory = "General",
    createdAt,
  } = job;

  const skillsArray = skills ? skills.split(",").map((s) => s.trim()) : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 py-8 px-4 md:px-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideInLeft}
        >
          <Link
            href="/browse-jobs"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Jobs
          </Link>
        </motion.div>

        {/* Main Job Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
            >
              {/* Company Logo */}
              <motion.div
                variants={scaleIn}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800 border border-zinc-700"
              >
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt={companyName}
                    fill
                    className="object-cover p-2"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <House size={32} className="text-zinc-500" />
                  </div>
                )}
              </motion.div>

              {/* Title & Company */}
              <motion.div
                variants={slideInRight}
                className="flex-1 min-w-0"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                    {jobTitle}
                  </h1>
                  {isRemote && (
                    <Chip
                      color="success"
                      variant="flat"
                      className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    >
                      <div className="flex items-center gap-1">
                        <Globe size={14} />
                        <span>Remote</span>
                      </div>
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <House size={16} />
                  <span className="text-lg font-medium text-white">
                    {companyName}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-sm capitalize text-zinc-500">
                    {jobCategory}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="my-6 border-t border-zinc-800"
            />

            {/* Key Details Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Briefcase, label: "Job Type", value: jobType, color: "text-blue-400" },
                { icon: FileDollar, label: "Salary", value: formatSalary(minSalary, maxSalary, currency), color: "text-emerald-400" },
                { icon: MapPin, label: "Location", value: isRemote ? "Remote" : location, color: "text-amber-400" },
                { icon: Clock, label: "Apply By", value: formatDate(deadline), color: "text-rose-400" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  custom={idx}
                  className="flex items-center gap-3"
                >
                  <item.icon size={20} className={item.color} />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-white">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="my-6 border-t border-zinc-800"
            />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <motion.div
                variants={slideInLeft}
                className="lg:col-span-2 space-y-6"
              >
                {description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full" />
                      About the Role
                    </h3>
                    <p className="text-zinc-300 leading-relaxed">{description}</p>
                  </div>
                )}

                {responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      {renderListFromString(responsibilities)?.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-emerald-400 mt-1">▸</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-amber-500 rounded-full" />
                      Requirements
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      {renderListFromString(requirements)?.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-amber-400 mt-1">▸</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-rose-500 rounded-full" />
                      Benefits & Perks
                    </h3>
                    <ul className="space-y-2 text-zinc-300">
                      {renderListFromString(benefits)?.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-rose-400 mt-1">▸</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Right Column - Sidebar */}
              <motion.div
                variants={slideInRight}
                className="space-y-6"
              >
                {/* Skills */}
                {skillsArray.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill, index) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="bg-zinc-800/50 text-zinc-300 text-sm px-3 py-1 rounded-full border border-zinc-700 hover:border-blue-500 hover:text-blue-400 transition-colors cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Details */}
                <motion.div
                  variants={itemVariants}
                  className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800 space-y-3"
                >
                  {experienceLevel && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-sm">Experience</span>
                      <span className="text-white text-sm font-medium">
                        {experienceLevel}
                      </span>
                    </div>
                  )}
                  {vacancies && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-sm">Vacancies</span>
                      <span className="text-white text-sm font-medium">
                        {vacancies}
                      </span>
                    </div>
                  )}
                  {createdAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-sm">Posted</span>
                      <span className="text-white text-sm font-medium">
                        {formatDate(createdAt)}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Quick Apply Card */}
                <motion.div
                  variants={scaleIn}
                  className="bg-gradient-to-br from-blue-600/10 to-blue-700/5 border border-blue-600/20 rounded-xl p-4 text-center"
                >
                  <p className="text-white font-medium mb-1">Ready to apply?</p>
                  <p className="text-zinc-400 text-sm mb-3">
                    Join a team of innovators
                  </p>
                  <Button
                    as="a"
                    href={`/apply/${job._id}`}
                    color="primary"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    Apply Now
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
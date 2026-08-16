"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, Chip } from "@heroui/react";
import {
  Briefcase,
  Clock,
  FileDollar,
  Globe,
  House,
  MapPin,
} from "@gravity-ui/icons";
import Image from "next/image";
import Link from "next/link";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
  hover: {
    scale: 1.02,
    y: -6,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
  },
};

const JobCard = ({ job, index }) => {
  const formatSalary = () => {
    const min = Number(job.minSalary).toLocaleString();
    const max = Number(job.maxSalary).toLocaleString();
    return `${job.currency} ${min} – ${max}`;
  };

  const jobId = job._id?.$id || job._id;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
      transition={{ delay: index ? index * 0.03 : 0 }}
    >
      <Card className="border border-zinc-200/50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 w-full h-full shadow-sm dark:shadow-lg">
        {/* Header - Logo, Title, Company, Remote Badge */}
        <div className="flex items-start gap-3 pb-3 border-b border-zinc-200/50 dark:border-zinc-800">
          {/* Logo */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={job.companyName}
                fill
                className="object-cover p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <House size={24} className="text-zinc-400 dark:text-zinc-600" />
              </div>
            )}
          </div>

          {/* Title & Company */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white truncate">
              {job.jobTitle}
            </h3>
            <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <House size={14} />
              <span className="truncate">{job.companyName}</span>
            </div>
          </div>

          {/* Remote Badge */}
          {job.isRemote && (
            <Chip
              size="sm"
              variant="flat"
              color="success"
              className="shrink-0 border border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            >
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <span>Remote</span>
              </div>
            </Chip>
          )}
        </div>

        {/* Content - Key Info */}
        <div className="space-y-2 py-3">
          <div className="grid grid-cols-2 gap-1 text-sm">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <MapPin size={14} className="text-zinc-400 dark:text-zinc-600" />
              <span className="truncate text-xs">
                {job.isRemote ? "Remote" : job.location}
              </span>
            </div>

            {/* Job Type */}
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Briefcase size={14} className="text-zinc-400 dark:text-zinc-600" />
              <span className="text-xs">{job.jobType}</span>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <FileDollar size={14} className="text-zinc-400 dark:text-zinc-600" />
              <span className="font-medium text-zinc-900 dark:text-white text-xs">
                {formatSalary()}
              </span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Clock size={14} className="text-zinc-400 dark:text-zinc-600" />
              <span className="text-xs">
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - View Details Button */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-200/50 dark:border-zinc-800">
          <Link
            href={`/browse-jobs/${jobId}`}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm font-medium transition-colors"
          >
            View Details →
          </Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default JobCard;
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Magnifier, ChevronDown } from "@gravity-ui/icons";
import { FaTimes } from "react-icons/fa";
import JobCard from "@/components/jobs/JobCard";

// =====================================================
// ANIMATION VARIANTS
// =====================================================

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
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
      damping: 25,
      stiffness: 120,
    },
  },
};

// =====================================================
// HELPERS
// =====================================================

/**
 * Convert anything into a clean lowercase string.
 */
const normalize = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * Normalize values used for comparison.
 *
 * Examples:
 * "Full Time"   -> "full-time"
 * "FULL-TIME"   -> "full-time"
 * "full_time"   -> "full-time"
 * "Part Time"   -> "part-time"
 */
const normalizeValue = (value) => {
  return normalize(value)
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * Normalize job category.
 */
const normalizeCategory = (category) => {
  const value = normalize(category);

  if (!value) {
    return "";
  }

  const categoryMap = {
    design: "Design",
    finance: "Finance",
    technology: "Technology",
    tech: "Technology",
    marketing: "Marketing",
    sales: "Sales",
    "human resources": "Human Resources",
    hr: "Human Resources",
    healthcare: "Healthcare",
    health: "Healthcare",
    manufacturing: "Manufacturing",
    education: "Education",
    engineering: "Engineering",
    legal: "Legal",
    "customer service": "Customer Service",
    "customer support": "Customer Service",
    operations: "Operations",
    administrative: "Administrative",
    "real estate": "Real Estate",
    hospitality: "Hospitality",
    "media and communication": "Media & Communication",
    "media communication": "Media & Communication",
  };

  return (
    categoryMap[value] ||
    value
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ")
  );
};

/**
 * Convert skills into searchable text.
 *
 * Supports:
 * ["React", "Node.js", "MongoDB"]
 *
 * and:
 * "React, Node.js, MongoDB"
 */
const getSkillsText = (skills) => {
  if (!skills) {
    return "";
  }

  if (Array.isArray(skills)) {
    return skills
      .filter(Boolean)
      .map((skill) => normalize(skill))
      .join(" ");
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => normalize(skill))
      .filter(Boolean)
      .join(" ");
  }

  return normalize(skills);
};

/**
 * Convert arrays/strings/objects into searchable text.
 */
const getFieldText = (value) => {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "object") {
          return Object.values(item)
            .filter(Boolean)
            .map(normalize)
            .join(" ");
        }

        return normalize(item);
      })
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .filter(Boolean)
      .map(normalize)
      .join(" ");
  }

  return normalize(value);
};

/**
 * Check whether a value represents true.
 *
 * Supports:
 * true
 * "true"
 * "yes"
 * "1"
 * 1
 */
const isTrue = (value) => {
  if (value === true || value === 1) {
    return true;
  }

  if (typeof value === "string") {
    return ["true", "yes", "1", "remote"].includes(
      normalize(value)
    );
  }

  return false;
};

/**
 * Build one big searchable string for every job.
 */
const getJobSearchText = (job) => {
  if (!job || typeof job !== "object") {
    return "";
  }

  const fields = [
    job.jobTitle,
    job.title,

    job.companyName,
    job.company,

    job.jobCategory,
    job.category,
    job.industry,

    job.location,
    job.city,
    job.country,

    job.jobType,
    job.type,

    job.description,
    job.requirements,
    job.responsibilities,
    job.benefits,

    job.experience,
    job.experienceLevel,

    getSkillsText(job.skills),

    getFieldText(job.tags),
    getFieldText(job.keywords),
  ];

  return fields
    .filter(Boolean)
    .map(getFieldText)
    .join(" ");
};

// =====================================================
// COMPONENT
// =====================================================

export default function JobFilters({
  initialJobs = [],
  initialSearch = "",
  initialLocation = "",
}) {
  // ===================================================
  // STATE
  // ===================================================

  const [searchQuery, setSearchQuery] =
    useState(initialSearch || "");

  const [locationQuery, setLocationQuery] =
    useState(initialLocation || "");

  const [selectedType, setSelectedType] =
    useState("all");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [isRemoteOnly, setIsRemoteOnly] =
    useState(false);

  // ===================================================
  // SAFELY HANDLE JOB DATA
  // ===================================================

  const jobs = useMemo(() => {
    if (!Array.isArray(initialJobs)) {
      return [];
    }

    return initialJobs.filter(
      (job) => job && typeof job === "object"
    );
  }, [initialJobs]);

  // ===================================================
  // SYNC INITIAL SEARCH
  // ===================================================

  useEffect(() => {
    setSearchQuery(initialSearch || "");
  }, [initialSearch]);

  // ===================================================
  // SYNC INITIAL LOCATION
  // ===================================================

  useEffect(() => {
    setLocationQuery(initialLocation || "");
  }, [initialLocation]);

  // ===================================================
  // JOB TYPES
  // ===================================================

  const jobTypes = useMemo(() => {
    const types = new Map();

    jobs.forEach((job) => {
      const rawType =
        job.jobType ?? job.type ?? "";

      if (!rawType) {
        return;
      }

      const normalized = normalizeValue(rawType);

      if (!normalized) {
        return;
      }

      if (!types.has(normalized)) {
        types.set(normalized, rawType);
      }
    });

    return [
      "all",
      ...Array.from(types.keys()).sort(),
    ];
  }, [jobs]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories = useMemo(() => {
    const categorySet = new Set();

    jobs.forEach((job) => {
      const category =
        job.jobCategory ??
        job.category ??
        job.industry ??
        "";

      const normalized = normalizeCategory(category);

      if (normalized) {
        categorySet.add(normalized);
      }
    });

    return [
      "all",
      ...Array.from(categorySet).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [jobs]);

  // ===================================================
  // FILTER JOBS
  // ===================================================

  const filteredJobs = useMemo(() => {
    const search = normalize(searchQuery);
    const location = normalize(locationQuery);

    return jobs.filter((job) => {
      // =================================================
      // SEARCH FILTER
      // =================================================

      const jobSearchText =
        getJobSearchText(job);

      const matchesSearch =
        !search ||
        jobSearchText.includes(search);

      // =================================================
      // LOCATION FILTER
      // =================================================

      const jobLocation = normalize(
        job.location ??
          job.city ??
          ""
      );

      const jobIsRemote =
        isTrue(job.isRemote) ||
        jobLocation.includes("remote") ||
        normalize(job.workLocation) === "remote";

      let matchesLocation = true;

      if (location) {
        // If user searches "remote"
        if (location === "remote") {
          matchesLocation = jobIsRemote;
        } else {
          matchesLocation =
            jobLocation.includes(location) ||
            jobLocation
              .split(",")
              .some((part) =>
                normalize(part).includes(location)
              );
        }
      }

      // =================================================
      // JOB TYPE FILTER
      // =================================================

      const rawJobType =
        job.jobType ??
        job.type ??
        "";

      const normalizedJobType =
        normalizeValue(rawJobType);

      const matchesType =
        selectedType === "all" ||
        normalizedJobType === selectedType;

      // =================================================
      // CATEGORY FILTER
      // =================================================

      const rawCategory =
        job.jobCategory ??
        job.category ??
        job.industry ??
        "";

      const normalizedJobCategory =
        normalizeCategory(rawCategory);

      const matchesCategory =
        selectedCategory === "all" ||
        normalizedJobCategory === selectedCategory;

      // =================================================
      // REMOTE FILTER
      // =================================================

      const matchesRemote =
        !isRemoteOnly || jobIsRemote;

      // =================================================
      // FINAL RESULT
      // =================================================

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesCategory &&
        matchesRemote
      );
    });
  }, [
    jobs,
    searchQuery,
    locationQuery,
    selectedType,
    selectedCategory,
    isRemoteOnly,
  ]);

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedType("all");
    setSelectedCategory("all");
    setIsRemoteOnly(false);
  };

  // ===================================================
  // ACTIVE FILTERS
  // ===================================================

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(locationQuery.trim()) ||
    selectedType !== "all" ||
    selectedCategory !== "all" ||
    isRemoteOnly;

  // ===================================================
  // LOADING
  // ===================================================

  if (!Array.isArray(initialJobs)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

          <p className="text-zinc-400 mt-4">
            Loading opportunities...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="w-full">

      {/* =================================================
          ACTIVE FILTER CHIPS
      ================================================= */}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">

          {/* SEARCH CHIP */}
          {searchQuery && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                Searching: "{searchQuery}"

                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="hover:text-blue-300 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}

          {/* LOCATION CHIP */}
          {locationQuery && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs">
                Location: "{locationQuery}"

                <button
                  type="button"
                  onClick={() =>
                    setLocationQuery("")
                  }
                  className="hover:text-cyan-300 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}

          {/* JOB TYPE CHIP */}
          {selectedType !== "all" && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs capitalize">
                Type:{" "}
                {selectedType.replace(
                  /-/g,
                  " "
                )}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedType("all")
                  }
                  className="hover:text-purple-300 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}

          {/* CATEGORY CHIP */}
          {selectedCategory !== "all" && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">
                Category: {selectedCategory}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory("all")
                  }
                  className="hover:text-emerald-300 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}

          {/* REMOTE CHIP */}
          {isRemoteOnly && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs">
                Remote Only

                <button
                  type="button"
                  onClick={() =>
                    setIsRemoteOnly(false)
                  }
                  className="hover:text-cyan-300 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <div className="flex flex-col gap-4 bg-zinc-900/50 p-6 rounded-[24px] border border-zinc-800/80 max-w-7xl mx-auto mb-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="md:col-span-5">

            <label className="text-sm font-medium text-zinc-400 block mb-2">
              Search Jobs
            </label>

            <div className="relative bg-zinc-800 border border-zinc-700 focus-within:border-blue-500 rounded-xl transition-all">

              <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />

              <input
                type="text"
                placeholder="Title, company, skills, or keywords..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-2.5 pl-10 pr-10 outline-none rounded-xl"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              JOB TYPE
          ================================================= */}

          <div className="md:col-span-3">

            <label className="text-sm font-medium text-zinc-400 block mb-2">
              Job Type
            </label>

            <div className="relative">

              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(
                    e.target.value
                  )
                }
                className="appearance-none w-full bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-600 focus:border-blue-500 rounded-xl py-2.5 px-4 pr-10 text-sm font-normal transition-all outline-none cursor-pointer"
              >
                {jobTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-zinc-800 text-white"
                  >
                    {type === "all"
                      ? "All Types"
                      : type
                          .replace(
                            /-/g,
                            " "
                          )
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            </div>
          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="md:col-span-3">

            <label className="text-sm font-medium text-zinc-400 block mb-2">
              Category
            </label>

            <div className="relative">

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                className="appearance-none w-full bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-600 focus:border-blue-500 rounded-xl py-2.5 px-4 pr-10 text-sm font-normal transition-all outline-none cursor-pointer"
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-zinc-800 text-white"
                    >
                      {category === "all"
                        ? "All Categories"
                        : category}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            </div>
          </div>

          {/* =================================================
              REMOTE
          ================================================= */}

          <div className="md:col-span-1 flex items-center justify-start md:justify-center h-10 pb-1">

            <label className="flex items-center gap-2 cursor-pointer select-none">

              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) =>
                  setIsRemoteOnly(
                    e.target.checked
                  )
                }
                className="accent-blue-500 w-4 h-4 rounded bg-zinc-800 border-zinc-700 cursor-pointer"
              />

              <span className="text-sm font-medium text-zinc-300 md:hidden lg:inline">
                Remote
              </span>

            </label>
          </div>
        </div>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div>

          <label className="text-sm font-medium text-zinc-400 block mb-2">
            Location
          </label>

          <div className="relative">

            <input
              type="text"
              placeholder="City, country, or type remote..."
              value={locationQuery}
              onChange={(e) =>
                setLocationQuery(
                  e.target.value
                )
              }
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-xl text-white placeholder-zinc-500 text-sm py-2.5 px-4 outline-none transition-all"
            />

            {locationQuery && (
              <button
                type="button"
                onClick={() =>
                  setLocationQuery("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          RESULT COUNT
      ================================================= */}

      <div className="flex items-center justify-between mb-6">

        <motion.div
          key={filteredJobs.length}
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
          }}
        >
          <p className="text-zinc-400">

            <span className="text-blue-400 font-semibold text-2xl">
              {filteredJobs.length}
            </span>{" "}

            <span className="text-zinc-500">
              {filteredJobs.length === 1
                ? "opportunity"
                : "opportunities"}
            </span>{" "}

            <span className="text-zinc-600">
              found
            </span>

          </p>
        </motion.div>

        {/* CLEAR FILTERS */}

        {hasActiveFilters && (
          <motion.button
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            type="button"
            onClick={clearFilters}
            className="text-sm text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            <FaTimes size={12} />
            Clear all filters
          </motion.button>
        )}
      </div>

      {/* =================================================
          JOB GRID
      ================================================= */}

      <AnimatePresence mode="wait">

        {filteredJobs.length > 0 ? (
          <motion.div
            key={`${searchQuery}-${locationQuery}-${selectedType}-${selectedCategory}-${isRemoteOnly}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map(
              (job, index) => (
                <motion.div
                  key={
                    job._id ||
                    job.id ||
                    index
                  }
                  variants={itemVariants}
                  className="h-full"
                >
                  <JobCard
                    job={job}
                    index={index}
                  />
                </motion.div>
              )
            )}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            className="text-center py-16"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">

              <div className="text-4xl mb-4">
                🔍
              </div>

              <p className="text-zinc-400 text-lg">
                No jobs found matching your filters
              </p>

              <p className="text-zinc-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          FOOTER
      ================================================= */}

      {filteredJobs.length > 0 && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-500"
        >
          Showing{" "}
          <span className="text-white">
            {filteredJobs.length}
          </span>{" "}
          of{" "}
          <span className="text-white">
            {jobs.length}
          </span>{" "}
          jobs

          <span className="mx-2">
            ·
          </span>

          <span className="text-zinc-600">
            Last updated{" "}
            {new Date().toLocaleDateString()}
          </span>
        </motion.div>
      )}
    </div>
  );
}
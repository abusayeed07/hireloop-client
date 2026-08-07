"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextField, InputGroup, Select, ListBox } from "@heroui/react";
import { Magnifier, ChevronDown } from "@gravity-ui/icons";
import { FaTimes } from "react-icons/fa";
import JobCard from "@/components/jobs/JobCard";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
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

// ✅ Accept initialSearch and initialLocation as props
export default function JobFilters({ 
  initialJobs = [], 
  initialSearch = "",
  initialLocation = ""
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);

  // ✅ Sync state when URL parameters change (e.g. from Homepage)
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Get unique categories from jobs
  const categories = useMemo(() => {
    const cats = initialJobs?.map((job) => job.jobCategory).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [initialJobs]);

  // Filter jobs based on all filters
  const filteredJobs = useMemo(() => {
    if (!initialJobs || initialJobs.length === 0) return [];

    return initialJobs.filter((job) => {
      // Search filter
      const matchesSearch =
        job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.toLowerCase().includes(searchQuery.toLowerCase());

      // Job type filter
      const matchesType =
        selectedType === "all" ||
        job.jobType?.toLowerCase().replace(/\s/g, "-") === selectedType ||
        job.jobType?.toLowerCase() === selectedType.replace("-", " ");

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        job.jobCategory?.toLowerCase() === selectedCategory.toLowerCase();

      // Remote filter
      const matchesRemote = isRemoteOnly ? job.isRemote === true : true;

      return matchesSearch && matchesType && matchesCategory && matchesRemote;
    });
  }, [initialJobs, searchQuery, selectedType, selectedCategory, isRemoteOnly]);

  // Loading state
  if (!initialJobs || initialJobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-zinc-400 mt-4">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      
      {/* ✅ Active Filter Chips */}
      {(searchQuery || selectedType !== "all" || selectedCategory !== "all" || isRemoteOnly) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                Searching: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-blue-300 transition-colors">
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}
          {selectedType !== "all" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs">
                Type: {selectedType}
                <button onClick={() => setSelectedType("all")} className="hover:text-purple-300 transition-colors">
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}
          {selectedCategory !== "all" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")} className="hover:text-emerald-300 transition-colors">
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}
          {isRemoteOnly && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs">
                Remote Only
                <button onClick={() => setIsRemoteOnly(false)} className="hover:text-cyan-300 transition-colors">
                  <FaTimes size={12} />
                </button>
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Filter Section */}
      <div className="flex flex-col gap-4 bg-zinc-900/50 p-6 rounded-[24px] border border-zinc-800/80 max-w-7xl mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* 1. Search Text Field - Span 5 columns */}
          <div className="md:col-span-5">
            <div className="text-sm font-medium text-zinc-400 block mb-2">
              Search Jobs
            </div>
            <div className="relative bg-zinc-800 border border-zinc-700 focus-within:border-blue-500 rounded-xl transition-all">
              <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm py-2.5 pl-10 pr-3 outline-none rounded-xl"
              />
            </div>
          </div>

          {/* 2. Job Type Select Filter - Span 3 columns */}
          <div className="md:col-span-3">
            <div className="text-sm font-medium text-zinc-400 block mb-2">
              Job Type
            </div>
            <Select
              selectedKey={selectedType}
              onSelectionChange={(key) => setSelectedType(key)}
            >
              <Select.Trigger className="w-full flex items-center justify-between bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-600 rounded-xl py-2.5 px-4 text-sm font-normal transition-all">
                <Select.Value>
                  {selectedType === "all"
                    ? "All Types"
                    : selectedType.replace("-", " ")}
                </Select.Value>
                <Select.Indicator>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </Select.Indicator>
              </Select.Trigger>

              <Select.Popover className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl mt-1 overflow-hidden z-50">
                <ListBox className="p-1">
                  {["all", "full-time", "part-time", "contract", "internship", "freelance"].map(
                    (type) => (
                      <ListBox.Item
                        key={type}
                        id={type}
                        className="text-zinc-200 hover:bg-blue-600 hover:text-white rounded-lg px-3 py-2 text-sm cursor-pointer capitalize"
                      >
                        {type === "all" ? "All Types" : type.replace("-", " ")}
                      </ListBox.Item>
                    )
                  )}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* 3. Category Select Filter - Span 3 columns */}
          <div className="md:col-span-3">
            <div className="text-sm font-medium text-zinc-400 block mb-2">
              Category
            </div>
            <Select
              selectedKey={selectedCategory}
              onSelectionChange={(key) => setSelectedCategory(key)}
            >
              <Select.Trigger className="w-full flex items-center justify-between bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-600 rounded-xl py-2.5 px-4 text-sm font-normal transition-all">
                <Select.Value>
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory}
                </Select.Value>
                <Select.Indicator>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </Select.Indicator>
              </Select.Trigger>

              <Select.Popover className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl mt-1 overflow-hidden z-50">
                <ListBox className="p-1">
                  {categories.map((category) => (
                    <ListBox.Item
                      key={category}
                      id={category}
                      className="text-zinc-200 hover:bg-blue-600 hover:text-white rounded-lg px-3 py-2 text-sm cursor-pointer capitalize"
                    >
                      {category === "all" ? "All Categories" : category}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* 4. Remote Checkbox Filter - Span 1 column */}
          <div className="md:col-span-1 flex items-center justify-start md:justify-center h-10 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
                className="accent-blue-500 w-4 h-4 rounded bg-zinc-800 border-zinc-700 cursor-pointer"
              />
              <span className="text-sm font-medium text-zinc-300 md:hidden lg:inline">
                Remote
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Clear Filters */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          key={filteredJobs.length}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <p className="text-zinc-400">
            <span className="text-blue-400 font-semibold text-2xl">
              {filteredJobs.length}
            </span>{" "}
            <span className="text-zinc-500">
              {filteredJobs.length === 1 ? "opportunity" : "opportunities"}
            </span>{" "}
            <span className="text-zinc-600">found</span>
          </p>
        </motion.div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedType !== "all" || selectedCategory !== "all" || isRemoteOnly) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setSearchQuery("");
              setSelectedType("all");
              setSelectedCategory("all");
              setIsRemoteOnly(false);
            }}
            className="text-sm text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            <FaTimes size={12} />
            Clear all filters
          </motion.button>
        )}
      </div>

      {/* Job Cards Grid - 3 Columns */}
      <AnimatePresence mode="wait">
        {filteredJobs.length > 0 ? (
          <motion.div
            key={searchQuery + selectedType + selectedCategory + isRemoteOnly}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id || index}
                variants={itemVariants}
                className="h-full"
              >
                <JobCard job={job} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-zinc-400 text-lg">
                No jobs found matching your filters
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {filteredJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-500"
        >
          Showing <span className="text-white">{filteredJobs.length}</span> of{" "}
          <span className="text-white">{initialJobs.length}</span> jobs
          <span className="mx-2">·</span>
          <span className="text-zinc-600">
            Last updated {new Date().toLocaleDateString()}
          </span>
        </motion.div>
      )}
    </div>
  );
}
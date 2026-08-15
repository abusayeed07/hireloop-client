"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getJobs } from "@/lib/api/jobs";
import toast from "react-hot-toast";
import { Filter, Search, MapPin, X, ChevronDown, Building2, Wifi, Briefcase, Users, Sparkles } from "lucide-react";
import Pagination from "@/components/Pagination";
import JobCard from "@/components/jobs/JobCard";
import LoadingPage from "@/app/loading";

// =============================================
// FILTER SIDEBAR COMPONENT
// =============================================
const FilterSidebar = ({ filters, setFilters, categories, categoryCounts, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    jobType: true,
    remote: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

  return (
    <div className="lg:w-72 flex-shrink-0">
      <div className="bg-[#111214] border border-white/5 rounded-2xl p-5 sticky top-24">
        <div className="flex items-center justify-between lg:hidden mb-4">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
          <Filter className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          <button
            onClick={() => setFilters({ category: "", jobType: "", remote: "" })}
            className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-zinc-300">Category</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSections.category ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ""}
                  onChange={() => setFilters((prev) => ({ ...prev, category: "" }))}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">All Categories</span>
                <span className="ml-auto text-xs text-zinc-500">{Object.values(categoryCounts).reduce((a, b) => a + b, 0)}</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={filters.category.toLowerCase() === cat.toLowerCase()}
                    onChange={() => setFilters((prev) => ({ ...prev, category: cat }))}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors capitalize">{cat}</span>
                  <span className="ml-auto text-xs text-zinc-500">{categoryCounts[cat] || 0}</span>
                </label>
              ))}
            </motion.div>
          )}
        </div>

        <div className="border-t border-white/5 my-4" />

        {/* Job Type Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("jobType")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-zinc-300">Job Type</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSections.jobType ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.jobType && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-1.5"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="jobType"
                  value=""
                  checked={filters.jobType === ""}
                  onChange={() => setFilters((prev) => ({ ...prev, jobType: "" }))}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Any Type</span>
              </label>
              {jobTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="jobType"
                    value={type}
                    checked={filters.jobType === type}
                    onChange={() => setFilters((prev) => ({ ...prev, jobType: type }))}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{type}</span>
                </label>
              ))}
            </motion.div>
          )}
        </div>

        <div className="border-t border-white/5 my-4" />

        {/* Remote Filter */}
        <div>
          <button
            onClick={() => toggleSection("remote")}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-zinc-300">Remote</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSections.remote ? "rotate-180" : ""}`} />
          </button>
          {expandedSections.remote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-1.5"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="remote"
                  value=""
                  checked={filters.remote === ""}
                  onChange={() => setFilters((prev) => ({ ...prev, remote: "" }))}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">All Jobs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="remote"
                  value="remote"
                  checked={filters.remote === "remote"}
                  onChange={() => setFilters((prev) => ({ ...prev, remote: "remote" }))}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Remote Only
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="remote"
                  value="onsite"
                  checked={filters.remote === "onsite"}
                  onChange={() => setFilters((prev) => ({ ...prev, remote: "onsite" }))}
                  className="w-3.5 h-3.5 accent-blue-500"
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  On-site Only
                </span>
              </label>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================
// MAIN PAGE
// =============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export default function BrowseJobsPage() {
  const searchParams = useSearchParams();

  // ✅ Support both 'search' (AI) and 'q' (homepage) parameters
  const initialSearch =
    searchParams.get("search") ||
    searchParams.get("q") ||
    "";

  const initialLocation =
    searchParams.get("location") || "";

  // ✅ FIX: read the 'category' param the AI assistant redirects with
  // (e.g. /browse-jobs?category=Marketing) — this was previously ignored,
  // so category-based redirects from the chat assistant showed all jobs.
  const initialCategory =
    searchParams.get("category") || "";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [locationQuery, setLocationQuery] = useState(initialLocation);

  const [filters, setFilters] = useState({
    category: initialCategory, // ✅ was ""
    jobType: "",
    remote: "",
  });

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 6;

  // ✅ Keep filters in sync if the URL changes after mount
  // (e.g. user sends another chat message that redirects again
  // while already on /browse-jobs)
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setLocationQuery(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  // Fetch data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // FILTER LOGIC
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((job) => {
        const searchableFields = [
          job.jobTitle,
          job.companyName,
          job.jobCategory,
          job.location,
          job.jobType,
          job.description,
        ].filter(Boolean);

        // Handle skills (string or array)
        let skillsText = "";
        if (job.skills) {
          if (Array.isArray(job.skills)) {
            skillsText = job.skills.join(" ");
          } else {
            skillsText = job.skills;
          }
        }
        searchableFields.push(skillsText);

        return searchableFields.some(field =>
          field.toLowerCase().includes(query)
        );
      });
    }

    if (locationQuery.trim()) {
      const query = locationQuery.toLowerCase().trim();
      result = result.filter((job) => {
        if (job.isRemote) return query.includes("remote");
        return job.location?.toLowerCase().includes(query);
      });
    }

    if (filters.category) {
      // ✅ FIX: case-insensitive comparison. The AI assistant sends
      // display-cased categories like "Marketing" / "Human Resources";
      // job documents may store jobCategory with different casing.
      const targetCategory = filters.category.toLowerCase();
      result = result.filter(
        (job) =>
          (job.jobCategory || "Uncategorized").toLowerCase() === targetCategory
      );
    }

    if (filters.jobType) {
      result = result.filter(
        (job) => job.jobType?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    if (filters.remote === "remote") {
      result = result.filter((job) => job.isRemote === true);
    } else if (filters.remote === "onsite") {
      result = result.filter((job) => job.isRemote === false || job.isRemote === undefined);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "salary-high") return (b.maxSalary || 0) - (a.maxSalary || 0);
      if (sortBy === "salary-low") return (a.minSalary || 0) - (b.minSalary || 0);
      return 0;
    });

    return result;
  }, [jobs, searchQuery, locationQuery, filters, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <LoadingPage 
        title="Finding Jobs"
        message="Loading the latest job opportunities for you..."
        customStats={[
          { icon: Briefcase, label: "Loading jobs", animate: "spin" },
          { icon: Users, label: "Finding matches", animate: "pulse" },
          { icon: Sparkles, label: "Preparing recommendations", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-black border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 md:py-26">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">
              Career Opportunities
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Browse Jobs
          </h1>
          <p className="text-zinc-400 mt-3 text-lg max-w-2xl">
            Discover your next opportunity from thousands of listings. Find roles that match your skills, location, and career goals.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-8 pb-6">
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Job title, keyword, company, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Location or type 'remote'"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            />
            {locationQuery && (
              <button
                onClick={() => setLocationQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            type="submit"
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 text-sm"
          >
            Search
          </button>
        </form>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                Searching: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-blue-300 transition-colors">
                  <X size={12} />
                </button>
              </span>
            </motion.div>
          )}
          {locationQuery && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs">
                Location: "{locationQuery}"
                <button onClick={() => setLocationQuery("")} className="hover:text-emerald-300 transition-colors">
                  <X size={12} />
                </button>
              </span>
            </motion.div>
          )}
          {/* ✅ NEW: category chip so it's visible/clearable when arriving via AI redirect */}
          {filters.category && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs">
                Category: {filters.category}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
                  className="hover:text-purple-300 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="hidden lg:block">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                categories={[...new Set(jobs.map(j => j.jobCategory).filter(Boolean))]}
                categoryCounts={jobs.reduce((acc, job) => {
                  const cat = job.jobCategory || "Uncategorized";
                  acc[cat] = (acc[cat] || 0) + 1;
                  return acc;
                }, {})}
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#111214] border border-white/5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="absolute top-0 left-0 h-full w-72 bg-black p-4 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    categories={[...new Set(jobs.map(j => j.jobCategory).filter(Boolean))]}
                    categoryCounts={jobs.reduce((acc, job) => {
                      const cat = job.jobCategory || "Uncategorized";
                      acc[cat] = (acc[cat] || 0) + 1;
                      return acc;
                    }, {})}
                    onClose={() => setShowMobileFilters(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Job Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-400">
                Showing <span className="text-white font-medium">{filteredJobs.length}</span> jobs
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-[#111214] border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredJobs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white">No jobs found</h3>
                <p className="text-zinc-400 mt-2">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLocationQuery("");
                    setFilters({ category: "", jobType: "", remote: "" });
                  }}
                  className="mt-4 px-6 py-2 text-sm bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={searchQuery + locationQuery + JSON.stringify(filters) + sortBy}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {currentItems.map((job, index) => (
                    <motion.div
                      key={job._id || index}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.05 } }
                      }}
                    >
                      <JobCard job={job} index={index} />
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      size="md"
                      color="primary"
                      showTotal={true}
                      totalItems={filteredJobs.length}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
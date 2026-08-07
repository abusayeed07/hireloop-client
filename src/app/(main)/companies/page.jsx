// frontend/src/app/(main)/companies/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, MapPin, Briefcase, ChevronRight, X, Building, Users, Sparkles } from "lucide-react";
import { serverFetch } from "@/lib/core/server";
import toast from "react-hot-toast";
import LoadingPage from "@/app/loading";
import Pagination from "@/components/Pagination";

// Company Card Component
const CompanyCard = ({ company, index }) => {
  const [openJobs, setOpenJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const jobs = await serverFetch(`/api/jobs?companyId=${company._id}`);
        const activeJobs = Array.isArray(jobs) ? jobs.filter(job => job.status !== 'closed') : [];
        setOpenJobs(activeJobs.length);
      } catch (error) {
        console.error("Error fetching company jobs:", error);
        setOpenJobs(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, [company._id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  // ✅ Get full industry name
  const getIndustryName = (industry) => {
    const industryMap = {
      't': 'Technology',
      'd': 'Design',
      'm': 'Marketing',
      'f': 'Finance',
      'h': 'Healthcare',
      'e': 'Education',
      'man': 'Manufacturing',
      'Technology': 'Technology',
      'Design': 'Design',
      'Marketing': 'Marketing',
      'Finance': 'Finance',
      'Healthcare': 'Healthcare',
      'Education': 'Education',
      'Manufacturing': 'Manufacturing',
    };
    return industryMap[industry] || industry || 'General';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{ y: -4, borderColor: "rgba(59,130,246,0.3)" }}
      className="bg-[#111214] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col justify-between"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {company.logo ? (
            <Image 
              src={company.logo} 
              alt={company.name} 
              width={40} 
              height={40} 
              className="w-10 h-10 object-contain"
              unoptimized
            />
          ) : (
            <Building2 className="w-6 h-6 text-zinc-400" />
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer truncate">
              {company.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${getStatusColor(company.status)}`}>
              {getStatusLabel(company.status)}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5 truncate">
            {getIndustryName(company.industry)}
          </p>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-2 text-sm text-zinc-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{company.location || "Location not specified"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Open Jobs + View Profile */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-zinc-300">
            <span className="font-semibold text-white">
              {loading ? "..." : openJobs}
            </span> Open Jobs
          </span>
        </div>
        <Link
          href={`/companies/${company._id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

// Main Companies Page
export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await serverFetch('/api/companies');
        
        console.log('📊 Raw API response:', response);
        
        // ✅ Handle the response format correctly
        let companiesData = [];
        if (response && response.success && response.data) {
          companiesData = response.data;
        } else if (Array.isArray(response)) {
          companiesData = response;
        }
        
        console.log(`✅ Found ${companiesData.length} companies`);
        console.log('📊 Companies:', companiesData.map(c => ({ name: c.name, status: c.status })));
        
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        toast.error("Failed to load companies");
        setCompanies([]);
        setFilteredCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filter companies based on search
  useEffect(() => {
    setCurrentPage(1);

    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = companies.filter(
      (company) =>
        company.name?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query) ||
        company.location?.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query)
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <LoadingPage 
        title="Discover Companies"
        message="Loading the best employers for you..."
        customStats={[
          { icon: Building, label: "Loading companies", animate: "spin" },
          { icon: Users, label: "Finding top employers", animate: "pulse" },
          { icon: Sparkles, label: "Preparing recommendations", animate: "bounce" },
        ]}
        customColor="from-blue-400 via-indigo-400 to-purple-400"
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 md:py-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">
              Company Directory
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Discover Top Companies
          </h1>
          <p className="text-zinc-400 mt-3 text-lg max-w-2xl">
            Find and research the best employers in Bangladesh. Explore their company culture, benefits, and open positions.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by company name, industry, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111214]/80 backdrop-blur-sm border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
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
          <button 
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 text-sm whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* Active Filter Tag */}
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
              Searching: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="hover:text-blue-300 transition-colors">
                <X size={12} />
              </button>
            </span>
          </motion.div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-sm text-zinc-400">
            Showing <span className="text-white font-medium">{filteredCompanies.length > 0 ? Math.min(indexOfFirstItem + 1, filteredCompanies.length) : 0}-{Math.min(indexOfLastItem, filteredCompanies.length)}</span> of <span className="text-white font-medium">{filteredCompanies.length}</span> Companies Found
          </p>
          {filteredCompanies.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {filteredCompanies.filter(c => c.status?.toLowerCase() === 'approved').length} Approved
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {filteredCompanies.filter(c => c.status?.toLowerCase() === 'pending').length} Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                {filteredCompanies.filter(c => c.status?.toLowerCase() === 'rejected').length} Rejected
              </span>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl"
          >
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-white">No companies found</h3>
            <p className="text-zinc-400 mt-2">Try adjusting your search terms</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-6 py-2 text-sm bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentCompanies.map((company, index) => (
                <CompanyCard key={company._id || index} company={company} index={index} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalItems={filteredCompanies.length}
                  itemsPerPage={itemsPerPage}
                  showTotal={true}
                  color="primary"
                  size="md"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
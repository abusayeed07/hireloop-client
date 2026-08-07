"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Chip, Tooltip, Modal } from "@heroui/react";
import { Briefcase, Plus, Eye, Pencil, TrashBin } from "@gravity-ui/icons";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";
import { getMyJobs } from "@/lib/api/jobs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, Search, X } from "lucide-react";
import Pagination from "@/components/Pagination";
import Metadata from "@/components/Metadata";

export default function RecruiterJobs() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // ✅ Check session first
      if (!session?.user?.id) {
        if (isMounted) {
          setLoading(false);
          // ✅ Redirect inside useEffect, not during render
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace('/signin');
          }
        }
        return;
      }

      try {
        const companyData = await getLoggedInRecruiterCompany();
        if (!companyData || Object.keys(companyData).length === 0) {
          if (isMounted) {
            // ✅ Redirect inside useEffect
            if (!isRedirecting) {
              setIsRedirecting(true);
              router.replace('/dashboard/recruiter/company');
            }
          }
          return;
        }

        let jobsData = await getMyJobs() || [];
        
        // Sort jobs by newest first
        jobsData = jobsData.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return dateB - dateA;
        });

        if (isMounted) {
          setCompany(companyData);
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        if (isMounted) {
          if (!isRedirecting) {
            setIsRedirecting(true);
            router.replace('/dashboard/recruiter/company');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!isPending) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, isPending, router, isRedirecting]);

  // Filter Jobs based on Search Query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    const query = searchQuery.toLowerCase().trim();
    return jobs.filter((job) => {
      return (
        job.jobTitle?.toLowerCase().includes(query) ||
        job.companyName?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.jobCategory?.toLowerCase().includes(query)
      );
    });
  }, [jobs, searchQuery]);

  // Pagination Calculations
  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Handle Page Change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Open Delete Modal
  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  // Actually Delete the Job
  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      
      const response = await fetch(`${baseUrl}/api/jobs/${jobToDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Job deleted successfully!");
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobToDelete._id));
        setDeleteModalOpen(false);
        setJobToDelete(null);
        if (currentJobs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error(result.error || "Failed to delete job.");
      }
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Handle Edit navigation with event handler
  const handleEditJob = (jobId) => {
    router.push(`/dashboard/recruiter/jobs/${jobId}/edit`);
  };

  // ✅ Handle View navigation with event handler
  const handleViewJob = (jobId) => {
    router.push(`/browse-jobs/${jobId}`);
  };

  // ✅ Show loading state
  if (isPending || loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading your workspace...</p>
        </div>
      </motion.div>
    );
  }

  // ✅ Don't render anything if redirecting
  if (isRedirecting) {
    return null;
  }

  // ✅ If no session, show nothing (useEffect handles redirect)
  if (!session?.user) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "success";
      case "closed": case "inactive": return "danger";
      default: return "warning";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "Active";
      case "closed": return "Closed";
      case "inactive": return "Inactive";
      default: return status || "Unknown";
    }
  };

  // ✅ No jobs state
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return (
      <>
        <Metadata page="recruiter-manage-jobs" />
        <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Company Jobs</h1>
                  <p className="text-zinc-400 text-sm mt-1">Manage and monitor all your job postings</p>
                </div>
                <Link href="/dashboard/recruiter/jobs/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11">
                    <Plus size={18} /> Post New Job
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} className="text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No jobs yet</h3>
              <p className="text-zinc-400 mb-6">Get started by posting your first job opening</p>
              <Link href="/dashboard/recruiter/jobs/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Metadata page="recruiter-manage-jobs" />
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <div className="p-6 max-w-7xl mx-auto space-y-4">
          
          {/* Header with Search and Actions */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">Manage All Jobs</h2>
              <p className="text-sm text-zinc-400">View, update, and manage your current job postings.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 focus:border-blue-500/50 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-zinc-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Post New Job Button */}
              <Link href="/dashboard/recruiter/jobs/new" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-10 shadow-lg shadow-purple-500/20">
                  <Plus size={18} />
                  Post New Job
                </Button>
              </Link>
              
            </div>
          </div>

          <Table aria-label="Company jobs management table" className="dark">
            <Table.ScrollContainer className="max-h-[70vh]">
              <Table.Content className="min-w-[800px]">
                <Table.Header className="bg-dark-950/80 sticky top-0 z-10">
                  <Table.Column isRowHeader className="text-zinc-300 font-medium">Job Title</Table.Column>
                  <Table.Column className="text-zinc-300 font-medium">Type & Category</Table.Column>
                  <Table.Column className="text-zinc-300 font-medium">Location</Table.Column>
                  <Table.Column className="text-zinc-300 font-medium">Deadline</Table.Column>
                  <Table.Column className="text-zinc-300 font-medium">Status</Table.Column>
                  <Table.Column className="text-zinc-300 font-medium">Actions</Table.Column>
                </Table.Header>
                <Table.Body>
                  {currentJobs.map((job) => (
                    <Table.Row key={job._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <Table.Cell className="py-4">
                        <div className="font-medium text-white">{job.jobTitle || "N/A"}</div>
                      </Table.Cell>
                      <Table.Cell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm capitalize font-medium text-zinc-300">{job.jobType || "N/A"}</span>
                          <span className="text-xs text-zinc-500 capitalize">{job.jobCategory || "N/A"}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="py-4">
                        {job.isRemote ? (
                          <span className="flex items-center gap-1 text-zinc-300"><span>🌍</span> Remote</span>
                        ) : (
                          <span className="text-zinc-300">{job.location || "N/A"}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="py-4">
                        <span className="text-zinc-300">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}</span>
                      </Table.Cell>
                      <Table.Cell className="py-4">
                        <Chip color={getStatusColor(job.status)} size="sm" variant="flat" className="capitalize">
                          {getStatusText(job.status)}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell className="py-4">
                        <div className="flex items-center gap-2">
                          
                          {/* 👁️ VIEW BUTTON - Using onClick handler */}
                          <Tooltip content="View Details">
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="light" 
                              className="text-zinc-400 hover:text-white min-w-8 w-8 h-8"
                              onPress={() => handleViewJob(job._id)}
                            >
                              <Eye size={16} />
                            </Button>
                          </Tooltip>

                          {/* ✏️ EDIT BUTTON - Using onClick handler */}
                          <Tooltip content="Edit Job">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="text-zinc-400 hover:text-purple-400 min-w-8 w-8 h-8"
                              onPress={() => handleEditJob(job._id)}
                            >
                              <Pencil size={16} />
                            </Button>
                          </Tooltip>

                          {/* 🗑️ DELETE BUTTON */}
                          <Tooltip content="Delete Job">
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="light" 
                              className="text-red-400 hover:text-red-300 min-w-8 w-8 h-8" 
                              onPress={() => openDeleteModal(job)}
                            >
                              <TrashBin size={16} />
                            </Button>
                          </Tooltip>

                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 flex justify-center"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                size="md"
                color="primary"
                showTotal={true}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog className="sm:max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Icon className="bg-red-500/10 text-red-400 rounded-full p-1">
                      <AlertTriangle className="size-5" />
                    </Modal.Icon>
                    <Modal.Heading className="text-white text-lg font-semibold">
                      Delete Job Posting
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="space-y-4">
                    <p className="text-zinc-300">
                      Are you sure you want to delete the job posting{" "}
                      <span className="font-semibold text-white">
                        "{jobToDelete?.jobTitle || 'Unknown'}"
                      </span>
                      ?
                    </p>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400">
                        ⚠️ This action cannot be undone. All applications associated with this job will also be permanently removed.
                      </p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="flex gap-3">
                    <Button variant="flat" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium" onPress={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                      Cancel
                    </Button>
                    <Button variant="flat" className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium disabled:opacity-50" onPress={confirmDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</span>
                      ) : (
                        "Yes, Delete"
                      )}
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>

        </div>
      </div>
    </>
  );
}
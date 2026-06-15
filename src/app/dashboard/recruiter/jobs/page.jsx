import { getCompanyJobs } from "@/lib/api/jobs";
import React from "react";
import { Table, Button, Chip, Tooltip } from "@heroui/react";
import { Briefcase, Plus, Eye, Pencil, TrashBin } from "@gravity-ui/icons";
import Link from "next/link";
import { getLoggedInRecruiterCompany } from "@/lib/api/companies";

const RecruiterJobs = async () => {
  const company = await getLoggedInRecruiterCompany();
  const jobs = await getCompanyJobs(company._id) || [];
  console.log("Job for company", jobs);

  // Helper to determine status chip coloring
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "closed":
      case "inactive":
        return "danger";
      default:
        return "warning";
    }
  };

  // Helper to get status display text
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "closed":
        return "Closed";
      case "inactive":
        return "Inactive";
      default:
        return status || "Unknown";
    }
  };

  // Check if jobs is an array and has data
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Company Jobs
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                  Manage and monitor all your job postings
                </p>
              </div>
              <Link href="/dashboard/recruiter/jobs/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11">
                  <Plus size={18} />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No jobs yet
            </h3>
            <p className="text-zinc-400 mb-6">
              Get started by posting your first job opening
            </p>
            <Link href="/dashboard/recruiter/jobs/new">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] p-8">
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Manage All Jobs
              </h2>
              <p className="text-sm text-zinc-400">
                View, update, and manage your current job postings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Stats Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 py-2">
                <Briefcase size={14} className="text-purple-400" />
                <span className="text-xs text-zinc-400">Total Jobs</span>
                <span className="text-sm font-semibold text-white">
                  {jobs.length}
                </span>
              </div>
              <Link href="/dashboard/recruiter/jobs/new">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11 shadow-lg shadow-purple-500/20">
                  <Plus size={18} />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <Table aria-label="Company jobs management table" className="dark">
          <Table.ScrollContainer className="max-h-[70vh]">
            <Table.Content className="min-w-[800px]">
              <Table.Header className="bg-dark-950/80 sticky top-0 z-10">
                <Table.Column isRowHeader className="text-zinc-300 font-medium">
                  Job Title
                </Table.Column>
                <Table.Column className="text-zinc-300 font-medium">
                  Type & Category
                </Table.Column>
                <Table.Column className="text-zinc-300 font-medium">
                  Location
                </Table.Column>
                <Table.Column className="text-zinc-300 font-medium">
                  Deadline
                </Table.Column>
                <Table.Column className="text-zinc-300 font-medium">
                  Status
                </Table.Column>
                <Table.Column className="text-zinc-300 font-medium">
                  Actions
                </Table.Column>
              </Table.Header>

              <Table.Body>
                {jobs.map((job) => (
                  <Table.Row
                    key={job._id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* job title  */}
                    <Table.Cell className="py-4">
                      <div className="font-medium text-white">
                        {job.jobTitle || "N/A"}
                      </div>
                    </Table.Cell>

                    {/* job type  */}
                    <Table.Cell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm capitalize font-medium text-zinc-300">
                          {job.jobType || "N/A"}
                        </span>
                        <span className="text-xs text-zinc-500 capitalize">
                          {job.jobCategory || "N/A"}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* location  */}
                    <Table.Cell className="py-4">
                      {job.isRemote ? (
                        <span className="flex items-center gap-1 text-zinc-300">
                          <span>🌍</span> Remote
                        </span>
                      ) : (
                        <span className="text-zinc-300">
                          {job.location || "N/A"}
                        </span>
                      )}
                    </Table.Cell>

                    {/* deadline  */}
                    <Table.Cell className="py-4">
                      <span className="text-zinc-300">
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </Table.Cell>

                    {/* status  */}
                    <Table.Cell className="py-4">
                      <Chip
                        color={getStatusColor(job.status)}
                        size="sm"
                        variant="flat"
                        className="capitalize"
                      >
                        {getStatusText(job.status)}
                      </Chip>
                    </Table.Cell>

                    {/* Action Button  */}
                    <Table.Cell className="py-4">
                      <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-zinc-400 hover:text-white min-w-8 w-8 h-8"
                            aria-label="View job details"
                          >
                            <Eye size={16} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit Job">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-zinc-400 hover:text-purple-400 min-w-8 w-8 h-8"
                            aria-label="Edit job"
                          >
                            <Pencil size={16} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete Job">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-red-400 hover:text-red-300 min-w-8 w-8 h-8"
                            aria-label="Delete job"
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
      </div>
    </div>
  );
};

export default RecruiterJobs;

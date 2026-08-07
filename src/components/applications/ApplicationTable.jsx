"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronRight,
  FolderArchive,
} from "lucide-react";
import { Button } from "@heroui/react";
import Pagination from "@/components/Pagination";

const ApplicationTable = ({ 
  applications, 
  totalItems, 
  currentPage, 
  itemsPerPage, 
  totalPages,
  baseUrl,
  tab,
  search,
}) => {
  const router = useRouter();

  // for status
  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-500/20 text-yellow-400",
      applied: "bg-yellow-500/20 text-yellow-400",
      review: "bg-blue-500/20 text-blue-400",
      reviewed: "bg-blue-500/20 text-blue-400",
      shortlisted: "bg-green-500/20 text-green-400",
      interview: "bg-purple-500/20 text-purple-400",
      interviewing: "bg-purple-500/20 text-purple-400",
      accepted: "bg-cyan-500/20 text-cyan-400",
      offered: "bg-cyan-500/20 text-cyan-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  // for date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build URL with query params (client-side)
  const buildUrl = (newParams) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tab) params.set("tab", tab);
    if (newParams.page) params.set("page", newParams.page);
    return `/dashboard/seeker/applications?${params.toString()}`;
  };

  // Handle page change with client-side navigation
  const handlePageChange = (newPage) => {
    const url = buildUrl({ page: newPage });
    router.push(url);
  };

  if (totalItems === 0) {
    return tab === "archived" ? (
      <div className="py-20 text-center">
        <FolderArchive className="w-16 h-16 mx-auto text-zinc-700 mb-5" />
        <h2 className="text-2xl font-semibold text-white">Archive is Empty</h2>
        <p className="text-zinc-400 mt-2 max-w-sm mx-auto">
          Applications only appear here if their current tracking status is updated to rejected.
        </p>
      </div>
    ) : (
      <div className="py-20 text-center">
        <Briefcase className="w-16 h-16 mx-auto text-zinc-700 mb-5" />
        <h2 className="text-2xl font-semibold text-white">No Active Applications</h2>
        <p className="text-zinc-400 mt-2">
          You haven't applied to any jobs yet or your filters returned no hits.
        </p>
        <Link href="/browse-jobs">
          <Button color="primary" className="mt-6 bg-cyan-500 hover:bg-cyan-600">
            Browse Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full">
        <thead className="bg-zinc-950">
          <tr className="border-b border-white/10">
            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Job Title
            </th>
            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Company
            </th>
            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Applied
            </th>
            <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {applications.map((application) => {
            const logoUrl =
              application.logo ||
              application.companyLogo ||
              application.company?.logo ||
              application.companyImage ||
              application.image;

            return (
              <tr key={application._id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={application.companyName || "Company logo"}
                          className="w-full h-full object-contain p-1"
                          width={40}
                          height={40}
                          unoptimized
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/browse-jobs/${application.jobId}`}
                        className="font-medium text-white hover:text-cyan-400 transition"
                      >
                        {application.jobTitle || "Untitled Position"}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {application.jobType || "Full-time"} •{" "}
                        {application.location || "Remote"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-white font-medium">
                    {application.companyName || application.name || "Unknown Company"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <p className="text-white">
                    {formatDate(application.appliedAt || application.createdAt)}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status || "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/browse-jobs/${application.jobId}`}
                    className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-white/5">
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
        </div>
      )}
    </>
  );
};

export default ApplicationTable;
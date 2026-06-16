import JobFilters from "@/components/jobs/JobFilters";
import { getJobs } from "@/lib/api/jobs";

export default async function BrowseJobsPage() {
  // Fetched server-side on the initial request
  const jobs = await getJobs();

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-6 md:p-12 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-400 uppercase tracking-wider">
              Career Opportunities
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Open Positions
          </h1>
          <p className="text-zinc-400 mt-3 text-lg">
            Discover your next engineering challenge at top companies.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <span className="text-2xl font-bold text-white">
                {jobs?.length || 0}
              </span>
              <span className="text-zinc-500 ml-2">Total Jobs</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-400">
                {new Set(jobs?.map((j) => j.companyName)).size || 0}
              </span>
              <span className="text-zinc-500 ml-2">Companies</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400">
                {jobs?.filter((j) => j.isRemote).length || 0}
              </span>
              <span className="text-zinc-500 ml-2">Remote</span>
            </div>
          </div>
        </div>

        {/* Pass data to JobFilters */}
        <JobFilters initialJobs={jobs || []} />
      </div>
    </div>
  );
}
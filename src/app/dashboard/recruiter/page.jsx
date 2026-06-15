"use client";

import { useSession } from "@/lib/auth-client";
import React from "react";
import DashboardStats from "../../../components/dashboard/DashboardStats";
import {
  Briefcase,
  Eye,
  Envelope,
  Bookmark,
  Persons, // Changed from 'Users' to 'Persons'
} from "@gravity-ui/icons";

import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import DashboardRecentApplications from "@/components/dashboard/DashboardRecentApplications";

const RecruiterDashboardPage = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="text-white p-5">Loading....</div>;
  }

  const user = session?.user;

  const recruiterStats = [
    {
      title: "Total Job Posts",
      value: "48",
      icon: Briefcase,
    },
    {
      title: "Total Applicants",
      value: "1,284",
      icon: Persons, // Using Persons instead of Users
    },
    {
      title: "Active Jobs",
      value: "18",
      icon: Eye,
    },
    {
      title: "Jobs Closed",
      value: "32",
      icon: Bookmark,
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-black text-white">
      <DashboardNavbar />

      <div className="p-6 flex flex-col gap-6">

        {/* dashboard header name  */}
        <div className="px-4 pt-5">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || "Recruiter"}
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Here is an overview of your job posting performance.
          </p>
        </div>
        </div>

        {/* dashboard stats  */}
        <div className="mt-8">
          <DashboardStats stats={recruiterStats} />
      </div>

      <div className="mt-15">
        <DashboardRecentApplications />
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;

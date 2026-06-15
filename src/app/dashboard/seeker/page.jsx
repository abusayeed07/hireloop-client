"use client";

import { useSession } from "@/lib/auth-client";
import React from "react";
import DashboardStats from "../../../components/dashboard/DashboardStats";
import { Briefcase, Eye, Envelope, Bookmark } from "@gravity-ui/icons";

const SeekerDashboardPage = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="text-white p-5">Loading....</div>;
  }

  const user = session?.user;
  console.log("Session data in SeekerDashboardPage", session);

  const seekerStats = [
    {
      title: "Applications Sent",
      value: "14",
      icon: Briefcase,
    },
    {
      title: "Profile Views",
      value: "284",
      icon: Eye,
    },
    {
      title: "Interview Invites",
      value: "3",
      icon: Envelope,
    },
    {
      title: "Saved Jobs",
      value: "19",
      icon: Bookmark,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="px-4 pt-5">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name || "Seeker"}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Here is an overview of your job search progress.
        </p>
      </div>

      {/* Rendered Component */}
      <DashboardStats stats={seekerStats} />
    </div>
  );
};

export default SeekerDashboardPage;

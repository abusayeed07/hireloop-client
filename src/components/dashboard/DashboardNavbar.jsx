"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bell, Search } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const DashboardNavbar = () => {
  const { data: session } = useSession();
  const [imageError, setImageError] = useState(false);

  const getInitials = () => {
    if (!session?.user?.name) return "U";

    return session.user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="h-16 bg-dark border-b border-white/10 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-4xl">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search applications, jobs, or talent..."
            className="w-full h-11 bg-[#1A1A1A] border border-white/10 rounded-lg pl-11 pr-4 text-white outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5 ml-6">
        {/* Notification */}
        <button className="relative text-gray-400 hover:text-white transition">
          <Bell size={20} />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10"></div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <h4 className="text-sm font-medium text-white">
              {session?.user?.name || "User"}
            </h4>

            <p className="text-xs text-gray-500">
              {session?.user?.email || "Dashboard User"}
            </p>
          </div>

          {session?.user?.image && !imageError ? (
            <Image
              src={session.user.image}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full object-cover border border-white/10"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold">
              {getInitials()}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
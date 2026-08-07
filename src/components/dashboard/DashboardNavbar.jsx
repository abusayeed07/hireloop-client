// components/dashboard/DashboardNavbar.jsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Search, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const DashboardNavbar = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [imageError, setImageError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Only toggle dropdown if we are on a mobile view
  const handleUserClick = () => {
    if (window.innerWidth < 768) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <>
      <nav className="h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-black/20">

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-4xl mx-4">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Search applications, jobs, or talent..."
              className="w-full h-11 bg-zinc-900/50 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Search - Mobile Toggle */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <Search size={22} />
        </button>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Notification */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 hidden md:block" />

          {/* User Profile Trigger Area */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              className="flex items-center gap-3 group focus:outline-none md:cursor-default"
            >
              {/* Desktop Only Text Layout */}
              <div className="text-right hidden md:block">
                <h4 className="text-sm font-medium text-white">
                  {session?.user?.name || "User"}
                </h4>
                <p className="text-xs text-zinc-500">
                  {session?.user?.email || "Dashboard User"}
                </p>
              </div>

              {/* Avatar Logo (Always shown) */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 md:group-hover:border-white/10 transition-all duration-300">
                {session?.user?.image && !imageError ? (
                  <Image
                    src={session.user.image}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials()}
                  </div>
                )}
              </div>
            </button>

            {/* Mobile Dropdown Menu (Hidden on md/desktop screens via Tailwind 'md:hidden') */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 md:hidden"
                >
                  <div className="p-4">
                    <p className="text-sm font-medium text-white truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {session?.user?.email || "user@example.com"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar Expansion */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 shadow-lg shadow-black/20"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search applications, jobs, or talent..."
                className="w-full h-11 bg-zinc-900/50 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-zinc-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                autoFocus
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNavbar;
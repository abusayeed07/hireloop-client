"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../../../public/logo.png";

import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
  LogOut,
  User,
  Briefcase,
  Bookmark,
  FileText,
  CreditCard,
  Home,
  Users,
  Building2,
  DollarSign,
  Menu,
  Globe,
  X,
  Shield,
  BarChart3,
  Zap,
  Bell,
  Mail,
  Award,
  Star,
  Clock,
  Calendar,
  MessageSquare,
  PieChart,
  TrendingUp,
  Activity,
} from "lucide-react";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Fix hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Get user role with fallback
  const role = user?.role?.toLowerCase() || "seeker";

  // ✅ Get dashboard name based on role
  const getDashboardName = () => {
    switch(role) {
      case "admin":
        return "Admin Console";
      case "recruiter":
        return "Recruiter Dashboard";
      case "seeker":
      default:
        return "Seeker Dashboard";
    }
  };

  // ✅ Get dashboard icon based on role
  const getDashboardIcon = () => {
    switch(role) {
      case "admin":
        return <Shield className="w-5 h-5" />;
      case "recruiter":
        return <Building2 className="w-5 h-5" />;
      case "seeker":
      default:
        return <User className="w-5 h-5" />;
    }
  };

  // ✅ Navigation links for each role
  const recruiterNavLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/recruiter" },
    {
      icon: Building2,
      label: "Company Profile",
      href: "/dashboard/recruiter/company",
    },
    {
      icon: PlusCircle,
      label: "Post a New Job",
      href: "/dashboard/recruiter/jobs/new",
    },
    {
      icon: ListChecks,
      label: "Manage All Jobs",
      href: "/dashboard/recruiter/jobs",
    },
    { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const seekerNavLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/seeker" },
    {
      icon: Bookmark,
      label: "Saved Jobs",
      href: "/dashboard/seeker/saved-jobs",
    },
    {
      icon: FileText,
      label: "Applications",
      href: "/dashboard/seeker/applications",
    },
    { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const adminNavLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users" },
    { icon: Building2, label: "Companies", href: "/dashboard/admin/companies" },
    { icon: Briefcase, label: "Jobs", href: "/dashboard/admin/jobs" },
    { icon: DollarSign, label: "Payments", href: "/dashboard/admin/payments" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
  ];

  // ✅ Map role to nav links
  const navLinksMap = {
    seeker: seekerNavLinks,
    recruiter: recruiterNavLinks,
    admin: adminNavLinks,
  };
  const navItems = navLinksMap[role] || seekerNavLinks;

  // ✅ SIMPLIFIED isActive function - exact matching with priority
  const isActive = (href) => {
    // 1. EXACT MATCH - highest priority
    if (pathname === href) return true;

    // 2. For dashboard parent pages, only active when no child matches
    if (
      href === "/dashboard/seeker" ||
      href === "/dashboard/recruiter" ||
      href === "/dashboard/admin"
    ) {
      if (pathname.startsWith(href)) {
        const hasMoreSpecificMatch = navItems.some(item => {
          if (item.href === href) return false;
          if (item.href.startsWith(href) && item.href !== href) {
            return pathname === item.href || pathname.startsWith(item.href + '/');
          }
          return false;
        });
        return !hasMoreSpecificMatch;
      }
      return false;
    }

    if (pathname.startsWith(href)) {
      const isMoreSpecificMatch = navItems.some(item => {
        if (item.href === href) return false;
        if (pathname.startsWith(item.href) && item.href.startsWith(href)) {
          return pathname === item.href || pathname.startsWith(item.href + '/');
        }
        return false;
      });
      return !isMoreSpecificMatch;
    }

    return false;
  };

  const handleSignOut = async () => {
    try {
      if (user?.id && typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        sessionStorage.setItem("redirectUserID", user.id);
      }

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/signin");
          },
          onError: (error) => {
            console.error("Sign out error:", error);
            toast.error("Failed to sign out");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  const getAvatarImage = () => {
    const image = user?.image;
    if (image && image.trim() !== "") return image;
    return null;
  };

  // ✅ Get role badge color
  const getRoleBadgeColor = () => {
    switch(role) {
      case "admin":
        return "from-red-500 to-orange-500";
      case "recruiter":
        return "from-blue-500 to-cyan-500";
      case "seeker":
      default:
        return "from-emerald-500 to-teal-500";
    }
  };

  // ✅ Get role badge label
  const getRoleBadgeLabel = () => {
    switch(role) {
      case "admin":
        return "Admin";
      case "recruiter":
        return "Recruiter";
      case "seeker":
      default:
        return "Seeker";
    }
  };

  // Desktop Navigation Renderer
  const renderNavContent = () => (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      {/* ✅ Dashboard Header with Dynamic Name */}
      <motion.div variants={itemVariants} className="px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getRoleBadgeColor()} bg-opacity-10`}>
            {getDashboardIcon()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {getDashboardName()}
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {getRoleBadgeLabel()} • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="border-b border-white/5 my-1 mx-3"
      />

      {/* Public Site Link */}
      <motion.div variants={itemVariants}>
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/5 hover:text-white group relative overflow-hidden ${
            pathname === "/"
              ? "bg-white/5 text-white shadow-sm border-l-2 border-cyan-400"
              : "text-zinc-400 hover:border-l-2 hover:border-cyan-400/30"
          }`}
        >
          <Globe
            className={`w-5 h-5 transition-colors duration-300 ${pathname === "/" ? "text-cyan-400" : "text-zinc-500 group-hover:text-cyan-400"}`}
          />
          <span>Public Site</span>
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="border-b border-white/5 my-1 mx-3"
      />

      {/* Role-Specific Links */}
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <motion.div key={item.label} variants={itemVariants}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/5 hover:text-white group relative overflow-hidden ${
                active
                  ? "bg-white/5 text-white shadow-sm border-l-2 border-cyan-400"
                  : "text-zinc-400"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors duration-300 ${active ? "text-cyan-400" : "text-zinc-500 group-hover:text-cyan-400"}`}
              />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );

  // Don't render anything on server to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* =============================== */}
      {/* 💻 DESKTOP SIDEBAR */}
      {/* =============================== */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-zinc-950/60 backdrop-blur-xl border-r border-white/5 p-4 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center gap-2 px-3 py-4 mb-2 border-b border-white/5">
          <div className="relative w-[150px] h-[40px]">
            <Image
              src={logoImg}
              alt="Logo"
              fill
              className="object-contain"
              priority
              sizes="150px"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {renderNavContent()}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4 border-t border-white/5"
        >
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getRoleBadgeColor()} flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0 shadow-lg shadow-purple-500/20`}>
              {getAvatarImage() ? (
                <Image
                  src={getAvatarImage()}
                  alt={user?.name || "Avatar"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {getUserInitials()}
                </span>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm text-white font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {user?.email || ""}
              </p>
              <span className={`text-[8px] uppercase font-bold tracking-wider bg-gradient-to-r ${getRoleBadgeColor()} bg-clip-text text-transparent`}>
                {getRoleBadgeLabel()}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSignOut}
              className="relative z-10 p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors duration-300" />
            </motion.button>
          </div>
        </motion.div>
      </motion.aside>

      {/* =============================== */}
      {/* 📱 MOBILE HEADER - USING REGULAR IMG TAG FOR RELIABILITY */}
      {/* =============================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        {/* Logo - Using regular img tag for mobile reliability */}
        <Link href="/dashboard" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="HireLoop Logo"
            className="h-[32px] w-auto object-contain sm:h-[36px]"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = 'text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent';
                fallback.textContent = 'HireLoop';
                parent.appendChild(fallback);
              }
            }}
          />
        </Link>

        {/* Mobile Header Right Side */}
        <div className="flex items-center gap-2">
          <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor()} text-white`}>
            {getRoleBadgeLabel()}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white shrink-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle Menu</span>
          </motion.button>
        </div>
      </div>

      {/* =============================== */}
      {/* 📱 MOBILE OVERLAY */}
      {/* =============================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* =============================== */}
      {/* 📱 MOBILE SIDEBAR DRAWER - USING REGULAR IMG TAG */}
      {/* =============================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-zinc-950/90 backdrop-blur-xl border-r border-white/5 p-6 z-50 flex flex-col shadow-2xl shadow-black/70 pt-20"
          >
            {/* Logo - Using regular img tag for mobile reliability */}
            <div className="flex items-center px-3 py-4 mb-2 border-b border-white/5">
              <img
                src="/logo.png"
                alt="HireLoop Logo"
                className="h-[36px] w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent';
                    fallback.textContent = 'HireLoop';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {renderNavContent()}
            </div>

            {/* User Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-4 border-t border-white/5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getRoleBadgeColor()} flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0 shadow-lg shadow-purple-500/20`}>
                  {getAvatarImage() ? (
                    <Image
                      src={getAvatarImage()}
                      alt={user?.name || "Avatar"}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {getUserInitials()}
                    </span>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {user?.email || ""}
                  </p>
                  <span className={`text-[8px] uppercase font-bold tracking-wider bg-gradient-to-r ${getRoleBadgeColor()} bg-clip-text text-transparent`}>
                    {getRoleBadgeLabel()}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all w-full font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, HelpCircle, Shield } from "lucide-react";
import logoImg from "../../public/logo.png";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

// 1️⃣ CSS BUBBLE ANIMATION
const bubbleStyles = `
  @keyframes floatBubbleNav {
    0% { transform: translate(0, 0) scale(1) rotate(0deg); }
    25% { transform: translate(15px, -20px) scale(1.05) rotate(2deg); }
    50% { transform: translate(-10px, 15px) scale(0.95) rotate(-2deg); }
    75% { transform: translate(20px, 10px) scale(1.02) rotate(1deg); }
    100% { transform: translate(-15px, -10px) scale(0.98) rotate(-1deg); }
  }

  .nav-bubble {
    position: absolute;
    border-radius: 50%;
    filter: blur(30px);
    opacity: 0.15;
    animation: floatBubbleNav 20s infinite ease-in-out alternate;
    pointer-events: none;
    z-index: 0;
  }

  .nav-bubble-1 {
    width: 200px;
    height: 200px;
    background: #8b5cf6;
    top: -20%;
    left: -5%;
    animation-duration: 22s;
  }

  .nav-bubble-2 {
    width: 250px;
    height: 250px;
    background: #06b6d4;
    bottom: -30%;
    right: -5%;
    animation-duration: 18s;
    animation-delay: 2s;
  }

  .nav-bubble-3 {
    width: 150px;
    height: 150px;
    background: #ec4899;
    top: 10%;
    right: 15%;
    animation-duration: 25s;
    animation-delay: 4s;
  }

  .nav-bubble-4 {
    width: 180px;
    height: 180px;
    background: #f59e0b;
    bottom: 10%;
    left: 20%;
    animation-duration: 20s;
    animation-delay: 1s;
  }
`;

// ============================================================
// NAV LINK ENTRANCE ANIMATION
// ============================================================

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const Navbar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession();
  const user = sessionData?.user ?? null;

  useEffect(() => {
    if (user?.status === 'suspended') {
      toast.error('Your account has been suspended. Please contact support.', {
        duration: 5000,
      });
      authClient.signOut();
      router.push('/account-suspended');
    }
  }, [user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            document.cookie.split(";").forEach((c) => {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(
                  /=.*/,
                  "=;expires=" + new Date().toUTCString() + ";path=/",
                );
            });

            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
            toast.success("Signed out successfully");

            setTimeout(() => {
              window.location.href = "/signin";
            }, 500);
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
    } finally {
      setSigningOut(false);
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
    if (imageError) return null;
    const image = user?.image;
    if (image && image.trim() !== "") return image;
    return null;
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const role = user.role?.toLowerCase();
    if (role === 'admin') {
      return {
        label: 'Admin',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: <Shield className="w-3 h-3" />
      };
    }
    if (role === 'recruiter') {
      return {
        label: 'Recruiter',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: null
      };
    }
    return {
      label: 'Seeker',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: null
    };
  };

  const getNavLinks = () => {
    const links = [
      { label: "Browse Jobs", href: "/browse-jobs" },
      { label: "Company", href: "/companies" },
      { label: "Pricing", href: "/pricing" },
    ];

    if (user?.email) {
      let dashboardPath;
      if (user?.role === "recruiter") dashboardPath = "/dashboard/recruiter";
      else if (user?.role === "admin") dashboardPath = "/dashboard/admin";
      else dashboardPath = "/dashboard/seeker";
      links.push({ label: "Dashboard", href: dashboardPath });
    } else {
      links.push({ label: "Support", href: "/contact", icon: HelpCircle });
    }

    if (user?.role === "recruiter") {
      links.push({ label: "Post Job", href: "/dashboard/recruiter/jobs/new" });
    }

    return links;
  };

  const navLinks = getNavLinks();
  const roleBadge = getRoleBadge();

  if (!mounted || sessionPending) {
    return (
      <div className="fixed top-0 left-0 w-full z-50 bg-zinc-50/80 dark:bg-background/60 backdrop-blur-xl border-b border-zinc-200/50 dark:border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-8">
                <div className="w-full h-full bg-zinc-200 dark:bg-foreground/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-24 h-9 bg-zinc-200 dark:bg-foreground/5 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.status === 'suspended') {
    return null;
  }

  const renderDesktopDropdownItems = () => {
    if (!user) return null;

    return (
      <>
        <div className="px-4 py-3 border-b border-zinc-200/50 dark:border-border">
          <div className="flex items-center gap-3">
            {getAvatarImage() ? (
              <Image
                src={getAvatarImage()}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-foreground text-sm font-medium truncate">
                {user.name || "User"}
              </p>
              <p className="text-zinc-500 dark:text-muted-foreground text-xs truncate">
                {user.email || ""}
              </p>
              {roleBadge && (
                <span className={`inline-flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full border ${roleBadge.color}`}>
                  {roleBadge.icon}
                  {roleBadge.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setIsDropdownOpen(false);
            router.push("/profile");
          }}
          className="block w-full text-left px-4 py-2.5 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-foreground/5 hover:text-zinc-900 dark:hover:text-foreground transition-colors"
        >
          Profile
        </button>
        <Link
          href="/contact"
          onClick={() => setIsDropdownOpen(false)}
          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-foreground/5 hover:text-zinc-900 dark:hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-zinc-500 dark:text-muted-foreground" />
          Help & Support
        </Link>
        <div className="border-t border-zinc-200/50 dark:border-border my-1"></div>
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            handleSignOut();
          }}
          disabled={signingOut}
          className="block w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </>
    );
  };

  return (
    <>
      <style>{bubbleStyles}</style>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full z-50 bg-zinc-50/80 dark:bg-background/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-border shadow-sm transition-colors duration-500"
      >
        <div className="relative w-full h-full overflow-hidden">
          <div className="nav-bubble nav-bubble-1"></div>
          <div className="nav-bubble nav-bubble-2"></div>
          <div className="nav-bubble nav-bubble-3"></div>
          <div className="nav-bubble nav-bubble-4"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-32 h-8"
                >
                  <Image
                    src={logoImg}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 128px"
                    className="object-contain"
                    alt="Logo"
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* Desktop Links */}
            <motion.div
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:flex items-center gap-3"
            >
              <motion.div
                variants={navItemVariants}
                className="flex items-center gap-1 bg-zinc-100/50 dark:bg-foreground/5 backdrop-blur-sm rounded-xl p-1 border border-zinc-200/50 dark:border-border shadow-inner transition-colors duration-500"
              >
                {/* ✅ THEME TOGGLE */}
                <ThemeToggle />

                <div className="w-px h-5 bg-zinc-200/50 dark:bg-border mx-1"></div>

                {navLinks.map((link) => {
                  const isActive = pathName === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navActivePill"
                          className="absolute inset-0 bg-zinc-200/50 dark:bg-foreground/10 rounded-lg shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      <span
                        className={`relative z-10 flex items-center transition-colors duration-200 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                      >
                        {link.icon ? (
                          <link.icon className="w-4 h-4 inline-block mr-2" />
                        ) : null}
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

                <div className="w-px h-5 bg-zinc-200/50 dark:bg-border mx-1"></div>

                {user ? (
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-foreground/5 transition-all border border-transparent hover:border-blue-500/30"
                    >
                      {getAvatarImage() ? (
                        <Image
                          src={getAvatarImage()}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover border-2 border-blue-500"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold border-2 border-blue-500">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="hidden xl:block text-sm text-zinc-900 dark:text-foreground font-medium ml-1">
                        {user.name?.split(" ")[0] || user.name || "User"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-zinc-500 dark:text-muted-foreground transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-popover/95 backdrop-blur-xl border border-zinc-200/50 dark:border-border rounded-xl shadow-2xl py-2 z-[100]"
                        >
                          {renderDesktopDropdownItems()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link href="/signin">
                      <button className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-zinc-900 dark:text-foreground bg-zinc-100/50 dark:bg-foreground/5 rounded-lg border border-zinc-200/50 dark:border-border hover:bg-zinc-200/50 dark:hover:bg-foreground/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* =============================================
          MOBILE MENU OVERLAY
      ============================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white/95 dark:bg-background/95 backdrop-blur-xl border-l border-zinc-200/50 dark:border-border shadow-2xl overflow-y-auto transition-colors duration-500"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200/50 dark:border-border">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="relative w-28 h-7">
                    <Image
                      src={logoImg}
                      fill
                      className="object-contain"
                      alt="Logo"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-900 dark:text-foreground bg-zinc-100/50 dark:bg-foreground/5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info - Mobile */}
              {user && (
                <div className="p-4 border-b border-zinc-200/50 dark:border-border">
                  <div className="flex items-center gap-3">
                    {getAvatarImage() ? (
                      <Image
                        src={getAvatarImage()}
                        alt={user.name || "User"}
                        width={44}
                        height={44}
                        className="rounded-full object-cover border-2 border-blue-500"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-base font-bold border-2 border-blue-500">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 dark:text-foreground text-sm font-medium truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-zinc-500 dark:text-muted-foreground text-xs truncate">
                        {user.email || ""}
                      </p>
                      {roleBadge && (
                        <span className={`inline-flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full border ${roleBadge.color}`}>
                          {roleBadge.icon}
                          {roleBadge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links - Mobile */}
              <div className="p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathName === link.href
                        ? "bg-zinc-100 dark:bg-foreground/10 text-blue-600 dark:text-blue-400"
                        : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-foreground/5"
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-zinc-200/50 dark:border-border"></div>

              {/* Auth Actions - Mobile */}
              <div className="p-4 space-y-2">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-foreground/5 rounded-lg transition-colors text-left"
                    >
                      Profile Settings
                    </button>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-foreground/5 rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={signingOut}
                      className="w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-2.5 text-sm font-medium text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-2.5 text-sm font-medium text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-200/50 dark:border-border mt-2">
                <p className="text-center text-[10px] text-zinc-500 dark:text-muted-foreground">
                  © 2026 HireLoop. All rights reserved.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
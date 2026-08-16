"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth-client";
import { getJobs } from "@/lib/api/jobs";
import Marquee from "react-fast-marquee";
import SplitText from "@/components/ui/SplitText";

import {
  Magnifier,
  MapPin,
  Briefcase,
  ChartColumn,
  Star,
  Rocket,
} from "@gravity-ui/icons";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";

import { Button, Input, Card } from "@heroui/react";

import ctaBg from "../../../public/cta-bg.png";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingPage from "@/app/loading";

const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
});

// =============================================
// THEME HOOK
// =============================================
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// =============================================
// FEATURES DATA
// =============================================
const features = [
  {
    title: "Smart Search",
    desc: "Find your ideal job with advanced filters.",
    icon: Magnifier,
  },
  {
    title: "Salary Insights",
    desc: "Get real salary data to negotiate confidently.",
    icon: ChartColumn,
  },
  {
    title: "Top Companies",
    desc: "Apply to vetted companies that are hiring.",
    icon: Briefcase,
  },
  {
    title: "Saved Jobs",
    desc: "Manage apps & favorites on your dashboard.",
    icon: Star,
  },
  {
    title: "One-Click Apply",
    desc: "Simplify your job applications.",
    icon: Rocket,
  },
  {
    title: "Resume Builder",
    desc: "Create professional resumes with modern templates.",
    icon: Briefcase,
  },
  {
    title: "Skill-Based Matching",
    desc: "Discover jobs that match your skills.",
    icon: Magnifier,
  },
  {
    title: "Career Growth Resources",
    desc: "Boost your career with quick interview tips.",
    icon: ArrowRight,
  },
];

const rotatingTexts = [
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Data Scientist",
  "AI Engineer",
];

const companyNames = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Netflix",
  "Spotify",
  "Stripe",
  "Figma",
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Frontend Developer",
    company: "Google",
    text: "HireLoop helped me land my dream job at Google! The platform made job searching so much easier.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Backend Engineer",
    company: "Amazon",
    text: "Found my current role within 2 weeks. The salary insights feature was incredibly helpful!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager",
    company: "Spotify",
    text: "The skill-based matching is spot-on. I got interviews from companies that perfectly matched my profile.",
    rating: 5,
  },
];

const marqueeLogos = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Netflix",
  "Spotify",
  "Stripe",
  "Figma",
  "Meta",
  "Tesla",
];

// =============================================
// ANIMATIONS
// =============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const formatSalary = (min, max, currency = "USD") => {
  if (!min || !max) return "Not specified";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(Number(min))} – ${formatter.format(Number(max))}`;
};

export default function HomePage() {
  const router = useRouter();
  const isDark = useIsDarkMode();

  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    router.push(`/browse-jobs?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: sessionData, error } = await authClient.getSession();
        if (error) throw error;
        setUser(sessionData?.user || null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length),
      2000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentCompanyIndex((prev) => (prev + 1) % companyNames.length),
      1500,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(interval);
  }, []);

  if (loadingJobs || sessionLoading) {
    return <LoadingPage />;
  }

  return (
    <main className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* =============================================
          HERO SECTION
      ============================================= */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-20 md:pt-28 lg:pt-36 overflow-hidden px-3 sm:px-4">
        {/* PixelBlast animated background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color={isDark ? "#B497CF" : "#7C5CBF"}
            patternScale={3}
            patternDensity={1.5}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.25}
            transparent
            className={
              isDark ? "opacity-70 md:opacity-90" : "opacity-40 md:opacity-60"
            }
          />
        </div>

        {/* Purple Glow - lighter in light mode */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] md:w-[1000px] h-[300px] sm:h-[600px] md:h-[1000px] bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] sm:blur-[150px] rounded-full z-[1]"
        />

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center text-center w-full max-w-5xl mx-auto mb-6 md:mb-8 lg:mb-16 px-2 pointer-events-none">
          {user && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-1 md:mb-2"
            >
              <p className="text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm md:text-lg font-medium">
                👋 Welcome back, {user.name}!
              </p>
            </motion.div>
          )}

          {/* Floating Trusted Brands Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full overflow-hidden mb-4 md:mb-6"
          >
            <div className="flex whitespace-nowrap animate-marquee gap-6 md:gap-12">
              {[
                "Google",
                "Microsoft",
                "Amazon",
                "Apple",
                "Meta",
                "Netflix",
                "Stripe",
                "Figma",
                "Spotify",
              ].map((name, i) => (
                <span
                  key={i}
                  className="text-zinc-500 dark:text-muted-foreground font-bold text-[10px] sm:text-xs md:text-sm tracking-wider uppercase"
                >
                  {name}
                </span>
              ))}
              {[
                "Google",
                "Microsoft",
                "Amazon",
                "Apple",
                "Meta",
                "Netflix",
                "Stripe",
                "Figma",
                "Spotify",
              ].map((name, i) => (
                <span
                  key={`dup-${i}`}
                  className="text-zinc-500 dark:text-muted-foreground font-bold text-[10px] sm:text-xs md:text-sm tracking-wider uppercase"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 border border-zinc-200/50 dark:border-border bg-white/80 dark:bg-foreground/5 backdrop-blur-xl rounded-full px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 text-[10px] sm:text-xs md:text-sm text-zinc-600 dark:text-muted-foreground shadow-lg"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-yellow-400" />
            50,000+ NEW JOBS THIS MONTH
          </motion.div>

          <div className="mt-3 md:mt-6 lg:mt-8 px-1 sm:px-2">
            <SplitText
              text="Find Your Dream Job Today"
              className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight"
              delay={50}
              animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
            />

            {/* Animated Rotating Job Title */}
            <div className="mt-4 md:mt-6 lg:mt-8">
              <h2 className="relative inline-block min-w-[140px] sm:min-w-[180px] md:min-w-[250px] lg:min-w-[280px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 whitespace-nowrap bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-left text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                  >
                    {rotatingTexts[currentTextIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="opacity-0 text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {rotatingTexts[0]}
                </span>
              </h2>
            </div>
          </div>

          {/* ✅ FIXED: Description with proper theme colors */}
          <SplitText
            text="HireLoop connects top talent with world-class companies. Browse thousands of curated opportunities and land your next role — faster."
            className="max-w-2xl mx-auto text-zinc-700 dark:text-white mt-3 md:mt-4 lg:mt-6 text-xs sm:text-sm md:text-base lg:text-lg leading-6 md:leading-7 lg:leading-8 px-2 sm:px-4"
            delay={10}
            animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
            animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 md:mt-6 lg:mt-8"
          >
            <p className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-muted-foreground mb-1.5 md:mb-2 lg:mb-3">
              Trusted by employees from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentCompanyIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                >
                  {companyNames[currentCompanyIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] sm:text-xs md:text-base text-zinc-500 dark:text-muted-foreground ml-0.5 sm:ml-1">
                + 10,000+ companies
              </span>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="w-full max-w-4xl mx-auto mt-4 md:mt-6 lg:mt-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 md:p-3 shadow-2xl shadow-purple-900/20 dark:shadow-purple-900/20 pointer-events-auto"
          >
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3">
              <div className="flex items-center flex-1 gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3 border border-zinc-200/50 dark:border-zinc-700 rounded-lg bg-white/50 dark:bg-zinc-800/50 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-200">
                <Magnifier className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm md:text-base outline-none py-2 sm:py-2.5"
                />
              </div>
              <div className="hidden md:block w-px bg-zinc-200/50 dark:bg-zinc-700" />
              <div className="flex items-center flex-1 gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3 border border-zinc-200/50 dark:border-zinc-700 rounded-lg bg-white/50 dark:bg-zinc-800/50 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-200">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm md:text-base outline-none py-2 sm:py-2.5"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  type="submit"
                  radius="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl px-8 h-11 shadow-lg shadow-blue-600/20 rounded-full"
                >
                  <Magnifier className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="sm:hidden ml-1">Search</span>
                </Button>
              </motion.div>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mt-3 md:mt-4 lg:mt-6 px-1 sm:px-4 pointer-events-auto"
          >
            {["Trending", "Product Designer", "AI Engineering", "DevOps"].map(
              (item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-full bg-white/80 dark:bg-card border border-zinc-200/50 dark:border-border text-[10px] sm:text-xs md:text-sm text-zinc-600 dark:text-muted-foreground cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-foreground/10"
                >
                  {item}
                </motion.span>
              ),
            )}
          </motion.div>
        </div>
      </section>

      {/* =============================================
          STATS GRID SECTION
      ============================================= */}
      <section className="relative z-10 -mt-12 sm:-mt-16 md:-mt-24 py-8 sm:py-12 md:py-20 bg-zinc-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center justify-items-center"
          >
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                50,000
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-muted-foreground mt-0.5 sm:mt-1">
                Active Jobs
              </span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                12,000
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-muted-foreground mt-0.5 sm:mt-1">
                Companies
              </span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                2M
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-muted-foreground mt-0.5 sm:mt-1">
                Job Seekers
              </span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center"
            >
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                97%
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-zinc-500 dark:text-muted-foreground mt-0.5 sm:mt-1">
                Satisfaction
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Activity Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-3 sm:py-4 bg-zinc-100/50 dark:bg-muted/50 border-b border-zinc-200/50 dark:border-border text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-zinc-500 dark:text-muted-foreground px-3">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="truncate">
            <span className="text-zinc-900 dark:text-foreground font-bold">
              {jobs.length * 12}
            </span>{" "}
            new jobs posted in the last 24 hours
          </span>
          <span className="text-zinc-400 dark:text-muted-foreground mx-0.5 sm:mx-1">
            •
          </span>
          <Link
            href="/browse-jobs"
            className="cursor-pointer hover:text-zinc-900 dark:hover:text-foreground transition-colors whitespace-nowrap"
          >
            View all ↗
          </Link>
        </div>
      </motion.div>

      {/* =============================================
          MARQUEE SECTION
      ============================================= */}
      <section className="py-4 sm:py-6 md:py-8 bg-zinc-100/50 dark:bg-muted border-y border-zinc-200/50 dark:border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-muted-foreground text-center mb-2 sm:mb-4 tracking-widest uppercase">
            Trusted by leading innovators
          </p>
          <Marquee
            autoFill
            pauseOnHover
            speed={40}
            gradient={false}
            className="flex gap-4 sm:gap-6 md:gap-8 overflow-hidden"
          >
            {marqueeLogos.map((name, index) => (
              <span
                key={index}
                className="mx-3 sm:mx-4 md:mx-6 text-zinc-500 dark:text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl font-bold hover:text-zinc-900 dark:hover:text-foreground transition-colors whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* =============================================
          JOBS SECTION
      ============================================= */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Why HireLoop Feature Highlights */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 lg:mb-16"
          >
            {[
              {
                icon: Rocket,
                title: "Lightning Fast Apply",
                desc: "Apply to jobs in under 30 seconds with your saved profile.",
              },
              {
                icon: ChartColumn,
                title: "Smart Matching",
                desc: "AI-driven algorithm matches you to your perfect role.",
              },
              {
                icon: Building2,
                title: "Top Tier Companies",
                desc: "Access exclusive listings from the world's best employers.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 dark:bg-card border border-zinc-200/50 dark:border-border p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl hover:border-violet-500/30 transition-all group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-zinc-100 dark:bg-foreground/5 border border-zinc-200/50 dark:border-border flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-all">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-zinc-900 dark:text-foreground font-semibold text-sm sm:text-base md:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
          >
            <p className="text-violet-600 dark:text-violet-400 text-[10px] sm:text-xs md:text-sm tracking-[3px] sm:tracking-[4px] uppercase font-semibold">
              Featured Jobs
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mt-1 sm:mt-2 md:mt-3 lg:mt-4">
              Popular Job Openings
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-4 sm:mt-6 md:mt-8"
          >
            {jobs.slice(0, 6).map((job, index) => (
              <motion.div
                key={job._id || index}
                variants={fadeInUp}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.3, type: "spring" },
                }}
              >
                <Card className="bg-white/80 dark:bg-card border border-zinc-200/50 dark:border-border hover:border-violet-500/50 transition-all duration-300 shadow-lg hover:shadow-violet-500/10 group">
                  <div className="p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-5 blur-2xl group-hover:opacity-20 transition-opacity rounded-full" />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between mb-1.5 sm:mb-2"
                    >
                      <span className="text-[10px] sm:text-xs text-violet-600 dark:text-violet-400 font-medium bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-violet-200/50 dark:border-violet-500/20">
                        {job.jobType || "Full-time"}
                      </span>
                    </motion.div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-zinc-900 dark:text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                      {job.jobTitle}
                    </h3>
                    <p className="text-zinc-600 dark:text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                      <span className="truncate">
                        {job.companyName || "Company"}
                      </span>
                    </p>
                    <p className="text-zinc-600 dark:text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 md:leading-7">
                      {job.isRemote
                        ? "🌐 Remote"
                        : job.location || "Location not specified"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 mt-3 sm:mt-4 md:mt-6">
                      {job.jobCategory && (
                        <span className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/50 dark:border-cyan-500/20 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 text-[8px] sm:text-[10px] md:text-xs text-cyan-700 dark:text-cyan-300 truncate max-w-[80px] sm:max-w-none">
                          {job.jobCategory}
                        </span>
                      )}
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 text-[8px] sm:text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 truncate">
                        {formatSalary(
                          job.minSalary,
                          job.maxSalary,
                          job.currency,
                        )}
                      </span>
                    </div>
                    <Link href={`/browse-jobs/${job._id}`}>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="cursor-pointer flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 md:mt-6 lg:mt-8 text-zinc-700 dark:text-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-xs sm:text-sm md:text-base font-medium group"
                      >
                        Apply Now
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =============================================
          TESTIMONIALS SECTION
      ============================================= */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-gradient-to-b from-zinc-100/50 to-zinc-50 dark:from-muted dark:to-background mt-6 sm:mt-8 md:mt-10 lg:mt-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
          >
            <p className="text-violet-600 dark:text-violet-400 text-[10px] sm:text-xs md:text-sm tracking-[3px] sm:tracking-[4px] uppercase font-semibold">
              Testimonials
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mt-1 sm:mt-2 md:mt-3 lg:mt-4">
              What Our Users Say
            </h2>
          </motion.div>

          <div className="relative min-h-[300px] sm:min-h-[320px] md:min-h-[350px] lg:h-[300px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonialIndex}
                initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="text-center max-w-3xl mx-auto px-3 sm:px-4 bg-white/60 dark:bg-card/60 p-5 sm:p-6 md:p-8 lg:p-12 rounded-xl sm:rounded-2xl border border-zinc-200/50 dark:border-border backdrop-blur-xl shadow-2xl"
              >
                <div className="flex justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 gap-0.5 sm:gap-1">
                  {[...Array(testimonials[currentTestimonialIndex].rating)].map(
                    (_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl"
                      >
                        ★
                      </motion.span>
                    ),
                  )}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-zinc-800 dark:text-foreground/90 leading-relaxed italic px-1"
                >
                  "{testimonials[currentTestimonialIndex].text}"
                </motion.p>
                <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                  <p className="font-semibold text-zinc-900 dark:text-foreground text-sm sm:text-base md:text-lg">
                    {testimonials[currentTestimonialIndex].name}
                  </p>
                  <p className="text-zinc-500 dark:text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                    {testimonials[currentTestimonialIndex].role} at{" "}
                    {testimonials[currentTestimonialIndex].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 md:mt-6 lg:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentTestimonialIndex === index
                    ? "w-5 sm:w-6 md:w-8 bg-violet-400"
                    : "w-1.5 sm:w-2 bg-zinc-300 dark:bg-foreground/20 hover:bg-zinc-400 dark:hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURES SECTION
      ============================================= */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-28 bg-zinc-100/50 dark:bg-muted relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-purple-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(92,83,254,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_50%,_rgba(92,83,254,0.1),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-violet-600 dark:text-violet-400 text-[10px] sm:text-xs md:text-sm tracking-[3px] sm:tracking-[4px] uppercase font-semibold">
              Features
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mt-1 sm:mt-2 md:mt-3 lg:mt-4">
              Everything you need
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                to succeed
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-x-10 lg:gap-y-14 mt-6 sm:mt-8 md:mt-10 lg:mt-16 xl:mt-20"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 group"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-lg sm:rounded-xl md:rounded-2xl border border-zinc-200/50 dark:border-border bg-white/80 dark:bg-card/80 flex items-center justify-center group-hover:border-violet-500/50 transition-colors shadow-lg flex-shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-violet-600 dark:text-violet-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-900 dark:text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-muted-foreground mt-0.5 sm:mt-1 md:mt-2 leading-5 sm:leading-6 md:leading-7 text-xs sm:text-sm group-hover:text-zinc-800 dark:group-hover:text-foreground/80 transition-colors">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* =============================================
          CTA SECTION
      ============================================= */}
      <section className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src={ctaBg}
            alt="CTA Background"
            fill
            className="object-cover object-top opacity-40 dark:opacity-50 sm:opacity-50 sm:dark:opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.3),_rgba(92,83,254,0.2),_rgba(255,255,255,0.3))] mix-blend-normal dark:bg-[linear-gradient(to_bottom,_black,_rgba(92,83,254,0.4),_black)] dark:mix-blend-color" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-20 text-center px-3 sm:px-4 md:px-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-24 md:h-28 lg:h-32 bg-violet-500/20 blur-[50px] sm:blur-[60px] md:blur-[80px] rounded-full pointer-events-none"
          />

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold leading-tight relative z-10 text-white dark:text-white"
          >
            Your next role is
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              already looking for you
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 dark:text-gray-400 mt-2 sm:mt-3 md:mt-4 lg:mt-6 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-2 sm:px-4 relative z-10"
          >
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6 lg:mt-10 px-2 sm:px-4 relative z-10"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href={user ? "/dashboard" : "/signup"} className="block">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-full sm:w-auto px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
                  {user ? "Go to Dashboard" : "Create a free account"}
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href={"/pricing"} className="block">
                <Button className="bg-white/10 dark:bg-transparent border border-white/30 dark:border-white/20 text-white backdrop-blur-md w-full sm:w-auto px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base hover:bg-white/20 dark:hover:bg-white/10 transition-all">
                  View pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {user && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-cyan-300 dark:text-cyan-400 text-xs sm:text-sm mt-4 sm:mt-5 md:mt-6 relative z-10"
            >
              Logged in as {user.email}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Custom CSS for Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </main>
  );
}

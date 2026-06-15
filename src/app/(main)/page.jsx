"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

import {
  Magnifier,
  MapPin,
  Briefcase,
  ChartColumn,
  Star,
  Rocket,
  ArrowRight,
  CrownDiamond,
  Check,
} from "@gravity-ui/icons";

import { Button, Input, Card } from "@heroui/react";

import globeImg from "../../../public/globe.png";
import ctaBg from "../../../public/cta-bg.png";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const jobs = [1, 2, 3];

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
    desc: "Simplify your job applications for an easier process.",
    icon: Rocket,
  },
  {
    title: "Resume Builder",
    desc: "Create professional resumes with modern templates.",
    icon: Briefcase,
  },
  {
    title: "Skill-Based Matching",
    desc: "Discover jobs that match your skills and experience.",
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

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const { data: session } = useSession();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Rotate text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Rotate company names every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCompanyIndex((prev) => (prev + 1) % companyNames.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-black text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-black pt-10 md:pt-20">
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          {/* Animated Purple Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/30 blur-[180px] rounded-full z-0"
          />

          {/* Hero Container */}
          <div className="relative flex justify-center">
            {/* Animated Globe Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <Image
                src={globeImg}
                alt="Globe Image"
                className="w-full max-w-4xl md:max-w-6xl object-contain relative z-10 mx-auto"
              />
            </motion.div>

            {/* Dark Overlay on Upper Globe */}
            <div className="absolute top-0 left-0 w-full h-[35%] bg-gradient-to-b from-black to-transparent z-10" />

            {/* Hero Content */}
            <div className="absolute inset-0 z-30 flex flex-col items-center text-center pt-8 md:pt-16 px-4">
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-xl rounded-full px-3 py-1 md:px-4 md:py-2 text-xs md:text-xl text-gray-300"
              >
                🔥 50,000+ NEW JOBS THIS MONTH
              </motion.div>

              {/* Animated Heading with Rotating Text */}
              <div className="mt-4 md:mt-8 px-2">
                <h1 className="text-3xl md:text-7xl font-bold leading-tight">
                  Find Your Dream{" "}
                  <span className="relative inline-block min-w-[200px] md:min-w-[280px]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentTextIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 whitespace-nowrap bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-left"
                      >
                        {rotatingTexts[currentTextIndex]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="opacity-0">{rotatingTexts[0]}</span>
                  </span>
                  <br />
                  Job Today
                </h1>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="max-w-2xl mx-auto text-gray-400 mt-4 md:mt-6 text-sm md:text-lg leading-6 md:leading-8 px-4"
              >
                HireLoop connects top talent with world-class companies. Browse
                thousands of curated opportunities and land your next role —
                faster.
              </motion.p>

              {/* Trusted by companies - Rotating */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 md:mt-8"
              >
                <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
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
                      className="text-base md:text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                    >
                      {companyNames[currentCompanyIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-xs md:text-base text-gray-400">
                    + 10,000+ companies
                  </span>
                </div>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="w-full max-w-4xl mx-auto mt-6 md:mt-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 md:p-3"
              >
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <div className="flex items-center flex-1 gap-2 md:gap-3 px-2 md:px-3">
                    <Magnifier className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <Input
                      variant="underlined"
                      placeholder="Job title, skill or company"
                      className={{
                        input: "text-white text-sm md:text-base",
                      }}
                    />
                  </div>

                  <div className="hidden md:block w-px bg-white/10" />

                  <div className="flex items-center flex-1 gap-2 md:gap-3 px-2 md:px-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <Input
                      variant="underlined"
                      placeholder="Location or Remote"
                      className={{
                        input: "text-white text-sm md:text-base",
                      }}
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="md:ml-auto"
                  >
                    <Button
                      radius="lg"
                      className="bg-[#5C53FE] text-white w-full md:w-auto min-w-14"
                    >
                      <Magnifier className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6 px-4"
              >
                {[
                  "Trending Position",
                  "Product Designer",
                  "AI Engineering",
                  "DevOps Engineer",
                ].map((item, index) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                    className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-zinc-900 border border-white/10 text-xs md:text-sm text-gray-300 cursor-pointer"
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>

              {/* Globe Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="mt-40 md:mt-80 px-4 relative bottom-50 z-20"
              >
                <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold leading-tight text-center">
                  Assisting over 15,000 job seekers
                  <br />
                  find their dream positions.
                </h2>
              </motion.div>
            </div>

            {/* Animated Stats Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="absolute bottom-[-80px] md:bottom-60 left-1/2 -translate-x-1/2 z-40 w-full grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 px-4 md:px-6"
            >
              {[
                { number: "50K", title: "Active Jobs" },
                { number: "12K", title: "Companies" },
                { number: "2M", title: "Job Seekers" },
                { number: "97%", title: "Satisfaction Rate" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-zinc-950/70 border border-white/10 backdrop-blur-xl">
                    <div className="p-3 md:p-7">
                      <Briefcase className="w-3 h-3 md:w-5 md:h-5 text-violet-400 mb-2 md:mb-8" />
                      <motion.h3
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="text-lg md:text-4xl font-bold"
                      >
                        {item.number}
                      </motion.h3>
                      <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">
                        {item.title}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-10 md:py-20 bg-zinc-950 mt-20 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <p className="text-violet-400 text-xs md:text-sm tracking-[4px] uppercase">
              Testimonials
            </p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mt-2 md:mt-4">
              What Our Users Say
            </h2>
          </motion.div>

          <div className="relative min-h-[350px] md:h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonialIndex}
                initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="text-center max-w-3xl mx-auto px-4"
              >
                <div className="flex justify-center mb-4 md:mb-6">
                  {[...Array(testimonials[currentTestimonialIndex].rating)].map(
                    (_, i) => (
                      <span
                        key={i}
                        className="text-yellow-400 text-lg md:text-2xl"
                      >
                        ★
                      </span>
                    ),
                  )}
                </div>
                <p className="text-base md:text-xl lg:text-2xl text-gray-300 leading-relaxed">
                  "{testimonials[currentTestimonialIndex].text}"
                </p>
                <div className="mt-6 md:mt-8">
                  <p className="font-semibold text-white text-base md:text-lg">
                    {testimonials[currentTestimonialIndex].name}
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {testimonials[currentTestimonialIndex].role} at{" "}
                    {testimonials[currentTestimonialIndex].company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                  currentTestimonialIndex === index
                    ? "w-6 md:w-8 bg-violet-400"
                    : "w-1.5 md:w-2 bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* JOBS SECTION */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <p className="text-violet-400 text-xs md:text-sm tracking-[4px] uppercase">
              Featured Jobs
            </p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mt-2 md:mt-4">
              Popular Job Openings
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="bg-zinc-950 border border-white/10 hover:border-violet-500/40 transition-all duration-300">
                  <div className="p-4 md:p-8">
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-xl md:text-2xl font-semibold"
                    >
                      Frontend Developer
                    </motion.h3>
                    <p className="text-gray-400 mt-2 md:mt-4 text-sm md:text-base leading-6 md:leading-7">
                      Showcase your commitment to diversity and inclusion by
                      highlighting initiatives.
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-8">
                      <span className="bg-white/5 border border-white/10 rounded-full px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                        📍 New York, USA
                      </span>
                      <span className="bg-white/5 border border-white/10 rounded-full px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                        💼 Hybrid
                      </span>
                      <span className="bg-white/5 border border-white/10 rounded-full px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                        💰 €25-€40/hour
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 mt-6 md:mt-10 text-white hover:text-violet-400 transition-colors text-sm md:text-base"
                    >
                      Apply Now
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-14 md:py-28 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-violet-400 text-xs md:text-sm tracking-[4px] uppercase">
              Features
            </p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mt-2 md:mt-4">
              Everything you need
              <br />
              to succeed
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-10 md:gap-y-14 mt-10 md:mt-20"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  className="flex gap-3 md:gap-5"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-white/10 bg-zinc-900 flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-violet-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mt-1 md:mt-2 leading-5 md:leading-7 text-xs md:text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative h-[400px] md:h-[650px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src={ctaBg}
            alt="CTA Background"
            fill
            className="object-cover object-top opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_black,_rgba(92,83,254,0.45),_black)] mix-blend-color" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-20 text-center px-4 md:px-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight"
          >
            Your next role is
            <br />
            already looking for you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mt-4 md:mt-6 text-sm md:text-lg max-w-2xl mx-auto px-4"
          >
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 md:mt-10 px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={"/signup"}>
                <Button className="bg-white text-black px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base">
                  Create a free account
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-zinc-800 text-white border border-white/10 px-4 md:px-8 py-2 md:py-3 hover:bg-zinc-700 rounded-lg text-sm md:text-base">
                View pricing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

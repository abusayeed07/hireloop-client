"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, House, Rocket, Search } from "lucide-react";

const NotFoundPage = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const gridPattern = `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E`;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden flex items-center justify-center px-4">
      {/* ============================================= */}
      {/* ANIMATED BACKGROUND */}
      {/* ============================================= */}
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 80, -50, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating particles */}
      {mounted && particles.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/20"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, 50, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("${gridPattern}")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ============================================= */}
      {/* MAIN CONTENT - FIXED VISIBILITY */}
      {/* ============================================= */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 1,
          }}
          className="mb-6 relative"
        >
          {/* Glowing ring behind 404 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-purple-500/30 blur-sm" />
          </div>
          
          <motion.div
            className="relative text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            404
          </motion.div>
        </motion.div>

        {/* Icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title - FIXED: Better visibility */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
        >
          Oops! Lost in Space?
        </motion.h1>

        {/* Description - FIXED: Better visibility */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/90 mb-8 max-w-md mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          The page you&apos;re looking for has wandered off into the universe. 
          Let&apos;s bring you back to Earth.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90 px-8 py-3 rounded-xl font-medium shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300">
                <House className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/browse-jobs">
              <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 px-8 py-3 rounded-xl font-medium transition-all duration-300">
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Popular Pages - FIXED: Better visibility */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <p className="text-sm text-white/60 mb-3">Popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Browse Jobs", href: "/browse-jobs" },
              { label: "Companies", href: "/companies" },
              { label: "Pricing", href: "/pricing" },
              { label: "Contact", href: "/contact" },
            ].map((page, index) => (
              <motion.div
                key={page.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={page.href}
                  className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/30 inline-flex items-center gap-1 backdrop-blur-sm"
                >
                  {page.label}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute -top-20 -right-20 text-8xl opacity-10 select-none"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ✦
        </motion.div>
        <motion.div
          className="absolute -bottom-20 -left-20 text-8xl opacity-10 select-none"
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ✧
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
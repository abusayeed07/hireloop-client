"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import "./signup.css";

export default function SelectRolePage() {
  const roles = [
    {
      title: "I'm looking for a job",
      description: "Find opportunities and apply to top companies.",
      href: "/signup/form?role=seeker",
      icon: User,
      color: "from-cyan-500 to-blue-600",
      border: "hover:border-cyan-500/60",
      glow: "hover:shadow-cyan-500/20",
      features: [
        "Find opportunities and apply to top companies",
        "Application tracking",
        "Save favorite jobs",
      ],
    },
    {
      title: "I'm hiring",
      description: "Post jobs and find the best talent for your company.",
      href: "/signup/form?role=recruiter",
      icon: Briefcase,
      color: "from-purple-500 to-pink-600",
      border: "hover:border-purple-500/60",
      glow: "hover:shadow-purple-500/20",
      features: [
        "Post jobs and find the best talent",
        "Manage applicants",
        "Company dashboard",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* Background */}
      <div className="animated-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="pt-25 relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        {/* Logo */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            Create an account
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Join Bangladesh's leading professional network
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {roles.map((role, index) => {
            const Icon = role.icon;

            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                }}
              >
                <Link href={role.href}>
                  <div
                    className={`group h-full rounded-3xl border border-zinc-800 bg-white/[0.03] backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-2 ${role.border} ${role.glow} hover:shadow-2xl`}
                  >
                    <div
                      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${role.color}`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {role.title}
                    </h2>
                    <p className="mt-3 text-zinc-400 leading-7">
                      {role.description}
                    </p>
                    <div className="mt-8 space-y-3">
                      {role.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                          <span className="text-zinc-300 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 flex items-center font-semibold text-white">
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-cyan-400 hover:text-cyan-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
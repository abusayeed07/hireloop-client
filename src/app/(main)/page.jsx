"use client";

import Image from "next/image";

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

const jobs = [1, 2, 3, 4, 5, 6];

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

export default function HomePage() {
  return (
    <main className="bg-black text-white overflow-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden bg-black pt-20">
        <div className="relative max-w-7xl mx-auto px-6">

          {/* Purple Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black blur-[180px] rounded-full z-0" />

          {/* Hero Container */}
          <div className="relative flex justify-center">

            {/* Globe Image */}
            <Image
              src={globeImg}
              alt="Globe Image"
              className="w-full max-w-6xl object-contain relative z-10"
            />

            {/* Dark Overlay on Upper Globe */}
            <div className="absolute top-0 left-0 w-full h-[35%] bg-gradient-to-b from-black to-transparent z-10" />

            {/* Hero Content */}
            <div className="absolute inset-0 z-30 flex flex-col items-center text-center pt-16">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 text-xl text-gray-300">
                🔥 50,000+ NEW JOBS THIS MONTH
              </div>

              {/* Heading */}
              <h1 className="text-5xl md:text-7xl font-bold mt-8 leading-tight">
                Find Your Dream Job Today
              </h1>

              {/* Description */}
              <p className="max-w-2xl mx-auto text-gray-400 mt-6 text-lg leading-8">
                HireLoop connects top talent with world-class companies.
                Browse thousands of curated opportunities and land your
                next role — faster.
              </p>

              {/* Search */}
              <div className="max-w-4xl w-full mx-auto mt-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3">

                <div className="flex items-center flex-1 gap-3 px-3">
                  <Magnifier className="w-5 h-5 text-gray-500" />

                  <Input
                    variant="underlined"
                    placeholder="Job title, skill or company"
                    className={{
                      input: "text-white",
                    }}
                  />
                </div>

                <div className="hidden md:block w-px bg-white/10" />

                <div className="flex items-center flex-1 gap-3 px-3">
                  <MapPin className="w-5 h-5 text-gray-500" />

                  <Input
                    variant="underlined"
                    placeholder="Location or Remote"
                    className={{
                      input: "text-white",
                    }}
                  />
                </div>

                <Button
                  radius="lg"
                  className="bg-[#5C53FE] text-white min-w-14"
                >
                  <Magnifier className="w-5 h-5" />
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {[
                  "Trending Position",
                  "Product Designer",
                  "AI Engineering",
                  "DevOps Engineer",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-sm text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Globe Text */}
              <div className="mt-80">
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
                  Assisting over 15,000 job seekers
                  <br />
                  find their dream positions.
                </h2>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="absolute bottom-60 left-1/2 -translate-x-1/2 z-40 w-full grid grid-cols-2 md:grid-cols-4 gap-5 px-6">
              {[
                { number: "50K", title: "Active Jobs" },
                { number: "12K", title: "Companies" },
                { number: "2M", title: "Job Seekers" },
                { number: "97%", title: "Satisfaction Rate" },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="bg-zinc-950/70 border border-white/10 backdrop-blur-xl"
                >
                  <div className="p-7">
                    <Briefcase className="w-5 h-5 text-violet-400 mb-8" />

                    <h3 className="text-4xl font-bold">
                      {item.number}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      {item.title}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-violet-400 text-sm tracking-[4px] uppercase">
              Smart Job Discovery
            </p>

            <h2 className="text-5xl font-bold mt-4">
              The roles you'd never
              <br />
              find by searching
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {jobs.map((job) => (
              <Card
                key={job}
                className="bg-zinc-950 border border-white/10"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-semibold">
                    Frontend Developer
                  </h3>

                  <p className="text-gray-400 mt-4 leading-7">
                    Showcase your commitment to diversity and
                    inclusion by highlighting initiatives.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-8">
                    <span className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm">
                      📍 New York, USA
                    </span>

                    <span className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm">
                      💼 Hybrid
                    </span>

                    <span className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm">
                      💰 €25-€40/hour
                    </span>
                  </div>

                  <button className="flex items-center gap-2 mt-10 text-white">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <Button radius="full" className="px-8">
              View all job open
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-violet-400 text-sm tracking-[4px] uppercase">
              Features Job
            </p>

            <h2 className="text-5xl font-bold mt-4">
              Everything you need
              <br />
              to succeed
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14 mt-20">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="flex gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl border border-white/10 bg-zinc-900 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 mt-2 leading-7 text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-violet-400 text-sm tracking-[4px] uppercase">
              Pricing
            </p>

            <h2 className="text-5xl font-bold mt-4">
              Pay for the leverage,
              <br />
              not the listings
            </h2>
          </div>

          <div className="flex justify-center mt-10">
            <div className="bg-zinc-900 border border-white/10 rounded-full p-1 flex">
              <button className="px-5 py-2 rounded-full bg-white text-black text-sm">
                Monthly
              </button>

              <button className="px-5 py-2 text-sm text-gray-400">
                Yearly
              </button>

              <span className="bg-pink-600 text-xs px-4 py-3 rounded-full">
                25%
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                name: "Starter",
                price: "$0",
                icon: Star,
              },
              {
                name: "Growth",
                price: "$17",
                icon: ChartColumn,
              },
              {
                name: "Premium",
                price: "$99",
                icon: CrownDiamond,
              },
            ].map((plan, index) => {
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.name}
                  className={`border ${index === 1
                    ? "border-white/20 bg-zinc-900"
                    : "border-white/10 bg-zinc-950"
                    }`}
                >
                  <div className="p-8">
                    {/* top */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>

                        <h3 className="text-2xl font-semibold">
                          {plan.name}
                        </h3>
                      </div>

                      <div>
                        <span className="text-5xl font-bold">
                          {plan.price}
                        </span>

                        <span className="text-gray-400">
                          /month
                        </span>
                      </div>
                    </div>

                    {/* features */}
                    <ul className="space-y-4 mt-10 text-gray-300">
                      {[
                        "Daily AI match brief",
                        "Verified salary bands",
                        "Company insight dashboards",
                        "1-click apply, unlimited",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                            <Check className="w-3 h-3 text-violet-400" />
                          </div>

                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* button */}
                    <Button
                      className={`mt-10 w-full rounded-lg ${index === 1
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-white"
                        }`}
                    >
                      Choose This Plan <ArrowRight />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative h-[650px] overflow-hidden flex items-center justify-center">

        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={ctaBg}
            alt="CTA Background"
            fill
            className="object-cover object-top opacity-70"
          />

          {/* image color effect only */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_black,_rgba(92,83,254,0.45),_black)] mix-blend-color" />
        </div>
        {/* Content */}
        <div className="relative z-20 text-center px-6">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Your next role is
            <br />
            already looking for you
          </h2>

          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Build a profile in three minutes. The matches start
            arriving tomorrow morning.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button
              className="bg-white text-black px-8 rounded-lg"
            >
              Create a free account
            </Button>

            <Button
              className="bg-zinc-800 text-white border border-white/10 px-8 hover:bg-zinc-700 rounded-lg"
            >
              View pricing
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
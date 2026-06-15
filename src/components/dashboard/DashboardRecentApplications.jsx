"use client";

import React from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  ArrowRight,
  Person,
  Briefcase,
} from "@gravity-ui/icons";

const applicants = [
  {
    name: "Julianne Moore",
    role: "Senior Product Designer",
    date: "Oct 24, 2023",
    exp: "6 years",
    status: "Interviewing",
    color: "success",
  },
  {
    name: "Robert Downey",
    role: "Backend Engineer",
    date: "Oct 23, 2023",
    exp: "4 years",
    status: "New",
    color: "default",
  },
  {
    name: "Emma Stone",
    role: "Marketing Lead",
    date: "Oct 22, 2023",
    exp: "8 years",
    status: "Reviewing",
    color: "warning",
  },
  {
    name: "Chris Pratt",
    role: "Product Manager",
    date: "Oct 21, 2023",
    exp: "5 years",
    status: "Rejected",
    color: "danger",
  },
];

const companies = [
  {
    name: "Google Inc.",
    location: "Technology • Mountain View",
    jobs: 24,
  },
  {
    name: "Meta Platforms",
    location: "Social Media • Menlo Park",
    jobs: 18,
  },
  {
    name: "Stripe",
    location: "Fintech • San Francisco",
    jobs: 12,
  },
  {
    name: "Tesla",
    location: "Automotive • Austin",
    jobs: 31,
  },
];

export default function DashboardRecentApplications() {
  return (
    <section className="px-4 pb-6 grid lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
      {/* LEFT */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">
            Recent Applications
          </h3>

          <Button
            variant="light"
            size="sm"
            endContent={<ArrowRight />}
          >
            View all
          </Button>
        </div>

        <Card className="bg-zinc-950 border border-white/10 p-0 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-sm">
                  <th className="text-left p-5">
                    Candidate Name
                  </th>
                  <th className="text-left">Role</th>
                  <th className="text-left">
                    Date Applied
                  </th>
                  <th className="text-left">
                    Experience
                  </th>
                  <th className="text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {applicants.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-white/5"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                          <Person width={16} />
                        </div>

                        <span className="font-medium">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td className="text-gray-400">
                      {item.role}
                    </td>

                    <td className="text-gray-400">
                      {item.date}
                    </td>

                    <td className="text-gray-400">
                      {item.exp}
                    </td>

                    <td>
                      <Chip
                        size="sm"
                        color={item.color}
                        variant="flat"
                      >
                        {item.status}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* RIGHT */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">
            My Top Companies
          </h3>

          <Button
            variant="light"
            size="sm"
            endContent={<ArrowRight />}
          >
            View all
          </Button>
        </div>

        <Card className="bg-zinc-950 border border-white/10 p-5 flex flex-col rounded-lg">
          <div className="space-y-5">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-between"
              >
                <div className="flex gap-3 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Briefcase width={16} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      {company.name}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {company.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {company.jobs}
                  </p>

                  <p className="text-[10px] uppercase text-gray-500">
                    Active Jobs
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="bordered"
            className="w-full bg-zinc-900 rounded-lg py-5"
          >
            View All Companies
          </Button>
        </Card>
      </div>


      
    </section>
  );
}
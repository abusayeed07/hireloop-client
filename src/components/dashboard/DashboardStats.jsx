// components/DashboardStats.jsx
"use client";

import React from "react";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/50 hover:transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            <p className="text-gray-400 text-sm mt-2">{stat.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
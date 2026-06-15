"use client";

import React from "react";
import { Spinner, Card } from "@heroui/react";
import { Cloud, CircleInfo, Gear, ArrowLeft, ArrowRight } from "@gravity-ui/icons";

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 animate-in fade-in zoom-in duration-700">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 md:p-12 rounded-2xl">
          {/* Logo/Icon Container */}
          <div className="relative mb-8 flex justify-center">
            <div className="relative">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 border-b-blue-500 animate-spin"></div>
              
              {/* Middle Ring */}
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-500 border-l-purple-500 animate-spin-slow"></div>
              
              {/* Inner Ring */}
              <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-pink-500 border-r-indigo-500 animate-spin-reverse"></div>
              
              {/* Center Icon - Using Gear which definitely exists */}
              <div className="w-28 h-28 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Gear className="w-14 h-14 text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text animate-spin" />
              </div>
            </div>
          </div>

          {/* Loading Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Loading
            </h2>
            <div className="flex justify-center gap-1 mt-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Loading Message */}
          <p className="text-gray-400 text-center mb-6 text-sm md:text-base">
            Please wait while we prepare everything for you...
          </p>

          {/* Progress Bar */}
          <div className="w-64 md:w-80 mx-auto mb-6">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full animate-progress"></div>
            </div>
          </div>

          {/* Loading Stats */}
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Gear className="w-3 h-3 animate-spin" />
              <span>Loading assets</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-3 h-3 animate-pulse" />
              <span>Preparing UI</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleInfo className="w-3 h-3" />
              <span>Almost ready</span>
            </div>
          </div>

          {/* Optional: Loading Tips */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Did you know? This app is built with Next.js 16 + HeroUI
            </p>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
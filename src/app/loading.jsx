// app/LoadingPage.jsx
"use client";

import React from "react";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { 
  Cloud, 
  Info,
  Loader2, 
  Sparkles,
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const ringVariants = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 2, repeat: Infinity, ease: "linear" },
  },
};

const ringReverseVariants = {
  animate: {
    rotate: [360, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};

const iconSpinVariants = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 4, repeat: Infinity, ease: "linear" },
  },
};

// Loading step configurations
const loadingSteps = {
  initial: {
    message: "Initializing...",
    icon: Loader2,
    color: "from-cyan-400 to-blue-400"
  },
  loading: {
    message: "Loading assets...",
    icon: Cloud,
    color: "from-blue-400 to-purple-400"
  },
  preparing: {
    message: "Preparing UI...",
    icon: Sparkles,
    color: "from-purple-400 to-pink-400"
  },
  almost: {
    message: "Almost ready...",
    icon: Clock,
    color: "from-pink-400 to-cyan-400"
  },
  complete: {
    message: "Ready!",
    icon: CheckCircle,
    color: "from-green-400 to-emerald-400"
  }
};

const LoadingPage = ({ 
  title = "Loading",
  message = "Please wait while we prepare everything for you...",
  showProgress = true,
  progress = null,
  showStats = true,
  showTips = true,
  customStats = null,
  customIcon = null,
  customColor = "from-cyan-400 via-blue-400 to-purple-400",
  size = "default",
  variant = "default",
  step = "loading",
  estimatedTime = null,
}) => {
  
  const stepConfig = loadingSteps[step] || loadingSteps.loading;
  const StepIcon = stepConfig.icon || Loader2;
  const stepColor = stepConfig.color || "from-cyan-400 to-blue-400";

  const sizes = {
    sm: {
      card: "p-6 md:p-8",
      icon: "w-20 h-20",
      loader: "w-10 h-10",
      title: "text-2xl md:text-3xl",
      message: "text-xs sm:text-sm",
      progress: "w-48 md:w-60",
    },
    default: {
      card: "p-8 md:p-12",
      icon: "w-28 h-28",
      loader: "w-14 h-14",
      title: "text-3xl md:text-4xl",
      message: "text-sm md:text-base",
      progress: "w-64 md:w-80",
    },
    lg: {
      card: "p-10 md:p-16",
      icon: "w-36 h-36",
      loader: "w-18 h-18",
      title: "text-4xl md:text-5xl",
      message: "text-base md:text-lg",
      progress: "w-80 md:w-96",
    },
  };

  const sizeConfig = sizes[size] || sizes.default;

  const defaultStats = [
    { icon: Loader2, label: "Loading assets", animate: "spin" },
    { icon: Cloud, label: "Preparing UI", animate: "pulse" },
    { icon: Info, label: "Almost ready", animate: "bounce" },
  ];

  const stats = customStats || defaultStats;

  const tips = [
    "Built with Next.js 16 + HeroUI",
    "Secure & Fast",
    "Modern UI Experience",
    "Powered by AI",
  ];

  const progressValue = progress !== null ? progress : null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-zinc-100 to-white dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      
      {/* Animated Background Orbs - lighter in light mode */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-300/30 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300/30 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/30 dark:bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,0,0,0.05)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat"
        }}
      />

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 px-4"
      >
        <Card className={`bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-md mx-auto ${sizeConfig.card}`}>
          
          {/* Logo/Icon Container */}
          <motion.div
            variants={itemVariants}
            className="relative mb-8 flex justify-center"
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                variants={ringVariants}
                animate="animate"
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 border-b-blue-500"
              />
              
              {/* Middle Ring */}
              <motion.div
                variants={ringReverseVariants}
                animate="animate"
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-500 border-l-purple-500"
              />
              
              {/* Inner Ring */}
              <motion.div
                variants={ringVariants}
                animate="animate"
                className="absolute inset-4 rounded-full border-2 border-transparent border-t-pink-500 border-r-indigo-500"
                transition={{ duration: 1.5 }}
              />
              
              {/* Center Icon */}
              <div className={`${sizeConfig.icon} bg-gradient-to-br from-cyan-300/20 to-purple-300/20 dark:from-cyan-500/20 dark:to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm`}>
                {customIcon ? (
                  <customIcon className={`${sizeConfig.loader} text-transparent bg-gradient-to-r ${customColor} bg-clip-text`} />
                ) : (
                  <motion.div variants={iconSpinVariants} animate="animate">
                    <StepIcon className={`${sizeConfig.loader} text-transparent bg-gradient-to-r ${stepColor} bg-clip-text`} />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Loading Title */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className={`${sizeConfig.title} font-bold bg-gradient-to-r ${customColor} bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient`}>
              {title}
            </h2>
            
            {/* Bouncing Dots */}
            <div className="flex justify-center gap-1 mt-2">
              <motion.div
                className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              />
              <motion.div
                className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Loading Message */}
          <motion.p variants={itemVariants} className={`text-zinc-600 dark:text-gray-400 text-center mb-6 ${sizeConfig.message}`}>
            {message}
          </motion.p>

          {/* Estimated Time */}
          {estimatedTime && (
            <motion.p variants={itemVariants} className="text-center text-xs text-zinc-500 dark:text-gray-500 mb-4">
              ⏱️ Estimated time: {estimatedTime}
            </motion.p>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <motion.div variants={itemVariants} className={`${sizeConfig.progress} mx-auto mb-6`}>
              <div className="h-1 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: progressValue !== null ? `${progressValue}%` : ["0%", "70%", "100%"]
                  }}
                  transition={
                    progressValue !== null 
                      ? { duration: 0.5, ease: "easeOut" }
                      : {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.5, 1],
                        }
                  }
                />
              </div>
              {progressValue !== null && (
                <div className="text-right text-xs text-zinc-500 dark:text-gray-500 mt-1">
                  {Math.round(progressValue)}%
                </div>
              )}
            </motion.div>
          )}

          {/* Loading Stats */}
          {showStats && (
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap justify-center gap-6 text-xs text-zinc-500 dark:text-gray-500"
            >
              {stats.map((stat, index) => {
                const StatIcon = stat.icon;
                let animation = {};
                
                if (stat.animate === "spin") {
                  animation = { rotate: 360 };
                } else if (stat.animate === "pulse") {
                  animation = { scale: [1, 1.2, 1] };
                } else if (stat.animate === "bounce") {
                  animation = { y: [0, -5, 0] };
                }

                return (
                  <motion.div key={index} variants={itemVariants} className="flex items-center gap-2">
                    <motion.div animate={animation} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                      <StatIcon className="w-3 h-3" />
                    </motion.div>
                    <span>{stat.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Loading Tips */}
          {showTips && (
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-white/10"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 dark:text-gray-500">
                {tips.slice(0, 3).map((tip, index) => (
                  <span key={index} className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                    {tip}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Export with different presets for easy use
export const LoadingPresets = {
  page: (props) => <LoadingPage title="Loading Page" {...props} />,
  data: (props) => <LoadingPage title="Fetching Data" message="Loading your data..." step="loading" {...props} />,
  dashboard: (props) => <LoadingPage title="Dashboard" message="Loading your dashboard..." step="preparing" customStats={[
    { icon: TrendingUp, label: "Loading analytics", animate: "spin" },
    { icon: Users, label: "Fetching users", animate: "pulse" },
    { icon: Briefcase, label: "Loading jobs", animate: "bounce" },
  ]} {...props} />,
  auth: (props) => <LoadingPage title="Signing In" message="Please wait while we verify your credentials..." step="almost" customColor="from-purple-400 via-pink-400 to-rose-400" {...props} />,
  upload: (props) => <LoadingPage title="Uploading" message="Your file is being uploaded..." step="loading" showProgress={true} progress={45} customColor="from-orange-400 via-red-400 to-pink-400" {...props} />,
  minimal: (props) => <LoadingPage variant="minimal" showStats={false} showTips={false} size="sm" {...props} />,
  full: (props) => <LoadingPage variant="full" size="lg" showStats={true} showTips={true} {...props} />,
};

export default LoadingPage;
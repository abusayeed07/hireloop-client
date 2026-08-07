// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

// const UnauthorizedView = () => {
//   const router = useRouter();

//   // 🎨 Framer Motion Animation Variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 300, damping: 24 },
//     },
//   };

//   const iconVariants = {
//     hidden: { scale: 0, rotate: -180 },
//     visible: {
//       scale: 1,
//       rotate: 0,
//       transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
//     },
//   };

//   const pulseVariants = {
//     animate: {
//       scale: [1, 1.15, 1],
//       opacity: [0.6, 0.2, 0.6],
//       transition: {
//         duration: 2.5,
//         repeat: Infinity,
//         ease: "easeInOut",
//       },
//     },
//   };

//   const bounceVariants = {
//     animate: {
//       y: [0, -6, 0],
//       transition: {
//         duration: 1.5,
//         repeat: Infinity,
//         ease: "easeInOut",
//       },
//     },
//   };

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//       className="min-h-[100vh] bg-[#090a0f] flex items-center justify-center px-4 relative overflow-hidden"
//     >
//       {/* 🔮 Ambient Animated Background Layers */}
      
//       {/* Floating Orb 1 - Top Right */}
//       <motion.div
//         className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none"
//         animate={{
//           x: [0, 40, -20, 0],
//           y: [0, -30, 20, 0],
//           scale: [1, 1.1, 0.9, 1],
//         }}
//         transition={{
//           duration: 20,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />

//       {/* Floating Orb 2 - Bottom Left */}
//       <motion.div
//         className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl pointer-events-none"
//         animate={{
//           x: [0, -50, 30, 0],
//           y: [0, 40, -20, 0],
//           scale: [1, 0.9, 1.1, 1],
//         }}
//         transition={{
//           duration: 25,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />

//       {/* Floating Orb 3 - Center Pulse */}
//       <motion.div
//         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-red-600/5 via-transparent to-transparent blur-3xl pointer-events-none"
//         animate={{
//           opacity: [0.3, 0.6, 0.3],
//           scale: [1, 1.05, 1],
//         }}
//         transition={{
//           duration: 8,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />

//       {/* ✨ Subtle Animated Grid */}
//       <div
//         className="absolute inset-0 opacity-[0.02] pointer-events-none"
//         style={{
//           backgroundImage: `
//             linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)
//           `,
//           backgroundSize: "40px 40px",
//         }}
//       />

//       {/* ✨ Floating Particles */}
//       {Array.from({ length: 15 }).map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-1 w-1 rounded-full bg-red-400/20 pointer-events-none"
//           initial={{
//             x: Math.random() * 1600,
//             y: Math.random() * 900,
//             opacity: 0,
//           }}
//           animate={{
//             y: [null, -200],
//             opacity: [0, 0.6, 0],
//           }}
//           transition={{
//             repeat: Infinity,
//             duration: 6 + Math.random() * 8,
//             delay: Math.random() * 5,
//           }}
//         />
//       ))}

//       {/* 🎯 Main Content */}
//       <motion.div
//         variants={itemVariants}
//         className="relative z-10 text-center max-w-md mx-auto"
//       >
//         {/* Icon with Animation */}
//         <motion.div
//           variants={iconVariants}
//           className="relative mb-8 flex justify-center"
//         >
//           <div className="relative inline-block">
//             {/* Pulsing Glow Behind Icon */}
//             <motion.div
//               variants={pulseVariants}
//               animate="animate"
//               className="absolute inset-0 bg-red-600/20 rounded-full blur-xl"
//             />
            
//             {/* Shield Container */}
//             <div className="relative w-28 h-28 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-full flex items-center justify-center border-2 border-red-500/40 shadow-2xl shadow-red-600/20 backdrop-blur-sm">
//               <Shield className="w-14 h-14 text-red-500 drop-shadow-lg" />
              
//               {/* Bouncing Exclamation Badge */}
//               <motion.div
//                 variants={bounceVariants}
//                 animate="animate"
//                 className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-red-500/40 border border-red-400/20"
//               >
//                 !
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Title */}
//         <motion.h2
//           variants={itemVariants}
//           className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
//         >
//           Access Denied
//         </motion.h2>

//         {/* Subtitle with Separators */}
//         <motion.div
//           variants={itemVariants}
//           className="flex items-center justify-center gap-3 mb-6"
//         >
//           <div className="h-px w-10 bg-gradient-to-r from-transparent to-red-500/50" />
//           <span className="text-sm text-red-400 font-medium uppercase tracking-[0.2em]">
//             Restricted Area
//           </span>
//           <div className="h-px w-10 bg-gradient-to-l from-transparent to-red-500/50" />
//         </motion.div>

//         {/* Description */}
//         <motion.p
//           variants={itemVariants}
//           className="text-zinc-400 mb-8 leading-relaxed text-sm"
//         >
//           This page is exclusively available for job seekers. Please switch to a
//           seeker account to access this content.
//         </motion.p>

//         {/* Action Buttons */}
//         <motion.div
//           variants={itemVariants}
//           className="flex flex-col sm:flex-row gap-3 justify-center"
//         >
//           <motion.button
//             whileHover={{ scale: 1.03, boxShadow: "0px 0px 30px rgba(37, 99, 235, 0.3)" }}
//             whileTap={{ scale: 0.95 }}
//             transition={{ type: "spring", stiffness: 400, damping: 17 }}
//             onClick={() => router.push("/browse-jobs")}
//             className="cursor-pointer group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-shadow duration-300 flex items-center justify-center gap-2 overflow-hidden w-full sm:w-auto"
//           >
//             <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             <ArrowLeft className="w-4 h-4 relative z-10 group-hover:-translate-x-1 transition-transform" />
//             <span className="relative z-10">Go to Jobs</span>
//           </motion.button>
//         </motion.div>

//         {/* Footer Hint */}
//         <motion.div
//           variants={itemVariants}
//           className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500"
//         >
//           <AlertTriangle className="w-3 h-3 text-zinc-500" />
//           <span>Contact support if you believe this is a mistake</span>
//         </motion.div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default UnauthorizedView;
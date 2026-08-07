// frontend/src/app/(main)/account-suspended/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Mail, Shield, AlertTriangle, LogOut, ArrowRight, HelpCircle, MessageCircle, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const AccountSuspendedPage = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const [isMounted, setIsMounted] = useState(false);

    // ✅ Fix: Only run on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ Auto logout when on suspension page
    useEffect(() => {
        const logout = async () => {
            try {
                await authClient.signOut();
                console.log('✅ User logged out due to suspension');
                setIsLoggingOut(false);
            } catch (error) {
                console.error('❌ Error logging out:', error);
                setIsLoggingOut(false);
            }
        };
        logout();
    }, []);

    // ✅ Countdown for auto-redirect
    useEffect(() => {
        if (!isLoggingOut) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLoggingOut]);

    // Animation variants
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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 },
        },
    };

    const orbVariants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    // ✅ Don't render particles on server
    const renderParticles = () => {
        if (typeof window === 'undefined') return null;
        
        return [...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400/20 rounded-full"
                initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 0,
                }}
                animate={{
                    y: [null, -100, 100, -50, 50],
                    x: [null, 50, -50, 30, -30],
                    opacity: [0, 0.5, 0.3, 0.6, 0],
                }}
                transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5,
                }}
            />
        ));
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pt-15 relative min-h-screen bg-[#090a0f] overflow-hidden">
            {/* =============================================
                ANIMATED BACKGROUND
            ============================================= */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <motion.div
                    variants={orbVariants}
                    animate="animate"
                    className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"
                />
                <motion.div
                    variants={orbVariants}
                    animate="animate"
                    transition={{ delay: 1, duration: 5 }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl"
                />
                <motion.div
                    variants={orbVariants}
                    animate="animate"
                    transition={{ delay: 2, duration: 6 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"
                />

                {/* Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Floating Particles - Only render on client */}
                {renderParticles()}

                {/* Animated Border Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 border border-red-500/10 rounded-3xl m-8 pointer-events-none"
                />
            </div>

            {/* =============================================
                MAIN CONTENT
            ============================================= */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    {/* Card */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-[#111214]/90 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 shadow-2xl shadow-red-500/10 overflow-hidden"
                    >
                        {/* Card Glow Effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                            }}
                            className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"
                        />

                        {/* Icon */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center mb-6"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.3,
                                }}
                                className="relative"
                            >
                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
                                    <Ban className="w-12 h-12 text-red-400" />
                                </div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -inset-4 bg-red-500/10 rounded-full blur-xl -z-10"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center mb-2"
                        >
                            <h1 className="text-3xl font-bold text-white">
                                Account Suspended
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-500/50" />
                                <span className="text-red-400/60 text-xs uppercase tracking-wider">
                                    Access Revoked
                                </span>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500/50" />
                            </div>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6 relative overflow-hidden"
                        >
                            <motion.div
                                animate={{
                                    x: ["-100%", "100%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent"
                            />
                            <p className="text-zinc-400 text-sm text-center relative z-10">
                                Your account has been suspended by an administrator.
                                You cannot access any features until your account is reactivated.
                            </p>
                        </motion.div>

                        {/* Status List */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-3 mb-6"
                        >
                            {[
                                { icon: AlertTriangle, text: "All features are temporarily disabled", color: "text-yellow-500" },
                                { icon: LogOut, text: isLoggingOut ? "Logging out..." : "You have been automatically logged out", color: "text-red-400" },
                                { icon: Mail, text: "Contact support for more information", color: "text-blue-400" },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="flex items-center gap-3 text-zinc-500 text-sm bg-white/5 rounded-lg px-4 py-2.5 border border-white/5"
                                >
                                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-3"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.2)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.location.href = '/contact'}
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                            >
                                <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                Contact Support
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.location.href = '/'}
                                className="w-full px-6 py-3.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-white/5 hover:border-white/10"
                            >
                                <Home className="w-4 h-4" />
                                Return to Homepage
                            </motion.button>

                            {/* Auto-redirect countdown */}
                            {!isLoggingOut && countdown > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-xs text-zinc-600 mt-2"
                                >
                                    Redirecting to homepage in{" "}
                                    <span className="text-blue-400 font-medium">{countdown}</span> seconds
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Footer */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-6 pt-4 border-t border-white/5 text-center"
                        >
                            <p className="text-[10px] text-zinc-600">
                                If you believe this is a mistake, please contact our support team.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <HelpCircle className="w-3 h-3 text-zinc-600" />
                                <span className="text-[10px] text-zinc-600">
                                    Reference: {Math.random().toString(36).substring(2, 8).toUpperCase()}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountSuspendedPage;
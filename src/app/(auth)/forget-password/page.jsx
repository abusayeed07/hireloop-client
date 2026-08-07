// src/app/(auth)/forgot-password/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { Card, Button, Input, Label } from "@heroui/react";
import toast from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastEmailSent, setLastEmailSent] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      toast.success("Token copied to clipboard!");
      setTimeout(() => setCopiedToken(false), 3000);
    } else {
      setCopiedLink(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setResetToken("");
    setResetUrl("");

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      console.log("📧 Checking email in database:", email);
      
      const checkResponse = await fetch(`${BASE_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const checkResult = await checkResponse.json();
      console.log("📦 User check result:", checkResult);

      if (!checkResult.exists) {
        setError("No account found with this email address. Please check and try again.");
        toast.error("No account found with this email address.");
        setIsLoading(false);
        return;
      }

      console.log("✅ User found, requesting password reset...");
      
      const response = await fetch(`${BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
        credentials: 'include',
      });

      console.log("📥 Response status:", response.status);

      if (response.ok) {
        console.log("⏳ Waiting for token...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let tokenData = null;
        let attempts = 0;
        while (attempts < 5 && !tokenData?.token) {
          const tokenResponse = await fetch(`${BASE_URL}/api/auth/get-reset-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            credentials: 'include',
          });
          tokenData = await tokenResponse.json();
          console.log(`🔑 Token attempt ${attempts + 1}:`, tokenData);
          if (!tokenData.token) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
        }

        if (tokenData?.token) {
          setResetToken(tokenData.token);
          setResetUrl(`${window.location.origin}/reset-password?token=${tokenData.token}`);
        }
        
        setIsSuccess(true);
        setLastEmailSent(email);
        startCooldown(60);
        toast.success("Password reset token generated!");
        setEmail("");
        setIsLoading(false);
        return;
      } else {
        let errorMessage = "Failed to send reset link. Please try again.";
        try {
          const result = await response.json();
          if (result?.error?.message) {
            errorMessage = result.error.message;
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
      
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    if (!lastEmailSent) {
      toast.error("No email found to resend. Please enter your email again.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setResetToken("");
    setResetUrl("");

    try {
      const response = await fetch(`${BASE_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lastEmailSent,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tokenResponse = await fetch(`${BASE_URL}/api/auth/get-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: lastEmailSent }),
          credentials: 'include',
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.token) {
          setResetToken(tokenData.token);
          setResetUrl(`${window.location.origin}/reset-password?token=${tokenData.token}`);
        }
        startCooldown(60);
        toast.success("New reset token generated!");
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State with Animations
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 flex items-center justify-center p-4 overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -80, 50, 0],
              y: [0, 50, -80, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white"
              >
                Password Reset Token Ready
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-400 text-sm mt-1"
              >
                For <span className="text-white font-medium">{lastEmailSent}</span>
              </motion.p>
            </div>

            {resetToken ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {/* First Field: Token */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label className="text-xs font-medium text-zinc-400">🔑 Your Reset Token</Label>
                  <div className="relative mt-1">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 pr-12">
                      <code className="text-sm font-mono text-blue-400 break-all">{resetToken}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(resetToken, 'token')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-700 rounded transition-colors"
                    >
                      {copiedToken ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Second Field: Reset Link */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label className="text-xs font-medium text-zinc-400">🔗 Reset Link (with token)</Label>
                  <div className="relative mt-1">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 pr-24">
                      <code className="text-xs font-mono text-blue-400 break-all">{resetUrl}</code>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        onClick={() => copyToClipboard(resetUrl, 'link')}
                        className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                      <Link
                        href={resetUrl}
                        className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col gap-3 pt-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={resetUrl}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 text-center block"
                    >
                      Go to Reset Password Page
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleResend}
                      disabled={isLoading || resendCooldown > 0}
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white transition-all ${
                        resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        "Sending..."
                      ) : resendCooldown > 0 ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-pulse" />
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        "Resend Reset Link"
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-pulse">
                  <p className="text-zinc-400">⏳ Generating token...</p>
                  <p className="text-zinc-500 text-xs mt-2">Please wait a moment</p>
                </div>
              </div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-zinc-500 text-xs text-center mt-4"
            >
              ⏰ Token expires in 1 hour
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 pt-4 border-t border-zinc-800"
            >
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                  setLastEmailSent("");
                  setResetToken("");
                  setResetUrl("");
                }}
                variant="light"
                className="text-zinc-400 hover:text-white w-full"
              >
                Try Different Email
              </Button>
              <Link
                href="/signin"
                className="text-sm text-zinc-400 hover:text-white transition-colors block text-center mt-2"
              >
                ← Back to Sign In
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Forgot Password Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 50, -80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </motion.div>

        <Card className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
            >
              Reset Password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 text-sm mt-1"
            >
              Enter your email to receive a secure recovery link
            </motion.p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-600 text-sm w-full"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-sm text-rose-400">{error}</p>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Checking...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-zinc-500 text-sm mt-6"
          >
            Remembered your password?{" "}
            <Link
              href="/signin"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </Card>
      </motion.div>
    </div>
  );
}
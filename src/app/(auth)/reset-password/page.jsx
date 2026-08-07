// src/app/(auth)/reset-password/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key, Copy, Check } from "lucide-react";
import { Card, Button, Input, Label } from "@heroui/react";
import toast from "react-hot-toast";

// ✅ Import your beautiful loading component
import LoadingSpinner from "@/app/loading"; // Update path to your loading component

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Get token from URL
  const tokenFromUrl = searchParams.get("token");

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log("🔍 URL Token:", tokenFromUrl);

    // ✅ If token exists in URL, set it
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      toast.success("Token found in URL!");
    } else {
      // Check if token is in path (e.g., /reset-password/TOKEN)
      const pathSegments = window.location.pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment !== "reset-password") {
        setToken(lastSegment);
        toast.success("Token found in URL path!");
      }
    }
  }, [tokenFromUrl]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const finalToken = token || tokenFromUrl;

    if (!finalToken) {
      setError("Please enter your reset token.");
      toast.error("Please enter your reset token.");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Resetting password with token:", finalToken);

      // ✅ Try different endpoint formats
      let response = null;
      let success = false;

      // Try 1: Token in body (standard Better Auth)
      try {
        console.log("📤 Trying /reset-password with token in body...");
        response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: password,
            token: finalToken,
          }),
          credentials: "include",
        });

        if (response.ok) {
          success = true;
          console.log("✅ Success with token in body");
        }
      } catch (err) {
        console.log("❌ Token in body failed:", err.message);
      }

      // Try 2: Token in URL path
      if (!success) {
        try {
          console.log("📤 Trying /reset-password/TOKEN...");
          response = await fetch(`${BASE_URL}/api/auth/reset-password/${finalToken}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newPassword: password,
            }),
            credentials: "include",
          });

          if (response.ok) {
            success = true;
            console.log("✅ Success with token in URL");
          }
        } catch (err) {
          console.log("❌ Token in URL failed:", err.message);
        }
      }

      // Try 3: With callbackURL
      if (!success) {
        try {
          console.log("📤 Trying with callbackURL...");
          const callbackURL = encodeURIComponent(`${window.location.origin}/reset-password`);
          response = await fetch(`${BASE_URL}/api/auth/reset-password?token=${finalToken}&callbackURL=${callbackURL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newPassword: password,
            }),
            credentials: "include",
          });

          if (response.ok) {
            success = true;
            console.log("✅ Success with callbackURL");
          }
        } catch (err) {
          console.log("❌ With callbackURL failed:", err.message);
        }
      }

      // If all attempts failed
      if (!success || !response) {
        throw new Error("All reset attempts failed");
      }

      console.log("📥 Reset response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to reset password. Please try again.";
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

      const result = await response.json();
      console.log("📦 Reset password response:", result);

      setIsSuccess(true);
      toast.success("Password reset successfully!");

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err) {
      console.error("❌ Reset password error:", err);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    router.push("/forgot-password");
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 text-center">
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
              className="text-xl font-bold text-white mb-2"
            >
              Password Reset Successful! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-400 text-sm mb-6"
            >
              Your password has been reset. Redirecting to sign in...
            </motion.p>
            <Link
              href="/signin"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Go to Sign In →
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ✅ Loading State using your beautiful loading component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
        <Card className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
            >
              Set New Password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-sm mt-1"
            >
              Enter your new password below
            </motion.p>

            {/* Show token status */}
            {token ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
              >
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Token loaded from URL
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-zinc-400 font-mono break-all flex-1">
                    {token}
                  </p>
                  <button
                    onClick={() => copyToClipboard(token)}
                    className="ml-2 p-1 hover:bg-zinc-700 rounded transition-colors shrink-0"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
              >
                <p className="text-sm text-amber-400">
                  ⚠️ No token found. Please enter your reset token manually.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  💡 Check your server logs for:{" "}
                  <span className="text-blue-400">🔑 RESET TOKEN</span>
                </p>
              </motion.div>
            )}
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Token Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">
                Reset Token
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Enter your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-9 pr-10 bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-600 text-sm w-full"
                  required
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                💡 Enter the token from your server logs or email
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-600 text-sm w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-zinc-500">
                  Must contain 8+ characters
                </p>
                {password && password.length >= 8 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-10 bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-600 text-sm w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password && password !== confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-rose-400"
                >
                  Passwords do not match
                </motion.p>
              )}
              {confirmPassword &&
                password === confirmPassword &&
                password.length >= 8 && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-emerald-400 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" /> Passwords match
                  </motion.p>
                )}
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
                disabled={isLoading || !password || !confirmPassword || !token}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col gap-2 text-center"
          >
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Request New Reset Link →
            </Link>
            <Link
              href="/signin"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              ← Back to Sign In
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
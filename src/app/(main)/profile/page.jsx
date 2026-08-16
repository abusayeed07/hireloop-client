"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Upload,
  Save,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Camera,
  Loader2,
  XCircle,
  UserCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { Card, Button, Input, Badge } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Image from "next/image";
import LoadingPage from "@/app/loading";
import Metadata from "@/components/Metadata";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

const avatarVariants = {
  hidden: { scale: 0.8, opacity: 0, rotate: -10 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setIsUploadingAvatar(true);
    const formDataImg = new FormData();
    formDataImg.append("image", file);

    try {
      const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formDataImg },
      );
      const data = await response.json();

      if (data.success) {
        const updateRes = await authClient.updateUser({
          image: data.data.url,
        });

        if (updateRes.error) {
          throw new Error(
            updateRes.error.message || "Failed to update profile image.",
          );
        }

        toast.success("Profile image updated successfully!");
        await authClient.getSession();
      } else {
        throw new Error("Upload failed. Try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Network error during upload");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const updateData = {
        name: formData.name,
      };

      if (formData.phone?.trim()) {
        updateData.phone = formData.phone.trim();
      }

      const profileRes = await authClient.updateUser(updateData);

      if (profileRes.error) {
        toast.error(profileRes.error.message || "Failed to update profile info.");
        setSaving(false);
        return;
      }

      const hasNewPassword = passwordData.newPassword?.trim() !== "";
      const hasConfirmPassword = passwordData.confirmPassword?.trim() !== "";
      const hasCurrentPassword = passwordData.currentPassword?.trim() !== "";

      if (hasNewPassword || hasConfirmPassword || hasCurrentPassword) {
        if (!hasCurrentPassword) {
          toast.error("Please enter your Current Password to change it.");
          setSaving(false);
          return;
        }
        
        if (!hasNewPassword) {
          toast.error("Please enter a New Password.");
          setSaving(false);
          return;
        }
        
        if (!hasConfirmPassword) {
          toast.error("Please confirm your New Password.");
          setSaving(false);
          return;
        }

        if (passwordData.newPassword.length < 8) {
          toast.error("Password must be at least 8 characters long.");
          setSaving(false);
          return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("The provided new passwords do not match.");
          setSaving(false);
          return;
        }

        const passwordRes = await authClient.changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          revokeOtherSessions: true,
        });

        if (passwordRes.error) {
          const errorMsg = passwordRes.error.message || "Failed to update password.";
          toast.error(errorMsg);
          setSaving(false);
          return;
        }

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        toast.success("Password updated successfully!");
      }

      toast.success("Profile updated successfully!");
      setStatusMessage({
        type: "success",
        text: "Profile updated successfully.",
      });

      await authClient.getSession();

      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (error) {
      console.error("Profile modification failure:", error);
      const errorMsg = error.message || "An unexpected system error occurred.";
      toast.error(errorMsg);
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !session) {
    return (
      <LoadingPage 
        title="Loading Profile"
        message="Fetching your account information..."
        customStats={[
          { icon: UserCircle, label: "Loading profile", animate: "spin" },
          { icon: Settings, label: "Preparing settings", animate: "pulse" },
          { icon: Sparkles, label: "Almost ready", animate: "bounce" },
        ]}
        customColor="from-purple-400 via-pink-400 to-rose-400"
      />
    );
  }

  return (
    <>
      <Metadata page="profile" />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-200 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden"
      >
        {/* Ambient Background Glow - lighter in light mode */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/5 dark:bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-400/5 dark:bg-purple-500/5 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto space-y-8 mt-15 relative z-10">
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            className="border-b border-zinc-200/50 dark:border-zinc-800/60 pb-5"
          >
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">
              Manage your account identity, telemetry details, and security
              configuration.
            </p>
          </motion.div>

          <form onSubmit={handleSaveChanges} className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl shadow-black/5 dark:shadow-black/40 space-y-8 hover:border-zinc-300 dark:hover:border-zinc-700/60 transition-all duration-300">
                
                {/* Section 1: Profile Information */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-200 font-medium text-sm border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
                    <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <h2>Profile Information</h2>
                  </div>

                  {/* Avatar Upload Section */}
                  <motion.div 
                    variants={avatarVariants}
                    className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/60"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(59, 130, 246, 0.15)" }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-2xl font-bold uppercase overflow-hidden group border border-zinc-300/50 dark:border-zinc-700 shadow-lg cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageUpload}
                      />

                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt="Avatar"
                          fill
                          className="object-cover transition-all duration-300"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-zinc-500 dark:text-zinc-300">
                          {formData.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                        {isUploadingAvatar ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-white mb-1" />
                            <span className="text-[10px] text-zinc-300 font-medium">
                              Upload
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>

                    <div className="text-center sm:text-left space-y-1">
                      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Profile Photo
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">PNG or JPG up to 2MB.</p>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          size="sm"
                          variant="flat"
                          className="bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 mt-2 text-xs h-8 rounded-lg border border-zinc-300/50 dark:border-zinc-700/50 transition-all duration-200"
                          onPress={() => fileInputRef.current?.click()}
                          isLoading={isUploadingAvatar}
                          startContent={
                            !isUploadingAvatar && <Upload className="w-3.5 h-3.5" />
                          }
                        >
                          {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Inputs Grid */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" />
                        <Input
                          type="text"
                          variant="bordered"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="John Doe"
                          className="pl-9 bg-white/80 dark:bg-zinc-950/60 border-zinc-300/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm w-full focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email - Disabled */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <Input
                          type="email"
                          variant="bordered"
                          value={user?.email || ""}
                          disabled
                          placeholder="email@example.com"
                          className="pl-9 opacity-60 bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-300/30 dark:border-zinc-900 text-zinc-500 dark:text-zinc-500 cursor-not-allowed text-sm w-full"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" />
                        <Input
                          type="tel"
                          variant="bordered"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+880 1XXX-XXXXXX"
                          className="pl-9 bg-white/80 dark:bg-zinc-950/60 border-zinc-300/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm w-full focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Account Role - Disabled */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                        Account Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <Input
                          type="text"
                          variant="bordered"
                          value={user?.role || "seeker"}
                          disabled
                          className="pl-9 opacity-60 bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-300/30 dark:border-zinc-900 text-zinc-500 dark:text-zinc-500 cursor-not-allowed capitalize text-sm w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Section 2: Security Credentials */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-6 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60"
                >
                  <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-200 font-medium text-sm border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
                    <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <h2>Security Credentials</h2>
                  </div>

                  <div className="space-y-5">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                        Current Account Password
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 z-10" />
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder={
                            showCurrentPassword ? "currentpassword123" : "••••••••"
                          }
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          variant="bordered"
                          className="w-full h-10 pl-9 pr-12 bg-white/80 dark:bg-zinc-950/60 border border-zinc-300/50 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-600 focus:outline-none transition-all"
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors z-10 focus:outline-none"
                        >
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={showCurrentPassword ? "off" : "on"}
                              initial={{ opacity: 0, rotate: -90 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              exit={{ opacity: 0, rotate: 90 }}
                              transition={{ duration: 0.15 }}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>

                    {/* New Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                          New Secure Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder={
                              showNewPassword ? "newpassword123" : "••••••••"
                            }
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            variant="bordered"
                            className="w-full h-10 pl-3 pr-12 bg-white/80 dark:bg-zinc-950/60 border border-zinc-300/50 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-600 focus:outline-none transition-all"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors z-10 focus:outline-none"
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={showNewPassword ? "off" : "on"}
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.15 }}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">
                          Confirm New Password
                        </label>
                        
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={
                              showConfirmPassword ? "newpassword123" : "••••••••"
                            }
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            variant="bordered"
                            className={`w-full h-10 pl-3 pr-12 transition-all duration-300 bg-white/80 dark:bg-zinc-950/60 ${
                              passwordData.confirmPassword && passwordData.newPassword
                                ? passwordData.confirmPassword === passwordData.newPassword
                                  ? "border-green-500/50 ring-1 ring-green-500/50 bg-green-50 dark:bg-green-950/10"
                                  : "border-red-500/50 ring-1 ring-red-500/50 bg-red-50 dark:bg-red-950/10"
                                : "border-zinc-300/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
                            }`}
                          />
                          
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
                            {passwordData.confirmPassword && passwordData.newPassword && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                {passwordData.confirmPassword === passwordData.newPassword ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                )}
                              </motion.div>
                            )}
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors z-0 focus:outline-none"
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={showConfirmPassword ? "off" : "on"}
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.15 }}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    {passwordData.newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-zinc-500 dark:text-zinc-500 space-y-1 pl-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`${passwordData.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {passwordData.newPassword.length >= 8 ? '✅' : '⬜'}
                          </span>
                          At least 8 characters
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {/[A-Z]/.test(passwordData.newPassword) ? '✅' : '⬜'}
                          </span>
                          At least one uppercase letter
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {/[0-9]/.test(passwordData.newPassword) ? '✅' : '⬜'}
                          </span>
                          At least one number
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {statusMessage.text && (
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={`flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-full shadow-sm border ${
                        statusMessage.type === "success"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20"
                          : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/20"
                      }`}
                    >
                      {statusMessage.type === "success" ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{statusMessage.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Actions */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-end border-t border-zinc-200/50 dark:border-zinc-800/60 pt-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      type="submit"
                      isLoading={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl px-8 h-11 shadow-lg shadow-blue-600/20"
                      startContent={!saving && <Save className="w-3.5 h-3.5" />}
                    >
                      Save Account Updates
                    </Button>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Save, CheckCircle, AlertCircle } from "lucide-react";
import { Card, Button, Input } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

const safeFetch = async (url, options) => {
  if (options.body instanceof FormData) {
    const formData = options.body;
    const obj = {};
    for (const [key, value] of formData.entries()) {
      obj[key] = value;
    }
    options.body = JSON.stringify(obj);
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  }
  return fetch(url, options);
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      if (user.phone) {
        validatePhoneNumber(user.phone);
      }
    }
  }, [user]);

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (!cleaned || cleaned.length === 0) {
      setPhoneError("Phone number is required");
      setIsPhoneValid(false);
      return false;
    }

    if (cleaned.length !== 11) {
      setPhoneError(`Phone number must be 11 digits (currently ${cleaned.length} digits)`);
      setIsPhoneValid(false);
      return false;
    }

    if (!/^01[3-9]\d{8}$/.test(cleaned)) {
      if (/^01/.test(cleaned)) {
        const operatorCode = cleaned.substring(0, 3);
        if (!['013', '014', '015', '016', '017', '018', '019'].includes(operatorCode)) {
          setPhoneError(`Invalid operator code. Must start with 013-019 (e.g., 017)`);
        } else {
          setPhoneError("Invalid phone number format");
        }
      } else {
        setPhoneError("Must start with 01 and be a valid Bangladesh number (e.g., 01712345678)");
      }
      setIsPhoneValid(false);
      return false;
    }

    setPhoneError("");
    setIsPhoneValid(true);
    return true;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    if (value.startsWith("+")) {
      value = "+" + value.slice(1).replace(/\D/g, "");
    } else {
      value = value.replace(/\D/g, "");
    }

    let maxAllowed = 11;
    if (value.startsWith("+880")) {
      maxAllowed = 14;
    } else if (value.startsWith("880")) {
      maxAllowed = 13;
    }

    if (value.length > maxAllowed) {
      value = value.slice(0, maxAllowed);
    }

    setFormData((prev) => ({ ...prev, phone: value }));

    if (value) {
      validatePhoneNumber(value);
    } else {
      setPhoneError("");
      setIsPhoneValid(true);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      toast.error(phoneError || "Please enter a valid 11-digit phone number");
      return;
    }

    setUpdating(true);
    try {
      const { data, error } = await authClient.updateUser({
        name: formData.name,
        phone: formData.phone,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile.");
        return;
      }

      toast.success("Profile updated successfully!");

      setTimeout(() => {
        if (user?.role === "recruiter") {
          router.push("/dashboard/recruiter");
        } else {
          router.push("/dashboard/seeker");
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:via-black dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 md:px-8 overflow-hidden">
      {/* Background Orbs - lighter in light mode */}
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
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-[120px]"
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
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[120px]"
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/20 dark:bg-cyan-500/5 rounded-full blur-[140px]"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto space-y-6 relative z-10"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage your account identity settings.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/60 rounded-2xl p-6 shadow-2xl shadow-black/5 dark:shadow-black/30">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Row */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/60"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold uppercase relative overflow-hidden border border-white/10 shadow-inner flex-shrink-0"
                >
                  {user?.image ? (
                    <Image 
                      src={user.image} 
                      alt="Avatar" 
                      width={80} 
                      height={80} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </motion.div>
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-white">Profile Photo</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Your profile image</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Update your avatar through your account provider</p>
                </div>
              </motion.div>

              {/* Inputs Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 z-10" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-white/80 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl border border-zinc-300/50 dark:border-zinc-800 pl-7 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 z-10" />
                    <Input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      placeholder="email@example.com"
                      className="bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-500 rounded-xl border border-zinc-300/30 dark:border-zinc-900/50 cursor-not-allowed opacity-60 pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    Phone Number
                    {formData.phone && isPhoneValid && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 z-10" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="01712345678"
                      className={`bg-white/80 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl border ${
                        phoneError ? 'border-rose-500/50 focus:border-rose-500' : 
                        isPhoneValid && formData.phone ? 'border-emerald-500/50 focus:border-emerald-500' : 
                        'border-zinc-300/50 dark:border-zinc-800 focus:border-blue-500'
                      } pl-7 transition-all`}
                    />
                    {phoneError && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 dark:text-rose-400" />
                    )}
                    {formData.phone && isPhoneValid && !phoneError && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  {phoneError && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-medium"
                    >
                      {phoneError}
                    </motion.p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                      Enter 11-digit Bangladesh number (e.g., 01712345678)
                    </p>
                    {formData.phone && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                        ({formData.phone.replace(/\D/g, '').length}/11)
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Account Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 z-10" />
                    <Input
                      type="text"
                      value={user?.role || "seeker"}
                      disabled
                      className="bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-500 rounded-xl border border-zinc-300/30 dark:border-zinc-900/50 cursor-not-allowed opacity-60 capitalize pl-7"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div 
                variants={itemVariants}
                className="flex justify-end pt-4 border-t border-zinc-200/50 dark:border-zinc-800/60"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    isLoading={updating}
                    disabled={updating || !isPhoneValid || !!phoneError}
                    className={`bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm rounded-xl px-6 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 ${
                      !isPhoneValid || phoneError ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {!updating && <Save className="w-4 h-4 mr-2" />}
                    {updating ? "Updating..." : "Save Updates"}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
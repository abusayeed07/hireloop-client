"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Switch,
  useOverlayState,
  Modal,
} from "@heroui/react";
import {
  Bell,
  ShieldAlert,
  AlertCircle,
  Shield,
  CheckCircle,
  X,
  Trash2,
  UserCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import LoadingPage from "@/app/loading";
import Metadata from "@/components/Metadata";

// ========== SHARED SETTINGS PAGE ==========
export default function SettingsPage() {
  const router = useRouter();
  const modalState = useOverlayState();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userRole = user?.role || 'seeker';

  const [deleting, setDeleting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  if (isPending || !session) {
    return (
      <LoadingPage 
        title="Loading Settings"
        message="Preparing your account settings..."
        customStats={[
          { icon: UserCircle, label: "Loading profile", animate: "spin" },
          { icon: Settings, label: "Preparing settings", animate: "pulse" },
          { icon: Sparkles, label: "Almost ready", animate: "bounce" },
        ]}
        customColor="from-cyan-400 via-blue-400 to-purple-400"
      />
    );
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    if (deleteConfirmText !== "DELETE") {
      toast.error('Verification phrase mismatch. Please type "DELETE".');
      return;
    }

    setDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      
      const response = await fetch(`${baseUrl}/api/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account termination failed.");
      }

      toast.success("Account records permanently expunged.");
      modalState.close();
      setDeleteConfirmText("");

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            if (typeof window !== "undefined") {
              localStorage.clear();
              sessionStorage.clear();
              window.location.replace("/signup");
            }
          },
          onError: (error) => {
            console.error("Sign out error:", error);
            if (window) {
              window.location.replace("/signup");
            }
          },
        },
      });
    } catch (error) {
      const errorMsg = error?.message || "An unexpected system error occurred.";
      toast.error(errorMsg);
      console.error("Delete account error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Metadata userRole={userRole} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-200 py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden flex flex-col items-center"
      >
        {/* Ambient Background Layers - lighter in light mode */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-300/30 dark:bg-cyan-500/10 blur-[140px] animate-pulse pointer-events-none" />
        <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-violet-300/30 dark:bg-violet-500/10 blur-[160px] animate-pulse delay-1000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-emerald-300/30 dark:bg-emerald-500/10 blur-[140px] animate-pulse delay-700 pointer-events-none" />

        {/* Subtle Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400/30 dark:bg-cyan-400/30 pointer-events-none"
            initial={{
              x: Math.random() * 1600,
              y: Math.random() * 900,
              opacity: 0,
            }}
            animate={{
              y: [null, -200],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 6 + Math.random() * 8,
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Main Container */}
        <div className="w-full pt-10 max-w-3xl mx-auto space-y-10 relative z-10 flex flex-col items-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full text-center pb-6 border-b border-zinc-200/50 dark:border-white/5"
          >
            <Card className="bg-white/80 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/50 w-full">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                Account Settings
              </h1>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                Manage your account preferences, notification routing, security
                configuration and privacy controls.
              </p>
            </Card>
          </motion.div>

          {/* Notifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 shadow-2xl shadow-cyan-500/5 rounded-2xl p-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <motion.div
                    className="flex items-start gap-4"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-500/10 rounded-xl border border-cyan-200/50 dark:border-cyan-500/20 shrink-0">
                      <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm">
                        Notifications
                      </h2>
                      <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 leading-relaxed">
                        Receive email updates for applications, interviews, and
                        company activity.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Switch
                      isSelected={emailNotifications}
                      onValueChange={setEmailNotifications}
                      className="bg-zinc-200 dark:bg-zinc-800 data-[selected=true]:bg-cyan-500"
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full relative"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(239,68,68,0)",
                  "0 0 35px rgba(239,68,68,0.15)",
                  "0 0 0 rgba(239,68,68,0)",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: "1rem",
                zIndex: 0,
              }}
            />

            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="relative z-10 bg-gradient-to-br from-red-100/60 to-red-50/30 dark:from-red-950/60 dark:to-red-900/10 backdrop-blur-xl border border-red-300/50 dark:border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-900/20 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-20">
                  <motion.div
                    className="flex items-start gap-4"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-red-200/50 dark:bg-red-500/20 rounded-xl border border-red-300/50 dark:border-red-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.2)] shrink-0">
                      <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-red-700 dark:text-red-300 font-semibold text-sm">
                        Decommission Portfolio
                      </h2>
                      <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 leading-relaxed max-w-sm">
                        Permanently delete your account and all associated data.
                        This action is irreversible and will remove your profile,
                        applications, and activity history from our systems.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 0px 30px rgba(220, 38, 38, 0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <Button
                        variant="flat"
                        className="bg-gradient-to-r from-red-200/50 to-red-100/30 dark:from-red-950/50 dark:to-red-900/30 hover:from-red-300/50 hover:to-red-200/30 dark:hover:from-red-900/60 dark:hover:to-red-800/40 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300/50 dark:border-red-500/30 hover:border-red-400/50 dark:hover:border-red-500/50 text-xs font-semibold rounded-lg px-6 h-10 shrink-0 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-900/20"
                        onClick={modalState.open}
                      >
                        <Trash2 className="w-4 h-4" />
                        Terminate Account
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* ✅ FIXED: Delete Confirmation Modal with Theme Support */}
        <AnimatePresence mode="wait">
          {modalState.isOpen && (
            <Modal state={modalState}>
              <Modal.Backdrop className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  className="absolute inset-0 bg-black/60 dark:bg-[#030305]/90 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    modalState.close();
                    setDeleteConfirmText("");
                  }}
                />

                <motion.div
                  className="w-full max-w-[480px] bg-white/95 dark:bg-[#09090b] border border-red-300/50 dark:border-red-900/60 rounded-2xl shadow-2xl shadow-red-500/20 dark:shadow-red-950/40 overflow-hidden relative z-10 mx-2"
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 30 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 via-transparent to-red-500/10 dark:from-red-600/10 dark:via-transparent dark:to-red-900/20 blur-3xl pointer-events-none" />

                  <Modal.Dialog className="relative z-10 bg-transparent">
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="hover:bg-red-100 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-500 transition-colors rounded-lg top-4 right-4 absolute p-1.5 z-20"
                      onClick={() => {
                        modalState.close();
                        setDeleteConfirmText("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                    
                    <div className="pt-8 px-6 flex justify-center">
                      <motion.div
                        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 border border-red-300/50 dark:border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.4,
                        }}
                      >
                        <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
                      </motion.div>
                    </div>
                    
                    <Modal.Header className="pt-4 px-6 pb-2 text-center">
                      <Modal.Heading className="text-lg font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">
                        System Termination Request
                      </Modal.Heading>
                    </Modal.Header>
                    
                    <Modal.Body className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                      <motion.div
                        className="space-y-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <p className="text-zinc-500 dark:text-zinc-500 text-sm leading-relaxed text-center">
                          Confirm complete removal from the Hireloop
                          infrastructure. This execution permanently clears
                          authorization records, application matrices, and cached
                          pipelines.
                        </p>

                        <motion.div
                          className="bg-red-100/50 dark:bg-red-950/20 border border-red-300/50 dark:border-red-900/30 rounded-xl p-4 flex items-start gap-3"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500/80 mt-0.5 shrink-0" />
                          <p className="text-red-700 dark:text-red-500/80 text-xs leading-relaxed">
                            <strong className="text-red-700 dark:text-red-500 block mb-1">
                              ⚠️ Irreversible Directive:
                            </strong>{" "}
                            This operations loop cannot be suspended or reverted
                            once authorized.
                          </p>
                        </motion.div>

                        <motion.div
                          className="space-y-3 pt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 }}
                        >
                          <p className="text-zinc-600 dark:text-zinc-500 text-xs font-medium text-center">
                            Type{" "}
                            <span className="text-red-600 dark:text-red-400 font-mono font-bold select-none bg-red-100 dark:bg-red-950/30 px-2 py-0.5 rounded border border-red-300/50 dark:border-red-900/40 mx-1">
                              DELETE
                            </span>{" "}
                            to unlock operation panel:
                          </p>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <Input
                              placeholder="Verification string input"
                              value={deleteConfirmText}
                              onChange={(e) =>
                                setDeleteConfirmText(e.target.value)
                              }
                              variant="bordered"
                              size="lg"
                              radius="lg"
                              className={`w-full bg-white/80 dark:bg-zinc-950/80 border rounded-xl text-zinc-900 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-700 font-mono tracking-[0.25em] focus:outline-none transition-all duration-300 ${
                                deleteConfirmText === "DELETE"
                                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                  : "border-zinc-300/50 dark:border-zinc-800 focus-within:border-red-500/50 dark:focus-within:border-red-700/50 focus-within:ring-1 focus-within:ring-red-500/20 dark:focus-within:ring-red-700/20"
                              }`}
                            />
                          </motion.div>

                          {deleteConfirmText === "DELETE" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                              className="flex items-center justify-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs bg-emerald-100/50 dark:bg-emerald-950/20 border border-emerald-300/50 dark:border-emerald-900/40 p-3 rounded-xl overflow-hidden"
                            >
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <span>
                                Verification confirmed. Proceed with deletion.
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    </Modal.Body>
                    
                    <Modal.Footer className="border-t border-red-300/50 dark:border-red-900/30 py-4 px-6 flex gap-3 bg-zinc-50/50 dark:bg-zinc-950/30">
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full bg-zinc-200 dark:bg-zinc-900 hover:bg-zinc-300 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium text-xs rounded-xl h-10 border border-zinc-300/50 dark:border-zinc-800/60 transition-all duration-300"
                          variant="flat"
                          onClick={() => {
                            modalState.close();
                            setDeleteConfirmText("");
                          }}
                        >
                          Cancel Execution
                        </Button>
                      </motion.div>
                      <motion.div
                        className="flex-1"
                        whileHover={
                          deleteConfirmText === "DELETE"
                            ? {
                                scale: 1.03,
                                boxShadow: "0px 0px 25px rgba(220, 38, 38, 0.4)",
                              }
                            : {}
                        }
                        whileTap={
                          deleteConfirmText === "DELETE" ? { scale: 0.97 } : {}
                        }
                      >
                        <Button
                          className={`w-full text-white font-medium text-xs rounded-xl h-10 transition-all duration-300 ${
                            deleteConfirmText === "DELETE"
                              ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25 dark:bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-red-700 dark:hover:scale-105"
                              : "bg-zinc-300 dark:bg-zinc-700/30 cursor-not-allowed text-zinc-500 dark:text-zinc-600"
                          }`}
                          isLoading={deleting}
                          isDisabled={deleteConfirmText !== "DELETE" || deleting}
                          onClick={handleDeleteAccount}
                        >
                          {deleting ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="animate-pulse">●</span>{" "}
                              Decommissioning...
                            </motion.span>
                          ) : (
                            "Confirm Deletion"
                          )}
                        </Button>
                      </motion.div>
                    </Modal.Footer>
                  </Modal.Dialog>
                </motion.div>
              </Modal.Backdrop>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
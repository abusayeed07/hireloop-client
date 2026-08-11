"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Zap,
  Calendar,
  DollarSign,
  FileText,
  HelpCircle,
  ExternalLink,
  AlertTriangle,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import Metadata from "@/components/Metadata";

// HeroUI Modal Components
import { Button, Modal } from "@heroui/react";
import Pagination from "@/components/Pagination";
import AddPaymentMethodModal from "@/components/AddPaymentMethodModal";

// ============================================
// 🎨 ANIMATION VARIANTS
// ============================================
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
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const statsVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

// ============================================
// 🎨 1. CREDIT CARD DISPLAY COMPONENT
// ============================================
const CreditCardDisplay = ({ card }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -15;
    const rotateYValue = ((x - centerX) / centerX) * 15;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  const normalizedCardholder = card?.cardholderName || card?.cardholder || card?.name || "CARD HOLDER";
  const normalizedBrand = String(card?.brand || "VISA").toUpperCase();

  // Card brand colors
  const getCardBrand = (brand) => {
    const brands = {
      VISA: {
        bg: "from-blue-600 via-blue-700 to-blue-900",
        chip: "bg-yellow-400",
        text: "text-white",
        logo: (
          <div className="text-white font-bold text-2xl tracking-wider">
            VISA
          </div>
        ),
      },
      MASTERCARD: {
        bg: "from-red-600 via-orange-600 to-orange-800",
        chip: "bg-yellow-400",
        text: "text-white",
        logo: (
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80 -ml-3"></div>
          </div>
        ),
      },
      MASTER_CARD: {
        bg: "from-red-600 via-orange-600 to-orange-800",
        chip: "bg-yellow-400",
        text: "text-white",
        logo: (
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80 -ml-3"></div>
          </div>
        ),
      },
      AMEX: {
        bg: "from-blue-800 via-indigo-800 to-purple-900",
        chip: "bg-yellow-400",
        text: "text-white",
        logo: (
          <div className="text-white font-bold text-xl tracking-wider">
            AMERICAN EXPRESS
          </div>
        ),
      },
      DISCOVER: {
        bg: "from-orange-600 via-orange-700 to-orange-900",
        chip: "bg-yellow-400",
        text: "text-white",
        logo: <div className="text-white font-bold text-2xl">DISCOVER</div>,
      },
    };
    return brands[brand] || brands["VISA"];
  };

  const brand = getCardBrand(normalizedBrand);

  return (
    <div
      ref={cardRef}
      className="hover-3d cursor-pointer mx-auto w-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovering
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
        transition: "transform 0.1s ease-out",
      }}
    >
      <div
        className={`w-full bg-gradient-to-br ${brand.bg} rounded-2xl p-6 md:p-8 shadow-2xl border border-white/10 min-h-[220px] md:min-h-[260px] flex flex-col justify-between`}
      >
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="text-white/70 text-sm font-medium">
            {normalizedCardholder}
          </div>
          <div className="text-white/50 text-4xl">✦</div>
        </div>

        {/* Card Number */}
        <div className="my-4 md:my-6">
          <div className="text-white/50 text-xs mb-1">CARD NUMBER</div>
          <div className="text-white text-xl md:text-2xl font-mono tracking-wider flex items-center gap-2">
            {card?.last4 ? (
              <>
                <span className="text-white/50">{card.first4 || '••••'}</span>
                <span className="text-white/20 tracking-[0.2em]">•••• ••••</span>
                <span className="text-white font-bold">{card.last4}</span>
              </>
            ) : (
              "•••• •••• •••• 4242"
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-white/50 text-xs">CARD HOLDER</div>
            <div className="text-white font-medium text-sm md:text-base">
              {normalizedCardholder}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-xs">EXPIRES</div>
            <div className="text-white font-medium text-sm md:text-base">
              {card?.expiryMonth || "12"}/{card?.expiryYear || "25"}
            </div>
          </div>
        </div>

        {/* Card Brand Logo */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-7 ${brand.chip} rounded opacity-80`}></div>
            <div className="w-12 h-8 bg-white/10 rounded border border-white/5"></div>
          </div>
          <div className="text-white/80 font-bold text-xl md:text-2xl">
            {brand.logo}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🚀 2. MAIN BILLING PAGE
// ============================================
const BillingPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || 'seeker';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // Billing History Pagination States
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 5;

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userId = user.id;

      const [sub, history, methods] = await Promise.all([
        fetch(`${baseUrl}/api/billing/subscription?userId=${userId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json()),
        fetch(`${baseUrl}/api/billing/history?userId=${userId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json()),
        fetch(`${baseUrl}/api/billing/payment-methods?userId=${userId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json()),
      ]);

      let subscriptionData = sub || {};
      
      const userPlan = user?.plan?.toLowerCase() || "free";
      const subPlan = subscriptionData?.planTier || subscriptionData?.plan?.toLowerCase() || userPlan;
      
      subscriptionData.planTier = subPlan;
      
      if (!subscriptionData.planName) {
        subscriptionData.planName = subPlan.charAt(0).toUpperCase() + subPlan.slice(1);
      }

      const isCancelled = subscriptionData?.status?.toLowerCase() === "cancelled";

      if (isCancelled) {
        subscriptionData.planName = "Free";
        subscriptionData.planTier = "free";
        subscriptionData.description = "Your subscription has been cancelled. Basic features only.";
        subscriptionData.features = [
          { included: true, text: "Browse & save up to 10 jobs" },
          { included: true, text: "Apply to up to 3 jobs per month" },
          { included: true, text: "Basic profile" },
          { included: true, text: "Email alerts" },
          { included: false, text: "Application tracking" },
          { included: false, text: "Salary insights" },
          { included: false, text: "Profile boost to recruiters" },
          { included: false, text: "Unlimited applications" },
        ];
        subscriptionData.amount = 0;
      }

      setSubscription(subscriptionData);
      setBillingHistory(Array.isArray(history) ? history : []);
      setPaymentMethods(Array.isArray(methods) ? methods : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const timeoutId = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchData, user?.id]);

  const handleUpgrade = () => {
    const role = user?.role || "seeker";
    if (role === "recruiter") {
      router.push("/pricing?tab=recruiter");
    } else {
      router.push("/pricing");
    }
  };

  const handleCancel = async () => {
    const planTier = subscription?.planTier?.toLowerCase() || user?.plan?.toLowerCase() || "free";
    const isFreePlan = planTier === "free" || planTier === "recruiter_free" || planTier === "seeker_free";
    
    if (isFreePlan) {
      toast.error("You are on the Free plan. No cancellation needed.");
      setIsModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

      console.log(`🔄 Attempting to cancel ${subscription?.planName || "Pro"} plan...`);

      const response = await fetch(`${baseUrl}/api/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const result = await response.json();
      console.log("📦 Cancel result:", result);

      if (result && result.success) {
        toast.success("Subscription cancelled successfully.");
        setIsModalOpen(false);
        await fetchData();
        try {
          await authClient.getSession();
          console.log("✅ Session refreshed");
        } catch (err) {
          console.log("Could not refresh session:", err);
        }
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("❌ Cancellation error:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
      inactive: "bg-zinc-700/50 text-zinc-400 border border-zinc-600",
      paid: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      failed: "bg-red-500/20 text-red-400 border border-red-500/30",
      trialing: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    };
    return map[status?.toLowerCase()] || map.inactive;
  };

  const getStatusIcon = (status) => {
    const map = {
      active: <CheckCircle className="w-3 h-3" />,
      paid: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />,
      trialing: <Zap className="w-3 h-3" />,
    };
    return map[status?.toLowerCase()] || <Clock className="w-3 h-3" />;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return `$${Number(amount).toFixed(2)}`;
  };

  if (loading) {
    return <BillingSkeleton />;
  }

  const isCancelled = subscription?.status?.toLowerCase() === "cancelled";
  const planTier = subscription?.planTier?.toLowerCase() || user?.plan?.toLowerCase() || "free";
  const isFreePlan = planTier === "free" || planTier === "recruiter_free" || planTier === "seeker_free";
  const isPremiumPlan = planTier === "premium" || planTier === "recruiter_premium" || planTier === "seeker_premium";
  const isPaidPlan = !isFreePlan && !isPremiumPlan;
  
  const formattedRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Seeker";

  // Pagination Calculations
  const totalHistoryItems = billingHistory.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / historyItemsPerPage);
  const startIndex = (historyPage - 1) * historyItemsPerPage;
  const endIndex = startIndex + historyItemsPerPage;
  const currentHistoryItems = billingHistory.slice(startIndex, endIndex);

  return (
    <>
      <Metadata userRole={userRole} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-8 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mt-15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Subscription & Billing
                </h1>
                <p className="text-zinc-400 mt-1">
                  Manage your subscription, payment methods, and billing history.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {formattedRole}
                </span>
                <button
                  onClick={fetchData}
                  className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 mb-6 w-full md:w-auto"
          >
            {["overview", "history", "payment"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
              >
                {tab === "overview" && "Overview"}
                {tab === "history" && "Billing History"}
                {tab === "payment" && "Payment Methods"}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Current Plan Card */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-400">
                        CURRENT PLAN
                      </h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <h2 className="text-2xl font-bold text-white">
                          {isCancelled
                            ? "Cancelled"
                            : subscription?.planName || "Free"}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription?.status)} flex items-center gap-1`}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {getStatusIcon(subscription?.status)}
                          </motion.span>
                          <span className="ml-1">
                            {subscription?.status?.charAt(0).toUpperCase() +
                              subscription?.status?.slice(1) || "Inactive"}
                          </span>
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        {isCancelled
                          ? "Your subscription has been cancelled. Access continues until the end of the billing period."
                          : subscription?.description ||
                          "Get started with basic features"}
                      </p>
                      {subscription?.currentPeriodEnd && !isCancelled && (
                        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next billing date:{" "}
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      )}
                      {isCancelled && subscription?.currentPeriodEnd && (
                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Your access will end on{" "}
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!isCancelled && (
                        <>
                          {!isPremiumPlan && (
                            <button
                              onClick={handleUpgrade}
                              className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                            >
                              {isFreePlan ? "Upgrade Plan" : "Change Plan"}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}

                          {isPaidPlan && (
                            <button
                              onClick={() => setIsModalOpen(true)}
                              disabled={isProcessing}
                              className="cursor-pointer px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Cancel Plan"
                              )}
                            </button>
                          )}
                        </>
                      )}

                      {isCancelled && (
                        <button
                          onClick={handleUpgrade}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                        >
                          Reactivate Plan
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  {subscription?.features && subscription.features.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
                      {subscription.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-center gap-2"
                        >
                          {feature.included ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-zinc-600" />
                          )}
                          <span
                            className={`text-sm ${feature.included ? "text-zinc-300" : "text-zinc-600"}`}
                          >
                            {feature.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {[
                    {
                      label: "Monthly Cost",
                      value: isCancelled
                        ? "$0.00"
                        : subscription?.amount !== undefined &&
                          subscription?.amount !== null
                          ? formatCurrency(subscription.amount)
                          : "$0.00",
                      icon: DollarSign,
                      color: "text-blue-400",
                      bg: "bg-blue-600/20",
                    },
                    {
                      label: "Billing Cycle",
                      value: isCancelled
                        ? "Cancelled"
                        : subscription?.billingCycle || "Monthly",
                      icon: Calendar,
                      color: "text-emerald-400",
                      bg: "bg-emerald-600/20",
                    },
                    {
                      label: "Total Invoices",
                      value: billingHistory.length,
                      icon: FileText,
                      color: "text-purple-400",
                      bg: "bg-purple-600/20",
                    },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={idx}
                        variants={statsVariants}
                        whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.1)" }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${stat.bg} rounded-xl`}>
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">{stat.label}</p>
                            <p className="text-lg font-bold text-white">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Upgrade Banner */}
                {isFreePlan && !isCancelled && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          Unlock More Features
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          Upgrade to Pro or Premium to get unlimited
                          applications, salary insights, and more.
                        </p>
                      </div>
                      <button
                        onClick={handleUpgrade}
                        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                      >
                        View Plans
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Billing History
                  </h3>
                  <span className="text-sm text-zinc-400">
                    {billingHistory.length} transactions
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {billingHistory.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Date
                          </th>
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Plan
                          </th>
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Amount
                          </th>
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Transaction ID
                          </th>
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Status
                          </th>
                          <th className="text-left py-3 text-xs font-medium text-zinc-400 uppercase">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentHistoryItems.map((bill, index) => (
                          <tr
                            key={index}
                            className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-3 text-sm text-zinc-300">
                              {formatDate(bill.date)}
                            </td>
                            <td className="py-3 text-sm text-zinc-300">
                              {bill.plan}
                            </td>
                            <td className="py-3 text-sm text-zinc-300">
                              {formatCurrency(bill.amount)}
                            </td>
                            <td className="py-3 text-sm text-zinc-400 font-mono">
                              {bill.transactionId}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}
                              >
                                {getStatusIcon(bill.status)}
                                <span>
                                  {bill.status?.charAt(0).toUpperCase() +
                                    bill.status?.slice(1) || "Unknown"}
                                </span>
                              </span>
                            </td>
                            <td className="py-3">
                              {bill.invoiceUrl ? (
                                <button
                                  onClick={() =>
                                    window.open(bill.invoiceUrl, "_blank")
                                  }
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-zinc-600 text-xs">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-zinc-800/50 rounded-full">
                          <FileText className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500">
                          No billing history available
                        </p>
                        <p className="text-xs text-zinc-600">
                          Your transactions will appear here once you subscribe
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalHistoryPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="px-6 py-5 border-t border-white/5 flex justify-center"
                  >
                    <Pagination
                      currentPage={historyPage}
                      totalPages={totalHistoryPages}
                      onPageChange={setHistoryPage}
                      size="md"
                      color="primary"
                      showTotal={true}
                      totalItems={totalHistoryItems}
                      itemsPerPage={historyItemsPerPage}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Payment Methods
                  </h3>
                  <button
                    onClick={() => setIsAddCardModalOpen(true)}
                    className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map((method, index) => (
                      <motion.div
                        key={method.id || index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <CreditCardDisplay key={method.id || index} card={method} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-zinc-800/50 rounded-full">
                        <CreditCard className="w-8 h-8 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500">
                        No payment methods added yet
                      </p>
                      <p className="text-xs text-zinc-600">
                        Add a payment method to start your subscription
                      </p>
                      <button
                        onClick={handleUpgrade}
                        className="cursor-pointer mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        View Plans
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600/20 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Need help with your invoice?
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Our support team is available 24/7 to help you resolve any
                    payment issues or clarify billing details.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/contact"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/privacy-policy"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
                >
                  Read Full Policy
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cancel Subscription Modal */}
        <Modal isOpen={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon className="bg-red-500/10 text-red-400 rounded-full p-1">
                    <AlertTriangle className="size-5" />
                  </Modal.Icon>
                  <Modal.Heading className="text-white text-lg font-semibold">
                    Cancel Subscription
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="space-y-4">
                  <p className="text-zinc-300">
                    Are you sure you want to cancel your{" "}
                    <span className="font-semibold text-white">
                      {subscription?.planName || "Pro"}
                    </span>{" "}
                    subscription?
                  </p>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Your access will continue until the end of your current
                      billing period ({formatDate(subscription?.currentPeriodEnd)}
                      ). After that, you'll lose access to premium features.
                    </p>
                  </div>

                  <ul className="space-y-1.5 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      Lose access to premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      Limited to 3 applications per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Your data will be preserved
                    </li>
                  </ul>
                </Modal.Body>
                <Modal.Footer className="flex gap-3">
                  <Button
                    variant="flat"
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium"
                    onPress={() => setIsModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Keep Plan
                  </Button>
                  <Button
                    variant="flat"
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium disabled:opacity-50"
                    onPress={handleCancel}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </span>
                    ) : (
                      "Yes, Cancel"
                    )}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        {/* Add Payment Method Modal */}
        <AddPaymentMethodModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onSuccess={fetchData}
        />
      </motion.div>
    </>
  );
};

// Loading Skeleton
const BillingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-8 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div>
          <div className="h-4 w-32 bg-zinc-800 rounded mb-4"></div>
          <div className="flex justify-between">
            <div>
              <div className="h-8 w-64 bg-zinc-800 rounded"></div>
              <div className="h-4 w-96 bg-zinc-800 rounded mt-2"></div>
            </div>
            <div className="h-6 w-24 bg-zinc-800 rounded-full"></div>
          </div>
        </div>
        <div className="flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 w-64">
          <div className="h-8 w-20 bg-zinc-800 rounded-xl"></div>
          <div className="h-8 w-20 bg-zinc-800 rounded-xl"></div>
          <div className="h-8 w-20 bg-zinc-800 rounded-xl"></div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between">
            <div>
              <div className="h-4 w-24 bg-zinc-800 rounded mb-2"></div>
              <div className="h-8 w-48 bg-zinc-800 rounded mb-2"></div>
              <div className="h-4 w-64 bg-zinc-800 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-zinc-800 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <div className="h-4 w-20 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <div className="h-4 w-20 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <div className="h-4 w-20 bg-zinc-800 rounded mb-2"></div>
            <div className="h-6 w-24 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BillingPage;
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button, Modal } from "@heroui/react";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Briefcase,
  Users,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Crown,
  Zap,
  AlertCircle,
  CreditCard,
  DollarSign,
  Shield,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingPage from "@/app/loading";

// Helper icons for the modal
const XCircle = ({ className }) => <X className={className} />;
const CheckCircle = ({ className }) => <Check className={className} />;

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState("seeker");
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: session, status, update } = useSession();

  // ✅ Force a session refresh when the page loads
  useEffect(() => {
    if (status === "authenticated") {
      update();
    }
  }, [status, update]);

  // ✅ Read the `tab` query param and switch tabs on load
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'recruiter') {
      setActiveTab('recruiter');
      
      setTimeout(() => {
        const toggleSection = document.getElementById('pricing-toggle');
        if (toggleSection) {
          toggleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams]);

  // Get plan tier order for comparison
  const getPlanTierOrder = (tier) => {
    const order = {
      free: 0,
      pro: 1,
      growth: 1,
      premium: 2,
      enterprise: 2,
    };
    return order[tier] || 0;
  };

  // Seeker Plans
  const seekerPlans = [
    {
      name: "Free",
      id: "seeker_free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      maxApplications: 3,
      tier: "free",
      isFree: true,
      features: [
        { included: true, text: "Browse & save up to 10 jobs" },
        { included: true, text: "Apply to up to 3 jobs per month" },
        { included: true, text: "Basic profile" },
        { included: true, text: "Email alerts" },
        { included: false, text: "Application tracking" },
        { included: false, text: "Salary insights" },
        { included: false, text: "Profile boost to recruiters" },
        { included: false, text: "Unlimited applications" },
      ],
      popular: false,
    },
    {
      name: "Pro",
      id: "seeker_pro",
      price: "$19",
      period: "/month",
      description: "For serious job seekers",
      maxApplications: 30,
      tier: "pro",
      isFree: false,
      features: [
        { included: true, text: "Apply to up to 30 jobs per month" },
        { included: true, text: "Unlimited saved jobs" },
        { included: true, text: "Application tracking" },
        { included: true, text: "Salary insights" },
        { included: false, text: "Unlimited applications" },
        { included: false, text: "Profile boost to recruiters" },
        { included: false, text: "Early access to new jobs" },
        { included: false, text: "Priority support" },
      ],
      popular: true,
    },
    {
      name: "Premium",
      id: "seeker_premium",
      price: "$39",
      period: "/month",
      description: "The ultimate job search",
      maxApplications: 100,
      tier: "premium",
      isFree: false,
      features: [
        { included: true, text: "Apply to up to 100 jobs per month" },
        { included: true, text: "Profile boost to recruiters" },
        { included: true, text: "Early access to new jobs" },
        { included: true, text: "Priority support" },
        { included: true, text: "Application tracking" },
        { included: true, text: "Salary insights" },
        { included: true, text: "Unlimited saved jobs" },
        { included: true, text: "Advanced analytics" },
      ],
      popular: false,
    },
  ];

  // Recruiter Plans
  const recruiterPlans = [
    {
      name: "Free",
      id: "recruiter_free",
      price: "$0",
      period: "forever",
      description: "Great for first-year hiring",
      maxActiveJobs: 3,
      tier: "free",
      isFree: true,
      features: [
        { included: true, text: "Up to 3 active job posts" },
        { included: true, text: "Basic applicant management" },
        { included: true, text: "Standard listing visibility" },
        { included: false, text: "Applicant tracking" },
        { included: false, text: "Basic analytics" },
        { included: false, text: "Email support" },
        { included: false, text: "Advanced analytics" },
        { included: false, text: "Featured listings" },
      ],
      popular: false,
    },
    {
      name: "Growth",
      id: "recruiter_growth",
      price: "$49",
      period: "/month",
      description: "For growing teams",
      maxActiveJobs: 10,
      tier: "growth",
      isFree: false,
      features: [
        { included: true, text: "Up to 10 active job posts" },
        { included: true, text: "Applicant tracking" },
        { included: true, text: "Basic analytics" },
        { included: true, text: "Email support" },
        { included: false, text: "Advanced analytics" },
        { included: false, text: "Featured listings" },
        { included: false, text: "Team collaboration" },
        { included: false, text: "Custom branding" },
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      id: "recruiter_enterprise",
      price: "$149",
      period: "/month",
      description: "For large organizations",
      maxActiveJobs: 50,
      tier: "enterprise",
      isFree: false,
      features: [
        { included: true, text: "Up to 50 active job posts" },
        { included: true, text: "Advanced analytics dashboard" },
        { included: true, text: "Featured job listings" },
        { included: true, text: "Team collaboration" },
        { included: true, text: "Custom branding" },
        { included: true, text: "Priority support" },
        { included: true, text: "Applicant tracking" },
        { included: true, text: "All Growth features" },
      ],
      popular: false,
    },
  ];

  const allPlans = [...seekerPlans, ...recruiterPlans];

  const faqs = [
    {
      id: 1,
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period.",
    },
    {
      id: 2,
      question: "What is your refund policy?",
      answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.",
    },
    {
      id: 4,
      question: "Can I switch plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be prorated accordingly.",
    },
    {
      id: 5,
      question: "Is there a free trial for paid plans?",
      answer: "Yes, we offer a 7-day free trial for Pro and Growth plans. No credit card required to start your trial.",
    },
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const currentPlans = activeTab === "seeker" ? seekerPlans : recruiterPlans;

  // ✅ Check if user is admin
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  // Handle Plan Selection
  const handlePlanSelect = (plan) => {
    if (status === "unauthenticated" || !session?.user) {
      toast.error("Please sign up first to purchase a plan.");
      router.push(`/signup?redirect=/pricing`);
      return;
    }

    // ✅ ADMIN RESTRICTION: Admin cannot purchase plans
    if (isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }

    const userRole = session.user.role;
    const userPlanId = session.user.plan;
    const matchedUserPlan = allPlans.find(p => p.id === userPlanId);
    const currentTier = session.user.planTier || matchedUserPlan?.tier || "free";
    const targetTier = plan.tier || "free";

    const isSeekerPlan = plan.id.startsWith("seeker_");
    const isRecruiterPlan = plan.id.startsWith("recruiter_");

    if (isSeekerPlan && userRole !== "seeker") {
      toast.error("You are a recruiter. Please switch to the Recruiter tab to purchase a plan.");
      return;
    }

    if (isRecruiterPlan && userRole !== "recruiter") {
      toast.error("You are a job seeker. Please switch to the Seeker tab to purchase a plan.");
      return;
    }

    if (userPlanId === plan.id) {
      toast.success(`✅ You are already on the ${plan.name} plan. Enjoy all the features!`);
      return;
    }

    if (plan.isFree) {
      toast.error(
        "⚠️ You cannot downgrade to the Free plan directly. Please cancel your current subscription first or contact support."
      );
      return;
    }

    const currentTierOrder = getPlanTierOrder(currentTier);
    const targetTierOrder = getPlanTierOrder(targetTier);

    if (targetTierOrder < currentTierOrder) {
      setSelectedPlan(plan);
      setIsDowngradeModalOpen(true);
      return;
    }

    handlePurchase(plan);
  };

  const handlePurchase = async (plan) => {
    setLoading(true);
    setLoadingPlanId(plan.id);

    try {
      const userEmail = session.user.email;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const matchedUserPlan = allPlans.find(p => p.id === session.user.plan);
      const currentTier = session.user.planTier || matchedUserPlan?.tier || "free";
      const isDowngrade = getPlanTierOrder(currentTier) > getPlanTierOrder(plan.tier);

      const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: plan.id,
          email: userEmail,
          is_downgrade: isDowngrade || false,
          success_url: `${window.location.origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Failed to create checkout session");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No checkout URL received");
      }
    } catch (error) {
      console.error("❌ Purchase error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingPlanId(null);
      setIsDowngradeModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const getUserPlanName = () => {
    const userPlanId = session?.user?.plan;
    if (!userPlanId) return "Free";
    const plan = allPlans.find(p => p.id === userPlanId);
    
    if (!plan) {
      if (userPlanId === "seeker_pro") return "Pro";
      if (userPlanId === "seeker_premium") return "Premium";
      if (userPlanId === "recruiter_growth") return "Growth";
      if (userPlanId === "recruiter_enterprise") return "Enterprise";
      return "Free";
    }
    
    return plan.name || "Free";
  };

  const getLostFeatures = () => {
    if (!selectedPlan) return [];
    return selectedPlan.features.filter(f => !f.included);
  };

  const getKeptFeatures = () => {
    if (!selectedPlan) return [];
    return selectedPlan.features.filter(f => f.included);
  };

  const closeModal = () => {
    setIsDowngradeModalOpen(false);
    setSelectedPlan(null);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
  };

  // ✅ Show loading page while session is loading
  if (status === "loading") {
    return (
      <LoadingPage 
        title="Loading Pricing"
        message="Getting your account information ready..."
        customStats={[
          { icon: CreditCard, label: "Loading plans", animate: "spin" },
          { icon: Users, label: "Checking account", animate: "pulse" },
          { icon: DollarSign, label: "Preparing pricing", animate: "bounce" },
        ]}
        customColor="from-green-400 via-emerald-400 to-teal-400"
      />
    );
  }

  return (
    <div className="mt-16 sm:mt-20 min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="py-8 sm:py-12 px-3 sm:px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
              Choose Your <span className="text-blue-400">Plan</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Select the perfect plan for your needs. Upgrade or downgrade anytime.
            </p>
            {session?.user && (
              <div className="mt-2 space-y-1 px-2">
                <p className="text-zinc-500 text-xs sm:text-sm truncate">
                  👋 Signed in as{" "}
                  <span className="text-blue-400">{session.user.email}</span>
                </p>
                <p className="text-zinc-500 text-xs">
                  Role:{" "}
                  <span className="capitalize text-zinc-300">
                    {session.user.role}
                  </span>
                  {isAdmin && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </p>
              </div>
            )}
          </motion.div>

          {/* Toggle - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center mb-8 sm:mb-12 px-2"
            id="pricing-toggle"
          >
            <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl sm:rounded-2xl p-1 flex gap-0.5 sm:gap-1 w-full max-w-md">
              <button
                onClick={() => setActiveTab("seeker")}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === "seeker"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">For </span>Job Seekers
              </button>
              <button
                onClick={() => setActiveTab("recruiter")}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === "recruiter"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">For </span>Recruiters
              </button>
            </div>
          </motion.div>

          {/* Admin Banner - Show when admin is viewing */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 max-w-3xl mx-auto"
            >
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-400 shrink-0" />
                <div>
                  <h3 className="text-purple-400 font-semibold text-sm">Admin Account</h3>
                  <p className="text-zinc-400 text-xs">
                    You are an administrator. You have full access to all features 
                    and don't need to purchase any plan. Your admin privileges override all plan restrictions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Plans Grid - Mobile Optimized */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-1 sm:px-0"
            >
              {currentPlans.map((plan, index) => {
                const isCurrentPlan = session?.user?.plan === plan.id;
                const matchedUserPlan = allPlans.find(p => p.id === session?.user?.plan);
                const currentTier = session?.user?.planTier || matchedUserPlan?.tier || "free";
                const isDowngrade = getPlanTierOrder(plan.tier) < getPlanTierOrder(currentTier);
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-b from-blue-600/10 to-purple-600/10 border-blue-500/30 shadow-2xl shadow-blue-600/10 sm:scale-105"
                        : isDowngrade && !isCurrentPlan && !plan.isFree
                        ? "bg-gradient-to-b from-red-600/5 to-orange-600/5 border-red-500/20"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    } ${plan.popular ? "order-first sm:order-none" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[8px] sm:text-xs font-bold px-2 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-lg shadow-blue-500/30 whitespace-nowrap">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                        Most Popular
                      </div>
                    )}

                    {isCurrentPlan && !isAdmin && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-emerald-500/20 text-emerald-400 text-[8px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5 sm:gap-1">
                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline" />
                        <span className="hidden xs:inline">Current</span>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-purple-500/20 text-purple-400 text-[8px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-0.5 sm:gap-1">
                        <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline" />
                        <span className="hidden xs:inline">Admin</span>
                      </div>
                    )}

                    {isDowngrade && !isCurrentPlan && !plan.isFree && !isAdmin && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500/20 text-red-400 text-[8px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-red-500/30">
                        Downgrade
                      </div>
                    )}

                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-zinc-400 text-[10px] sm:text-xs md:text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-zinc-400 text-xs sm:text-sm ml-0.5 sm:ml-1">
                        {plan.period}
                      </span>
                      {isAdmin && (
                        <span className="ml-2 text-[8px] sm:text-xs text-purple-400 bg-purple-500/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-purple-500/30">
                          Free for Admin
                        </span>
                      )}
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <span className="inline-block bg-zinc-800/50 text-zinc-300 text-[8px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-zinc-700">
                        {plan.maxApplications !== undefined
                          ? `${plan.maxApplications} applications/month`
                          : plan.maxActiveJobs !== undefined
                          ? `${plan.maxActiveJobs} active jobs`
                          : ""}
                      </span>
                    </div>

                    <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-4 sm:mb-5 md:mb-6">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm">
                          {feature.included ? (
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-zinc-600 mt-0.5 shrink-0" />
                          )}
                          <span
                            className={
                              feature.included ? "text-zinc-300" : "text-zinc-600"
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-[8px] sm:text-[10px] text-zinc-500 pl-4 sm:pl-5">
                          +{plan.features.length - 5} more features
                        </li>
                      )}
                    </ul>

                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[6px] sm:text-[8px] md:text-[10px] text-emerald-400/80 mb-2 sm:mb-3">
                      <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>14-day money-back guarantee</span>
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={
                        (loading && loadingPlanId === plan.id) || 
                        (isCurrentPlan && !isAdmin) ||
                        isAdmin
                      }
                      className={`cursor-pointer block w-full text-center py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-[10px] sm:text-xs md:text-sm ${
                        isAdmin
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-not-allowed"
                          : isCurrentPlan
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                          : plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/20"
                          : isDowngrade && !isCurrentPlan && !plan.isFree
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                          : plan.isFree
                          ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      } ${
                        loading && loadingPlanId === plan.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isAdmin ? (
                        <span className="flex items-center justify-center gap-1 sm:gap-2">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                          Admin Access
                        </span>
                      ) : loading && loadingPlanId === plan.id ? (
                        <span className="flex items-center justify-center gap-1 sm:gap-2">
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          <span className="hidden xs:inline">Processing...</span>
                        </span>
                      ) : isCurrentPlan ? (
                        "✓ Current Plan"
                      ) : isDowngrade && !isCurrentPlan && !plan.isFree ? (
                        "↓ Downgrade"
                      ) : plan.isFree ? (
                        "Get Started"
                      ) : (
                        "Start Plan"
                      )}
                    </button>

                    {!plan.isFree && !isAdmin && (
                      <p className="text-[6px] sm:text-[8px] md:text-[10px] text-zinc-600 text-center mt-1.5 sm:mt-2">
                        🔒 Secure checkout powered by Stripe
                      </p>
                    )}
                    {isAdmin && (
                      <p className="text-[6px] sm:text-[8px] md:text-[10px] text-purple-500/60 text-center mt-1.5 sm:mt-2">
                        🛡️ Admin privileges included
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* FAQ Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-16 md:mt-20 max-w-3xl mx-auto px-2 sm:px-0"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors gap-2"
                  >
                    <span className="text-white font-medium text-xs sm:text-sm md:text-base">
                      {faq.question}
                    </span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 text-zinc-400 text-xs sm:text-sm leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Admin Modal */}
      <AnimatePresence mode="wait">
        {isAdminModalOpen && (
          <Modal isOpen={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
            <Modal.Backdrop className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                className="absolute inset-0 bg-[#030305]/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeAdminModal}
              />

              <motion.div
                className="w-full max-w-[420px] sm:max-w-[480px] bg-[#09090b] border border-purple-500/40 rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden relative z-10 mx-2"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-900/20 blur-3xl pointer-events-none" />

                <Modal.Dialog className="relative z-10 bg-transparent">
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:bg-purple-950/30 text-zinc-500 hover:text-purple-500 transition-colors rounded-lg top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 absolute p-1.5 z-20"
                    onClick={closeAdminModal}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>

                  <div className="pt-6 sm:pt-8 px-4 sm:px-6 flex justify-center">
                    <motion.div
                      className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        bounce: 0.4,
                      }}
                    >
                      <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-purple-500" />
                    </motion.div>
                  </div>

                  <Modal.Header className="pt-3 sm:pt-4 px-4 sm:px-6 pb-1 sm:pb-2 text-center">
                    <Modal.Heading className="text-base sm:text-lg font-bold text-zinc-200 tracking-tight">
                      Admin Account
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="py-3 sm:py-4 px-4 sm:px-6 text-zinc-400">
                    <motion.div
                      className="space-y-3 sm:space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed text-center">
                        You are signed in as an <strong className="text-purple-400">Admin</strong>.
                      </div>

                      <motion.div
                        className="bg-purple-950/20 border border-purple-500/30 rounded-lg sm:rounded-xl p-4"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                          <div className="text-purple-300 text-[10px] sm:text-xs leading-relaxed">
                            <p className="font-semibold text-purple-400 mb-1">
                              🛡️ Admin Benefits:
                            </p>
                            <ul className="space-y-1">
                              <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Full access to all features</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>No subscription needed</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Manage users and content</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Access all admin tools</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-blue-950/20 border border-blue-900/30 rounded-lg sm:rounded-xl p-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-blue-400/80 text-[9px] sm:text-xs flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          You don't need to purchase any plan. Your admin account already has full access.
                        </p>
                      </motion.div>
                    </motion.div>
                  </Modal.Body>

                  <Modal.Footer className="border-t border-purple-500/30 py-3 sm:py-4 px-4 sm:px-6 flex justify-center bg-zinc-950/30">
                    <motion.div
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-xs rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20"
                        onClick={closeAdminModal}
                      >
                        Got it!
                      </Button>
                    </motion.div>
                  </Modal.Footer>
                </Modal.Dialog>
              </motion.div>
            </Modal.Backdrop>
          </Modal>
        )}
      </AnimatePresence>

      {/* ✅ FULLY FIXED: Downgrade Warning Modal */}
      <AnimatePresence mode="wait">
        {isDowngradeModalOpen && selectedPlan && (
          <Modal isOpen={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
            <Modal.Backdrop className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                className="absolute inset-0 bg-[#030305]/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeModal}
              />

              <motion.div
                className="w-full max-w-[420px] sm:max-w-[480px] bg-[#09090b] border border-yellow-900/60 rounded-xl sm:rounded-2xl shadow-2xl shadow-yellow-950/40 overflow-hidden relative z-10 mx-2"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-transparent to-amber-900/20 blur-3xl pointer-events-none" />

                <Modal.Dialog className="relative z-10 bg-transparent">
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:bg-yellow-950/30 text-zinc-500 hover:text-yellow-500 transition-colors rounded-lg top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 absolute p-1.5 z-20"
                    onClick={closeModal}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>

                  <div className="pt-6 sm:pt-8 px-4 sm:px-6 flex justify-center">
                    <motion.div
                      className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        bounce: 0.4,
                      }}
                    >
                      <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-500" />
                    </motion.div>
                  </div>

                  <Modal.Header className="pt-3 sm:pt-4 px-4 sm:px-6 pb-1 sm:pb-2 text-center">
                    <Modal.Heading className="text-base sm:text-lg font-bold text-zinc-200 tracking-tight">
                      Downgrade Warning
                    </Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="py-3 sm:py-4 px-4 sm:px-6 text-zinc-400">
                    <motion.div
                      className="space-y-3 sm:space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed text-center">
                        You are about to downgrade to the <strong className="text-yellow-400">{selectedPlan.name}</strong> plan.
                      </div>

                      <motion.div
                        className="bg-yellow-950/20 border border-yellow-500/30 rounded-lg sm:rounded-xl p-4"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                          <div className="text-yellow-300 text-[10px] sm:text-xs leading-relaxed">
                            <p className="font-semibold text-yellow-400 mb-1">
                              ⚠️ You will lose access to the following features:
                            </p>
                            <ul className="space-y-1">
                              {getLostFeatures().map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <X className="w-3 h-3 text-red-400" />
                                  <span>{feature.text}</span>
                                </li>
                              ))}
                              {getLostFeatures().length === 0 && (
                                <li className="text-zinc-500 text-xs">No features will be lost.</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-blue-950/20 border border-blue-900/30 rounded-lg sm:rounded-xl p-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-blue-400/80 text-[9px] sm:text-xs flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          You will still keep access to all your current data and settings.
                        </p>
                      </motion.div>
                    </motion.div>
                  </Modal.Body>

                  <Modal.Footer className="border-t border-yellow-500/30 py-3 sm:py-4 px-4 sm:px-6 flex justify-center gap-3 bg-zinc-950/30">
                    <motion.div
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-lg sm:rounded-xl transition-all duration-300 border border-zinc-700"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-medium text-xs rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20"
                        onClick={() => handlePurchase(selectedPlan)}
                      >
                        Confirm Downgrade
                      </Button>
                    </motion.div>
                  </Modal.Footer>
                </Modal.Dialog>
              </motion.div>
            </Modal.Backdrop>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
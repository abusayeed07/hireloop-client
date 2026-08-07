"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  Send, 
  ArrowLeft,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Button, Input, TextArea } from "@heroui/react";
import toast from "react-hot-toast";

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
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const contactInfoVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const faqs = [
  {
    question: "How do I apply for a job?",
    answer: "Simply browse through our job listings, click on a role that interests you, and hit the 'Apply Now' button. You'll be guided through our simple application process.",
  },
  {
    question: "How do I reset my password?",
    answer: "Go to the Sign In page and click 'Forgot Password'. We'll send a password reset link to your registered email address.",
  },
  {
    question: "What is the pricing for your platform?",
    answer: "We offer a free plan for beginners, a Pro plan for serious job seekers, and an Enterprise plan for companies. Visit our Pricing page for more details.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time from your Billing settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "How can I contact support directly?",
    answer: "If you can't find the answer you're looking for, fill out the contact form below. Our support team typically responds within 24 hours.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    // 🔧 FUTURE: Add your backend API submission here
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white pt-24 pb-16 relative overflow-hidden">
      
      {/* 🔮 Ambient Background Orbs */}
      <motion.div
        animate={{
          x: [-80, 80, -80],
          y: [-40, 40, -40],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-20 left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [80, -80, 80],
          y: [40, -40, 40],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ===== HERO SECTION ===== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <HelpCircle className="w-12 h-12 text-blue-400" />
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            How can we help?
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-zinc-400 text-lg mt-4 max-w-2xl mx-auto"
          >
            Search our FAQ or reach out to our support team. We're here to assist you with any questions or issues.
          </motion.p>
        </motion.div>

        {/* ===== FAQ SECTION ===== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className="h-6 w-1 bg-purple-500 rounded-full" />
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-[#111214] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== 🚀 ELEVATED CONTACT SECTION ===== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className="h-6 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-2xl font-semibold text-white">Send us a message</h2>
          </motion.div>

          <motion.div variants={itemVariants}>
            {/* 🌟 Glassmorphism Container with Glowing Border */}
            <motion.div 
              whileHover={{ borderColor: "rgba(96, 165, 250, 0.4)" }}
              className="bg-[#111214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Subtle Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />

              <div className="flex flex-col lg:flex-row relative z-10">
                
                {/* LEFT: Contact Information */}
                <motion.div 
                  variants={contactInfoVariants}
                  className="lg:w-1/3 bg-gradient-to-br from-zinc-900/50 to-zinc-800/20 p-8 border-b lg:border-b-0 lg:border-r border-white/5"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Get in touch</h3>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Our support team is available 24/7 to assist you with any questions, feedback, or technical issues you may encounter.
                  </p>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Email us</p>
                        <a href="mailto:support@hireloop.com" className="text-white hover:text-blue-400 transition-colors text-sm font-medium">
                          support@hireloop.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <Clock className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Response time</p>
                        <p className="text-white text-sm font-medium">Within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Live chat</p>
                        <p className="text-white text-sm font-medium">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* RIGHT: Contact Form */}
                <motion.div 
                  variants={itemVariants}
                  className="flex-1 p-8 lg:p-10"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                        <div className="relative">
                          <Input
                            value={formData.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className={`bg-[#1c1c1e] border transition-all duration-200 text-white rounded-xl focus:ring-1 ${
                              focusedField === 'name'
                                ? "border-blue-500/50 ring-blue-500/20"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Email Address</label>
                        <div className="relative">
                          <Input
                            type="email"
                            value={formData.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className={`bg-[#1c1c1e] border transition-all duration-200 text-white rounded-xl focus:ring-1 ${
                              focusedField === 'email'
                                ? "border-blue-500/50 ring-blue-500/20"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Subject</label>
                      <div className="relative">
                        <Input
                          value={formData.subject}
                          onFocus={() => setFocusedField('subject')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="What is this regarding?"
                          className={`bg-[#1c1c1e] border transition-all duration-200 text-white rounded-xl focus:ring-1 ${
                            focusedField === 'subject'
                              ? "border-blue-500/50 ring-blue-500/20"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Message</label>
                      <div className="relative">
                        <TextArea
                          value={formData.message}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Describe your issue or question in detail..."
                          rows={5}
                          className={`bg-[#1c1c1e] border transition-all duration-200 text-white rounded-xl focus:ring-1 min-h-[150px] resize-none ${
                            focusedField === 'message'
                              ? "border-blue-500/50 ring-blue-500/20"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                      <p className="text-xs text-zinc-500">
                        We typically respond within <span className="text-white">24 hours</span>.
                      </p>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl px-8 h-11 shadow-lg shadow-blue-600/20"
                          endContent={<Send className="w-4 h-4" />}
                        >
                          Send Message
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ===== FOOTER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-8 border-t border-white/5 text-center"
        >
          <div className="flex justify-center gap-6 flex-wrap">
            <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/browse-jobs" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Browse Jobs
            </Link>
            <span className="text-zinc-600">•</span>
            <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Pricing
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            © {new Date().getFullYear()} HireLoop. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
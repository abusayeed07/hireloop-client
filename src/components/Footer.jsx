"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

import logoImg from "../../public/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const linkHover = {
    rest: { color: "#9ca3af" },
    hover: { color: "#6366f1", x: 4 },
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Subscribing...");

    try {
      // Simulate API call - Replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(`🎉 ${email} has been added to our mailing list!`, {
        id: toastId,
        duration: 4000,
      });
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again later.", {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={containerVariants}
      className="bg-[#0e162b] text-gray-400 border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 border-b border-white/10 pb-12">
          {/* Brand Info */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="relative w-36 h-10">
              <Image
                src={logoImg}
                fill
                sizes="144px"
                className="object-contain object-left"
                alt="HireLoop Logo"
              />
            </div>

            <p className="text-sm text-gray-400 max-w-xs leading-6 mt-2">
              The AI-native career platform. Built for people who take their work seriously.
            </p>

            <div className="mt-2 space-y-1 text-sm text-gray-300">
              <p>Whitney Square, North Loop</p>
              <p>210 N 2nd St #070, Minneapolis, MN 55401</p>
            </div>

            <div className="mt-1">
              <Link href="tel:+6127729555" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors text-sm">
                (612) 772-9555
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs font-semibold tracking-wider">
              <Link href="#" className="text-white hover:text-indigo-400 transition-colors uppercase">Map</Link>
              <span className="text-zinc-700">/</span>
              <Link href="#" className="text-white hover:text-indigo-400 transition-colors uppercase">Directions</Link>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {[
                { href: "https://facebook.com", icon: FaFacebookF },
                { href: "https://twitter.com", icon: FaTwitter },
                { href: "https://linkedin.com", icon: FaLinkedinIn },
                { href: "https://instagram.com", icon: FaInstagram },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-indigo-600 flex items-center justify-center transition-all duration-300 text-zinc-400 hover:text-white"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Sitemap */}
          <motion.div variants={itemVariants} className="lg:border-l lg:border-white/10 lg:pl-12 flex flex-col">
            <h3 className="text-indigo-400 font-semibold tracking-wider mb-5 text-xs uppercase">
              Sitemap
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
              {["Home", "Web Design Portfolio", "SEO Strategy", "All Services", "Digital Marketing Blog", "About Us", "Contact Us"].map((item) => (
                <li key={item}>
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    variants={linkHover}
                    className="inline-block cursor-pointer transition-all duration-200"
                  >
                    <Link href="#" className="hover:underline underline-offset-4 decoration-indigo-500/40">
                      {item}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1 lg:border-l lg:border-white/10 lg:pl-12 flex flex-col justify-start">
            <h3 className="text-indigo-400 font-semibold tracking-wider mb-2 text-xs uppercase">
              Want our best marketing tips?
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mb-5 leading-relaxed">
              We send out our best strategies in a juicy weekly newsletter. Only value, no fluff.
            </p>

            <form onSubmit={handleNewsletter} className="flex w-full max-w-md rounded-lg overflow-hidden border border-white/10 focus-within:border-indigo-500/50 transition-all duration-300 shadow-xl">
              <input
                type="email"
                placeholder="Your E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-[#151c33] text-white placeholder-zinc-500 px-4 py-3 text-sm outline-none transition-all"
              />
              <motion.button
                type="submit"
                whileHover={{ opacity: 0.95 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white font-semibold px-6 py-3 text-xs uppercase tracking-wider hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Sign Up"}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Metadata */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500"
        >
          <p className="text-center sm:text-left">
            &copy; {currentYear} HireLoop Platform / All rights reserved. /{" "}
            <Link href="#" className="hover:text-white transition-colors underline decoration-zinc-700">Privacy</Link>
          </p>
          <div className="flex items-center gap-6">
            <span className="bg-[#1a233a] text-[10px] px-2 py-1 rounded border border-white/5 text-gray-400 select-none tracking-widest font-mono">
              SECURED BY RECAPTCHA
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
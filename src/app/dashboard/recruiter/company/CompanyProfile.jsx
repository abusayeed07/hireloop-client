"use client";

import React, { useState } from "react";
import {
  Form,
  TextField,
  TextArea,
  Label,
  Input,
  Select,
  ListBox,
  Button,
  Description,
} from "@heroui/react";
import {
  ArrowUpToLine,
  Globe,
  Factory,
  Pencil,
  ChevronDown,
} from "@gravity-ui/icons";
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Link2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  Target,
  Eye,
  Heart,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { createCompany, updateCompany } from "@/lib/api/companies"; // ✅ Import updateCompany
import toast from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ========================================================
// 🎨 SHARED STYLES
// ========================================================
const textInputClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition duration-200";
const selectTriggerClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 flex items-center justify-between outline-none data-[hover=true]:border-zinc-700 transition duration-200";
const selectPopoverClass =
  "bg-zinc-950 border border-zinc-800 rounded-lg p-1 shadow-xl min-w-[200px]";
const selectItemClass =
  "text-zinc-300 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-900 hover:text-white outline-none data-[focused=true]:bg-zinc-900";
const textAreaClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg p-3 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition duration-200 resize-none";

// ========================================================
// 📦 COMPONENTS
// ========================================================

// Info Box Component
const InfoBox = ({ icon: Icon, label, value, className = "" }) => (
  <motion.div
    whileHover={{ y: -3, borderColor: "rgba(255,255,255,0.1)" }}
    className={`bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg ${className}`}
  >
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-zinc-500" />
      <span className="text-xs text-zinc-500 uppercase font-semibold">{label}</span>
    </div>
    <span className="text-zinc-300 font-medium">{value || "Not specified"}</span>
  </motion.div>
);

// Contact Info Component
const ContactInfo = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.03)" }}
    className="flex items-center gap-3 p-2 rounded-lg transition-colors cursor-default"
  >
    <Icon className="w-4 h-4 text-zinc-500" />
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-300">{value || "Not provided"}</p>
    </div>
  </motion.div>
);

// Social Link Component
const SocialLink = ({ icon: Icon, href, label, color = "text-zinc-500" }) => (
  <motion.a
    href={href || "#"}
    target="_blank"
    rel="noreferrer"
    whileHover={{ scale: 1.1, borderColor: "rgba(59,130,246,0.5)" }}
    className="w-9 h-9 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-800 group"
  >
    <Icon className={`w-4 h-4 ${color} group-hover:text-blue-400 transition-colors`} />
    <span className="sr-only">{label}</span>
  </motion.a>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "text-blue-400" }) => (
  <motion.div
    whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.1)" }}
    className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-4 text-center"
  >
    <div className={`flex items-center justify-center ${color} mb-1`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xl font-bold text-white">{value || 0}</p>
    <p className="text-xs text-zinc-500">{label}</p>
  </motion.div>
);

// ========================================================
// 🏢 MAIN COMPONENT
// ========================================================

export default function CompanyProfile({ recruiter, recruiterCompany }) {
  const router = useRouter();

  // Core State
  const [company, setCompany] = useState(recruiterCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  // Upload States
  const [logoUrl, setLogoUrl] = useState(recruiterCompany?.logo || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state - ✅ FILLED WITH EXACT DATA DURING EDIT
  const [formValues, setFormValues] = useState({
    companyName: recruiterCompany?.name || "",
    websiteUrl: recruiterCompany?.websiteUrl || "",
    industry: recruiterCompany?.industry || "technology",
    location: recruiterCompany?.location || "",
    employeeCount: recruiterCompany?.employeeCount || "1-10 employees",
    description: recruiterCompany?.description || "",
    foundedYear: recruiterCompany?.foundedYear || "",
    companySize: recruiterCompany?.companySize || "",
    companyType: recruiterCompany?.companyType || "",
    mission: recruiterCompany?.mission || "",
    vision: recruiterCompany?.vision || "",
    values: recruiterCompany?.values || "",
    phone: recruiterCompany?.phone || "",
    email: recruiterCompany?.email || "",
    twitter: recruiterCompany?.twitter || "",
    linkedin: recruiterCompany?.linkedin || "",
    instagram: recruiterCompany?.instagram || "",
    youtube: recruiterCompany?.youtube || "",
  });

  // Logo upload handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "File size exceeds 5MB limit" }));
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.success) {
        setLogoUrl(data.data.url);
        setErrors((prev) => ({ ...prev, logo: null }));
        toast.success("Logo uploaded successfully!");
      } else {
        setErrors((prev) => ({ ...prev, logo: "Upload failed. Try again." }));
        toast.error("Logo upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrors((prev) => ({
        ...prev,
        logo: "Network error during logo upload",
      }));
      toast.error("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!recruiter || !recruiter.id) {
      toast.error("Recruiter information is missing. Please refresh the page.");
      return;
    }

    const {
      companyName,
      websiteUrl,
      industry,
      location,
      employeeCount,
      description,
      foundedYear,
      companySize,
      companyType,
      mission,
      vision,
      values,
      phone,
      email,
      twitter,
      linkedin,
      instagram,
      youtube,
    } = formValues;

    // Manual validation check
    const newErrors = {};
    if (!companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!websiteUrl?.trim()) newErrors.websiteUrl = "Website URL is required";
    if (!location?.trim()) newErrors.location = "Location is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const newCompanyData = {
      name: companyName,
      websiteUrl,
      industry: industry || "Technology",
      location,
      employeeCount: employeeCount || "1-10 employees",
      description,
      logo: logoUrl || (company ? company.logo : ""),
      status: company?.status || "Pending",
      recruiterId: recruiter.id,
      foundedYear,
      companySize,
      companyType,
      mission,
      vision,
      values,
      phone,
      email,
      twitter,
      linkedin,
      instagram,
      youtube,
    };

    setIsSubmitting(true);

    try {
      let result;

      // ✅ CRITICAL FIX: Differentiate between Create and Update
      if (company && company._id) {
        // 🟢 UPDATE EXISTING COMPANY
        result = await updateCompany(company._id, newCompanyData);
      } else {
        // 🔵 CREATE NEW COMPANY
        result = await createCompany(newCompanyData);
      }

      if (result?.insertedId || result?.success) {
        const savedCompany = {
          ...newCompanyData,
          _id: result.insertedId || company?._id,
        };

        setCompany(savedCompany);
        setErrors({});
        setIsEditing(false);

        toast.success(company && company._id ? "Company updated successfully!" : "Company profile saved successfully!");

        router.refresh();

        // Only redirect to jobs if this was a new company creation
        if (!company || !company._id) {
          setTimeout(() => {
            router.push("/dashboard/recruiter/jobs/new");
          }, 100);
        }
      } else {
        toast.error(result?.message || "Failed to save company profile");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRegistration = () => {
    setLogoUrl("");
    setIsEditing(true);
  };

  const startEditing = () => {
    // ✅ FIX: Pre-fill EXACT data when editing
    setLogoUrl(company?.logo || "");
    setFormValues({
      companyName: company?.name || "",
      websiteUrl: company?.websiteUrl || "",
      industry: company?.industry || "technology",
      location: company?.location || "",
      employeeCount: company?.employeeCount || "1-10 employees",
      description: company?.description || "",
      foundedYear: company?.foundedYear || "",
      companySize: company?.companySize || "",
      companyType: company?.companyType || "",
      mission: company?.mission || "",
      vision: company?.vision || "",
      values: company?.values || "",
      phone: company?.phone || "",
      email: company?.email || "",
      twitter: company?.twitter || "",
      linkedin: company?.linkedin || "",
      instagram: company?.instagram || "",
      youtube: company?.youtube || "",
    });
    setIsEditing(true);
  };

  // ========================================================
  // 🚀 1. MODERN EMPTY STATE (REGISTER YOUR COMPANY)
  // ========================================================
  if (!company?._id && !isEditing) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden">
        
        {/* 🎨 Animated Gradient Background Orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 50, -20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ✨ Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* ✨ Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-blue-400/30 pointer-events-none"
            initial={{
              x: Math.random() * 1600,
              y: Math.random() * 900,
              opacity: 0,
            }}
            animate={{
              y: [null, -200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 6 + Math.random() * 8,
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* 🎯 Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl w-full text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-400 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Setup Required
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              type: "spring",
              stiffness: 120,
            }}
            className="relative flex justify-center mb-10"
          >
            <div className="absolute w-64 h-64 bg-white/[0.03] blur-3xl rounded-full" />

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-44 h-44 rounded-[36px] border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-center shadow-2xl"
            >
              <Factory size={62} className="text-zinc-500" />

              <motion.div
                animate={{
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl"
              >
                <Pencil size={18} className="text-white" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              Register Your Company
            </h2>
            <p className="mt-5 text-zinc-400 leading-relaxed max-w-xl mx-auto text-sm md:text-base">
              Create your company profile to publish job listings, manage
              applicants, build your employer brand and start hiring top talent.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-3 mt-10"
          >
            <Button
              onPress={startRegistration}
              className="bg-white text-black min-w-[220px] h-12 font-medium rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/10"
            >
              Register Company
            </Button>
            <Button
              variant="bordered"
              className="border-zinc-700 text-zinc-300 min-w-[160px] h-12 rounded-xl hover:border-zinc-500 transition-colors"
            >
              Learn More
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-zinc-500 mt-10 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3 h-3 text-zinc-500" />
            Company profiles are reviewed by administrators before becoming publicly visible.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ========================================================
  // 👁️ 2. VIEW MODE - PROFESSIONAL COMPANY PROFILE
  // ========================================================
  if (company?._id && !isEditing) {
    const getStatusStyles = (status) => {
      switch (status?.toLowerCase()) {
        case "approved":
          return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "rejected":
          return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        default:
          return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }
    };

    const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case "approved":
          return <CheckCircle className="w-3 h-3" />;
        case "rejected":
          return <XCircle className="w-3 h-3" />;
        default:
          return <Clock className="w-3 h-3" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl mx-auto my-8 space-y-6"
      >
        {/* Header Card */}
        <motion.div
          whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
          className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 transition-all"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    height={80}
                    width={80}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Building2 size={40} className="text-zinc-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-zinc-400">
                    {company.industry || "General"}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-sm text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {company.location || "Location not specified"}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${getStatusStyles(company.status)}`}
                  >
                    {getStatusIcon(company.status)}
                    {company.status || "Pending"}
                  </span>
                </div>
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-2"
                >
                  <Link2 size={14} />
                  {company.websiteUrl}
                </a>
              </div>
            </div>
            <Button
              onPress={startEditing}
              variant="bordered"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-lg px-4 font-medium h-10 flex items-center gap-2 transition-all hover:border-zinc-600"
            >
              <Pencil size={14} /> Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard icon={Users} label="Employees" value={company.employeeCount || "N/A"} />
          <StatCard icon={Briefcase} label="Open Jobs" value={company.jobs?.length || 0} />
          <StatCard icon={Calendar} label="Founded" value={company.foundedYear || "N/A"} color="text-purple-400" />
          <StatCard icon={Building2} label="Company Type" value={company.companyType || "N/A"} color="text-emerald-400" />
        </motion.div>

        {/* About Section */}
        {company.description && (
          <motion.div
            whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
            className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 transition-all"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <FileText size={14} />
              About the Company
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          </motion.div>
        )}

        {/* Mission & Vision */}
        {(company.mission || company.vision || company.values) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {company.mission && (
              <motion.div
                whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Mission
                  </h4>
                </div>
                <p className="text-zinc-300 text-sm">{company.mission}</p>
              </motion.div>
            )}
            {company.vision && (
              <motion.div
                whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Vision
                  </h4>
                </div>
                <p className="text-zinc-300 text-sm">{company.vision}</p>
              </motion.div>
            )}
            {company.values && (
              <motion.div
                whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Values
                  </h4>
                </div>
                <p className="text-zinc-300 text-sm">{company.values}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Contact & Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
            className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 transition-all"
          >
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Contact Information
            </h4>
            <div className="space-y-2">
              {company.phone && (
                <ContactInfo icon={Phone} label="Phone" value={company.phone} />
              )}
              {company.email && (
                <ContactInfo icon={Mail} label="Email" value={company.email} />
              )}
              {company.location && (
                <ContactInfo icon={MapPin} label="Location" value={company.location} />
              )}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
            className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 transition-all"
          >
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Social Links
            </h4>
            <div className="flex flex-wrap gap-2">
              {company.twitter && (
                <SocialLink icon={FaTwitter} href={company.twitter} label="Twitter" color="text-blue-400" />
              )}
              {company.linkedin && (
                <SocialLink icon={FaLinkedin} href={company.linkedin} label="LinkedIn" color="text-blue-600" />
              )}
              {company.instagram && (
                <SocialLink icon={FaInstagram} href={company.instagram} label="Instagram" color="text-pink-500" />
              )}
              {company.youtube && (
                <SocialLink icon={FaYoutube} href={company.youtube} label="YouTube" color="text-red-600" />
              )}
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 flex items-center justify-center transition-all hover:bg-zinc-800 group"
              >
                <span className="text-xs text-zinc-500 group-hover:text-blue-400 transition-colors font-semibold">FB</span>
                <span className="sr-only">Facebook</span>
              </a>
              {!company.twitter && !company.linkedin && !company.instagram && !company.youtube && (
                <p className="text-sm text-zinc-500">No social links added yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBox icon={Building2} label="Industry" value={company.industry} />
          <InfoBox icon={Users} label="Company Size" value={company.employeeCount} />
          <InfoBox icon={Briefcase} label="Company Type" value={company.companyType || "N/A"} />
          <InfoBox icon={Calendar} label="Founded" value={company.foundedYear || "N/A"} />
        </div>
      </motion.div>
    );
  }

  // ========================================================
  // ✏️ 3. EDIT/CREATE FORM - MODERN ANIMATED FORM
  // ========================================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-4xl mx-auto my-8 bg-zinc-950 p-8 border border-zinc-900 rounded-xl shadow-2xl shadow-black/50"
    >
      <Form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-zinc-200 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-400" />
            {company && company._id
              ? "Update Company Profile"
              : "Configure Workspace Platform"}
          </h2>

          {/* Row 1: Company Name + Industry */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TextField name="companyName" isRequired className="w-full">
              <Label className="text-zinc-400 font-medium text-sm">
                Company Name
              </Label>
              <Input
                placeholder="e.g. Acme Corp"
                className={textInputClass}
                value={formValues.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
              />
              {errors.companyName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.companyName}
                </span>
              )}
            </TextField>

            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 font-medium text-sm">
                Industry / Category
              </Label>
              <Select
                name="industry"
                selectedKeys={[formValues.industry]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected)
                    handleInputChange("industry", selected.toString());
                }}
                className="w-full"
                isRequired
              >
                <Select.Trigger className={selectTriggerClass}>
                  <Select.Value placeholder="Select industry" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={selectPopoverClass}>
                  <ListBox>
                    {["Technology", "Design", "Marketing", "Finance", "Healthcare", "Education", "Manufacturing"].map(
                      (item) => (
                        <ListBox.Item
                          key={item.toLowerCase()}
                          id={item.toLowerCase()}
                          className={selectItemClass}
                          textValue={item}
                        >
                          {item}
                        </ListBox.Item>
                      ),
                    )}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </motion.div>

          {/* Row 2: Website URL + Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <TextField name="websiteUrl" isRequired className="w-full">
              <Label className="text-zinc-400 font-medium text-sm">
                Website URL
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm border-r border-zinc-800 pr-2 z-10">
                  https://
                </span>
                <Input
                  placeholder="www.company.com"
                  className={`${textInputClass} pl-20`}
                  value={formValues.websiteUrl}
                  onChange={(e) =>
                    handleInputChange("websiteUrl", e.target.value)
                  }
                />
              </div>
              {errors.websiteUrl && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.websiteUrl}
                </span>
              )}
            </TextField>

            <TextField name="location" isRequired className="w-full">
              <Label className="text-zinc-400 font-medium text-sm">
                Location
              </Label>
              <div className="relative">
                <Globe
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 z-10"
                />
                <Input
                  placeholder="e.g. San Francisco, CA"
                  className={`${textInputClass} pl-10`}
                  value={formValues.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </div>
              {errors.location && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.location}
                </span>
              )}
            </TextField>
          </motion.div>

          {/* Row 3: Employee Count + Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 font-medium text-sm mb-2">
                Employee Count Range
              </Label>
              <Select
                name="employeeCount"
                selectedKeys={[formValues.employeeCount]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected)
                    handleInputChange("employeeCount", selected.toString());
                }}
                className="w-full"
              >
                <Select.Trigger className={selectTriggerClass}>
                  <Select.Value placeholder="Select employee count" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={selectPopoverClass}>
                  <ListBox>
                    {[
                      "1-10 employees",
                      "11-50 employees",
                      "51-200 employees",
                      "201+ employees",
                    ].map((item) => (
                      <ListBox.Item
                        key={item}
                        id={item}
                        className={selectItemClass}
                        textValue={item}
                      >
                        {item}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 font-medium text-sm">
                Company Logo
              </Label>
              <div className="flex items-center gap-4 mt-1">
                <label className="w-14 h-14 border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 rounded-xl flex items-center justify-center cursor-pointer transition-colors overflow-hidden group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt="Logo Preview"
                      height={64}
                      width={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ArrowUpToLine
                      size={18}
                      className="text-zinc-400 group-hover:text-zinc-300 transition-colors"
                    />
                  )}
                </label>
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-300">
                    {isUploading ? "Uploading..." : "Upload image"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    PNG, JPG up to 5MB
                  </span>
                  {errors.logo && (
                    <span className="text-xs text-red-500 mt-1">
                      {errors.logo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Row 4: Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <TextField name="description" className="w-full">
              <Label className="text-zinc-400 font-medium text-sm">
                Brief Description
              </Label>
              <TextArea
                placeholder="Tell us about your company's mission and culture..."
                rows={4}
                className={textAreaClass}
                value={formValues.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              <Description className="text-xs text-zinc-500 mt-1">
                Optional: Tell candidates about your company culture and values
              </Description>
            </TextField>
          </motion.div>

          {/* Additional Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-t border-zinc-900 pt-6 mt-4"
          >
            <h3 className="text-md font-semibold text-zinc-200 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField name="foundedYear" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Founded Year
                </Label>
                <Input
                  placeholder="e.g. 2020"
                  className={textInputClass}
                  value={formValues.foundedYear}
                  onChange={(e) =>
                    handleInputChange("foundedYear", e.target.value)
                  }
                />
              </TextField>

              <TextField name="companyType" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Company Type
                </Label>
                <Input
                  placeholder="e.g. Private, Public, Non-profit"
                  className={textInputClass}
                  value={formValues.companyType}
                  onChange={(e) =>
                    handleInputChange("companyType", e.target.value)
                  }
                />
              </TextField>

              <TextField name="mission" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Mission Statement
                </Label>
                <Input
                  placeholder="Our mission is to..."
                  className={textInputClass}
                  value={formValues.mission}
                  onChange={(e) =>
                    handleInputChange("mission", e.target.value)
                  }
                />
              </TextField>

              <TextField name="vision" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Vision Statement
                </Label>
                <Input
                  placeholder="Our vision is to..."
                  className={textInputClass}
                  value={formValues.vision}
                  onChange={(e) =>
                    handleInputChange("vision", e.target.value)
                  }
                />
              </TextField>

              <TextField name="values" className="w-full md:col-span-2">
                <Label className="text-zinc-400 font-medium text-sm">
                  Core Values
                </Label>
                <Input
                  placeholder="Innovation, Integrity, Teamwork..."
                  className={textInputClass}
                  value={formValues.values}
                  onChange={(e) =>
                    handleInputChange("values", e.target.value)
                  }
                />
              </TextField>

              <TextField name="phone" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Phone Number
                </Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  className={textInputClass}
                  value={formValues.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                />
              </TextField>

              <TextField name="email" className="w-full">
                <Label className="text-zinc-400 font-medium text-sm">
                  Contact Email
                </Label>
                <Input
                  placeholder="contact@company.com"
                  className={textInputClass}
                  value={formValues.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                />
              </TextField>
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4"
            >
              <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                Social Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField name="twitter" className="w-full">
                  <Label className="text-zinc-400 font-medium text-sm">
                    Twitter URL
                  </Label>
                  <Input
                    placeholder="https://twitter.com/company"
                    className={textInputClass}
                    value={formValues.twitter}
                    onChange={(e) =>
                      handleInputChange("twitter", e.target.value)
                    }
                  />
                </TextField>

                <TextField name="linkedin" className="w-full">
                  <Label className="text-zinc-400 font-medium text-sm">
                    LinkedIn URL
                  </Label>
                  <Input
                    placeholder="https://linkedin.com/company/company"
                    className={textInputClass}
                    value={formValues.linkedin}
                    onChange={(e) =>
                      handleInputChange("linkedin", e.target.value)
                    }
                  />
                </TextField>

                <TextField name="instagram" className="w-full">
                  <Label className="text-zinc-400 font-medium text-sm">
                    Instagram URL
                  </Label>
                  <Input
                    placeholder="https://instagram.com/company"
                    className={textInputClass}
                    value={formValues.instagram}
                    onChange={(e) =>
                      handleInputChange("instagram", e.target.value)
                    }
                  />
                </TextField>

                <TextField name="youtube" className="w-full">
                  <Label className="text-zinc-400 font-medium text-sm">
                    YouTube URL
                  </Label>
                  <Input
                    placeholder="https://youtube.com/@company"
                    className={textInputClass}
                    value={formValues.youtube}
                    onChange={(e) =>
                      handleInputChange("youtube", e.target.value)
                    }
                  />
                </TextField>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Form Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end gap-3 pt-5 border-t border-zinc-900"
        >
          {company && company._id && (
            <Button
              type="button"
              variant="bordered"
              onPress={() => setIsEditing(false)}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-lg px-5 h-11 transition-all"
            >
              Cancel
            </Button>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-white text-black font-semibold hover:bg-zinc-200 rounded-lg px-6 h-11 shadow-lg shadow-white/10 transition-all"
            >
              {company && company._id ? "Save Updates" : "Complete Setup"}
            </Button>
          </motion.div>
        </motion.div>
      </Form>
    </motion.div>
  );
}
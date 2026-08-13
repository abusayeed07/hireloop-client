"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  TextArea,
} from "@heroui/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Link2,
  FileText,
  Upload,
  X,
  Check,
  Send,
  Building2,
  Award,
  Code2,
  Globe,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
// ✅ Import your LoadingPage component
import LoadingPage from "@/app/loading";

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 80,
      duration: 0.5,
    },
  },
  hover: {
    scale: 1.01,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 150,
    },
  },
};

const fieldErrorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 4,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const JobApplyForm = ({ job, applicant }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: applicant?.name || "",
    email: applicant?.email || "",
    phone: applicant?.phone || "",
    location: "",
    currentCompany: "",
    currentRole: "",
    experience: "",
    education: "",
    portfolio: "",
    linkedin: "",
    skills: "",
    coverLetter: "",
  });

  // Phone Number validation
  const validatePhone = (value) => {
    const cleaned = value?.replace(/\D/g, "") || "";
    if (cleaned.length !== 11) {
      return "Phone number must be exactly 11 digits";
    }
    if (!cleaned.startsWith("01")) {
      return "Phone number must start with 01";
    }
    return null;
  };

  // Location validation
  const validateLocation = (value) => {
    if (!value || value.trim().length < 2) {
      return "Location is required";
    }
    return null;
  };

  // Experience validation
  const validateExperience = (value) => {
    if (!value || value.trim().length < 1) {
      return "Experience is required";
    }
    return null;
  };

  // Education validation
  const validateEducation = (value) => {
    if (!value || value.trim().length < 2) {
      return "Education is required";
    }
    return null;
  };

  // Skills validation (optional but with min length if provided)
  const validateSkills = (value) => {
    if (value && value.trim().length > 0 && value.trim().length < 2) {
      return "Please enter at least one skill";
    }
    return null;
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const validTypes = {
        resume: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        coverLetter: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
      };

      if (type === "resume" && !validTypes.resume.includes(file.type)) {
        toast.error("Please upload PDF or Word document for Resume");
        return;
      }
      if (
        type === "coverLetter" &&
        !validTypes.coverLetter.includes(file.type)
      ) {
        toast.error("Please upload PDF, Word, or Text file for Cover Letter");
        return;
      }

      if (type === "resume") {
        setResumeFile(file);
      } else {
        setCoverLetterFile(file);
      }
    }
  };

  const removeFile = (type) => {
    if (type === "resume") {
      setResumeFile(null);
    } else {
      setCoverLetterFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate resume file - REQUIRED
    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const submissionData = {
        jobId: job?._id,
        jobTitle: job?.jobTitle,
        companyId: job?.companyId,
        companyName: job?.companyName,
        applicantId: applicant?.id,
        applicantName: applicant?.name,
        applicantEmail: applicant?.email,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        currentCompany: formData.currentCompany,
        currentRole: formData.currentRole,
        experience: formData.experience,
        education: formData.education,
        portfolio: formData.portfolio,
        linkedin: formData.linkedin,
        skills: formData.skills,
        coverLetter: formData.coverLetter,
        resumeFileName: resumeFile.name,
        resumeFileType: resumeFile.type,
        coverLetterFileName: coverLetterFile?.name || "",
        coverLetterFileType: coverLetterFile?.type || "",
        appliedAt: new Date().toISOString(),
        status: "pending",
      };

      console.log("Submitting Application:", submissionData);

      const response = await fetch(`${baseUrl}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      console.log("Application result:", result);

      if (result.success || result.insertedId) {
        toast.success("Application submitted successfully! 🎉");
        setFormData({
          fullName: applicant?.name || "",
          email: applicant?.email || "",
          phone: applicant?.phone || "",
          location: "",
          currentCompany: "",
          currentRole: "",
          experience: "",
          education: "",
          portfolio: "",
          linkedin: "",
          skills: "",
          coverLetter: "",
        });
        setResumeFile(null);
        setCoverLetterFile(null);
        
        // Redirect to browse jobs
        window.location.href = `/browse-jobs`;
        
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ✅ Show LoadingPage when submitting
  if (isSubmitting) {
    return (
      <LoadingPage 
        title="Submitting Application"
        message="Please wait while we submit your application..."
        step="loading"
        showProgress={true}
        showStats={true}
        showTips={true}
        customColor="from-blue-400 via-purple-400 to-pink-400"
        customStats={[
          { icon: FileText, label: "Uploading resume", animate: "spin" },
          { icon: User, label: "Saving your details", animate: "pulse" },
          { icon: Send, label: "Submitting application", animate: "bounce" },
        ]}
        estimatedTime="~5 seconds"
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-5xl">
        <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-blue-500/40 hover:shadow-blue-500/20 p-7">
          <div className="relative z-10">
            
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                Apply for Position
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {job?.jobTitle || "Position"} at {job?.companyName || "Company"}
              </p>
            </motion.div>

            <Form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ===== PERSONAL INFORMATION ===== */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="fullName">
                      <Label className="text-zinc-400 text-sm">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                          readOnly
                        />
                      </div>
                      <Description className="text-xs text-zinc-500 mt-1">
                        Pre-filled from your account
                      </Description>
                    </TextField>
                  </motion.div>

                  {/* Email */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="email" type="email">
                      <Label className="text-zinc-400 text-sm">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                          readOnly
                        />
                      </div>
                      <Description className="text-xs text-zinc-500 mt-1">
                        Pre-filled from your account
                      </Description>
                    </TextField>
                  </motion.div>

                  {/* Phone */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField isRequired name="phone" type="tel" validate={validatePhone}>
                      <Label className="text-zinc-400 text-sm">
                        Phone Number <span className="text-zinc-500 text-xs">(11 digits)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="017xxxxxxxx"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                          maxLength={14}
                          readOnly={formData.phone && formData.phone.length > 0}
                        />
                      </div>
                      <Description className="text-xs text-zinc-500 mt-1">
                        {formData.phone && formData.phone.length > 0
                          ? "Pre-filled from your account."
                          : "Enter 11 digit phone number (e.g., 01712345678)"}
                      </Description>
                      <FieldError className="text-xs text-red-500 mt-1" />
                    </TextField>
                  </motion.div>

                  {/* Location */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField isRequired name="location" validate={validateLocation}>
                      <Label className="text-zinc-400 text-sm">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, location: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      <FieldError className="text-xs text-red-500 mt-1" />
                    </TextField>
                  </motion.div>
                </div>
              </motion.div>

              {/* ===== PROFESSIONAL INFORMATION ===== */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Professional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Company */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="currentCompany">
                      <Label className="text-zinc-400 text-sm">Current Company</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="Current employer"
                          value={formData.currentCompany}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, currentCompany: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </TextField>
                  </motion.div>

                  {/* Current Role */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="currentRole">
                      <Label className="text-zinc-400 text-sm">Current Role</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="Job title"
                          value={formData.currentRole}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, currentRole: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </TextField>
                  </motion.div>

                  {/* Experience */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField isRequired name="experience" validate={validateExperience}>
                      <Label className="text-zinc-400 text-sm">Years of Experience</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="e.g. 5 years"
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, experience: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      <FieldError className="text-xs text-red-500 mt-1" />
                    </TextField>
                  </motion.div>

                  {/* Education */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField isRequired name="education" validate={validateEducation}>
                      <Label className="text-zinc-400 text-sm">Highest Education</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="e.g. Bachelor's in CS"
                          value={formData.education}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, education: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      <FieldError className="text-xs text-red-500 mt-1" />
                    </TextField>
                  </motion.div>
                </div>
              </motion.div>

              {/* ===== LINKS & SOCIAL ===== */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Links & Social Profiles
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Portfolio */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="portfolio">
                      <Label className="text-zinc-400 text-sm">Portfolio / Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="https://yourportfolio.com"
                          value={formData.portfolio}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, portfolio: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </TextField>
                  </motion.div>

                  {/* LinkedIn */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="linkedin">
                      <Label className="text-zinc-400 text-sm">LinkedIn Profile</Label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="https://linkedin.com/in/username"
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, linkedin: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </TextField>
                  </motion.div>

                  {/* Skills */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", damping: 15 }}>
                    <TextField name="skills" className="md:col-span-2" validate={validateSkills}>
                      <Label className="text-zinc-400 text-sm">Skills</Label>
                      <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input
                          placeholder="React, Node.js, Python, MongoDB..."
                          value={formData.skills}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, skills: e.target.value }))
                          }
                          className="pl-9 bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      <FieldError className="text-xs text-red-500 mt-1" />
                    </TextField>
                  </motion.div>
                </div>
              </motion.div>

              {/* ===== DOCUMENTS ===== */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Documents
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume Upload - REQUIRED */}
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: "rgba(59,130,246,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
                      resumeFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-zinc-700 hover:border-blue-500/50 bg-zinc-800/20"
                    }`}
                  >
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, "resume")}
                      className="hidden"
                    />
                    <label htmlFor="resume" className="cursor-pointer block">
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium text-sm truncate max-w-[150px]">
                            {resumeFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile("resume");
                            }}
                            className="text-zinc-500 hover:text-red-400 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-2 group-hover:text-blue-400 transition" />
                          <p className="text-zinc-400 text-sm group-hover:text-white transition">
                            Upload Resume <span className="text-red-400">*</span>
                          </p>
                          <p className="text-xs text-zinc-600 mt-1">
                            PDF, DOC, DOCX (Max 5MB)
                          </p>
                          <p className="text-xs text-red-500 mt-2">
                            Resume is required
                          </p>
                        </>
                      )}
                    </label>
                  </motion.div>

                  {/* Cover Letter Upload - OPTIONAL */}
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: "rgba(59,130,246,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
                      coverLetterFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-zinc-700 hover:border-blue-500/50 bg-zinc-800/20"
                    }`}
                  >
                    <input
                      type="file"
                      id="coverLetter"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileUpload(e, "coverLetter")}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverLetter"
                      className="cursor-pointer block"
                    >
                      {coverLetterFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium text-sm truncate max-w-[150px]">
                            {coverLetterFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile("coverLetter");
                            }}
                            className="text-zinc-500 hover:text-red-400 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-2 group-hover:text-blue-400 transition" />
                          <p className="text-zinc-400 text-sm group-hover:text-white transition">
                            Upload Cover Letter (Optional)
                          </p>
                          <p className="text-xs text-zinc-600 mt-1">
                            PDF, DOC, DOCX, TXT (Max 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </motion.div>
                </div>
              </motion.div>

              {/* ===== COVER LETTER TEXT ===== */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Cover Letter (Optional)
                  </h3>
                </div>

                <TextArea
                  name="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're a great fit for this position..."
                  value={formData.coverLetter}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverLetter: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full bg-transparent text-white placeholder:text-zinc-500 border border-white/10 rounded-lg focus:border-blue-500/50 transition-colors p-3 min-h-[120px]"
                />
                <Description className="text-xs text-zinc-500 mt-1">
                  Optional: Share more about why you're interested in this role
                </Description>
              </motion.div>

              {/* ===== SUBMIT ===== */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-white/5"
              >
                <p className="text-xs text-zinc-500">
                  By submitting, you agree to our{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg shadow-purple-500/30 rounded-xl px-8 min-w-[160px]"
                    endContent={!isSubmitting && <Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </motion.div>
              </motion.div>
            </Form>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default JobApplyForm;
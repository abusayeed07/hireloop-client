"use client";

import React, { useState } from "react";
import {
  Form,
  Fieldset,
  TextField,
  Label,
  Input,
  TextArea,
  FieldError,
  Select,
  ListBox,
  Switch,
  Button,
} from "@heroui/react";
import {
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  ListCheck,
  GraduationCap,
  Gift,
  Clock,
} from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createJob, updateJob } from "@/lib/api/jobs";

export default function PostJobForm({ user, company, initialData = null, isEditing = false }) {
  const router = useRouter();
  const [isRemote, setIsRemote] = useState(initialData?.isRemote || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // 🎨 Animation variants
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

  // Check if user is logged in
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] flex items-center justify-center p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
            className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-3xl">👤</span>
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Not Logged In</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Please log in to post a job.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push('/signin')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Check if company exists
  if (!company) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] flex items-center justify-center p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
            className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Briefcase size={32} className="text-red-400" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Company Not Found</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Please make sure your company profile is set up before posting jobs.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push('/dashboard/recruiter/company')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-6 h-11"
            >
              Set Up Company
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // handle submit 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Manual validation
    const newErrors = {};
    
    if (!data.jobTitle || data.jobTitle.trim() === "") {
      newErrors.jobTitle = "Job title is required";
    } else if (data.jobTitle.length < 3) {
      newErrors.jobTitle = "Job title must be at least 3 characters";
    }

    if (!data.jobCategory) {
      newErrors.jobCategory = "Job category is required";
    }

    if (!data.jobType) {
      newErrors.jobType = "Job type is required";
    }

    // ✅ BULLETPROOF SALARY VALIDATION WITH CORRECT UX
    const rawMin = data.minSalary;
    const rawMax = data.maxSalary;

    // 1. Check if they are empty strings
    if (!rawMin || rawMin.trim() === "") {
      newErrors.minSalary = "Minimum salary is required";
    }
    if (!rawMax || rawMax.trim() === "") {
      newErrors.maxSalary = "Maximum salary is required";
    }

    // 2. Convert to numbers for comparison
    const minSal = parseInt(rawMin);
    const maxSal = parseInt(rawMax);

    // 3. Only compare if both are valid numbers
    if (!isNaN(minSal) && !isNaN(maxSal)) {
      if (minSal > maxSal) {
        // 🟢 BETTER UX: Highlight the Max Salary field because the user is trying to set it lower than Min
        newErrors.maxSalary = "Maximum salary must be greater than minimum salary";
      }
    }

    if (!isRemote && !data.location) {
      newErrors.location = "Location is required for non-remote roles";
    }

    if (!data.deadline) {
      newErrors.deadline = "Application deadline is required";
    } else {
      const selectedDate = new Date(data.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    if (!data.responsibilities || data.responsibilities.trim() === "") {
      newErrors.responsibilities = "Key responsibilities are required";
    } else if (data.responsibilities.length < 20) {
      newErrors.responsibilities = "Please provide at least 20 characters of responsibilities";
    }

    if (!data.requirements || data.requirements.trim() === "") {
      newErrors.requirements = "Requirements and qualifications are required";
    } else if (data.requirements.length < 20) {
      newErrors.requirements = "Please provide at least 20 characters of requirements";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix all errors before submitting");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        isRemote,
        companyId: company._id,
        companyName: company.name,
        companyLogo: company.logo || "",
        postedBy: user.email,
        postedByName: user.name || user.email,
        status: "active",
        isPubliclyVisible: true,
        salary: {
          min: parseInt(data.minSalary),
          max: parseInt(data.maxSalary),
          currency: data.currency || "USD",
        },
        skills: data.skills ? data.skills.split(",").map(s => s.trim()) : [],
      };

      let result;

      if (isEditing && initialData?._id) {
        result = await updateJob(initialData._id, payload);
      } else {
        result = await createJob(payload);
      }

      if (result && result.success) {
        toast.success(isEditing ? "Job updated successfully!" : "Job posted successfully!");
        e.target.reset();
        setIsRemote(false);
        setTimeout(() => {
          router.push("/dashboard/recruiter/jobs");
        }, 500);
      } else if (result && result.error) {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'post'} job. Please try again.`);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'post'} job. Please try again.`);
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] text-white py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Main Form Card */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="relative bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-purple-500/5"
          >
            {/* Form Header */}
            <motion.div
              variants={itemVariants}
              className="border-b border-zinc-800/80 pb-6 mb-8"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight"
                  >
                    {isEditing ? "Edit Job Posting" : "Post a New Job"}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-zinc-400 text-sm mt-2"
                  >
                    {isEditing 
                      ? "Update the details below to refresh your open position."
                      : "Fill out the details below to publish your open position and attract top talent."
                    }
                  </motion.p>
                </div>
                
                {/* "Posting as" - Display Logged-in User */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", damping: 12 }}
                  className="flex flex-col items-end gap-1"
                >
                  {/* User Badge */}
                  <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 py-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    <span className="text-sm">👤</span>
                    <span className="text-xs text-zinc-400">Posting as</span>
                    <span className="text-sm font-semibold text-zinc-200 max-w-[150px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                  
                  {/* Company Badge (below user) */}
                  <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-1">
                    <Briefcase size={12} className="text-zinc-500" />
                    <span className="text-[10px] text-zinc-400">Company:</span>
                    <span className="text-xs font-medium text-zinc-300 max-w-[120px] truncate">
                      {company.name}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Status panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1.5"
                >
                  <Briefcase size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-400">Company Status:</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    ✓ Approved
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1.5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                  <span className="text-xs text-zinc-400">
                    {isEditing ? "Changes will be published immediately" : "Job will be published immediately"}
                  </span>
                </motion.div>
                {/* User info badge */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1.5"
                >
                  <span className="text-sm">👤</span>
                  <span className="text-xs text-zinc-400">Posted by:</span>
                  <span className="text-xs font-medium text-zinc-300">
                    {user.name || user.email}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Form */}
            <Form onSubmit={handleSubmit} className="space-y-10">
              {/* SECTION 1: Job Information */}
              <motion.div variants={itemVariants}>
                <Fieldset className="space-y-6 w-full">
                  <legend className="text-lg font-semibold text-zinc-300 border-l-3 border-purple-500 pl-3 mb-4">
                    Job Information
                  </legend>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Title */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <TextField
                        id="jobTitle"
                        name="jobTitle"
                        isRequired
                        isInvalid={!!errors.jobTitle}
                        errorMessage={errors.jobTitle}
                        className="flex flex-col gap-1.5 w-full"
                        onFocus={() => setFocusedField('jobTitle')}
                        onBlur={() => setFocusedField(null)}
                        defaultValue={initialData?.jobTitle || ""} 
                      >
                        <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="jobTitle">
                          <motion.span
                            animate={{ rotate: focusedField === 'jobTitle' ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Briefcase size={14} className="text-purple-400" />
                          </motion.span>
                          Job Title
                        </Label>
                        <Input
                          placeholder="e.g. Senior Frontend Engineer"
                          className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                            errors.jobTitle
                              ? "border-red-500 focus:border-red-500"
                              : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                          }`}
                        />
                        <AnimatePresence>
                          {errors.jobTitle && (
                            <motion.div
                              variants={fieldErrorVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <FieldError className="text-xs text-red-400" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TextField>
                    </motion.div>

                    {/* Job Category */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="jobCategory">
                        <ListCheck size={14} className="text-purple-400" />
                        Job Category
                      </Label>
                      <Select
                        id="jobCategory"
                        name="jobCategory"
                        isRequired
                        isInvalid={!!errors.jobCategory}
                        errorMessage={errors.jobCategory}
                        aria-label="Job Category"
                        placeholder="Select a category"
                        defaultSelectedKeys={initialData?.jobCategory ? [initialData.jobCategory] : []} 
                      >
                        <Select.Trigger className={`w-full flex items-center justify-between bg-[#1c1c1e] border rounded-lg h-12 px-3 text-white transition-all duration-200 text-sm outline-none ${
                          errors.jobCategory
                            ? "border-red-500 focus:border-red-500"
                            : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                        }`}>
                          <Select.Value placeholder="Select a category" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm max-h-[300px] overflow-y-auto">
                          <ListBox className="outline-none">
                            <ListBox.Item
                              key="technology"
                              id="technology"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="💻 Technology"
                            >
                              <div className="flex items-center gap-2">
                                <span>💻</span> Technology
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="design"
                              id="design"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="🎨 Design"
                            >
                              <div className="flex items-center gap-2">
                                <span>🎨</span> Design
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="marketing"
                              id="marketing"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="📢 Marketing"
                            >
                              <div className="flex items-center gap-2">
                                <span>📢</span> Marketing
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="sales"
                              id="sales"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="💰 Sales"
                            >
                              <div className="flex items-center gap-2">
                                <span>💰</span> Sales
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="hr"
                              id="hr"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="👥 Human Resources"
                            >
                              <div className="flex items-center gap-2">
                                <span>👥</span> Human Resources
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="finance"
                              id="finance"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="💹 Finance"
                            >
                              <div className="flex items-center gap-2">
                                <span>💹</span> Finance
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="healthcare"
                              id="healthcare"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="🏥 Healthcare"
                            >
                              <div className="flex items-center gap-2">
                                <span>🏥</span> Healthcare
                              </div>
                            </ListBox.Item>
                            <ListBox.Item
                              key="education"
                              id="education"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="📚 Education"
                            >
                              <div className="flex items-center gap-2">
                                <span>📚</span> Education
                              </div>
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <AnimatePresence>
                        {errors.jobCategory && (
                          <motion.div
                            variants={fieldErrorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <FieldError className="text-xs text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Type */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="jobType">
                        <Clock size={14} className="text-purple-400" />
                        Job Type
                      </Label>
                      <Select
                        id="jobType"
                        name="jobType"
                        isRequired
                        isInvalid={!!errors.jobType}
                        errorMessage={errors.jobType}
                        aria-label="Job Type"
                        placeholder="Select job type"
                        defaultSelectedKeys={initialData?.jobType ? [initialData.jobType] : []} 
                      >
                        <Select.Trigger className={`w-full flex items-center justify-between bg-[#1c1c1e] border rounded-lg h-12 px-3 text-white transition-all duration-200 text-sm outline-none ${
                          errors.jobType
                            ? "border-red-500 focus:border-red-500"
                            : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                        }`}>
                          <Select.Value placeholder="Select job type" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm max-h-[300px] overflow-y-auto">
                          <ListBox className="outline-none">
                            <ListBox.Item
                              key="full-time"
                              id="full-time"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Full-time"
                            >
                              Full-time
                            </ListBox.Item>
                            <ListBox.Item
                              key="part-time"
                              id="part-time"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Part-time"
                            >
                              Part-time
                            </ListBox.Item>
                            <ListBox.Item
                              key="contract"
                              id="contract"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Contract"
                            >
                              Contract
                            </ListBox.Item>
                            <ListBox.Item
                              key="internship"
                              id="internship"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Internship"
                            >
                              Internship
                            </ListBox.Item>
                            <ListBox.Item
                              key="freelance"
                              id="freelance"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Freelance"
                            >
                              Freelance
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <AnimatePresence>
                        {errors.jobType && (
                          <motion.div
                            variants={fieldErrorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <FieldError className="text-xs text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Salary Range */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="space-y-1.5"
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2 mb-2">
                        <span className="text-purple-400">💰</span>
                        Salary Range
                      </Label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <TextField
                            id="minSalary"
                            name="minSalary"
                            isInvalid={!!errors.minSalary}
                            errorMessage={errors.minSalary}
                            className="w-full"
                            defaultValue={initialData?.salary?.min || ""} 
                          >
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none">
                                $
                              </span>
                              <Input
                                placeholder="Min"
                                type="number"
                                min="0"
                                aria-label="Minimum salary"
                                className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-7 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 appearance-none ${
                                  errors.minSalary
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                                }`}
                              />
                            </div>
                            <AnimatePresence>
                              {errors.minSalary && (
                                <motion.div
                                  variants={fieldErrorVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <FieldError className="text-xs text-red-400" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </TextField>
                        </div>

                        <div className="flex-1">
                          <TextField
                            id="maxSalary"
                            name="maxSalary"
                            isInvalid={!!errors.maxSalary}
                            errorMessage={errors.maxSalary}
                            className="w-full"
                            defaultValue={initialData?.salary?.max || ""} 
                          >
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none">
                                $
                              </span>
                              <Input
                                placeholder="Max"
                                type="number"
                                min="0"
                                aria-label="Maximum salary"
                                className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-7 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 appearance-none ${
                                  errors.maxSalary
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                                }`}
                              />
                            </div>
                            <AnimatePresence>
                              {errors.maxSalary && (
                                <motion.div
                                  variants={fieldErrorVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  <FieldError className="text-xs text-red-400" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </TextField>
                        </div>

                        <div className="w-26">
                          <Select
                            id="currency"
                            name="currency"
                            aria-label="Currency"
                            defaultSelectedKeys={[initialData?.salary?.currency || "USD"]} 
                          >
                            <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm">
                              <ListBox className="outline-none">
                                <ListBox.Item
                                  key="USD"
                                  id="USD"
                                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                                  textValue="USD ($)"
                                >
                                  USD ($)
                                </ListBox.Item>
                                <ListBox.Item
                                  key="EUR"
                                  id="EUR"
                                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                                  textValue="EUR (€)"
                                >
                                  EUR (€)
                                </ListBox.Item>
                                <ListBox.Item
                                  key="GBP"
                                  id="GBP"
                                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                                  textValue="GBP (£)"
                                >
                                  GBP (£)
                                </ListBox.Item>
                                <ListBox.Item
                                  key="BDT"
                                  id="BDT"
                                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                                  textValue="BDT (৳)"
                                >
                                  BDT (৳)
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Location & Remote */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="location">
                          <MapPin size={14} className="text-purple-400" />
                          Location
                        </Label>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Switch
                            isSelected={isRemote}
                            onChange={setIsRemote}
                            size="sm"
                            className="scale-90"
                            aria-label="Remote toggle"
                          >
                            <Switch.Control className="bg-zinc-800 data-[selected=true]:bg-purple-500">
                              <Switch.Thumb className="bg-zinc-400 data-[selected=true]:bg-white" />
                            </Switch.Control>
                            <Switch.Content>
                              <Label className="text-xs text-zinc-400 font-medium ml-1">
                                Remote
                              </Label>
                            </Switch.Content>
                          </Switch>
                        </motion.div>
                      </div>
                      <div className="relative">
                        <Globe
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-10"
                        />
                        <Input
                          id="location"
                          name="location"
                          placeholder={
                            isRemote
                              ? "Global / Remote Position"
                              : "e.g. Austin, TX"
                          }
                          disabled={isRemote}
                          aria-label="Location"
                          defaultValue={initialData?.location || ""} 
                          className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-10 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                            !isRemote && errors.location
                              ? "border-red-500 focus:border-red-500"
                              : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                          } ${isRemote ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      <AnimatePresence>
                        {!isRemote && errors.location && (
                          <motion.p
                            variants={fieldErrorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-xs text-red-400 mt-1"
                          >
                            {errors.location}
                          </motion.p>
                        )}
                        {isRemote && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-emerald-400 mt-1"
                          >
                            ✓ Remote position - location not required
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Deadline */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <TextField
                        id="deadline"
                        name="deadline"
                        isRequired
                        isInvalid={!!errors.deadline}
                        errorMessage={errors.deadline}
                        className="flex flex-col gap-1.5 w-full"
                        defaultValue={initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ""} 
                      >
                        <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="deadline">
                          <Calendar size={14} className="text-purple-400" />
                          Application Deadline
                        </Label>
                        <Input
                          type="date"
                          className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                            errors.deadline
                              ? "border-red-500 focus:border-red-500"
                              : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                          }`}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <AnimatePresence>
                          {errors.deadline && (
                            <motion.div
                              variants={fieldErrorVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <FieldError className="text-xs text-red-400" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TextField>
                    </motion.div>
                  </div>
                </Fieldset>
              </motion.div>

              {/* SECTION 2: Job Description */}
              <motion.div variants={itemVariants}>
                <Fieldset className="space-y-6 w-full">
                  <legend className="text-lg font-semibold text-zinc-300 border-l-3 border-purple-500 pl-3 mb-4">
                    Job Details & Description
                  </legend>

                  {/* Key Responsibilities */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="flex flex-col gap-1.5 w-full"
                  >
                    <TextField
                      id="responsibilities"
                      name="responsibilities"
                      isRequired
                      isInvalid={!!errors.responsibilities}
                      errorMessage={errors.responsibilities}
                      className="flex flex-col gap-1.5 w-full"
                      defaultValue={initialData?.responsibilities || ""} 
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="responsibilities">
                        <ListCheck size={14} className="text-purple-400" />
                        Key Responsibilities
                      </Label>
                      <TextArea
                        placeholder="• Lead development of new features • Collaborate with cross-functional teams • Write clean, maintainable code • Participate in code reviews"
                        rows={4}
                        className={`w-full text-white bg-[#1c1c1e] border rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none ${
                          errors.responsibilities
                            ? "border-red-500 focus:border-red-500"
                            : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.responsibilities && (
                          <motion.div
                            variants={fieldErrorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <FieldError className="text-xs text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TextField>
                  </motion.div>

                  {/* Requirements & Qualifications */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="flex flex-col gap-1.5 w-full"
                  >
                    <TextField
                      id="requirements"
                      name="requirements"
                      isRequired
                      isInvalid={!!errors.requirements}
                      errorMessage={errors.requirements}
                      className="flex flex-col gap-1.5 w-full"
                      defaultValue={initialData?.requirements || ""} 
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="requirements">
                        <GraduationCap size={14} className="text-purple-400" />
                        Requirements & Qualifications
                      </Label>
                      <TextArea
                        placeholder="• Bachelor's degree in Computer Science or related field • 5+ years of experience in software development • Proficiency in React and Node.js • Strong problem-solving skills"
                        rows={4}
                        className={`w-full text-white bg-[#1c1c1e] border rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none ${
                          errors.requirements
                            ? "border-red-500 focus:border-red-500"
                            : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.requirements && (
                          <motion.div
                            variants={fieldErrorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <FieldError className="text-xs text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TextField>
                  </motion.div>

                  {/* Benefits & Perks */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="flex flex-col gap-1.5 w-full"
                  >
                    <TextField
                      id="benefits"
                      name="benefits"
                      className="flex flex-col gap-1.5 w-full"
                      defaultValue={initialData?.benefits || ""} 
                    >
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2" htmlFor="benefits">
                        <Gift size={14} className="text-purple-400" />
                        Benefits & Perks{" "}
                        <span className="text-zinc-500 text-xs">(Optional)</span>
                      </Label>
                      <TextArea
                        placeholder="• Competitive salary and equity package • Health, dental, and vision insurance • Remote work stipend • Professional development budget • Flexible working hours"
                        rows={3}
                        className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none"
                      />
                    </TextField>
                  </motion.div>
                </Fieldset>
              </motion.div>

              {/* Additional Info Section */}
              <motion.div variants={itemVariants}>
                <Fieldset className="space-y-4 w-full">
                  <legend className="text-sm font-medium text-zinc-400 border-b border-zinc-800 w-full pb-2 mb-3">
                    Additional Information
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Experience Level */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5"
                    >
                      <Label className="text-zinc-400 text-xs" htmlFor="experienceLevel">
                        Experience Level
                      </Label>
                      <Select 
                        id="experienceLevel"
                        name="experienceLevel" 
                        aria-label="Experience Level"
                        placeholder="Select level"
                        defaultSelectedKeys={initialData?.experienceLevel ? [initialData.experienceLevel] : []} 
                      >
                        <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600">
                          <Select.Value placeholder="Select level" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm max-h-[300px] overflow-y-auto">
                          <ListBox className="outline-none">
                            <ListBox.Item
                              key="entry"
                              id="entry"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Entry Level (0-2 years)"
                            >
                              Entry Level (0-2 years)
                            </ListBox.Item>
                            <ListBox.Item
                              key="mid"
                              id="mid"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Mid Level (3-5 years)"
                            >
                              Mid Level (3-5 years)
                            </ListBox.Item>
                            <ListBox.Item
                              key="senior"
                              id="senior"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Senior (6-9 years)"
                            >
                              Senior (6-9 years)
                            </ListBox.Item>
                            <ListBox.Item
                              key="lead"
                              id="lead"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="Lead/Principal (10+ years)"
                            >
                              Lead/Principal (10+ years)
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col gap-1.5"
                    >
                      <TextField
                        id="vacancies"
                        name="vacancies"
                        type="number"
                        className="flex flex-col gap-1.5"
                        defaultValue={initialData?.vacancies || ""} 
                      >
                        <Label className="text-zinc-400 text-xs" htmlFor="vacancies">
                          Number of Vacancies
                        </Label>
                        <Input
                          placeholder="e.g., 3"
                          type="number"
                          min="1"
                          className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                        />
                      </TextField>
                    </motion.div>
                  </div>

                  {/* Required Skills */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    <TextField id="skills" name="skills" className="flex flex-col gap-1.5" defaultValue={initialData?.skills || ""}> 
                      <Label className="text-zinc-400 text-xs" htmlFor="skills">
                        Required Skills (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., React, Node.js, Python, AWS (comma separated)"
                        className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                      />
                    </TextField>
                  </motion.div>
                </Fieldset>
              </motion.div>

              {/* Form Actions */}
              <motion.div
                variants={itemVariants}
                className="flex justify-end gap-3 pt-6 border-t border-zinc-800 w-full"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="bordered"
                    onClick={() => router.push("/dashboard/recruiter/jobs")}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 rounded-xl px-6 font-medium h-11 transition-all duration-200"
                    aria-label="Cancel and return to jobs"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-8 transition-all duration-200 h-11 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                    aria-label="Submit job posting"
                  >
                    {isSubmitting ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {isEditing ? "Updating..." : "Posting..."}
                      </motion.span>
                    ) : (
                      isEditing ? "Update Job" : "Post Job"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
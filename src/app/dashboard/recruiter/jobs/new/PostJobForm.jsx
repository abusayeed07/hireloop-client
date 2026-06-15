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
import { redirect, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createJob } from "@/lib/actions/jobs";

export default function PostJobForm({ company }) {
  const router = useRouter();

  // Mock configuration for recruiter's authenticated state
  console.log("PostJobForm receive company prop:", company);

  // const [company] = useState({
  //   name: "Acme Corp",
  //   id: "company_123",
  //   isApproved: true,
  // });

  const [isRemote, setIsRemote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!company.isApproved) {
    //   toast.error(
    //     "Your company profile must be approved before you can post jobs.",
    //   );
    //   return;
    // }

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Manual validation for salary fields since they're not wrapped in TextField
    const NewErrors = {};
    if (!data.minSalary) {
      NewErrors.minSalary = "Minimum salary is required";
    }
    if (!data.maxSalary) {
      NewErrors.maxSalary = "Maximum salary is required";
    }
    if (
      data.minSalary &&
      data.maxSalary &&
      parseInt(data.minSalary) > parseInt(data.maxSalary)
    ) {
      NewErrors.minSalary =
        "Minimum salary cannot be greater than maximum salary";
    }
    if (!isRemote && !data.location) {
      NewErrors.location = "Location is required for non-remote roles";
    }

    if (Object.keys(NewErrors).length > 0) {
      setErrors(NewErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      ...data,
      isRemote,
      companyId: company._id,
      companyName: company.name,
      companyLogo: company.logo,
      status: "active",
      isPubliclyVisible: true,
      salary: {
        min: parseInt(data.minSalary),
        max: parseInt(data.maxSalary),
        currency: data.currency,
      },
    };

    const res = await createJob(payload);
    if (res.insertedId) {
      toast.success("Job posted successfully!");
      e.target.reset();
      setIsRemote(false);
      redirect("/dashboard/recruiter/jobs");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0d0d0e] via-[#0f0f11] to-[#0d0d0e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Animated background accents */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main Form Card */}
        <div className="relative bg-[#121214]/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-purple-500/5">
          {/* Form Header */}
          <div className="border-b border-zinc-800/80 pb-6 mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                  Post a New Job
                </h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Fill out the details below to publish your open position and
                  attract top talent.
                </p>
              </div>
              {/* Company badge */}
              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 py-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-zinc-400">Posting as</span>
                <span className="text-sm font-semibold text-zinc-200">
                  {company.name}
                </span>
              </div>
            </div>

            {/* Status panel */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1.5">
                <Briefcase size={14} className="text-zinc-500" />
                <span className="text-xs text-zinc-400">Company Status:</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ✓ Approved
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-zinc-400">
                  Job will be published immediately
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="space-y-10">
            {/* SECTION 1: Job Information */}
            <Fieldset className="space-y-6 w-full">
              <legend className="text-lg font-semibold text-zinc-300 border-l-3 border-purple-500 pl-3 mb-4">
                Job Information
              </legend>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Title */}
                <TextField
                  name="jobTitle"
                  isRequired
                  validate={(value) => {
                    if (!value || value.trim() === "") {
                      return "Job title is required";
                    }
                    if (value.length < 3) {
                      return "Job title must be at least 3 characters";
                    }
                    return null;
                  }}
                  className="flex flex-col gap-1.5 w-full"
                >
                  <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                    <Briefcase size={14} className="text-purple-400" />
                    Job Title
                  </Label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                  />
                  <FieldError className="text-xs text-red-400" />
                </TextField>

                {/* Job Category */}
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                    <ListCheck size={14} className="text-purple-400" />
                    Job Category
                  </Label>
                  <Select
                    name="jobCategory"
                    isRequired
                    validate={(value) => {
                      if (!value) {
                        return "Job category is required";
                      }
                      return null;
                    }}
                    aria-label="Job Category"
                  >
                    <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600 data-[invalid=true]:border-danger">
                      <Select.Value placeholder="Select a category" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm">
                      <ListBox className="outline-none">
                        <ListBox.Item
                          id="technology"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Technology"
                        >
                          <div className="flex items-center gap-2">
                            <span>💻</span> Technology
                          </div>
                        </ListBox.Item>
                        <ListBox.Item
                          id="design"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Design"
                        >
                          <div className="flex items-center gap-2">
                            <span>🎨</span> Design
                          </div>
                        </ListBox.Item>
                        <ListBox.Item
                          id="marketing"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Marketing"
                        >
                          <div className="flex items-center gap-2">
                            <span>📢</span> Marketing
                          </div>
                        </ListBox.Item>
                        <ListBox.Item
                          id="sales"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Sales"
                        >
                          <div className="flex items-center gap-2">
                            <span>💰</span> Sales
                          </div>
                        </ListBox.Item>
                        <ListBox.Item
                          id="hr"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Human Resources"
                        >
                          <div className="flex items-center gap-2">
                            <span>👥</span> Human Resources
                          </div>
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <FieldError className="text-xs text-red-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Type */}
                <div className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                    <Clock size={14} className="text-purple-400" />
                    Job Type
                  </Label>
                  <Select
                    name="jobType"
                    isRequired
                    validate={(value) => {
                      if (!value) {
                        return "Job type is required";
                      }
                      return null;
                    }}
                    aria-label="Job Type"
                  >
                    <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600 data-[invalid=true]:border-danger">
                      <Select.Value placeholder="Select job type" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm">
                      <ListBox className="outline-none">
                        <ListBox.Item
                          id="full-time"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Full-time"
                        >
                          Full-time
                        </ListBox.Item>
                        <ListBox.Item
                          id="part-time"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Part-time"
                        >
                          Part-time
                        </ListBox.Item>
                        <ListBox.Item
                          id="contract"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Contract"
                        >
                          Contract
                        </ListBox.Item>
                        <ListBox.Item
                          id="internship"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Internship"
                        >
                          Internship
                        </ListBox.Item>
                        <ListBox.Item
                          id="freelance"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Freelance"
                        >
                          Freelance
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <FieldError className="text-xs text-red-400" />
                </div>

                {/* Salary Range - Using HeroUI FieldError */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2 mb-2">
                    <span className="text-purple-400">💰</span>
                    Salary Range
                  </Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <TextField
                        name="minSalary"
                        isInvalid={!!errors.minSalary}
                        errorMessage={errors.minSalary}
                        className="w-full"
                      >
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10">
                            $
                          </span>
                          <Input
                            placeholder="Min"
                            type="number"
                            aria-label="Minimum salary"
                            className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-7 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                              errors.minSalary
                                ? "border-red-500 focus:border-red-500"
                                : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                            }`}
                          />
                        </div>
                        <FieldError className="text-xs text-red-400" />
                      </TextField>
                    </div>

                    <div className="flex-1">
                      <TextField
                        name="maxSalary"
                        isInvalid={!!errors.maxSalary}
                        errorMessage={errors.maxSalary}
                        className="w-full"
                      >
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10">
                            $
                          </span>
                          <Input
                            placeholder="Max"
                            type="number"
                            aria-label="Maximum salary"
                            className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-7 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                              errors.maxSalary
                                ? "border-red-500 focus:border-red-500"
                                : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                            }`}
                          />
                        </div>
                        <FieldError className="text-xs text-red-400" />
                      </TextField>
                    </div>

                    <div className="w-26">
                      <Select
                        name="currency"
                        defaultSelectedKeys={["USD"]}
                        aria-label="Currency"
                      >
                        <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm">
                          <ListBox className="outline-none">
                            <ListBox.Item
                              id="USD"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="USD"
                            >
                              USD ($)
                            </ListBox.Item>
                            <ListBox.Item
                              id="EUR"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="EUR"
                            >
                              EUR (€)
                            </ListBox.Item>
                            <ListBox.Item
                              id="GBP"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="GBP"
                            >
                              GBP (£)
                            </ListBox.Item>
                            <ListBox.Item
                              id="BDT"
                              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                              textValue="BDT"
                            >
                              BDT (৳)
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Remote */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <MapPin size={14} className="text-purple-400" />
                      Location
                    </Label>
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
                  </div>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-10"
                    />
                    <Input
                      name="location"
                      placeholder={
                        isRemote
                          ? "Global / Remote Position"
                          : "e.g. Austin, TX"
                      }
                      disabled={isRemote}
                      aria-label="Location"
                      className={`w-full text-white bg-[#1c1c1e] border rounded-lg h-12 pl-10 pr-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 ${
                        !isRemote && errors.location
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-800 hover:bg-[#242426] focus:border-zinc-600"
                      } ${isRemote ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {!isRemote && errors.location && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.location}
                    </p>
                  )}
                  {isRemote && (
                    <p className="text-xs text-zinc-500 mt-1">
                      ✓ Remote position - location not required
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <TextField
                  name="deadline"
                  isRequired
                  validate={(value) => {
                    if (!value) {
                      return "Application deadline is required";
                    }
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                      return "Deadline cannot be in the past";
                    }
                    return null;
                  }}
                  className="flex flex-col gap-1.5 w-full"
                >
                  <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                    <Calendar size={14} className="text-purple-400" />
                    Application Deadline
                  </Label>
                  <Input
                    type="date"
                    className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <FieldError className="text-xs text-red-400" />
                </TextField>
              </div>
            </Fieldset>

            {/* SECTION 2: Job Description */}
            <Fieldset className="space-y-6 w-full">
              <legend className="text-lg font-semibold text-zinc-300 border-l-3 border-purple-500 pl-3 mb-4">
                Job Details & Description
              </legend>

              {/* Key Responsibilities field  */}
              <TextField
                name="responsibilities"
                isRequired
                validate={(value) => {
                  if (!value || value.trim() === "") {
                    return "Key responsibilities are required";
                  }
                  if (value.length < 20) {
                    return "Please provide at least 20 characters of responsibilities";
                  }
                  return null;
                }}
                className="flex flex-col gap-1.5 w-full"
              >
                <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                  <ListCheck size={14} className="text-purple-400" />
                  Key Responsibilities
                </Label>
                <TextArea
                  placeholder="• Lead development of new features • Collaborate with cross-functional teams • Write clean, maintainable code • Participate in code reviews"
                  rows={4}
                  className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none"
                />
                <FieldError className="text-xs text-red-400" />
              </TextField>

              {/* Requirements & Qualifications field  */}
              <TextField
                name="requirements"
                isRequired
                validate={(value) => {
                  if (!value || value.trim() === "") {
                    return "Requirements and qualifications are required";
                  }
                  if (value.length < 20) {
                    return "Please provide at least 20 characters of requirements";
                  }
                  return null;
                }}
                className="flex flex-col gap-1.5 w-full"
              >
                <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                  <GraduationCap size={14} className="text-purple-400" />
                  Requirements & Qualifications
                </Label>
                <TextArea
                  placeholder="• Bachelor's degree in Computer Science or related field • 5+ years of experience in software development • Proficiency in React and Node.js • Strong problem-solving skills"
                  rows={4}
                  className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none"
                />
                <FieldError className="text-xs text-red-400" />
              </TextField>

              {/* Benefits & Perks field  */}
              <TextField
                name="benefits"
                className="flex flex-col gap-1.5 w-full"
              >
                <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                  <Gift size={14} className="text-purple-400" />
                  Benefits & Perks{" "}
                  <span className="text-zinc-500 text-xs">(Optional)</span>
                </Label>
                <TextArea
                  placeholder="• Competitive salary and equity package • Health, dental, and vision insurance • Remote work stipend • Professional development budget • Flexible working hours"
                  rows={3}
                  className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg p-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200 resize-none"
                />
                <FieldError className="text-xs text-red-400" />
              </TextField>
            </Fieldset>

            {/* Additional Info Section */}
            <Fieldset className="space-y-4 w-full">
              <legend className="text-sm font-medium text-zinc-400 border-b border-zinc-800 w-full pb-2 mb-3">
                Additional Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-zinc-400 text-xs">
                    Experience Level
                  </Label>
                  <Select name="experienceLevel" aria-label="Experience Level">
                    <Select.Trigger className="w-full flex items-center justify-between bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] h-12 rounded-lg px-3 text-white transition-all duration-200 text-sm outline-none data-[focused=true]:border-zinc-600">
                      <Select.Value placeholder="Select level" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl shadow-2xl p-1 backdrop-blur-sm">
                      <ListBox className="outline-none">
                        <ListBox.Item
                          id="entry"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Entry Level"
                        >
                          Entry Level (0-2 years)
                        </ListBox.Item>
                        <ListBox.Item
                          id="mid"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Mid Level"
                        >
                          Mid Level (3-5 years)
                        </ListBox.Item>
                        <ListBox.Item
                          id="senior"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Senior"
                        >
                          Senior (6-9 years)
                        </ListBox.Item>
                        <ListBox.Item
                          id="lead"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm text-zinc-200 outline-none data-[focused=true]:bg-zinc-800 transition-colors duration-150"
                          textValue="Lead"
                        >
                          Lead/Principal (10+ years)
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <TextField
                  name="vacancies"
                  type="number"
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-zinc-400 text-xs">
                    Number of Vacancies
                  </Label>
                  <Input
                    placeholder="e.g., 3"
                    type="number"
                    min="1"
                    className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                  />
                </TextField>
              </div>

              {/* Required Skills Field  */}
              <div className="grid grid-cols-1 gap-4">
                <TextField name="skills" className="flex flex-col gap-1.5">
                  <Label className="text-zinc-400 text-xs">
                    Required Skills (Optional)
                  </Label>
                  <Input
                    placeholder="e.g., React, Node.js, Python, AWS (comma separated)"
                    className="w-full text-white bg-[#1c1c1e] border border-zinc-800 hover:bg-[#242426] focus:border-zinc-600 rounded-lg h-12 px-3 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                  />
                </TextField>
              </div>
            </Fieldset>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800 w-full">
              <Button
                type="button"
                variant="bordered"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 rounded-xl px-6 font-medium h-11 transition-all duration-200"
                aria-label="Cancel and return to jobs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 rounded-xl px-8 transition-all duration-200 h-11 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                aria-label="Submit job posting"
              >
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

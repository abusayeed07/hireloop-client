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
  FieldError,
} from "@heroui/react";
import {
  ArrowUpToLine,
  Globe,
  Factory,
  Pencil,
  ChevronDown,
} from "@gravity-ui/icons";
import { createCompany } from "@/lib/actions/companies";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { motion } from "framer-motion";

// Layout Shared Style Constants
const textInputClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition";
const selectTriggerClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 flex items-center justify-between outline-none data-[hover=true]:border-zinc-700";
const selectPopoverClass =
  "bg-zinc-950 border border-zinc-800 rounded-lg p-1 shadow-xl min-w-[200px]";
const selectItemClass =
  "text-zinc-300 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-900 hover:text-white outline-none data-[focused=true]:bg-zinc-900";
const textAreaClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg p-3 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition resize-none";

export default function CompanyProfile({ recruiter, recruiterCompany }) {
  // 1. Core State
  const [company, setCompany] = useState(recruiterCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  // Auxiliary Upload States
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions

  //   Validation for company name
  const validateCompanyName = (value) => {
    if (!value?.trim()) {
      return "Company name is required";
    }
    return null;
  };

  //   Validation for website url
  const validateWebsiteUrl = (value) => {
    if (!value?.trim()) {
      return "Website URL is required";
    }
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (!urlPattern.test(value)) {
      return "Please enter a valid URL";
    }
    return null;
  };

  //   Validation for location
  const validateLocation = (value) => {
    if (!value?.trim()) {
      return "Location is required";
    }
    return null;
  };

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
        },
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

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if recruiter exists and has an id

    if (!recruiter || !recruiter.id) {
      toast.error("Recruiter information is missing. Please refresh the page.");
      console.error("Recruiter data is missing:", recruiter);
      return;
    }

    const formData = new FormData(e.currentTarget);

    const companyName = formData.get("companyName");
    const websiteUrl = formData.get("websiteUrl");
    const industry = formData.get("industry");
    const location = formData.get("location");
    const employeeCount = formData.get("employeeCount");
    const description = formData.get("description");

    const newCompanyData = {
      name: companyName,
      websiteUrl,
      industry: industry || "Technology",
      location,
      employeeCount: employeeCount || "1-10 employees",
      description,
      logo: logoUrl || (company ? company.logo : ""),
      status: company ? company.status : "Pending",
      recruiterId: recruiter.id,
    };

    setIsSubmitting(true);

    try {
      console.log("Submitting company data:", newCompanyData);
      const payload = await createCompany(newCompanyData);

      if (payload?.insertedId) {
        setCompany({ ...newCompanyData, _id: payload.insertedId });
        toast.success("Company profile created successfully!");
        setErrors({});
        setIsEditing(false);
      } else if (payload?.error) {
        toast.error(payload.error);
      } else if (payload?.message) {
        toast.error(payload.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save company profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRegistration = () => {
    setLogoUrl("");
    setIsEditing(true);
  };

  const startEditing = () => {
    setLogoUrl(company?.logo || "");
    setIsEditing(true);
  };

  // Empty state
  if (!company?._id && !isEditing) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Setup Required
            </div>
          </motion.div>

          {/* Illustration */}
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
              className="relative w-44 h-44 rounded-[36px] border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-center"
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
                className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl"
              >
                <Pencil size={18} className="text-black" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-white">
              Register Your Company
            </h2>

            <p className="mt-5 text-zinc-400 leading-relaxed max-w-xl mx-auto">
              Create your company profile to publish job listings, manage
              applicants, build your employer brand and start hiring top talent.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-3 mt-10"
          >
            <Button
              onPress={startRegistration}
              className="bg-white text-black min-w-[220px] h-12 font-medium"
            >
              Register Company
            </Button>

            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 min-w-[160px] h-12"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-zinc-500 mt-10"
          >
            Company profiles are reviewed by administrators before becoming
            publicly visible.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // View mode
  if (company && !isEditing) {
    const getStatusStyles = (status) => {
      switch (status) {
        case "Approved":
          return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "Rejected":
          return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        default:
          return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }
    };

    return (
      <div className="max-w-4xl mx-auto my-8 bg-zinc-950 border border-zinc-900 rounded-xl p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                height={64}
                width={64}
                className="w-16 h-16 rounded-xl object-contain bg-zinc-900 p-2 border border-zinc-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <Factory size={24} className="text-zinc-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {company.name}
                </h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusStyles(company.status)}`}
                >
                  {company.status}
                </span>
              </div>
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-400 hover:underline flex items-center gap-1 mt-1"
              >
                <Globe size={14} className="text-zinc-500" />{" "}
                {company.websiteUrl}
              </a>
            </div>
          </div>
          <Button
            onPress={startEditing}
            variant="bordered"
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-lg px-4 font-medium h-10 flex items-center gap-2"
          >
            <Pencil size={14} /> Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg">
            <span className="text-xs text-zinc-500 uppercase font-semibold block">
              Industry Category
            </span>
            <span className="text-zinc-300 font-medium mt-1 block">
              {company.industry}
            </span>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg">
            <span className="text-xs text-zinc-500 uppercase font-semibold block">
              Location
            </span>
            <span className="text-zinc-300 font-medium mt-1 block">
              {company.location}
            </span>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-lg">
            <span className="text-xs text-zinc-500 uppercase font-semibold block">
              Company Scale
            </span>
            <span className="text-zinc-300 font-medium mt-1 block">
              {company.employeeCount}
            </span>
          </div>
        </div>

        {company.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              About our Vision & Culture
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-xl">
              {company.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Edit/Create form with proper HeroUI validation
  return (
    <div className="max-w-3xl mx-auto my-8 bg-zinc-950 p-8 border border-zinc-900 rounded-xl">
      <Form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200 border-b border-zinc-900 pb-3">
            {company
              ? "Update Company Profile"
              : "Configure Workspace Platform"}
          </h2>

          {/* Row 1: Company Name + Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name Field */}
            <TextField
              name="companyName"
              defaultValue={company?.name || ""}
              isRequired
              validate={validateCompanyName}
              className="w-full"
            >
              <Label className="text-zinc-400 font-medium text-sm">
                Company Name
              </Label>
              <Input placeholder="e.g. Acme Corp" className={textInputClass} />
              <FieldError className="text-xs text-danger mt-1" />
            </TextField>

            {/* Industry Field - Note: Select doesn't work with FieldError the same way */}
            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 font-medium text-sm">
                Industry / Category
              </Label>
              <Select
                name="industry"
                defaultSelectedKeys={[
                  company?.industry?.toLowerCase() || "technology",
                ]}
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
                    {["Technology", "Design", "Marketing", "Finance"].map(
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
          </div>

          {/* Row 2: Website URL + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website URL Field */}
            <TextField
              name="websiteUrl"
              defaultValue={company?.websiteUrl || ""}
              isRequired
              validate={validateWebsiteUrl}
              className="w-full"
            >
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
                />
              </div>
              <FieldError className="text-xs text-danger mt-1" />
            </TextField>

            {/* Location Field */}
            <TextField
              name="location"
              defaultValue={company?.location || ""}
              isRequired
              validate={validateLocation}
              className="w-full"
            >
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
                />
              </div>
              <FieldError className="text-xs text-danger mt-1" />
            </TextField>
          </div>

          {/* Row 3: Employee Count + Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Count Field */}
            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 font-medium text-sm mb-2">
                Employee Count Range
              </Label>
              <Select
                name="employeeCount"
                defaultSelectedKeys={[
                  company?.employeeCount || "1-10 employees",
                ]}
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

            {/* Company Logo Upload */}
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
          </div>

          {/* Row 4: Description */}
          <TextField
            name="description"
            defaultValue={company?.description || ""}
            className="w-full"
          >
            <Label className="text-zinc-400 font-medium text-sm">
              Brief Description
            </Label>
            <TextArea
              placeholder="Tell us about your company's mission and culture..."
              rows={4}
              className={textAreaClass}
            />
            <Description className="text-xs text-zinc-500 mt-1">
              Optional: Tell candidates about your company culture and values
            </Description>
          </TextField>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-5 border-t border-zinc-900">
          {company && (
            <Button
              type="button"
              variant="bordered"
              onPress={() => setIsEditing(false)}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-lg px-5 h-11"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-white text-black font-semibold hover:bg-zinc-200 rounded-lg px-6 h-11"
          >
            {company ? "Save Updates" : "Complete Setup"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

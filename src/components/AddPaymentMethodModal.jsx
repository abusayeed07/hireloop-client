// frontend/src/components/AddPaymentMethodModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CreditCard, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@heroui/react";
import { useSession } from "@/lib/auth-client";

export default function AddPaymentMethodModal({ isOpen, onClose, onSuccess }) {
  const { data: session } = useSession();
  const user = session?.user;

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardholderName: user?.name || "",
  });

  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cardholderName: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ Reset form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({ ...prev, cardholderName: user?.name || "" }));
      setErrors({ cardNumber: "", expiryDate: "", cardholderName: "" });
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change
    if (name === "cardNumber") setErrors((prev) => ({ ...prev, cardNumber: "" }));
    if (name === "expiryMonth" || name === "expiryYear") setErrors((prev) => ({ ...prev, expiryDate: "" }));
    if (name === "cardholderName") setErrors((prev) => ({ ...prev, cardholderName: "" }));
  };

  // ✅ VALIDATION LOGIC
  const validateForm = () => {
    let isValid = true;
    let newErrors = { cardNumber: "", expiryDate: "", cardholderName: "" };

    // 1. Validate Card Number (Must be 16 digits)
    const cleanCardNum = formData.cardNumber.replace(/\s/g, "");
    if (cleanCardNum.length !== 16 || !/^\d+$/.test(cleanCardNum)) {
      newErrors.cardNumber = "Card number must be exactly 16 digits.";
      isValid = false;
    }

    // 2. Validate Cardholder Name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required.";
      isValid = false;
    }

    // 3. Validate Expiry Date (Cannot be in the past)
    if (formData.expiryMonth && formData.expiryYear) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12

      const selectedYear = parseInt(formData.expiryYear);
      const selectedMonth = parseInt(formData.expiryMonth);

      if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
        newErrors.expiryDate = "Card has expired. Please choose a valid future date.";
        isValid = false;
      }
    } else if (formData.expiryMonth || formData.expiryYear) {
      newErrors.expiryDate = "Please select both Month and Year.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run validation
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

      const response = await fetch(`${baseUrl}/api/billing/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cardNumber: formData.cardNumber.replace(/\s/g, ""), // Remove spaces before sending
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cardholderName: formData.cardholderName,
        }),
      });

      const result = await response.json();
      console.log("📦 Add payment method result:", result);

      if (result?.success) {
        toast.success("Payment method added successfully!");
        setFormData({ 
          cardNumber: "", 
          expiryMonth: "", 
          expiryYear: "", 
          cardholderName: user?.name || "" 
        });
        setErrors({ cardNumber: "", expiryDate: "", cardholderName: "" });
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        toast.error(result?.error || "Failed to add payment method");
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Helper to format and display the first 4 and last 4 digits
  const getCardDisplay = (num) => {
    if (!num || num.length < 8) return "";
    const first4 = num.slice(0, 4);
    const last4 = num.slice(-4);
    return (
      <span className="text-xs text-zinc-400 mt-1 block">
        Card will show as: <span className="text-zinc-200 font-mono">{first4}•••• ••••{last4}</span>
      </span>
    );
  };

  const isFormValid = 
    formData.cardNumber.replace(/\s/g, "").length === 16 &&
    formData.expiryMonth &&
    formData.expiryYear &&
    formData.cardholderName.trim() &&
    !errors.cardNumber &&
    !errors.expiryDate;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", damping: 25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-zinc-800/50 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Add Payment Method</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 relative z-10">
            
            {/* Card Number Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                maxLength="16"
                className={`w-full bg-zinc-950/50 border ${errors.cardNumber ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600`}
              />
              {errors.cardNumber && (
                <span className="text-red-400 text-xs mt-1 block">{errors.cardNumber}</span>
              )}
              {getCardDisplay(formData.cardNumber)}
            </div>

            {/* Expiry Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Expiry Month
                </label>
                <select
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleChange}
                  required
                  className={`w-full bg-zinc-950/50 border ${errors.expiryDate ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors`}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Expiry Year
                </label>
                <select
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleChange}
                  required
                  className={`w-full bg-zinc-950/50 border ${errors.expiryDate ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors`}
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={String(new Date().getFullYear() + i)}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.expiryDate && (
              <span className="text-red-400 text-xs mt-1 block -my-2">{errors.expiryDate}</span>
            )}

            {/* Cardholder Name Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={handleChange}
                required
                className={`w-full bg-zinc-950/50 border ${errors.cardholderName ? 'border-red-500' : 'border-zinc-800'} text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600`}
              />
              {errors.cardholderName && (
                <span className="text-red-400 text-xs mt-1 block">{errors.cardholderName}</span>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="flat"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg px-5 h-10 font-medium transition-colors"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 h-10 font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
                isLoading={isLoading}
                isDisabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Save Card
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
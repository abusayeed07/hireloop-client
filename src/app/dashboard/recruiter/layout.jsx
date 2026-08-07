// frontend/src/app/dashboard/recruiter/layout.jsx
import { requireRole } from "@/lib/core/session";
import React from "react";

const RecruiterLayout = async ({ children }) => {
  // ✅ If the user is NOT a recruiter, this will redirect them.
  // If the user IS a recruiter, it just passes through.
  await requireRole("recruiter");

  return <div className="min-h-screen bg-zinc-950">{children}</div>;
};

export default RecruiterLayout;
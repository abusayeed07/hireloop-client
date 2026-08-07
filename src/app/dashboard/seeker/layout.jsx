import { requireRole } from "@/lib/core/session";
import React from "react";

const SeekerLayout = async ({ children }) => {
  await requireRole("seeker");

  return <div className="min-h-screen bg-zinc-950">{children}</div>;
};

export default SeekerLayout;

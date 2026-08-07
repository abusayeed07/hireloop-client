import { requireRole } from "@/lib/core/session";
import React from "react";

const AdminLayout = async ({ children }) => {
  await requireRole("admin");

  return <div className="min-h-screen bg-zinc-950">{children}</div>;
};

export default AdminLayout;

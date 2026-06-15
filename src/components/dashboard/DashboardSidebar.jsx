"use client";

import { House, Person, Gear, LayoutSideContentLeft } from "@gravity-ui/icons";
import { HiOutlineBriefcase } from "react-icons/hi";
import { Button, Drawer } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logoImg from "../../../public/logo.png";
import { ListChecks, PlusCircle } from "lucide-react";

export function DashboardSidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { icon: House, label: "Dashboard", href: "/dashboard/recruiter" },
    {
      icon: HiOutlineBriefcase,
      label: "Company Profile",
      href: "/dashboard/recruiter/company",
    },
    {
      icon: PlusCircle,
      label: "Post a New Job",
      href: "/dashboard/recruiter/jobs/new",
    },
    {
      icon: ListChecks,
      label: "Manage All Jobs",
      href: "/dashboard/recruiter/jobs",
    },
    { icon: Person, label: "Profile", href: "/dashboard/profile" },
    { icon: Gear, label: "Settings", href: "/dashboard/settings" },
  ];

  const NavContent = (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white group"
        >
          <item.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 p-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-3 py-4 mb-6 border-b border-white/10">
          <Link href={"/"}>
            <Image src={logoImg} alt="Logo" height={150} width={150} />
          </Link>
        </div>

        {/* Navigation */}
        {NavContent}
      </aside>

      {/* Mobile Drawer */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          className="bg-gray-900/80 backdrop-blur-xl border border-white/10 text-white"
          onClick={() => setIsDrawerOpen(true)}
        >
          <LayoutSideContentLeft className="w-4 h-4" />
          <span>Sidebar</span>
        </Button>
      </div>

      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Backdrop />
        <Drawer.Content placement="left" className="!w-72">
          <Drawer.Dialog className="bg-gray-900 border-r border-white/10">
            <Drawer.Header className="border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <Drawer.Heading className="text-white text-lg font-semibold">
                  HireLoop
                </Drawer.Heading>
              </div>
              <Drawer.CloseTrigger className="text-gray-400 hover:text-white" />
            </Drawer.Header>
            <Drawer.Body className="p-4">{NavContent}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </>
  );
}

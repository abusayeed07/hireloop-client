"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import logoImg from "../../public/logo.png";

const Navbar = () => {
  const pathName = usePathname();

  const links = (
    <>
      <Link
        href={"/browse-jobs"}
        className={
          pathName === "/browse-jobs"
            ? "px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Browse Jobs
      </Link>
      <Link
        href={"/company"}
        className={
          pathName === "/company"
            ? "px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Company
      </Link>
      <Link
        href={"/pricing"}
        className={
          pathName === "/pricing"
            ? "px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Pricing
      </Link>
    </>
  );

  return (
    <>
      <div className="container mx-auto navbar shadow-sm sticky top-0 z-50 px-4 bg-gray-900 rounded-lg">
        {/* LEFT SIDE */}
        <div className="navbar-start">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-2 group">
            <div className="relative w-32 h-8">
              <Image src={logoImg} fill className="object-contain" alt="Logo" />
            </div>
          </Link>
        </div>

        {/* RIGHT SIDE  */}
        <div className="navbar-end flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 bg-gray-800 rounded-lg p-1 text-white">
            {links}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-600 mx-1"></div>

            {/* Auth Buttons */}
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-semibold text-[#5C53FE] cursor-pointer">
                Sign In
              </button>
            </Link>

            <Link href="/signup">
              <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {links}
            <li className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 text-[#5C53FE]">
              <Link href="/login">Sign In</Link>
            </li>
            <li>
              <Link href="/signup" className="bg-white rounded-lg text-black ">
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;

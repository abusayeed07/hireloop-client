"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import logoImg from "../../public/logo.png";
import { signOut, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const pathName = usePathname();
  const [imageError, setImageError] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/signin");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out");
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  // Get valid image source
  const getAvatarImage = () => {
    if (imageError) return null;
    const image = session?.user?.image;
    if (image && image.trim() !== "") {
      return image;
    }
    return null;
  };

  const links = (
    <>
      <Link
        href={"/browse-jobs"}
        className={
          pathName === "/browse-jobs"
            ? "px-4 py-2 rounded-lg bg-white/10 text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-white/5 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Browse Jobs
      </Link>
      <Link
        href={"/company"}
        className={
          pathName === "/company"
            ? "px-4 py-2 rounded-lg bg-white/10 text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-white/5 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Company
      </Link>
      <Link
        href={"/pricing"}
        className={
          pathName === "/pricing"
            ? "px-4 py-2 rounded-lg bg-white/10 text-blue-400 shadow-sm font-medium block whitespace-nowrap"
            : "px-4 py-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-white/5 transition-all duration-200 font-medium block whitespace-nowrap"
        }
      >
        Pricing
      </Link>
    </>
  );

  return (
    <>
      <div className="container mx-auto shadow-sm sticky top-0 z-50 px-4 bg-gray-900 rounded-lg">
        <div className="flex justify-between items-center h-16">
          {/* LEFT SIDE - Logo */}
          <div className="flex-shrink-0">
            <Link href={"/"} className="flex items-center gap-2 group">
              <div className="relative w-32 h-8">
                <Image
                  src={logoImg}
                  fill
                  className="object-contain"
                  alt="Logo"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* RIGHT SIDE - Navigation & Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {links}

              {/* Divider */}
              <div className="w-px h-5 bg-gray-600 mx-1"></div>

              {/* Avatar & Auth Buttons */}
              {session?.user ? (
                // User is signed in - Show Avatar with Dropdown
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
                  >
                    {getAvatarImage() ? (
                      <Image
                        src={getAvatarImage()}
                        alt={session.user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold border-2 border-blue-500">
                        {getUserInitials()}
                      </div>
                    )}
                    <span className="hidden xl:block text-sm text-white font-medium">
                      {session.user.name?.split(" ")[0] || session.user.name}
                    </span>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu dropdown-content mt-3 w-52 bg-gray-800 rounded-lg shadow-lg p-2 z-[100] border border-gray-700"
                  >
                    <li className="px-4 py-2 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        {getAvatarImage() ? (
                          <Image
                            src={getAvatarImage()}
                            alt={session.user.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">
                            {session.user.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="text-gray-300 hover:text-white"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="text-gray-300 hover:text-white"
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="text-red-400 hover:text-red-300 w-full text-left"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                // User is not signed in - Show Sign In and Get Started buttons
                <>
                  <Link href="/signin">
                    <button className="px-4 py-2 text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-all">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile dropdown menu */}
          <div className="dropdown dropdown-end lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
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
              className="menu menu-sm dropdown-content bg-gray-800 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-gray-700"
            >
              {links}
              <li className="border-t border-gray-700 mt-2 pt-2">
                {session?.user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-700 mb-2">
                      <div className="flex items-center gap-3">
                        {getAvatarImage() ? (
                          <img
                            src={getAvatarImage()}
                            alt={session.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">
                            {session.user.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => router.push("/settings")}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="block px-4 py-2 text-blue-400"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center mt-2"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

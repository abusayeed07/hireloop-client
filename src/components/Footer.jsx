"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaPinterestP,
  FaLinkedinIn,
} from "react-icons/fa";

import logoImg from "../../public/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-gray-400 border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Left */}
          <div>
            {/* Logo */}
            <div className="relative w-44 h-12 mb-5">
              <Image
                src={logoImg}
                fill
                className="object-contain"
                alt="Logo"
              />
            </div>

            <p className="text-sm leading-7 max-w-xs">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-8">
              <Link
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </Link>

              <Link
                href="https://www.pinterest.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                aria-label="Pinterest"
              >
                <FaPinterestP className="w-4 h-4" />
              </Link>

              <Link
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-indigo-500 font-medium mb-5">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Job discovery</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Worker AI</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Companies</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Salary data</Link></li>
            </ul>
          </div>

          {/* Navigations */}
          <div>
            <h3 className="text-indigo-500 font-medium mb-5">Navigations</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Help center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Career library</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-indigo-500 font-medium mb-5">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Brand Guideline</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Newsroom</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>Copyright {currentYear} — Programming Hero</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms & Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Guideline</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
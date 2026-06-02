"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { ArrowRight, House, Magnifier } from '@gravity-ui/icons';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* SVG Illustration */}
        <div className="mb-8">
          <svg
            className="w-64 h-64 mx-auto"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="90" fill="#E0E7FF" className="dark:fill-gray-700" />
            <circle cx="100" cy="100" r="70" fill="#C7D2FE" className="dark:fill-gray-600" />
            <circle cx="100" cy="100" r="50" fill="#A5B4FC" className="dark:fill-gray-500" />
            <path
              d="M70 85 L130 85"
              stroke="#4F46E5"
              strokeWidth="4"
              strokeLinecap="round"
              className="dark:stroke-indigo-400"
            />
            <path
              d="M70 105 L130 105"
              stroke="#4F46E5"
              strokeWidth="4"
              strokeLinecap="round"
              className="dark:stroke-indigo-400"
            />
            <circle cx="85" cy="75" r="5" fill="#4F46E5" className="dark:fill-indigo-400" />
            <circle cx="115" cy="75" r="5" fill="#4F46E5" className="dark:fill-indigo-400" />
            <path
              d="M80 130 Q100 145 120 130"
              stroke="#4F46E5"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="dark:stroke-indigo-400"
            />
            <text x="100" y="175" textAnchor="middle" fill="#4F46E5" fontSize="20" fontWeight="bold" className="dark:fill-indigo-400">
              404
            </text>
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Lost in Space?
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          The page you're looking for has wandered off into the universe. Let's bring you back to Earth.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 px-8">
              🏠 Back to Home
            </Button>
          </Link>
          <Link href="/browse-jobs">
            <Button variant="bordered" className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400">
              🔍 Search Jobs
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Popular pages:</p>
          <div className="flex gap-4 justify-center mt-2">
            <Link href="/browse-jobs" className="hover:text-indigo-600">Browse Jobs</Link>
            <Link href="/company" className="hover:text-indigo-600">Companies</Link>
            <Link href="/pricing" className="hover:text-indigo-600">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
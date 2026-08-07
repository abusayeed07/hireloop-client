// frontend/src/app/(main)/layout.jsx
"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useSessionWithSuspension } from '@/hooks/useSessionWithSuspension';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

const MainLayout = ({ children }) => {
  const router = useRouter();
  const { session, status } = useSessionWithSuspension();

  // ✅ Check for suspension on page load
  useEffect(() => {
    if (session?.user?.status === 'suspended') {
      router.push('/account-suspended');
    }
  }, [session, router]);

  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
// frontend/src/hooks/useSessionWithSuspension.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import toast from 'react-hot-toast';

export const useSessionWithSuspension = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ✅ Check if user is suspended
    if (session?.user?.status === 'suspended') {
      console.log('🚫 User is suspended, logging out...');
      
      // ✅ Show toast notification
      toast.error('Your account has been suspended. Please contact support.', {
        duration: 5000,
      });
      
      // ✅ Sign out immediately
      import('@/lib/auth-client').then(({ authClient }) => {
        authClient.signOut();
      });
      
      // ✅ Redirect to suspension page
      router.push('/account-suspended');
    }
  }, [session, router]);

  return { session, status };
};
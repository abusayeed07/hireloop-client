// frontend/src/lib/api/interceptor.js
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

// ✅ Intercept all fetch requests
const originalFetch = window.fetch;

window.fetch = async function(url, options = {}) {
  try {
    const response = await originalFetch(url, options);
    
    // ✅ Check if response indicates suspension
    if (response.status === 403) {
      const data = await response.clone().json().catch(() => ({}));
      
      if (data.code === 'ACCOUNT_SUSPENDED' || 
          data.error?.toLowerCase().includes('suspended')) {
        
        // ✅ User is suspended - sign out and redirect
        toast.error('Your account has been suspended. Please contact support.');
        await authClient.signOut();
        window.location.href = '/account-suspended';
        
        throw new Error('Account suspended');
      }
    }
    
    return response;
  } catch (error) {
    // ✅ Handle network errors
    if (error.message === 'Account suspended') {
      throw error;
    }
    throw error;
  }
};
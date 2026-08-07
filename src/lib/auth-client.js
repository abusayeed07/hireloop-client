// frontend/src/lib/auth-client.js
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export const authClient = createAuthClient({
    baseURL: baseURL,
    basePath: "/api/auth",
    fetchOptions: {
        credentials: 'include',
        // ✅ Add this to handle sessions better
        onResponse: async (response) => {
            if (response.status === 401) {
                // Session expired, handle accordingly
                console.log('Session expired');
            }
        }
    },
    // ✅ Add session handling
    session: {
        // Refresh session on tab focus
        refreshOnFocus: true,
        // Refresh session every 5 minutes
        refreshInterval: 1000 * 60 * 5,
    }
});

export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession,
    useAuthActions,
    getSession
} = authClient;

export default authClient;
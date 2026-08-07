// frontend/src/lib/auth.js
import { getSession } from "./auth-client";
import { headers } from "next/headers"; 

// ✅ Centralized server-side auth helper
export const auth = {
    getSession: async () => {
        try {
            // ✅ CRITICAL FIX: await the headers() promise first!
            const headersList = await headers();
            // ✅ Safely get the cookie string
            const cookieString = headersList.get('cookie') || '';

            const session = await getSession({ 
                fetchOptions: {
                    headers: {
                        Cookie: cookieString, // ✅ Pass the raw string
                    },
                    cache: 'no-store', // Bypass cache to get fresh data
                }
            });
            return session;
        } catch (error) {
            console.error("❌ Server-side auth session error:", error);
            return null;
        }
    }
};

// ✅ Force the session cookie to refresh (Fixes stale plan badges)
export const refreshSession = async () => {
    try {
        const session = await auth.getSession();
        if (session?.user) {
            return { success: true, user: session.user };
        }
        return { success: false, error: "No active session found" };
    } catch (error) {
        console.error("Failed to refresh session:", error);
        return { success: false, error: error.message };
    }
};

export default auth;
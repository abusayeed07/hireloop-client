// frontend/src/lib/core/session.js
import { authClient } from "../auth-client";
import { redirect } from "next/navigation"; // ✅ Import redirect for Server Components

// ✅ Enhanced server header mapping
async function getServerFetchOptions() {
    if (typeof window !== "undefined") return {}; 

    try {
        const { headers } = require("next/headers");
        const nextHeaders = await headers();
        
        return {
            headers: {
                "Cookie": nextHeaders.get("cookie") || "",
                "User-Agent": nextHeaders.get("user-agent") || "",
                "X-Forwarded-For": nextHeaders.get("x-forwarded-for") || "",
            },
        };
    } catch (e) {
        console.warn("⚠️ Not running inside a server request context");
        return {};
    }
}

export const getUserSession = async () => {
    try {
        const fetchOptions = await getServerFetchOptions();
        const { data, error } = await authClient.getSession({ fetchOptions });
        
        if (error) {
            console.error('Server session error:', error);
            return null;
        }
        return data?.user || null;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
};

export const getServerSession = async () => {
    try {
        const fetchOptions = await getServerFetchOptions();
        const { data, error } = await authClient.getSession({ fetchOptions });
        
        if (error) {
            console.error('Session error:', error);
            return null;
        }
        return data || null;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

export const getUserFromSession = async () => {
    const session = await getServerSession();
    return session?.user || null;
};

// ✅ ADDED: requireAuth - Protects server components and redirects to signin if not logged in
export const requireAuth = async () => {
    const user = await getUserSession();
    if (!user) {
        redirect("/signin"); // Redirects on the server side
    }
    return user;
};

// ✅ ADDED: requireRole - Protects server components and redirects if user doesn't have the role
export const requireRole = async (role) => {
    const user = await getUserSession();
    
    if (!user) {
        redirect("/signin");
    }

    // Admins can access any page
    if (user.role === "admin") {
        return user;
    }

    if (user.role !== role) {
        redirect("/unauthorized");
    }

    return user;
};
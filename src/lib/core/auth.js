// frontend/src/lib/core/auth.js
import { redirect } from "next/navigation";
import { getUserSession } from "./session";

export const requireAuth = async () => {
    const user = await getUserSession();
    if (!user) {
        redirect("/signin");
    }
    return user;
};

export const requireRole = async (role) => {
    const user = await requireAuth();
    if (!user) return null;

    if (user.role === 'admin') {
        return user;
    }

    if (user.role !== role) {
        redirect("/unauthorized");
    }
    return user;
};

export const requireAnyRole = async (allowedRoles) => {
    const user = await requireAuth();
    if (!user) return null;

    if (user.role === 'admin') {
        return user;
    }

    if (!allowedRoles.includes(user.role)) {
        redirect("/unauthorized");
    }
    return user;
};

export const requireSeeker = async () => {
    return requireRole('seeker');
};

export const requireRecruiter = async () => {
    return requireRole('recruiter');
};

export const requireAdmin = async () => {
    return requireRole('admin');
};

export const getCurrentUser = async () => {
    return await getUserSession();
};

export const isAuthenticated = async () => {
    const user = await getUserSession();
    return !!user;
};

export const getUserEmail = async () => {
    const user = await getUserSession();
    return user?.email || null;
};

export const getUserRole = async () => {
    const user = await getUserSession();
    return user?.role || null;
};

export const hasRole = async (role) => {
    const user = await getUserSession();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === role;
};

export const hasAnyRole = async (allowedRoles) => {
    const user = await getUserSession();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return allowedRoles.includes(user.role);
};
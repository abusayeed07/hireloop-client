// src/lib/api/plans.js
import { serverFetch } from "../core/server";

// ✅ For Server Components, use direct fetch. For Client Components, use serverFetch.
export const getPlanById = async (planId) => {
    try {
        // If we are running on the SERVER (Server Component), use direct fetch
        if (typeof window === 'undefined') {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
            const response = await fetch(`${baseUrl}/api/plans?plan_id=${planId}`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // ✅ CRITICAL: Must be included!
            });
            
            if (!response.ok) {
                console.warn(`Plan fetch failed: ${response.status}`);
                return null;
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                console.warn("Plan fetch returned empty response");
                return null;
            }

            const data = JSON.parse(text);
            
            if (!data || Object.keys(data).length === 0) {
                console.warn("Plan fetch returned empty object {}", data);
                return null;
            }

            return data;
        }

        // If we are on the CLIENT, use serverFetch
        return serverFetch(`/api/plans?plan_id=${planId}`);
    } catch (error) {
        console.error(`❌ Error fetching plan ${planId}:`, error);
        return null;
    }
};

export const getAllPlans = async () => {
    try {
        const plans = await serverFetch('/api/plans');
        if (Array.isArray(plans)) return plans;
        if (plans && plans.results) return plans.results;
        if (plans && plans.data) return plans.data;
        return [];
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
};

export const getPlansByTier = async (tier) => {
    try {
        const plans = await serverFetch(`/api/plans?tier=${tier}`);
        return Array.isArray(plans) ? plans : [];
    } catch (error) {
        console.error(`Error fetching ${tier} plans:`, error);
        return [];
    }
};

export const getActivePlans = async () => {
    try {
        const plans = await serverFetch('/api/plans?status=active');
        return Array.isArray(plans) ? plans : [];
    } catch (error) {
        console.error('Error fetching active plans:', error);
        return [];
    }
};
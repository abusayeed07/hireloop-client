// src/lib/api/applications.js
import { serverFetch } from "../core/server";

export const getApplicationsByApplicant = async (userId) => {
    try {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        const url = `/api/applications${query}`;
        const response = await serverFetch(url);
        if (response === null) return [];
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
    } catch (error) {
        console.error('❌ getApplicationsByApplicant error:', error);
        return [];
    }
};

// ✅ NEW: Added for Recruiters to fetch applications by Company ID
export const getApplicationsByCompany = async (companyId) => {
    try {
        const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
        const url = `/api/applications${query}`;
        const response = await serverFetch(url);
        if (response === null) return [];
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
    } catch (error) {
        console.error('❌ getApplicationsByCompany error:', error);
        return [];
    }
};

export const submitApplication = async (applicationData) => {
    try {
        const result = await serverFetch('/api/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
        return result;
    } catch (error) {
        console.error('❌ submitApplication error:', error);
        return { success: false, error: error.message };
    }
};
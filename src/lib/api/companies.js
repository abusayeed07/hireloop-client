// src/lib/api/companies.js
import { serverFetch } from "../core/server";
import { getUserSession } from "../core/session";
import { getCompanyJobs } from "./jobs"; // ✅ Moved import to top

export const getCompanies = async () => {
    try {
        const data = await serverFetch('/api/companies');
        
        // ✅ Handle both response formats
        // If data has success and data property, extract the data array
        if (data && data.success && data.data) {
            return Array.isArray(data.data) ? data.data : [];
        }
        
        // If data is already an array
        if (Array.isArray(data)) {
            return data;
        }
        
        // If data has companies property
        if (data && data.companies && Array.isArray(data.companies)) {
            return data.companies;
        }
        
        // If data has data property but not success
        if (data && data.data && Array.isArray(data.data)) {
            return data.data;
        }
        
        console.warn('⚠️ Unexpected API response format:', data);
        return [];
    } catch (error) {
        console.error('❌ getCompanies error:', error);
        return [];
    }
};

// ✅ FIXED: Unwrap the data property
export const getCompanyById = async (companyId) => {
    try {
        if (!companyId) return null;
        const response = await serverFetch(`/api/companies/${companyId}`);
        
        // If the API returns { success: true, data: {...} }, return just the data
        if (response && response.success === true && response.data) {
            return response.data;
        }
        
        // Fallback if the API returns the raw object
        return response || null;
    } catch (error) {
        console.error(`❌ getCompanyById error for ${companyId}:`, error);
        return null;
    }
};

// ✅ FIXED: Unwrap the data property for recruiter
export const getRecruiterCompany = async (recruiterId) => {
    try {
        if (!recruiterId) return null;

        const response = await serverFetch(
            `/api/companies/my?recruiterId=${encodeURIComponent(recruiterId)}`,
        );

        // If the API returns { success: true, data: {...} }, return just the data
        if (response && response.success === true && response.data) {
            return response.data;
        }

        // Safety fallbacks
        if (!response || typeof response !== 'object') return null;
        if (Array.isArray(response)) return response[0] || null;
        if (Object.keys(response).length === 0) return null;

        return response;
    } catch (error) {
        console.error(`❌ getRecruiterCompany error for ${recruiterId}:`, error);
        return null;
    }
};

export const getLoggedInRecruiterCompany = async () => {
    try {
        const user = await getUserSession();
        if (!user?.id) return null;
        return getRecruiterCompany(user.id);
    } catch (error) {
        console.error('❌ getLoggedInRecruiterCompany error:', error);
        return null;
    }
};

// ✅ FIXED: Added safety check so it doesn't crash if jobs fail
export const getCompanyWithJobs = async (companyId) => {
    try {
        if (!companyId) return null;

        const [company, jobs] = await Promise.all([
            getCompanyById(companyId),
            getCompanyJobs(companyId).catch(() => []) // Safety catch
        ]);

        if (!company) return null;

        return {
            ...company,
            jobs: jobs || [],
            jobCount: jobs?.length || 0,
        };
    } catch (error) {
        console.error(`❌ getCompanyWithJobs error for ${companyId}:`, error);
        return null;
    }
};

export const updateCompany = async (companyId, updates) => {
    try {
        if (!companyId) return { success: false, error: 'Company ID required' };

        const result = await serverFetch(`/api/companies/${companyId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return result;
    } catch (error) {
        console.error(`❌ updateCompany error for ${companyId}:`, error);
        return { success: false, error: error.message };
    }
};

export const createCompany = async (companyData) => {
    try {
        const result = await serverFetch('/api/companies', {
            method: 'POST',
            body: JSON.stringify(companyData),
        });
        return result;
    } catch (error) {
        console.error('❌ createCompany error:', error);
        return { success: false, error: error.message };
    }
};

// ✅ ============================================
// ✅ ADMIN FUNCTIONS (for admin dashboard)
// ✅ ============================================

// ✅ Get all companies with pagination and filters (Admin only)
export const getAdminCompanies = async (page = 1, limit = 50, search = '', status = '', industry = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        if (industry && industry !== 'all') params.append('industry', industry);

        const data = await serverFetch(`/api/companies/admin/companies?${params}`);
        return data;
    } catch (error) {
        console.error('❌ getAdminCompanies error:', error);
        return { success: false, data: [], pagination: { total: 0 } };
    }
};

// ✅ Update company status (Admin only)
export const updateCompanyStatus = async (companyId, action) => {
    try {
        if (!companyId) return { success: false, error: 'Company ID required' };

        const result = await serverFetch(`/api/companies/admin/companies/${companyId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action }),
        });
        return result;
    } catch (error) {
        console.error(`❌ updateCompanyStatus error for ${companyId}:`, error);
        return { success: false, error: error.message };
    }
};

// ✅ Delete company (Admin only)
export const deleteCompany = async (companyId) => {
    try {
        if (!companyId) return { success: false, error: 'Company ID required' };

        const result = await serverFetch(`/api/companies/admin/companies/${companyId}`, {
            method: 'DELETE',
        });
        return result;
    } catch (error) {
        console.error(`❌ deleteCompany error for ${companyId}:`, error);
        return { success: false, error: error.message };
    }
};

// ✅ Get company stats (Admin only)
export const getCompanyStats = async () => {
    try {
        const data = await serverFetch('/api/companies/admin/stats');
        return data;
    } catch (error) {
        console.error('❌ getCompanyStats error:', error);
        return { success: false, data: { pending: 0, approved: 0, rejected: 0 } };
    }
};
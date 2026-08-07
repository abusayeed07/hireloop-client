import { serverFetch } from "../core/server";

export const getJobs = async () => {
    try {
        const data = await serverFetch('/api/jobs');
        console.log('📊 getJobs raw data:', data);
        
        if (data === null) {
            console.log('📊 No data returned');
            return [];
        }
        
        if (Array.isArray(data)) {
            console.log(`📊 Found ${data.length} jobs`);
            return data;
        }
        
        if (data && data.data && Array.isArray(data.data)) {
            console.log(`📊 Found ${data.data.length} jobs in data.data`);
            return data.data;
        }
        
        if (data && data.results && Array.isArray(data.results)) {
            console.log(`📊 Found ${data.results.length} jobs in data.results`);
            return data.results;
        }
        
        if (data && data.success === false) {
            console.error('❌ Error fetching jobs:', data.error);
            return [];
        }
        
        console.log('📊 No jobs found, returning empty array');
        return [];
    } catch (error) {
        console.error('❌ getJobs error:', error);
        return [];
    }
};

export const getJobById = async (jobId) => {
    try {
        const data = await serverFetch(`/api/jobs/${jobId}`);
        if (data === null) return null;
        if (data && data.success === false) {
            console.error('❌ Error fetching job:', data.error);
            return null;
        }
        return data || null;
    } catch (error) {
        console.error(`❌ getJobById error for ${jobId}:`, error);
        return null;
    }
};

export const getCompanyJobs = async (companyId, status = 'active') => {
    try {
        const queryParams = new URLSearchParams();
        if (companyId) queryParams.append('companyId', companyId);
        if (status) queryParams.append('status', status);
        
        const url = `/api/jobs?${queryParams.toString()}`;
        const data = await serverFetch(url);
        
        if (data === null) return [];
        if (Array.isArray(data)) return data;
        if (data && data.data && Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error(`❌ getCompanyJobs error for ${companyId}:`, error);
        return [];
    }
};

export const getJobsWithFilters = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const path = queryString ? `/api/jobs?${queryString}` : '/api/jobs';
        
        const data = await serverFetch(path);
        if (data === null) return [];
        if (Array.isArray(data)) return data;
        if (data && data.data && Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error('❌ getJobsWithFilters error:', error);
        return [];
    }
};

export const getFeaturedJobs = async (limit = 6) => {
    try {
        const data = await serverFetch(`/api/jobs?featured=true&limit=${limit}`);
        if (data === null) return [];
        if (Array.isArray(data)) return data.slice(0, limit);
        if (data && data.data && Array.isArray(data.data)) return data.data.slice(0, limit);
        return [];
    } catch (error) {
        console.error('❌ getFeaturedJobs error:', error);
        return [];
    }
};

export const getRecentJobs = async (limit = 10) => {
    try {
        const data = await serverFetch(`/api/jobs?recent=true&limit=${limit}`);
        if (data === null) return [];
        if (Array.isArray(data)) return data.slice(0, limit);
        if (data && data.data && Array.isArray(data.data)) return data.data.slice(0, limit);
        return [];
    } catch (error) {
        console.error('❌ getRecentJobs error:', error);
        return [];
    }
};

export const getMyJobs = async () => {
    try {
        const data = await serverFetch('/api/jobs/my-jobs');
        if (data === null) return [];
        if (Array.isArray(data)) return data;
        if (data && data.data && Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error('❌ getMyJobs error:', error);
        return [];
    }
};

export const getSavedJobs = async (userId) => {
    try {
        const queryParams = new URLSearchParams();
        if (userId) queryParams.append('userId', userId);
        
        const url = `/api/saved-jobs?${queryParams.toString()}`;
        const data = await serverFetch(url);
        if (data === null) return [];
        if (Array.isArray(data)) return data;
        if (data && data.data && Array.isArray(data.data)) return data.data;
        return [];
    } catch (error) {
        console.error('❌ getSavedJobs error:', error);
        return [];
    }
};

export const getSavedJobIds = async () => {
    try {
        const data = await serverFetch('/api/saved-jobs/ids');
        if (data === null) return [];
        return data?.savedJobIds || [];
    } catch (error) {
        console.error('❌ getSavedJobIds error:', error);
        return [];
    }
};

export const checkJobSaved = async (jobId, userId) => {
    try {
        // ✅ Pass userId as query param so backend can use req.query.userId
        const data = await serverFetch(`/api/saved-jobs/check/${jobId}?userId=${userId}`);
        if (data === null) return false;
        return data?.saved || false;
    } catch (error) {
        console.error('❌ checkJobSaved error:', error);
        return false;
    }
};

export const saveJob = async (jobId, userId) => {
    try {
        // ✅ Send BOTH to the backend. Backend uses req.user.id, but this is safe.
        const data = await serverFetch('/api/saved-jobs', {
            method: 'POST',
            body: JSON.stringify({ jobId, userId }),
        });
        if (data === null) return { success: false, error: 'Unauthorized' };
        if (data && data.error) return { success: false, error: data.error };
        return { success: true, ...data };
    } catch (error) {
        console.error('❌ saveJob error:', error);
        return { success: false, error: error.message };
    }
};

export const unsaveJob = async (jobId, userId) => {
    try {
        const data = await serverFetch(`/api/saved-jobs/${jobId}`, {
            method: 'DELETE',
            body: JSON.stringify({ userId }),
        });

        if (data === null) return { success: false, error: 'Unauthorized' };
        if (data && data.error) return { success: false, error: data.error };
        return { success: true, ...data };
    } catch (error) {
        console.error('❌ unsaveJob error:', error);
        return { success: false, error: error.message };
    }
};

export const createJob = async (jobData) => {
    try {
        const result = await serverFetch('/api/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
        return result;
    } catch (error) {
        console.error('❌ createJob API error:', error);
        return { success: false, error: error.message };
    }
};


export const updateJob = async (jobId, jobData) => {
  try {
    const result = await serverFetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
    return result;
  } catch (error) {
    console.error('❌ updateJob error:', error);
    return { success: false, error: error.message };
  }
};


// ==========================================
// ✅ ADMIN API HELPERS
// ==========================================

export const getAdminJobs = async () => {
    try {
        const data = await serverFetch('/api/jobs/admin/jobs');
        if (data === null) return [];
        if (data && data.success && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    } catch (error) {
        console.error('❌ getAdminJobs error:', error);
        return [];
    }
};

export const getAdminJobStats = async () => {
    try {
        const data = await serverFetch('/api/jobs/admin/stats');
        if (data === null) return {};
        return data?.data || {};
    } catch (error) {
        console.error('❌ getAdminJobStats error:', error);
        return {};
    }
};

export const deleteAdminJob = async (jobId) => {
    try {
        const result = await serverFetch(`/api/jobs/admin/jobs/${jobId}`, {
            method: 'DELETE',
        });
        return result;
    } catch (error) {
        console.error('❌ deleteAdminJob error:', error);
        return { success: false, error: error.message };
    }
};
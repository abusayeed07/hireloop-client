import { serverFetch } from "../core/server";

// ✅ Get applications by applicant (Seeker)
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

// ✅ Get applications by Company ID (Recruiter)
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

// ✅ Submit application (Seeker)
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

// ✅ Get recruiter's applications (Recruiter)
export const getRecruiterApplications = async () => {
    try {
        const data = await serverFetch('/api/applications/recruiter');
        if (data === null) return [];
        if (data && data.success && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    } catch (error) {
        console.error('❌ getRecruiterApplications error:', error);
        return [];
    }
};

// ✅ Get applications for a specific job (Recruiter)
export const getJobApplications = async (jobId) => {
    try {
        const data = await serverFetch(`/api/applications/job/${jobId}`);
        if (data === null) return [];
        if (data && data.success && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    } catch (error) {
        console.error('❌ getJobApplications error:', error);
        return [];
    }
};

// ✅ Update application status (Recruiter)
export const updateApplicationStatus = async (applicationId, status, recruiterNotes = '') => {
    try {
        const result = await serverFetch(`/api/applications/${applicationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, recruiterNotes }),
        });
        return result;
    } catch (error) {
        console.error('❌ updateApplicationStatus error:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Get application stats (Recruiter)
export const getApplicationStats = async () => {
    try {
        const data = await serverFetch('/api/applications/recruiter/stats');
        if (data === null) return {};
        return data?.data || {};
    } catch (error) {
        console.error('❌ getApplicationStats error:', error);
        return {};
    }
};

// ✅ Get my applications (Seeker)
export const getMyApplications = async () => {
    try {
        const data = await serverFetch('/api/applications/my');
        if (data === null) return [];
        if (data && data.success && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    } catch (error) {
        console.error('❌ getMyApplications error:', error);
        return [];
    }
};

// ✅ Get single application by ID (Recruiter)
export const getApplicationById = async (applicationId) => {
    try {
        const data = await serverFetch(`/api/applications/recruiter/${applicationId}`);
        if (data === null) {
            throw new Error('Application not found');
        }
        if (data && data.success && data.data) return data.data;
        if (data && data._id) return data;
        return data;
    } catch (error) {
        console.error('❌ getApplicationById error:', error);
        throw error;
    }
};
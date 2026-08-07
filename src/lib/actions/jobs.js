// // src/lib/actions/jobs.js
// 'use server';

// import { serverFetch, serverMutation } from "../core/server";
// import { requireRecruiter, requireAnyRole } from "../core/auth";

// // ============ GET FUNCTIONS ============

// export const getAllJobs = async (filters = {}) => {
//     const queryParams = new URLSearchParams();
//     Object.keys(filters).forEach(key => {
//         if (filters[key]) {
//             queryParams.append(key, filters[key]);
//         }
//     });
//     const queryString = queryParams.toString();
//     const url = queryString ? `/api/jobs?${queryString}` : '/api/jobs';
//     const result = await serverFetch(url);
//     return Array.isArray(result) ? result : [];
// };

// export const getJobById = async (jobId) => {
//     return serverFetch(`/api/jobs/${jobId}`);
// };

// export const getJobsByCompany = async (companyId) => {
//     return serverFetch(`/api/jobs?companyId=${companyId}`);
// };

// // ============ MUTATION FUNCTIONS ============

// export const createJob = async (newJobData) => {
//     const user = await requireRecruiter();
//     if (!user) return { success: false, error: 'Unauthorized' };
    
//     const result = await serverMutation('/api/jobs', {
//         ...newJobData,
//         recruiterId: user.id,
//         postedBy: user.email,
//         postedAt: new Date().toISOString(),
//         status: newJobData.status || 'active',
//     });
    
//     return result;
// };

// export const updateJob = async (jobId, updateData) => {
//     const user = await requireRecruiter();
//     if (!user) return { success: false, error: 'Unauthorized' };
    
//     const job = await serverFetch(`/api/jobs/${jobId}`);
    
//     if (user.role !== 'admin' && job?.recruiterId !== user.id) {
//         return { success: false, error: 'You can only update your own jobs' };
//     }
    
//     return serverMutation(`/api/jobs/${jobId}`, {
//         ...updateData,
//         updatedAt: new Date().toISOString(),
//     }, 'PUT');
// };

// export const deleteJob = async (jobId) => {
//     const user = await requireRecruiter();
//     if (!user) return { success: false, error: 'Unauthorized' };
    
//     const job = await serverFetch(`/api/jobs/${jobId}`);
    
//     if (user.role !== 'admin' && job?.recruiterId !== user.id) {
//         return { success: false, error: 'You can only delete your own jobs' };
//     }
    
//     return serverMutation(`/api/jobs/${jobId}`, {}, 'DELETE');
// };

// export const toggleJobStatus = async (jobId) => {
//     const user = await requireRecruiter();
//     if (!user) return { success: false, error: 'Unauthorized' };
    
//     const job = await serverFetch(`/api/jobs/${jobId}`);
    
//     if (user.role !== 'admin' && job?.recruiterId !== user.id) {
//         return { success: false, error: 'You can only manage your own jobs' };
//     }
    
//     const newStatus = job?.status === 'active' ? 'inactive' : 'active';
//     return serverMutation(`/api/jobs/${jobId}`, { status: newStatus }, 'PUT');
// };

// export const getJobApplications = async (jobId) => {
//     const user = await requireRecruiter();
//     if (!user) return [];
    
//     const job = await serverFetch(`/api/jobs/${jobId}`);
    
//     if (user.role !== 'admin' && job?.recruiterId !== user.id) {
//         return { success: false, error: 'You can only view applications for your own jobs' };
//     }
    
//     return serverFetch(`/api/applications?jobId=${jobId}`);
// };
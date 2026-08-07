// // src/lib/actions/plans.js
// 'use server';

// import { serverFetch } from "../core/server";

// export const getPlanById = async (planId) => {
//     return serverFetch(`/api/plans?plan_id=${planId}`);
// };

// export const getAllPlans = async () => {
//     try {
//         const plans = await serverFetch('/api/plans');
        
//         if (Array.isArray(plans)) {
//             return plans;
//         }
        
//         if (plans && plans.results) {
//             return plans.results;
//         }
        
//         if (plans && plans.data) {
//             return plans.data;
//         }
        
//         return [];
//     } catch (error) {
//         console.error('Error fetching plans:', error);
//         return [];
//     }
// };

// export const getPlansByTier = async (tier) => {
//     try {
//         const plans = await serverFetch(`/api/plans?tier=${tier}`);
//         if (Array.isArray(plans)) {
//             return plans;
//         }
//         return [];
//     } catch (error) {
//         console.error(`Error fetching ${tier} plans:`, error);
//         return [];
//     }
// };

// export const getActivePlans = async () => {
//     try {
//         const plans = await serverFetch('/api/plans?status=active');
//         if (Array.isArray(plans)) {
//             return plans;
//         }
//         return [];
//     } catch (error) {
//         console.error('Error fetching active plans:', error);
//         return [];
//     }
// };
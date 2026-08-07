// 'use server';

// import { serverFetch, serverMutation } from "../core/server";
// import { requireAuth } from "../core/auth";

// export const getSubscription = async () => {
//     const user = await requireAuth();
//     if (!user) return null;
//     return serverFetch(`/api/billing/subscription?email=${user.email}`);
// };

// // ✅ THESE MUST BE EXPORTED AS NAMED FUNCTIONS
// export const getBillingHistory = async () => {
//     const user = await requireAuth();
//     if (!user) return [];
//     const result = await serverFetch(`/api/billing/history?email=${user.email}`);
//     return Array.isArray(result) ? result : [];
// };

// export const getPaymentMethods = async () => {
//     const user = await requireAuth();
//     if (!user) return [];
//     const result = await serverFetch(`/api/billing/payment-methods?email=${user.email}`);
//     return Array.isArray(result) ? result : [];
// };

// export const cancelSubscription = async () => {
//     const user = await requireAuth();
//     if (!user) return { success: false, error: 'Unauthorized' };
//     return serverMutation('/api/billing/cancel', { email: user.email });
// };

// export const createSubscription = async (subInfo) => {
//     const user = await requireAuth();
//     if (!user) return { success: false, error: 'Unauthorized' };
//     return serverMutation('/api/billing/subscriptions', {
//         ...subInfo,
//         email: user.email,
//         userId: user.id,
//         userRole: user.role,
//     });
// };

// export const upgradeSubscription = async (planId) => {
//     const user = await requireAuth();
//     if (!user) return { success: false, error: 'Unauthorized' };
//     return serverMutation('/api/billing/upgrade', {
//         email: user.email,
//         planId,
//         userRole: user.role,
//     });
// };

// export const addPaymentMethod = async (paymentData) => {
//     const user = await requireAuth();
//     if (!user) return { success: false, error: 'Unauthorized' };
//     return serverMutation('/api/billing/payment-methods', {
//         email: user.email,
//         ...paymentData,
//         userRole: user.role,
//     });
// };
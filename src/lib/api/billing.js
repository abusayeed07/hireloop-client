// src/lib/api/billing.js
import { serverFetch, serverMutation } from "../core/server";

export const getSubscription = async () => {
    return serverFetch(`/api/billing/subscription`);
};

export const getBillingHistory = async () => {
    const result = await serverFetch(`/api/billing/history`);
    return Array.isArray(result) ? result : [];
};

export const getPaymentMethods = async () => {
    const result = await serverFetch(`/api/billing/payment-methods`);
    return Array.isArray(result) ? result : [];
};

export const cancelSubscription = async () => {
    return serverMutation('/api/billing/cancel', {});
};

export const upgradeSubscription = async (planId) => {
    return serverMutation('/api/billing/upgrade', { planId });
};

export const addPaymentMethod = async (paymentData) => {
    return serverMutation('/api/billing/payment-methods', paymentData);
};


// ==========================================
// ✅ ADMIN API HELPERS
// ==========================================

export const getAdminTransactions = async () => {
    try {
        const data = await serverFetch('/api/billing/admin/transactions');
        if (data === null) return [];
        if (data && data.success && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    } catch (error) {
        console.error('❌ getAdminTransactions error:', error);
        return [];
    }
};

export const getAdminStats = async () => {
    try {
        const data = await serverFetch('/api/billing/admin/stats');
        if (data === null) return {};
        return data?.data || {};
    } catch (error) {
        console.error('❌ getAdminStats error:', error);
        return {};
    }
};
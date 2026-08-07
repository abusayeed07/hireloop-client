// frontend/src/lib/api/admin.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// ✅ Get all users (Admin only)
export const getUsers = async (page = 1, limit = 50, search = '', role = '', status = '') => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (status) params.append('status', status);

        const response = await fetch(`${API_BASE_URL}/api/users/admin/users?${params}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// ✅ Update user (Admin only)
export const updateUser = async (userId, action) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/admin/users/${userId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// ✅ Delete user (Admin only)
export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// ✅ Get user stats (Admin only)
export const getUserStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/admin/stats`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
};

// ✅ Get single user (Admin only)
export const getUserById = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/admin/users/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};
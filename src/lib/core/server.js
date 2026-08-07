// src/lib/core/server.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const serverFetch = async (path, options = {}) => {
    try {
        const url = `${API_BASE_URL}${path}`;
        console.log('🔍 Fetching:', url);

        const headers = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...options.headers, 
        };
        
        const res = await fetch(url, {
            ...options,
            headers: headers,
            credentials: 'include',
        });
        
        console.log(`📊 Response status: ${res.status} for ${path}`);
        
        // ✅ Handle 401/403 by returning a clean error object
        if (res.status === 401 || res.status === 403) {
            return { success: false, error: 'Unauthorized' };
        }
        
        if (!res.ok) {
            console.error(`❌ API Error: ${res.status} ${res.statusText}`);
            // ✅ Handle 400 specifically by extracting the error message
            try {
                const errorData = await res.json();
                return { success: false, error: errorData.error || errorData.message || `API returned ${res.status}` };
            } catch {
                return { success: false, error: `API returned ${res.status}` };
            }
        }
        
        const text = await res.text();
        if (!text || text.trim() === '') {
            return {};
        }
        
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', text.substring(0, 200));
            return { success: false, error: 'Invalid JSON response from server' };
        }
    } catch (error) {
        console.error('❌ serverFetch error:', error);
        return { success: false, error: error.message || 'Network error - Cannot connect to server' };
    }
};

export const serverMutation = async (path, data = {}, method = 'POST', extraOptions = {}) => {
    return serverFetch(path, {
        method: method,
        body: JSON.stringify(data),
        ...extraOptions,
    });
};
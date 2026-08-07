// src/lib/actions/admin.js
import { requireAdmin } from "../core/auth";

export const deleteUser = async (userId) => {
    // ✅ Only admins can delete users
    const user = await requireAdmin();
    if (!user) return { success: false, error: 'Unauthorized' };
    
    return serverMutation('/api/admin/users/delete', { userId });
};
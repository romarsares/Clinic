/**
 * User Preferences Controller
 * 
 * Author: AI Assistant
 * Created: 2025-01-20
 * Purpose: Handles user preference management for personalization
 */

const db = require('../config/database');
const AuditService = require('../services/AuditService');

class UserPreferencesController {
    /**
     * Get user preferences
     * GET /api/v1/users/:userId/preferences
     */
    async getUserPreferences(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const clinicId = req.user.clinic_id;

            // Check if user can access these preferences
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied - can only view own preferences'
                });
            }

            const query = `
                SELECT preference_key, preference_value 
                FROM user_preferences 
                WHERE user_id = ? AND clinic_id = ?
            `;

            const [preferences] = await db.execute(query, [userId, clinicId]);

            // Convert to key-value object
            const preferencesObj = {};
            preferences.forEach(pref => {
                preferencesObj[pref.preference_key] = pref.preference_value;
            });

            res.json({
                success: true,
                data: preferencesObj
            });

        } catch (error) {
            console.error('Error fetching user preferences:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch preferences',
                error: error.message
            });
        }
    }

    /**
     * Update user preferences
     * PUT /api/v1/users/:userId/preferences
     */
    async updateUserPreferences(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const clinicId = req.user.clinic_id;
            const preferences = req.body;

            // Check if user can update these preferences
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied - can only update own preferences'
                });
            }

            // Validate user exists
            const [users] = await db.execute(
                'SELECT id FROM auth_users WHERE id = ? AND clinic_id = ?',
                [userId, clinicId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update each preference
            for (const [key, value] of Object.entries(preferences)) {
                await db.execute(`
                    INSERT INTO user_preferences (user_id, clinic_id, preference_key, preference_value, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE 
                    preference_value = VALUES(preference_value),
                    updated_at = NOW()
                `, [userId, clinicId, key, value]);
            }

            // Log preference update
            await AuditService.logAction({
                clinic_id: clinicId,
                user_id: req.user.id,
                action: 'user_preferences_update',
                entity: 'user_preferences',
                entity_id: userId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                new_value: preferences
            });

            res.json({
                success: true,
                message: 'Preferences updated successfully'
            });

        } catch (error) {
            console.error('Error updating user preferences:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update preferences',
                error: error.message
            });
        }
    }

    /**
     * Get specific preference
     * GET /api/v1/users/:userId/preferences/:key
     */
    async getPreference(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const preferenceKey = req.params.key;
            const clinicId = req.user.clinic_id;

            // Check access
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const query = `
                SELECT preference_value 
                FROM user_preferences 
                WHERE user_id = ? AND clinic_id = ? AND preference_key = ?
            `;

            const [preferences] = await db.execute(query, [userId, clinicId, preferenceKey]);

            if (preferences.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Preference not found'
                });
            }

            res.json({
                success: true,
                data: {
                    key: preferenceKey,
                    value: preferences[0].preference_value
                }
            });

        } catch (error) {
            console.error('Error fetching preference:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch preference',
                error: error.message
            });
        }
    }

    /**
     * Set specific preference
     * PUT /api/v1/users/:userId/preferences/:key
     */
    async setPreference(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const preferenceKey = req.params.key;
            const { value } = req.body;
            const clinicId = req.user.clinic_id;

            // Check access
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await db.execute(`
                INSERT INTO user_preferences (user_id, clinic_id, preference_key, preference_value, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                preference_value = VALUES(preference_value),
                updated_at = NOW()
            `, [userId, clinicId, preferenceKey, value]);

            res.json({
                success: true,
                message: 'Preference updated successfully'
            });

        } catch (error) {
            console.error('Error setting preference:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to set preference',
                error: error.message
            });
        }
    }

    /**
     * Delete specific preference
     * DELETE /api/v1/users/:userId/preferences/:key
     */
    async deletePreference(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const preferenceKey = req.params.key;
            const clinicId = req.user.clinic_id;

            // Check access
            if (userId !== req.user.id && !req.user.roles.includes('Owner') && !req.user.roles.includes('Admin')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await db.execute(
                'DELETE FROM user_preferences WHERE user_id = ? AND clinic_id = ? AND preference_key = ?',
                [userId, clinicId, preferenceKey]
            );

            res.json({
                success: true,
                message: 'Preference deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting preference:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete preference',
                error: error.message
            });
        }
    }
}

module.exports = new UserPreferencesController();
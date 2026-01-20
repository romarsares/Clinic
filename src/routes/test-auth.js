const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Simple login test endpoint
router.post('/test-login', async (req, res) => {
    try {
        console.log('Test login attempt:', req.body);
        
        const { email, password } = req.body;
        
        // Get user
        const [users] = await db.execute(
            'SELECT id, clinic_id, email, password_hash, full_name FROM auth_users WHERE email = ?',
            [email]
        );
        
        console.log('Users found:', users.length);
        
        if (!users.length) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const user = users[0];
        console.log('User:', { id: user.id, email: user.email });
        
        // Check password
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', isValid);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, clinicId: user.clinic_id },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                clinic_id: user.clinic_id,
                email: user.email,
                full_name: user.full_name
            }
        });
        
    } catch (error) {
        console.error('Test login error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
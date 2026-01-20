const express = require('express');
const path = require('path');
const router = express.Router();

// Settings page
router.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/views/settings.html'));
});

module.exports = router;
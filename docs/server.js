const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Placeholder for future logging service
const logger = {
  info: console.log,
  error: console.error,
};

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Routes ---
// TODO: Import route handlers from dedicated files
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// --- Server Start ---
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info('Phase 1: Core Foundation implementation has begun.');
});

module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/api/auth-service/health', (req, res) => {
    res.status(200).json({ status: 'Authentication Service is running' });
});

// Token verification endpoint
app.post('/api/auth-service/verify', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        res.status(200).json({
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            valid: false,
            error: 'Invalid or expired token'
        });
    }
});

// Token refresh endpoint
app.post('/api/auth-service/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');

        const newToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email, role: decoded.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: newToken
        });
    } catch (error) {
        res.status(401).json({
            error: 'Invalid refresh token'
        });
    }
});

// Logout endpoint (logging service)
app.post('/api/auth-service/logout', (req, res) => {
    try {
        const { userId, email } = req.body;

        // Log logout activity (can extend to save to database)
        console.log(`User logged out: ${email} (${userId})`);

        res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login log endpoint
app.post('/api/auth-service/log-login', (req, res) => {
    try {
        const { userId, email, timestamp } = req.body;

        // Log login activity
        console.log(`User logged in: ${email} (${userId}) at ${timestamp}`);

        res.status(200).json({
            message: 'Login logged successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`\n🔐 Authentication Service running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;

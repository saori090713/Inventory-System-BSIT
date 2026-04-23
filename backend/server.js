require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// MySQL Connection
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const categoryRoutes = require('./routes/category');
const unitRoutes = require('./routes/unit');
const userRoutes = require('./routes/user');

// Initialize Express app
const app = express();

// Connect to database completely
db.checkConnection();
db.sequelize.sync({ force: false }).then(() => {
    console.log('✓ Synchronized database successfully.');
    console.log('[DATABASE] Syncing complete. Tables created/updated.');
    // Seed default data (admin user)
    db.seedDefaultData();
}).catch(err => {
    console.error('✗ Database sync error:', err.message);
    console.error('[DATABASE] Full error:', err);
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allowed for manager instantiation scripts
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // Allowed for embedded <style> blocks and FA
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Backend API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/users', userRoutes);

const path = require('path');

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Automatically redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/pages/login.html');
});

// Convenience routes for main pages
const pages = ['login.html', 'dashboard.html', 'products.html', 'categories.html', 'units.html', 'users.html'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/pages', page));
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API Route not found' });
});

// 404 fallback for frontend - redirect to login
app.use((req, res) => {
    if (req.accepts('html')) {
        res.redirect('/pages/login.html');
        return;
    }
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '127.0.0.1', () => {
    console.log(`\n🚀 Backend API Server running on http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;

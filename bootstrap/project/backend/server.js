require('dotenv').config();
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
app.use(helmet());
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Backend API Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;

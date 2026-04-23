const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
    try {
        const { username, password, firstName, lastName } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            console.log(`[AUTH] Registration failed - Username already taken: ${username}`);
            return res.status(400).json({ error: 'Username already registered' });
        }

        // Create new user
        const user = await User.create({
            username,
            password,
            firstName: firstName || '',
            lastName: lastName || '',
            role: 'user' // Always assign user role on registration
        });

        console.log(`[AUTH] New user registered: ${username} (ID: ${user.id})`);

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('[AUTH] Registration error:', error.message);
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Find user and include password field using withPassword scope
        const user = await User.scope('withPassword').findOne({ where: { username } });

        if (!user) {
            console.log(`[AUTH] Login attempt failed - User not found: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            console.log(`[AUTH] Login attempt failed - Invalid password for user: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isActive) {
            console.log(`[AUTH] Login attempt failed - Account inactive: ${username}`);
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log(`[AUTH] Successful login: ${username}`);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('[AUTH] Login error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Public endpoint - get all active users (for login page display)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { isActive: true },
            attributes: ['id', 'username', 'firstName', 'lastName', 'role'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            users: users.map(u => ({
                id: u.id,
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role
            }))
        });
    } catch (error) {
        console.error('[AUTH] Error fetching users:', error.message);
        res.status(500).json({ error: error.message });
    }
};

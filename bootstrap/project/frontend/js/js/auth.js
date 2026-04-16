// ===== AUTH.JS - Authentication Management =====

class AuthService {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'current_user';
        this.loginUrl = '#'; // API endpoint would go here
    }

    // Login user
    async login(username, password) {
        try {
            // Validate input
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Get existing users
            let users = JSON.parse(localStorage.getItem('all_users')) || [
                { id: 1, username: 'admin', password: 'admin123', email: '', role: 'admin', createdAt: new Date().toISOString() }
            ];

            // Find user
            const foundUser = users.find(u => u.username === username && u.password === password);
            
            if (foundUser) {
                // Create user object without password
                const user = {
                    id: foundUser.id,
                    username: foundUser.username,
                    role: foundUser.role,
                    email: foundUser.email,
                    loginTime: new Date().toISOString()
                };

                const token = 'token_' + Date.now();

                // Store token and user
                localStorage.setItem(this.tokenKey, token);
                localStorage.setItem(this.userKey, JSON.stringify(user));

                console.log('✓ Login successful:', username);
                return { success: true, user };
            } else {
                throw new Error('Invalid username or password');
            }
        } catch (error) {
            console.error('✗ Login failed:', error.message);
            throw error;
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = 'login.html';
        console.log('✓ Logged out');
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(this.tokenKey);
    }

    // Get current user
    getCurrentUser() {
        const userJson = localStorage.getItem(this.userKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    // Get auth token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Check if user has admin role
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    // Register new user
    async register(username, password, email = '') {
        try {
            // Validate input
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Get existing users
            let users = JSON.parse(localStorage.getItem('all_users')) || [
                { id: 1, username: 'admin', password: 'admin123', email: '', role: 'admin', createdAt: new Date().toISOString() }
            ];

            // Check if username already exists
            if (users.find(u => u.username === username)) {
                throw new Error('Username already exists. Please choose another.');
            }

            // Create new user
            const newUser = {
                id: users.length + 1,
                username: username,
                password: password,
                email: email,
                role: 'user',
                createdAt: new Date().toISOString()
            };

            // Save user
            users.push(newUser);
            localStorage.setItem('all_users', JSON.stringify(users));

            // Auto-login after registration
            const token = 'token_' + Date.now();
            localStorage.setItem(this.tokenKey, token);
            const loggedInUser = { ...newUser };
            delete loggedInUser.password;
            localStorage.setItem(this.userKey, JSON.stringify(loggedInUser));

            console.log('✓ Account created and logged in:', username);
            return { success: true, user: loggedInUser };
        } catch (error) {
            console.error('✗ Registration failed:', error.message);
            throw error;
        }
    }

    // Verify session
    verifySession() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Create global auth service
const auth = new AuthService();

// Auto-check session on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.pageType !== 'login' && document.body.dataset.pageType !== 'index') {
        if (!auth.verifySession()) {
            console.log('Session expired, redirecting to login...');
        }
    }
});

console.log('✓ Auth service loaded');

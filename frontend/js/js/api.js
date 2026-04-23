// ===== API.JS - Backend API Service =====



class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = 5000;
    }

    // Helper: Get auth headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        };
    }

    // Helper: Make API request
    async request(method, endpoint, data = null) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method: method,
                headers: this.getHeaders()
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);

            // Handle 401 - unauthorized
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[API] Error on ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // ===== AUTH API =====

    async login(username, password) {
        return this.request('POST', '/auth/login', { username, password });
    }

    async register(username, password, firstName, lastName) {
        return this.request('POST', '/auth/register', {
            username,
            password,
            firstName: firstName || '',
            lastName: lastName || ''
        });
    }

    async verifyToken() {
        return this.request('GET', '/auth/verify');
    }

    // ===== INVENTORY API =====

    async getInventory(page = 1, limit = 10, search = '', category = '', status = '') {
        let endpoint = `/inventory?page=${page}&limit=${limit}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (category) endpoint += `&category=${category}`;
        if (status) endpoint += `&status=${status}`;

        return this.request('GET', endpoint);
    }

    async getInventoryItem(id) {
        return this.request('GET', `/inventory/${id}`);
    }

    async getInventoryById(id) {
        return this.getInventoryItem(id);
    }

    async createInventoryItem(data) {
        return this.request('POST', '/inventory', data);
    }

    async updateInventoryItem(id, data) {
        return this.request('PUT', `/inventory/${id}`, data);
    }

    async deleteInventoryItem(id) {
        return this.request('DELETE', `/inventory/${id}`);
    }

    async deleteInventory(id) {
        return this.deleteInventoryItem(id);
    }

    async getLowStockItems() {
        return this.request('GET', '/inventory/low-stock');
    }

    async getInventoryStats() {
        return this.request('GET', '/inventory/stats');
    }

    // ===== CATEGORIES API =====

    async getCategories() {
        return this.request('GET', '/categories');
    }

    async getCategory(id) {
        return this.request('GET', `/categories/${id}`);
    }

    async createCategory(data) {
        return this.request('POST', '/categories', data);
    }

    async updateCategory(id, data) {
        return this.request('PUT', `/categories/${id}`, data);
    }

    async deleteCategory(id) {
        return this.request('DELETE', `/categories/${id}`);
    }

    // ===== UNITS API =====

    async getUnits() {
        return this.request('GET', '/units');
    }

    async getUnit(id) {
        return this.request('GET', `/units/${id}`);
    }

    async createUnit(data) {
        return this.request('POST', '/units', data);
    }

    async updateUnit(id, data) {
        return this.request('PUT', `/units/${id}`, data);
    }

    async deleteUnit(id) {
        return this.request('DELETE', `/units/${id}`);
    }

    // ===== USERS API =====

    async getUsers() {
        return this.request('GET', '/users');
    }

    async getUser(id) {
        return this.request('GET', `/users/${id}`);
    }

    async updateUserRole(id, role) {
        return this.request('PUT', `/users/${id}/role`, { role });
    }

    async toggleUserStatus(id) {
        return this.request('PUT', `/users/${id}/toggle-status`);
    }

    async deleteUser(id) {
        return this.request('DELETE', `/users/${id}`);
    }
}

// Instantiate and expose globally window.apiService for clients that expect it (like login.js, etc).
window.apiService = new APIService();

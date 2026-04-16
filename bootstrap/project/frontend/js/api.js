// Frontend API service
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.token = sessionStorage.getItem('authToken');
    }

    updateToken() {
        this.token = sessionStorage.getItem('authToken');
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` })
        };
    }

    async request(endpoint, options = {}) {
        try {
            console.log(`[API] Fetching: ${API_BASE_URL}${endpoint}`);
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: this.getHeaders(),
                ...options
            });

            // Try to parse JSON response first
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = null;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    sessionStorage.removeItem('authToken');
                    sessionStorage.removeItem('user');
                    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
                    window.location.href = basePath + 'pages/login.html';
                    throw new Error(responseData?.error || 'Unauthorized');
                }
                
                if (response.status === 403) {
                    throw new Error(responseData?.error || 'Access denied: admin permissions required');
                }

                // Throw with specific error message from server
                const errorMsg = responseData?.error || `API Error: ${response.status}`;
                throw new Error(errorMsg);
            }

            console.log(`[API] ✓ Success: ${endpoint}`);
            return responseData;
        } catch (error) {
            console.error(`[API] ✗ Error for ${endpoint}:`, error);
            
            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                const msg = `Cannot connect to backend at ${API_BASE_URL}. Is the server running on port 5000?`;
                console.error(`[API] ${msg}`);
                throw new Error(msg);
            }
            
            throw error;
        }
    }

    // Auth endpoints
    async register(username, password, firstName, lastName) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, firstName, lastName })
        });
    }

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async verifyToken() {
        return this.request('/auth/verify', { method: 'GET' });
    }

    async getAllUsers() {
        return this.request('/auth/users/list', { method: 'GET' });
    }

    // Inventory endpoints
    async getInventory(page = 1, limit = 10, search = '', category = '', status = '') {
        const params = new URLSearchParams({
            page,
            limit,
            ...(search && { search }),
            ...(category && { category }),
            ...(status && { status })
        });

        return this.request(`/inventory?${params}`, { method: 'GET' });
    }

    async getInventoryStats() {
        return this.request('/inventory/stats', { method: 'GET' });
    }

    async getLowStockItems() {
        return this.request('/inventory/low-stock', { method: 'GET' });
    }

    async getInventoryById(id) {
        return this.request(`/inventory/${id}`, { method: 'GET' });
    }

    async createInventory(data) {
        return this.request('/inventory', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateInventory(id, data) {
        return this.request(`/inventory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteInventory(id) {
        return this.request(`/inventory/${id}`, { method: 'DELETE' });
    }

    // Category endpoints
    async getCategories() {
        return this.request('/categories', { method: 'GET' });
    }

    // Unit endpoints
    async getUnits() {
        return this.request('/units', { method: 'GET' });
    }

    // User endpoints
    async getUsers() {
        return this.request('/users', { method: 'GET' });
    }

    async updateUserRole(userId, role) {
        return this.request(`/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async toggleUserStatus(userId) {
        return this.request(`/users/${userId}/toggle-status`, { method: 'PUT' });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, { method: 'DELETE' });
    }
}

const apiService = new ApiService();

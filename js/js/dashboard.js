// ===== DASHBOARD.JS - Dashboard Page Logic =====



class DashboardManager {
    constructor() {
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.checkAuth()) {
            window.location.href = 'login.html';
            return;
        }

        // Display user info
        this.displayUserInfo();

        // Load dashboard data
        await this.loadStats();
        await this.loadLowStockItems();
        await this.loadRecentProducts();
        await this.checkAPIStatus();

        // Set up event listeners
        this.setupEventListeners();

        // Refresh data every 5 minutes
        setInterval(() => this.loadStats(), 300000);
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return false;
        }
        return true;
    }

    displayUserInfo() {
        // Handled globally by main.js to prevent UI consistency bugs and "random spaces"
    }

    async loadStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load stats');

            const stats = await response.json();
            
            document.getElementById('totalProducts').textContent = stats.totalItems || 0;
            document.getElementById('lowStockCount').textContent = stats.lowStockItems || 0;
            document.getElementById('outOfStockCount').textContent = stats.outOfStockItems || 0;
            document.getElementById('inStockCount').textContent = (stats.totalItems - stats.lowStockItems - stats.outOfStockItems) || 0;

            console.log('✓ Stats loaded');
        } catch (error) {
            console.error('✗ Error loading stats:', error);
            UIHelper.showAlert('Error loading statistics', 'danger');
        }
    }

    async loadLowStockItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/low-stock`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load low stock items');

            const items = await response.json();
            
            const container = document.getElementById('lowStockContainer');
            
            if (!items || items.length === 0) {
                container.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> All items are well-stocked!</div>';
                return;
            }

            let html = '<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Product</th><th>Category</th><th>Quantity</th><th>Threshold</th></tr></thead><tbody>';
            
            items.forEach(item => {
                const statusBadge = item.status === 'out of stock' ? 
                    '<span class="badge bg-danger">Out of Stock</span>' :
                    '<span class="badge bg-warning">Low Stock</span>';
                
                html += `<tr>
                    <td>${item.name}</td>
                    <td>${item.category?.name || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.lowStockThreshold}</td>
                </tr>`;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
            console.log(`✓ Loaded ${items.length} low stock items`);
        } catch (error) {
            console.error('✗ Error loading low stock items:', error);
            document.getElementById('lowStockContainer').innerHTML = 
                '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Error loading low stock items</div>';
        }
    }

    async loadRecentProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory?limit=5`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load recent products');

            const data = await response.json();
            const items = data.items || [];
            
            const tbody = document.getElementById('recentProductsTable');
            
            if (!items || items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No products found</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            items.forEach(item => {
                const statusBadge = this.getStatusBadge(item.status);
                const createdDate = UIHelper.formatDate(item.createdAt);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${item.name}</strong></td>
                    <td>${item.category?.name || 'N/A'}</td>
                    <td>${item.quantity} ${item.unit?.abbreviation || ''}</td>
                    <td>${UIHelper.formatCurrency(item.price)}</td>
                    <td><small>${createdDate}</small></td>
                `;
                tbody.appendChild(row);
            });

            console.log(`✓ Loaded ${items.length} recent products`);
        } catch (error) {
            console.error('✗ Error loading recent products:', error);
            document.getElementById('recentProductsTable').innerHTML = 
                '<tr><td colspan="6" class="text-center text-danger py-4"><i class="fas fa-exclamation-circle"></i> Error loading products</td></tr>';
        }
    }

    async checkAPIStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                document.getElementById('apiStatus').textContent = 'Online';
                document.getElementById('apiStatus').className = 'badge bg-success';
            }
        } catch (error) {
            document.getElementById('apiStatus').textContent = 'Offline';
            document.getElementById('apiStatus').className = 'badge bg-danger';
        }

        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    getStatusBadge(status) {
        const badges = {
            'in stock': '<span class="badge bg-success">In Stock</span>',
            'low stock': '<span class="badge bg-warning">Low Stock</span>',
            'out of stock': '<span class="badge bg-danger">Out of Stock</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    }

    setupEventListeners() {
        // Event listeners can be added here if needed in the future
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

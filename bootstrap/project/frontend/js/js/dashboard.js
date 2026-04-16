// ===== DASHBOARD.JS - Dashboard Page Logic =====

class DashboardManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadStatistics();
        await this.loadRecentActivity();
        this.initCharts();
        this.setupRefresh();
    }

    // Load dashboard statistics
    async loadStatistics() {
        try {
            console.log('[Dashboard] Loading statistics...');
            const stats = await apiService.getInventoryStats();

            // Update stat cards
            this.updateStatCard('total-items', stats.totalItems || 0);
            this.updateStatCard('low-stock', stats.lowStockItems || 0);
            this.updateStatCard('out-of-stock', stats.outOfStockItems || 0);

            // Update charts
            this.updateCharts(stats);

            console.log('✓ Statistics loaded:', stats);
        } catch (error) {
            console.error('✗ Error loading statistics:', error);
        }
    }

    // Update single stat card
    updateStatCard(cardId, value) {
        const card = document.getElementById(cardId);
        if (card) {
            card.textContent = value;
        }
    }

    // Initialize charts
    initCharts() {
        try {
            // Destroy existing charts before creating new ones
            if (this.charts.stockStatus) {
                this.charts.stockStatus.destroy();
            }
            if (this.charts.inventory) {
                this.charts.inventory.destroy();
            }

            // Stock Status Pie Chart
            const ctxPie = document.getElementById('stockStatusChart');
            if (ctxPie) {
                this.charts.stockStatus = new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#4facfe', '#f5576c', '#ff6b6b'],
                            borderColor: ['#fff', '#fff', '#fff'],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            // Inventory Bar Chart
            const ctxBar = document.getElementById('inventoryChart');
            if (ctxBar) {
                this.charts.inventory = new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: ['Total', 'Low Stock', 'Out of Stock'],
                        datasets: [{
                            label: 'Item Count',
                            data: [0, 0, 0],
                            backgroundColor: ['#667eea', '#f093fb', '#4facfe'],
                            borderRadius: 5,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }

            console.log('✓ Charts initialized');
        } catch (error) {
            console.error('✗ Error initializing charts:', error);
        }
    }

    // Update chart data
    updateCharts(stats) {
        try {
            const total = stats.totalItems || 0;
            const inStock = total - (stats.lowStockItems || 0) - (stats.outOfStockItems || 0);

            // Update pie chart
            if (this.charts.stockStatus) {
                this.charts.stockStatus.data.datasets[0].data = [
                    inStock,
                    stats.lowStockItems || 0,
                    stats.outOfStockItems || 0
                ];
                this.charts.stockStatus.update();
            }

            // Update bar chart
            if (this.charts.inventory) {
                this.charts.inventory.data.datasets[0].data = [
                    total,
                    stats.lowStockItems || 0,
                    stats.outOfStockItems || 0
                ];
                this.charts.inventory.update();
            }
        } catch (error) {
            console.error('✗ Error updating charts:', error);
        }
    }

    // Load recent activity
    async loadRecentActivity() {
        try {
            console.log('[Dashboard] Loading recent activity...');
            const result = await apiService.getInventory(1, 5);
            const items = result.items || [];
            const activityTbody = document.querySelector('#activityTable tbody');

            if (!activityTbody) return;

            if (items.length === 0) {
                activityTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No recent activity</td></tr>';
                return;
            }

            // Show last items as recent activity
            activityTbody.innerHTML = items.reverse().map(item => `
                <tr>
                    <td><strong>${item.name || 'N/A'}</strong></td>
                    <td>${item.quantity || 0} ${item.unit?.name || ''}</td>
                    <td>
                        <span class="badge ${
                            item.quantity === 0 ? 'bg-danger' :
                            item.quantity < (item.lowStockThreshold || 5) ? 'bg-warning' :
                            'bg-success'
                        }">
                            ${item.quantity === 0 ? 'Out of Stock' :
                              item.quantity < (item.lowStockThreshold || 5) ? 'Low Stock' :
                              'In Stock'}
                        </span>
                    </td>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('');

            console.log('✓ Recent activity loaded');
        } catch (error) {
            console.error('✗ Error loading activity:', error);
        }
    }

    // Setup auto-refresh
    setupRefresh() {
        // Refresh statistics every 30 seconds
        setInterval(() => {
            this.loadStatistics();
            this.loadRecentActivity();
        }, 30000);

        // Listen for data changes from other pages
        window.addEventListener('dataChanged', (event) => {
            console.log('[Dashboard] Data changed event received:', event.detail);
            this.refreshDashboard();
        });
    }

    // Public method to refresh dashboard immediately
    async refreshDashboard() {
        console.log('[Dashboard] Refreshing dashboard...');
        await this.loadStatistics();
        await this.loadRecentActivity();
        console.log('✓ Dashboard refreshed');
    }
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.pageType === 'dashboard') {
        window.dashboardManager = new DashboardManager();
    }
});

console.log('✓ Dashboard script loaded');

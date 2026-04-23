// ===== MAIN.JS - Common Utilities & UI Functions =====
const API_BASE_URL = 'http://127.0.0.1:5000/api';

window.isAdmin = function () {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.role === 'admin';
    } catch {
        return false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
    // ✅ FIX: Display logged-in user name and role in sidebar
    const userSpan = document.getElementById('userName');
    const roleSpan = document.getElementById('userRole');
    
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const role = (user.role || 'user').trim();
        
        if (userSpan) {
            const displayName = (user.username || user.firstName || 'User').trim();
            userSpan.innerHTML = `<i class="fas fa-user-circle me-2"></i>${displayName}`;
        }
        
        if (roleSpan) {
            roleSpan.textContent = role.toUpperCase();
            roleSpan.className = `badge ${role === 'admin' ? 'bg-danger' : 'bg-light text-success'}`;
        }

        // Auto-hide elements marked as data-require-admin if user is not admin
        if (role !== 'admin') {
            document.querySelectorAll('[data-require-admin]').forEach(el => {
                el.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Failed to parse user info', error);
    }
});

class UIHelper {
    // Show alert message
    static showAlert(message, type = 'success', duration = 3000, containerId = 'alertContainer') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const alertContainer = document.getElementById(containerId) || document.body;
        alertContainer.insertBefore(alertDiv, alertContainer.firstChild);

        if (duration) {
            setTimeout(() => {
                alertDiv.remove();
            }, duration);
        }

        return alertDiv;
    }

    // Show loading state
    static showLoading(buttonElement) {
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
            `;
        }
    }

    // Hide loading state
    static hideLoading(buttonElement, originalText) {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
        }
    }

    // Format date
    static formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Format currency
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Confirm delete
    static confirmDelete(itemName) {
        return confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`);
    }

    // Validate form
    static validateForm(formElement, event = null) {
        if (!formElement.checkValidity()) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            formElement.classList.add('was-validated');
            return false;
        }
        return true;
    }

    // Clear form
    static clearForm(formElement) {
        formElement.reset();
        formElement.classList.remove('was-validated');
    }

    // Get form data
    static getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    // Close modal
    static closeModal(modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }

    // Show modal
    static showModal(modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    // Disable buttons
    static disableButtons(selector, disabled = true) {
        document.querySelectorAll(selector).forEach(button => {
            button.disabled = disabled;
        });
    }

    // Show/hide element
    static toggleElement(selector, show = true) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    // Clear table
    static clearTable(tableBodySelector) {
        const tbody = document.querySelector(tableBodySelector);
        if (tbody) {
            tbody.innerHTML = '';
        }
    }

    // Add table row
    static addTableRow(tableBodySelector, rowHTML) {
        const tbody = document.querySelector(tableBodySelector);
        if (tbody) {
            const row = document.createElement('tr');
            row.innerHTML = rowHTML;
            tbody.appendChild(row);
        }
    }

    // Show empty state
    static showEmptyState(tableBodySelector, message = 'No data found') {
        this.clearTable(tableBodySelector);
        const tbody = document.querySelector(tableBodySelector);
        if (tbody) {
            const row = document.createElement('tr');
            const colCount = (tbody.closest('table')?.querySelectorAll('th').length || 5);
            row.innerHTML = `
                <td colspan="${colCount}" class="text-center text-muted py-4">
                    ${message}
                </td>
            `;
            tbody.appendChild(row);
        }
    }
}

class DataManager {
    // Search items
    static searchItems(items, query, searchFields = ['name']) {
        if (!query) return items;

        return items.filter(item => {
            return searchFields.some(field => {
                const fieldValue = item[field]?.toString().toLowerCase() || '';
                return fieldValue.includes(query.toLowerCase());
            });
        });
    }

    // Sort items
    static sortItems(items, sortBy, order = 'asc') {
        const sorted = [...items];
        sorted.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }

    // Get category name by ID
    static async getCategoryName(id) {
        try {
            const categories = await window.apiService.getCategories();
            const category = categories.find(c => c.id === parseInt(id));
            return category ? category.name : 'Unknown';
        } catch (err) {
            return 'Unknown';
        }
    }

    // Get unit name by ID
    static async getUnitName(id) {
        try {
            const units = await window.apiService.getUnits();
            const unit = units.find(u => u.id === parseInt(id));
            return unit ? unit.name : 'Unknown';
        } catch (err) {
            return 'Unknown';
        }
    }

    // Get stock status
    static getStockStatus(quantity) {
        if (quantity === 0) return 'Out of Stock';
        if (quantity < 10) return 'Low Stock';
        return 'In Stock';
    }

    // Get status badge class
    static getStatusBadgeClass(quantity) {
        if (quantity === 0) return 'badge bg-danger';
        if (quantity < 10) return 'badge bg-warning';
        return 'badge bg-light text-dark';
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

// Prevent form submission by default
document.addEventListener('submit', (e) => {
    if (e.target.dataset.noDefault) return;
    // Forms will handle their own submission
});

console.log('✓ Main utilities loaded');

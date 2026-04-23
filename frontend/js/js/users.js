class UsersManager {
    constructor() {
        this.users = [];
        this.api = window.apiService || new APIService(); // fallback if api.js did not instantiate
        this.setupEventListeners();
        this.loadUsers();
    }

    setupEventListeners() {
        // Search listener
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Modal save button listener
        const saveBtn = document.querySelector('#userModal .btn-success');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveUserRole());
        }
    }

    async loadUsers() {
        try {
            const response = await this.api.getUsers();
            // Backend returns array directly: [ {username, ...}, ... ]
            this.users = Array.isArray(response) ? response : (response.users || []);
            this.renderUsers(this.users);
        } catch (error) {
            UIHelper.showAlert(error.message || 'Failed to load users', 'danger');
            this.renderUsers([]);
        }
    }

    renderUsers(usersList) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (usersList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No users found</td></tr>';
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        tbody.innerHTML = usersList.map(user => {
            const isMe = user.username === currentUser.username;
            const currentBadgeClass = user.role === 'admin' ? 'bg-danger' : 'bg-info';
            
            // Logged account (Me) is Active (Green), others are Inactive (Orange)
            const statusBadgeClass = isMe ? 'bg-success' : 'bg-warning';
            const statusText = isMe ? 'Active' : 'Inactive';
            const statusIcon = isMe ? 'fa-check-circle' : 'fa-times-circle';
            
            return `
                <tr class="${isMe ? 'table-primary-light' : ''}">
                    <td>
                        <strong>${user.username}</strong>
                        ${isMe ? '<span class="ms-2 badge rounded-pill bg-primary" style="font-size: 0.65rem;">YOU</span>' : ''}
                    </td>
                    <td>${user.firstName || ''} ${user.lastName || ''}</td>
                    <td>
                        <span class="badge ${currentBadgeClass}" style="padding: 0.5em 1em; font-size: 0.85rem;">
                            ${(user.role || 'user').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${statusBadgeClass} text-dark shadow-sm" 
                              style="padding: 0.6em 1.2em; font-size: 0.85rem; min-width: 110px;">
                            <i class="fas ${statusIcon} me-1 ${isMe ? 'fa-pulse' : ''}"></i>
                            ${statusText}
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-user-btn" data-id="${user.id}" data-role="${user.role}" title="Change Role">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isMe ? `
                        <button class="btn btn-sm btn-outline-danger delete-user-btn" data-id="${user.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : '<span class="text-muted small px-2">N/A</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        // Bind events
        tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const role = e.currentTarget.getAttribute('data-role');
                this.editUser(id, role);
            });
        });
        tbody.querySelectorAll('.toggle-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.toggleStatus(id);
            });
        });
        tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.deleteUser(id);
            });
        });
    }

    handleSearch(query) {
        const filtered = this.users.filter(u => 
            (u.username || '').toLowerCase().includes(query.toLowerCase()) || 
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase())
        );
        this.renderUsers(filtered);
    }

    editUser(id, currentRole) {
        document.getElementById('userId').value = id;
        document.getElementById('userRoleSelect').value = currentRole;
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }

    async saveUserRole() {
        const id = document.getElementById('userId').value;
        const role = document.getElementById('userRoleSelect').value;
        
        try {
            await this.api.updateUserRole(id, role);
            UIHelper.showAlert('User role updated successfully', 'success');
            const modalEl = document.getElementById('userModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            this.loadUsers();
        } catch (error) {
            UIHelper.showAlert(error.message || 'Error updating user role', 'danger');
        }
    }

    async toggleStatus(id) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userToToggle = this.users.find(u => u.id == id);
        
        if (userToToggle && userToToggle.username === currentUser.username) {
            UIHelper.showAlert('You cannot deactivate your own account', 'warning');
            return;
        }

        if (!confirm(`Are you sure you want to toggle the status of "${userToToggle?.username || 'this user'}"?`)) return;
        
        try {
            await this.api.toggleUserStatus(id);
            UIHelper.showAlert('User status toggled successfully', 'success');
            this.loadUsers();
        } catch (error) {
            UIHelper.showAlert(error.message || 'Error toggling user status', 'danger');
        }
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        
        try {
            await this.api.deleteUser(id);
            UIHelper.showAlert('User deleted successfully', 'success');
            this.loadUsers();
        } catch (error) {
            UIHelper.showAlert(error.message || 'Error deleting user', 'danger');
        }
    }
}

let usersManager;

document.addEventListener('DOMContentLoaded', () => {
    // Basic auth check
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
    }
    
    // User role check (Admins only for this page)
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    usersManager = new UsersManager();
});

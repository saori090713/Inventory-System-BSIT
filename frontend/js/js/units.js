// ===== UNITS.JS - Units Management Logic =====

class UnitsManager {
    constructor() {
        this.currentEditId = null;
        this.allUnits = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateAdminUI();
        await this.loadUnits();
    }

    // Update admin-only UI elements
    updateAdminUI() {
        const addBtn = document.getElementById('addUnitBtn');
        if (addBtn) {
            if (window.isAdmin && window.isAdmin()) {
                addBtn.style.display = 'block';
            } else {
                addBtn.style.display = 'none';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('unitSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        // Add button
        const addBtn = document.getElementById('addUnitBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.resetForm());
        }

        // Form submit
        const unitForm = document.getElementById('unitForm');
        if (unitForm) {
            unitForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Load units from API
    async loadUnits(search = '') {
        try {
            console.log('[Units] Loading units...', { search });
            const units = await apiService.getUnits();
            console.log('[Units] API Response:', units);
            this.allUnits = units || [];
            
            let filtered = this.allUnits;
            if (search) {
                filtered = filtered.filter(u => 
                    u.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            this.renderUnits(filtered);
            console.log(`âœ“ Loaded ${filtered.length} units`);
        } catch (error) {
            console.error('âœ— Error loading units:', error);
            console.error('âœ— Error details:', error.message, error.stack);
            this.renderUnits([]);
            UIHelper.showAlert(`Error loading units: ${error.message}`, 'danger');
        }
    }

    // Render units in table
    renderUnits(units) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (units.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No units found</td></tr>';
            return;
        }

        // Build all rows at once instead of innerHTML +=
        let html = '';
        units.forEach(unit => {
            let actionsHtml = '<td><span class="text-muted text-sm">View Only</span></td>';
            if (window.isAdmin && window.isAdmin()) {
                actionsHtml = `
                    <td class="text-end">
                        <button class="btn btn-sm btn-primary edit-unit-btn" data-id="${unit.id}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-unit-btn" data-id="${unit.id}">
                            Delete
                        </button>
                    </td>
                `;
            }

            html += `
                <tr>
                    <td>${unit.id}</td>
                    <td>${unit.name}</td>
                    <td>${unit.abbreviation || '-'}</td>
                    ${actionsHtml}
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Securely bind events natively instead of inline 'onclick' to prevent CSP violation
        tbody.querySelectorAll('.edit-unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.editUnit(id);
            });
        });

        tbody.querySelectorAll('.delete-unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.deleteUnit(id);
            });
        });
    }

    // Search units
    handleSearch() {
        const searchInput = document.getElementById('unitSearch');
        const query = searchInput ? searchInput.value : '';
        this.loadUnits(query);
    }

    // Edit unit
    async editUnit(id) {
        try {
            if (!window.isAdmin || !window.isAdmin()) {
                UIHelper.showAlert('Only admins can edit units', 'warning');
                return;
            }

            console.log(`[Units] Editing unit ${id}`);
            const numId = parseInt(id);
            const unit = this.allUnits.find(u => parseInt(u.id) === numId);

            if (!unit) {
                console.error('[Units] Unit not found. ID:', id, 'All IDs:', this.allUnits.map(u => u.id));
                UIHelper.showAlert('Unit not found', 'danger');
                return;
            }

            this.currentEditId = id;

            // Populate form
            const nameInput = document.getElementById('unitName');
            const abbrInput = document.getElementById('unitAbbreviation');
            if (nameInput) {
                nameInput.value = unit.name;
            }
            if (abbrInput) {
                abbrInput.value = unit.abbreviation || '';
            }

            // Update modal title and button text
            const form = document.getElementById('unitForm');
            const submitBtn = form?.querySelector('button[type="submit"]');
            const modalTitle = document.getElementById('unitModalLabel');
            
            if (modalTitle) {
                modalTitle.textContent = 'Edit Unit';
            }
            if (submitBtn) {
                submitBtn.textContent = 'Update';
            }

            // Show modal
            const modal = document.getElementById('unitModal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }

            console.log(`✓ Unit loaded for editing: ${unit.name}`);
        } catch (error) {
            console.error('✗ Error editing unit:', error);
            UIHelper.showAlert('Error loading unit', 'danger');
        }
    }

    // Delete unit
    async deleteUnit(id) {
        try {
            if (!window.isAdmin || !window.isAdmin()) {
                UIHelper.showAlert('Only admins can delete units', 'warning');
                return;
            }

            const numId = parseInt(id);
            // Find unit in current list for confirmation message
            const unit = this.allUnits.find(u => parseInt(u.id) === numId);

            if (!confirm(`Are you sure you want to delete "${unit ? unit.name : 'this unit'}"?`)) {
                return;
            }

            console.log(`[Units] Deleting unit ${id}`);
            await apiService.deleteUnit(id);
            
            UIHelper.showAlert('Unit deleted successfully', 'success');
            await this.loadUnits();

            // Notify dashboard of data change
            window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'unit', action: 'delete' } }));

            console.log(`✓ Unit deleted: ID ${id}`);
        } catch (error) {
            console.error('✗ Error deleting unit:', error);
            if (error.message && error.message.includes('not found')) {
                UIHelper.showAlert('Unit not found or already deleted', 'warning');
                await this.loadUnits(); // Refresh the list
            } else {
                UIHelper.showAlert('Error deleting unit', 'danger');
            }
        }
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('unitForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        const modalTitle = document.getElementById('unitModalLabel');
        
        if (form) {
            form.reset();
            this.currentEditId = null;
        }

        if (modalTitle) {
            modalTitle.textContent = 'Add Unit';
        }
        
        if (submitBtn) {
            submitBtn.textContent = 'Add';
        }

        // Show modal
        const modal = document.getElementById('unitModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    // Handle form submit
    async handleFormSubmit(e) {
        e.preventDefault();

        if (!window.isAdmin || !window.isAdmin()) {
            UIHelper.showAlert('Only admins can manage units', 'warning');
            return;
        }

        try {
            console.log('[Units] Submitting form...');
            
            const unitName = document.getElementById('unitName').value;
            const unitAbbreviation = document.getElementById('unitAbbreviation')?.value || '';

            if (!unitName) {
                UIHelper.showAlert('Please enter a unit name', 'warning');
                return;
            }

            const data = { name: unitName, abbreviation: unitAbbreviation };
            console.log('[Units] Sending data:', data);

            let response;
            if (this.currentEditId) {
                // Update existing unit
                response = await apiService.updateUnit(this.currentEditId, data);

                console.log('[Units] Update response:', response);
                UIHelper.showAlert(`Unit "${unitName}" updated successfully`, 'success');
            } else {
                // Create new unit
                response = await apiService.createUnit(data);

                console.log('[Units] Create response:', response);
                UIHelper.showAlert(`Unit "${unitName}" created successfully`, 'success');
            }

            // Close modal - force close all modals to ensure clean state
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
            
            // Also hide the modal backdrop
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            
            // Re-enable body scrolling
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            // Reset form state (clears fields but doesn't open modal)
            const form = document.getElementById('unitForm');
            if (form) {
                UIHelper.clearForm(form);
                this.currentEditId = null;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add';
                }
            }
            
            // Small delay to ensure modal is fully closed
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Reload units
            console.log('[Units] Reloading units after add/edit...');
            await this.loadUnits();
            console.log('✓ Unit saved successfully');
        } catch (error) {
            console.error('✗ Error saving unit:', error);
            UIHelper.showAlert(`Error: ${error.message || 'Failed to save unit'}`, 'danger');
        }
    }
}

console.log('✓ Units script loaded');

let unitsManager;
document.addEventListener('DOMContentLoaded', () => {
    unitsManager = new UnitsManager();
});

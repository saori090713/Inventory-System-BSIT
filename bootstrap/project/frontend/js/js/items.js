// ===== ITEMS.JS - Items Management Logic =====

class ItemsManager {
    constructor() {
        this.currentEditId = null;
        this.allItems = [];
        this.init();
    }

    async init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Check admin status and show/hide add button
        this.updateAdminUI();
        
        // Load data
        await this.loadItems();
        await this.loadCategoryOptions();
        await this.loadUnitOptions();
    }

    // Update admin-only UI elements
    updateAdminUI() {
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            if (isAdmin && isAdmin()) {
                addBtn.style.display = 'block';
            } else {
                addBtn.style.display = 'none';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('itemSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        // Add button
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.resetForm());
        }

        // Form submit
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Load items from API
    async loadItems(search = '') {
        try {
            console.log('[Items] Loading items...', { search });
            
            const result = await apiService.getInventory(1, 100, search);
            console.log('[Items] API Response:', result);
            
            const items = result.items || [];
            this.allItems = items;
            
            this.renderItems(items);
            console.log(`✓ Loaded ${items.length} items`);
        } catch (error) {
            console.error('✗ Error loading items:', error);
            console.error('✗ Error details:', error.message, error.stack);
            this.renderItems([]);
            UIHelper.showAlert(`Error loading items: ${error.message}`, 'danger');
        }
    }

    // Render items in table
    renderItems(items) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No items found</td></tr>';
            return;
        }

        // Build all rows at once instead of innerHTML +=
        let html = '';
        items.forEach(item => {
            const quantity = item.quantity || 0;
            let statusClass = 'badge bg-success';
            let status = 'In Stock';
            
            if (quantity === 0) {
                statusClass = 'badge bg-danger';
                status = 'Out of Stock';
            } else if (quantity < (item.lowStockThreshold || 5)) {
                statusClass = 'badge bg-warning';
                status = 'Low Stock';
            }

            let actionsHtml = '<td><span class="text-muted text-sm">View Only</span></td>';
            if (isAdmin && isAdmin()) {
                actionsHtml = `
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="itemsManager.editItem(${item.id})">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="itemsManager.deleteItem(${item.id})">
                            Delete
                        </button>
                    </td>
                `;
            }

            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name || 'N/A'}</td>
                    <td>${item.category?.name || 'N/A'}</td>
                    <td>${item.unit?.name || 'N/A'}</td>
                    <td>${quantity}</td>
                    <td><span class="${statusClass}">${status}</span></td>
                    ${actionsHtml}
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    // Search items
    handleSearch() {
        const searchInput = document.getElementById('itemSearch');
        const query = searchInput ? searchInput.value : '';
        this.loadItems(query);
    }

    // Load category dropdown
    async loadCategoryOptions() {
        try {
            const categories = await apiService.getCategories();
            const select = document.getElementById('itemCategory');
            if (!select) return;

            select.innerHTML = '<option value="">Select Category</option>';
            (categories || []).forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Load unit dropdown
    async loadUnitOptions() {
        try {
            const units = await apiService.getUnits();
            const select = document.getElementById('itemUnit');
            if (!select) return;

            select.innerHTML = '<option value="">Select Unit</option>';
            (units || []).forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = unit.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading units:', error);
        }
    }

    // Edit item
    async editItem(id) {
        try {
            if (!isAdmin || !isAdmin()) {
                UIHelper.showAlert('Only admins can edit items', 'warning');
                return;
            }

            console.log(`[Items] Editing item ${id}`);
            const item = await apiService.getInventoryById(id);
            this.currentEditId = id;

            // Populate form
            document.getElementById('itemName').value = item.name || '';
            document.getElementById('itemCategory').value = item.categoryId || '';
            document.getElementById('itemUnit').value = item.unitId || '';
            document.getElementById('itemQuantity').value = item.quantity || 0;
            document.getElementById('itemPrice').value = item.price || '';

            // Update modal title and button text
            const form = document.getElementById('itemForm');
            const submitBtn = form?.querySelector('button[type="submit"]');
            const modalTitle = document.getElementById('itemModalLabel');
            
            if (modalTitle) {
                modalTitle.textContent = 'Edit Item';
            }
            if (submitBtn) {
                submitBtn.textContent = 'Update Item';
            }

            // Show modal
            const modal = document.getElementById('itemModal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }

            console.log(`✓ Item loaded for editing: ${item.name}`);
        } catch (error) {
            console.error('✗ Error editing item:', error);
            UIHelper.showAlert('Error loading item', 'danger');
        }
    }

    // Delete item
    async deleteItem(id) {
        try {
            if (!isAdmin || !isAdmin()) {
                UIHelper.showAlert('Only admins can delete items', 'warning');
                return;
            }

            // Try to get item details for confirmation, but don't fail if not found
            let itemName = 'this item';
            try {
                const item = await apiService.getInventoryById(id);
                itemName = item.name;
            } catch (e) {
                console.warn('[Items] Item not found for details, proceeding with deletion:', id);
            }

            if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
                return;
            }

            console.log(`[Items] Deleting item ${id}`);
            await apiService.deleteInventory(id);
            
            UIHelper.showAlert('Item deleted successfully', 'success');
            await this.loadItems();

            // Notify dashboard of data change
            window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'item', action: 'delete' } }));

            console.log(`✓ Item deleted: ID ${id}`);
        } catch (error) {
            console.error('✗ Error deleting item:', error);
            if (error.message && error.message.includes('not found')) {
                UIHelper.showAlert('Item not found or already deleted', 'warning');
                await this.loadItems(); // Refresh the list
                // Notify dashboard of data change
                window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'item', action: 'delete' } }));
            } else {
                UIHelper.showAlert('Error deleting item', 'danger');
            }
        }
    }

    // Handle form submit
    async handleFormSubmit(e) {
        e.preventDefault();

        if (!isAdmin || !isAdmin()) {
            UIHelper.showAlert('Only admins can manage items', 'warning');
            return;
        }

        try {
            console.log('[Items] Submitting form...');
            
            const itemName = document.getElementById('itemName').value;
            const category = document.getElementById('itemCategory').value;
            const unit = document.getElementById('itemUnit').value;
            const quantity = document.getElementById('itemQuantity').value;
            const price = document.getElementById('itemPrice').value;

            if (!itemName || !category || !unit || quantity === '') {
                UIHelper.showAlert('Please fill in all required fields', 'warning');
                return;
            }

            const data = {
                name: itemName,
                category,
                unit,
                quantity: parseInt(quantity),
                price: parseFloat(price) || 0,
                lowStockThreshold: 5
            };
            console.log('[Items] Sending data:', data);

            let response;
            if (this.currentEditId) {
                // Update existing item
                response = await apiService.updateInventory(this.currentEditId, data);
                console.log('[Items] Update response:', response);
                UIHelper.showAlert(`Item "${itemName}" updated successfully`, 'success');
            } else {
                // Create new item
                response = await apiService.createInventory(data);
                console.log('[Items] Create response:', response);
                UIHelper.showAlert(`Item "${itemName}" created successfully`, 'success');
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
            const form = document.getElementById('itemForm');
            if (form) {
                UIHelper.clearForm(form);
                this.currentEditId = null;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add Item';
                }
            }
            
            // Small delay to ensure modal is fully closed
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Reload items
            console.log('[Items] Reloading items after add/edit...');
            await this.loadItems();

            // Notify dashboard of data change
            window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'item', action: this.currentEditId ? 'update' : 'create' } }));

            console.log('✓ Item saved successfully');
        } catch (error) {
            console.error('✗ Error saving item:', error);
            UIHelper.showAlert(`Error: ${error.message || 'Failed to save item'}`, 'danger');
        }
    }

    // Reset form for new item
    async resetForm() {
        this.currentEditId = null;
        const form = document.getElementById('itemForm');
        if (form) {
            UIHelper.clearForm(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Add Item';
            }
        }

        // Reset modal title
        const modalTitle = document.getElementById('itemModalLabel');
        if (modalTitle) {
            modalTitle.textContent = 'Add Item';
        }

        // Reload category and unit options
        await this.loadCategoryOptions();
        await this.loadUnitOptions();

        // Show modal
        const modal = document.getElementById('itemModal');
        if (modal) {
            UIHelper.showModal(modal);
        }
    }
}

console.log('✓ Items script loaded');

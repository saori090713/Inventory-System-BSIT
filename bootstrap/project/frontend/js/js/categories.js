// ===== CATEGORIES.JS - Categories Management Logic =====

class CategoriesManager {
    constructor() {
        this.currentEditId = null;
        this.allCategories = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateAdminUI();
        await this.loadCategories();
    }

    // Update admin-only UI elements
    updateAdminUI() {
        const addBtn = document.getElementById('addCategoryBtn');
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
        const searchInput = document.getElementById('categorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        // Add button
        const addBtn = document.getElementById('addCategoryBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.resetForm());
        }

        // Form submit
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Load categories from API
    async loadCategories(search = '') {
        try {
            console.log('[Categories] Loading categories...', { search });
            const categories = await apiService.getCategories();
            console.log('[Categories] API Response:', categories);
            this.allCategories = categories || [];
            
            let filtered = this.allCategories;
            if (search) {
                filtered = filtered.filter(c => 
                    c.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            this.renderCategories(filtered);
            console.log(`✓ Loaded ${filtered.length} categories`);
        } catch (error) {
            console.error('✗ Error loading categories:', error);
            console.error('✗ Error details:', error.message, error.stack);
            this.renderCategories([]);
            UIHelper.showAlert(`Error loading categories: ${error.message}`, 'danger');
        }
    }

    // Render categories in table
    renderCategories(categories) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">No categories found</td></tr>';
            return;
        }

        // Build all rows at once instead of innerHTML +=
        let html = '';
        categories.forEach(category => {
            let actionsHtml = '<td><span class="text-muted text-sm">View Only</span></td>';
            if (isAdmin && isAdmin()) {
                actionsHtml = `
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="categoriesManager.editCategory(${category.id})">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="categoriesManager.deleteCategory(${category.id})">
                            Delete
                        </button>
                    </td>
                `;
            }

            html += `
                <tr>
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    ${actionsHtml}
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    // Search categories
    handleSearch() {
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        const query = searchInput ? searchInput.value : '';
        this.loadCategories(query);
    }

    // Edit category
    async editCategory(id) {
        try {
            if (!isAdmin || !isAdmin()) {
                UIHelper.showAlert('Only admins can edit categories', 'warning');
                return;
            }

            console.log(`[Categories] Editing category ${id}`);
            const numId = parseInt(id);
            const category = this.allCategories.find(c => parseInt(c.id) === numId);

            if (!category) {
                console.error('[Categories] Category not found. ID:', id, 'All IDs:', this.allCategories.map(c => c.id));
                UIHelper.showAlert('Category not found', 'danger');
                return;
            }

            this.currentEditId = id;

            // Populate form
            const nameInput = document.getElementById('categoryName');
            if (nameInput) {
                nameInput.value = category.name;
            }

            // Update modal title and button text
            const form = document.getElementById('categoryForm');
            const submitBtn = form?.querySelector('button[type="submit"]');
            const modalTitle = document.getElementById('categoryModalLabel');
            
            if (modalTitle) {
                modalTitle.textContent = 'Edit Category';
            }
            if (submitBtn) {
                submitBtn.textContent = 'Update';
            }

            // Show modal
            const modal = document.getElementById('categoryModal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }

            console.log(`✓ Category loaded for editing: ${category.name}`);
        } catch (error) {
            console.error('✗ Error editing category:', error);
            UIHelper.showAlert('Error loading category', 'danger');
        }
    }

    // Delete category
    async deleteCategory(id) {
        try {
            if (!isAdmin || !isAdmin()) {
                UIHelper.showAlert('Only admins can delete categories', 'warning');
                return;
            }

            const numId = parseInt(id);
            // Find category in current list for confirmation message
            const category = this.allCategories.find(c => parseInt(c.id) === numId);

            if (!confirm(`Are you sure you want to delete "${category ? category.name : 'this category'}"?`)) {
                return;
            }

            console.log(`[Categories] Deleting category ${id}`);
            await apiService.request(`/categories/${id}`, { method: 'DELETE' });
            
            UIHelper.showAlert('Category deleted successfully', 'success');
            await this.loadCategories();

            // Notify dashboard of data change
            window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'category', action: 'delete' } }));

            console.log(`✓ Category deleted: ID ${id}`);
        } catch (error) {
            console.error('✗ Error deleting category:', error);
            if (error.message && error.message.includes('not found')) {
                UIHelper.showAlert('Category not found or already deleted', 'warning');
                await this.loadCategories(); // Refresh the list
            } else {
                UIHelper.showAlert('Error deleting category', 'danger');
            }
        }
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('categoryForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        
        if (form) {
            form.reset();
            this.currentEditId = null;
        }
        
        if (submitBtn) {
            submitBtn.textContent = 'Add';
        }
    }

    // Handle form submit
    async handleFormSubmit(e) {
        e.preventDefault();

        if (!isAdmin || !isAdmin()) {
            UIHelper.showAlert('Only admins can manage categories', 'warning');
            return;
        }

        try {
            console.log('[Categories] Submitting form...');
            
            const categoryName = document.getElementById('categoryName').value;

            if (!categoryName) {
                UIHelper.showAlert('Please enter a category name', 'warning');
                return;
            }

            const data = { name: categoryName };
            console.log('[Categories] Sending data:', data);

            let response;
            if (this.currentEditId) {
                // Update existing category
                response = await apiService.request(`/categories/${this.currentEditId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                console.log('[Categories] Update response:', response);
                UIHelper.showAlert(`Category "${categoryName}" updated successfully`, 'success');
            } else {
                // Create new category
                response = await apiService.request('/categories', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                console.log('[Categories] Create response:', response);
                UIHelper.showAlert(`Category "${categoryName}" created successfully`, 'success');
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
            const form = document.getElementById('categoryForm');
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
            
            // Reload categories
            console.log('[Categories] Reloading categories after add/edit...');
            await this.loadCategories();

            // Notify dashboard of data change
            window.dispatchEvent(new CustomEvent('dataChanged', { detail: { type: 'category', action: this.currentEditId ? 'update' : 'create' } }));

            console.log('✓ Category saved successfully');
        } catch (error) {
            console.error('✗ Error saving category:', error);
            UIHelper.showAlert(`Error: ${error.message || 'Failed to save category'}`, 'danger');
        }
    }
}

console.log('✓ Categories script loaded');

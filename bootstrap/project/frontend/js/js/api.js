// ===== API.JS - API Communication Service =====

class APIService {
    constructor() {
        this.baseURL = ''; // Use relative URLs
        this.timeout = 5000;

        // Initialize mock data
        this.initMockData();
    }

    // Initialize mock data (simulates database)
    initMockData() {
        if (!localStorage.getItem('inventory_items')) {
            const mockItems = [
                { id: 1, name: 'Laptop', category: 1, quantity: 50, unit: 1, price: 999.99 },
                { id: 2, name: 'Mouse', category: 1, quantity: 200, unit: 1, price: 29.99 },
                { id: 3, name: 'Keyboard', category: 1, quantity: 100, unit: 1, price: 79.99 }
            ];
            localStorage.setItem('inventory_items', JSON.stringify(mockItems));
        }

        if (!localStorage.getItem('categories')) {
            const mockCategories = [
                { id: 1, name: 'Electronics' },
                { id: 2, name: 'Furniture' },
                { id: 3, name: 'Office Supplies' }
            ];
            localStorage.setItem('categories', JSON.stringify(mockCategories));
        }

        if (!localStorage.getItem('units')) {
            const mockUnits = [
                { id: 1, name: 'Piece' },
                { id: 2, name: 'Box' },
                { id: 3, name: 'Carton' }
            ];
            localStorage.setItem('units', JSON.stringify(mockUnits));
        }
    }

    // ===== ITEMS API =====

    // Get all items
    getItems(search = '') {
        try {
            let items = JSON.parse(localStorage.getItem('inventory_items') || '[]');

            if (search) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            console.log(`✓ Retrieved ${items.length} items`);
            return { success: true, data: items };
        } catch (error) {
            console.error('✗ Error retrieving items:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get single item
    getItem(id) {
        try {
            const items = JSON.parse(localStorage.getItem('inventory_items') || '[]');
            const item = items.find(i => i.id === parseInt(id));

            if (!item) {
                throw new Error('Item not found');
            }

            console.log(`✓ Retrieved item: ${item.name}`);
            return { success: true, data: item };
        } catch (error) {
            console.error('✗ Error retrieving item:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Create item
    createItem(itemData) {
        try {
            const items = JSON.parse(localStorage.getItem('inventory_items') || '[]');
            const newItem = {
                id: Math.max(...items.map(i => i.id), 0) + 1,
                ...itemData,
                createdAt: new Date().toISOString()
            };

            items.push(newItem);
            localStorage.setItem('inventory_items', JSON.stringify(items));

            console.log(`✓ Item created: ${newItem.name}`);
            return { success: true, data: newItem };
        } catch (error) {
            console.error('✗ Error creating item:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Update item
    updateItem(id, itemData) {
        try {
            const items = JSON.parse(localStorage.getItem('inventory_items') || '[]');
            const index = items.findIndex(i => i.id === parseInt(id));

            if (index === -1) {
                throw new Error('Item not found');
            }

            items[index] = {
                ...items[index],
                ...itemData,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('inventory_items', JSON.stringify(items));
            console.log(`✓ Item updated: ${items[index].name}`);
            return { success: true, data: items[index] };
        } catch (error) {
            console.error('✗ Error updating item:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Delete item
    deleteItem(id) {
        try {
            const items = JSON.parse(localStorage.getItem('inventory_items') || '[]');
            const index = items.findIndex(i => i.id === parseInt(id));

            if (index === -1) {
                throw new Error('Item not found');
            }

            const deleted = items.splice(index, 1)[0];
            localStorage.setItem('inventory_items', JSON.stringify(items));

            console.log(`✓ Item deleted: ${deleted.name}`);
            return { success: true, data: deleted };
        } catch (error) {
            console.error('✗ Error deleting item:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ===== CATEGORIES API =====

    // Get all categories
    getCategories() {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            console.log(`✓ Retrieved ${categories.length} categories`);
            return { success: true, data: categories };
        } catch (error) {
            console.error('✗ Error retrieving categories:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Create category
    createCategory(name) {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const newCategory = {
                id: Math.max(...categories.map(c => c.id), 0) + 1,
                name: name
            };

            categories.push(newCategory);
            localStorage.setItem('categories', JSON.stringify(categories));

            console.log(`✓ Category created: ${name}`);
            return { success: true, data: newCategory };
        } catch (error) {
            console.error('✗ Error creating category:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Update category
    updateCategory(id, name) {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const category = categories.find(c => c.id === parseInt(id));

            if (!category) {
                throw new Error('Category not found');
            }

            category.name = name;
            localStorage.setItem('categories', JSON.stringify(categories));

            console.log(`✓ Category updated: ${name}`);
            return { success: true, data: category };
        } catch (error) {
            console.error('✗ Error updating category:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Delete category
    deleteCategory(id) {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const index = categories.findIndex(c => c.id === parseInt(id));

            if (index === -1) {
                throw new Error('Category not found');
            }

            const deleted = categories.splice(index, 1)[0];
            localStorage.setItem('categories', JSON.stringify(categories));

            console.log(`✓ Category deleted: ${deleted.name}`);
            return { success: true, data: deleted };
        } catch (error) {
            console.error('✗ Error deleting category:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ===== UNITS API =====

    // Get all units
    getUnits() {
        try {
            const units = JSON.parse(localStorage.getItem('units') || '[]');
            console.log(`✓ Retrieved ${units.length} units`);
            return { success: true, data: units };
        } catch (error) {
            console.error('✗ Error retrieving units:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Create unit
    createUnit(name) {
        try {
            const units = JSON.parse(localStorage.getItem('units') || '[]');
            const newUnit = {
                id: Math.max(...units.map(u => u.id), 0) + 1,
                name: name
            };

            units.push(newUnit);
            localStorage.setItem('units', JSON.stringify(units));

            console.log(`✓ Unit created: ${name}`);
            return { success: true, data: newUnit };
        } catch (error) {
            console.error('✗ Error creating unit:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Update unit
    updateUnit(id, name) {
        try {
            const units = JSON.parse(localStorage.getItem('units') || '[]');
            const unit = units.find(u => u.id === parseInt(id));

            if (!unit) {
                throw new Error('Unit not found');
            }

            unit.name = name;
            localStorage.setItem('units', JSON.stringify(units));

            console.log(`✓ Unit updated: ${name}`);
            return { success: true, data: unit };
        } catch (error) {
            console.error('✗ Error updating unit:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Delete unit
    deleteUnit(id) {
        try {
            const units = JSON.parse(localStorage.getItem('units') || '[]');
            const index = units.findIndex(u => u.id === parseInt(id));

            if (index === -1) {
                throw new Error('Unit not found');
            }

            const deleted = units.splice(index, 1)[0];
            localStorage.setItem('units', JSON.stringify(units));

            console.log(`✓ Unit deleted: ${deleted.name}`);
            return { success: true, data: deleted };
        } catch (error) {
            console.error('✗ Error deleting unit:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ===== STATISTICS =====

    getStatistics() {
        try {
            const items = JSON.parse(localStorage.getItem('inventory_items') || '[]');
            const stats = {
                totalItems: items.length,
                totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
                lowStock: items.filter(item => item.quantity < 10).length,
                outOfStock: items.filter(item => item.quantity === 0).length
            };

            console.log('✓ Statistics retrieved');
            return { success: true, data: stats };
        } catch (error) {
            console.error('✗ Error retrieving statistics:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Create global API instance
const api = new APIService();

console.log('✓ API service loaded');

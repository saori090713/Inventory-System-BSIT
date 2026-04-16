// Products page logic
let currentPage = 1;
let currentSearch = '';
let allInventory = [];

async function loadProducts() {
    try {
        const response = await apiService.getInventory(currentPage, 10, currentSearch);
        
        if (response && response.items) {
            allInventory = response.items;
            renderProducts(response.items);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsContainer').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load products. Please try again.</div>
            </div>
        `;
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">No products found.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted small">${product.category?.name || 'N/A'}</p>
                    
                    <div class="mb-3">
                        <span class="badge ${getStatusBadgeClass(product.status)}">
                            ${product.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>

                    <div class="mb-3">
                        <p class="mb-1"><strong>Quantity:</strong> ${product.quantity}</p>
                        <p class="mb-1"><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                        <p class="mb-0"><strong>Unit:</strong> ${product.unit?.abbreviation || 'N/A'}</p>
                    </div>

                    <button class="btn btn-primary btn-sm w-100" onclick="showProductDetails(${product._id})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'in stock':
            return 'bg-light text-dark';
        case 'low stock':
            return 'bg-warning';
        case 'out of stock':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

async function showProductDetails(productId) {
    try {
        const product = await apiService.getInventoryById(productId);

        const modalBody = document.getElementById('productModalBody');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>${product.name}</h5>
                    <p class="text-muted">${product.description || 'No description'}</p>
                </div>
                <div class="col-md-6">
                    <span class="badge ${getStatusBadgeClass(product.status)} fs-6">
                        ${product.status?.toUpperCase()}
                    </span>
                </div>
            </div>

            <hr>

            <div class="row">
                <div class="col-md-6">
                    <p><strong>Category:</strong> ${product.category?.name || 'N/A'}</p>
                    <p><strong>Unit:</strong> ${product.unit?.abbreviation || 'N/A'}</p>
                    <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>Quantity:</strong> ${product.quantity}</p>
                    <p><strong>Low Stock Threshold:</strong> ${product.lowStockThreshold}</p>
                </div>
            </div>

            <div class="alert alert-info mt-3 mb-0">
                <small>${product.quantity <= product.lowStockThreshold ? '⚠️ This item is low in stock or out of stock' : '✓ This item is in stock'}</small>
            </div>
        `;

        document.getElementById('productModalTitle').textContent = product.name;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

async function loadStats() {
    try {
        const stats = await apiService.getInventoryStats();

        document.getElementById('totalProducts').textContent = stats.totalItems;
        document.getElementById('inStockCount').textContent = stats.totalItems - stats.lowStockItems - stats.outOfStockItems;
        document.getElementById('lowStockCount').textContent = stats.lowStockItems;
        document.getElementById('outOfStockCount').textContent = stats.outOfStockItems;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadProducts();
});

// Load on page load
window.addEventListener('load', () => {
    loadProducts();
    loadStats();
});

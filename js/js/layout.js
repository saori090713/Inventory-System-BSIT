function isAdmin() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const isAdminUser = user && user.role === 'admin';
        if (!isAdminUser) {
            console.warn('[AUTH] User is not admin. Current role:', user?.role || 'none');
        }
        return isAdminUser;
    } catch (error) {
        console.error('[AUTH] Error checking admin status:', error);
        return false;
    }
}

function renderLayout(activePage) {
    const navbarHtml = `
    <nav class="navbar navbar-light bg-light shadow-sm">
        <div class="container-fluid">
            <span class="navbar-brand fw-bold">Inventory System</span>
            <span id="userName" class="navbar-text ms-3"></span>
            <button class="btn btn-warning btn-sm text-dark ms-auto" onclick="logout()">
                Logout
            </button>
        </div>
    </nav>
    `;

    const getSidebarLink = (page, label, href) => {
        const isActive = activePage === page ? 'active bg-light text-dark' : 'text-primary';
        return `
        <li class="nav-item">
            <a class="nav-link ${isActive}" href="${href}">「 ${label} 」</a>
        </li>
        `;
    };

    const sidebarHtml = `
    <div class="col-md-2 bg-white border-end vh-100 p-3" id="sidebar-container">
        <h6 class="text-primary fw-bold">─── ⋆⋅ Menu ⋅⋆ ───</h6>
        <ul class="nav flex-column nav-pills">
            ${getSidebarLink('dashboard', 'Dashboard', 'dashboard.html')}
            ${getSidebarLink('items', 'Items', 'items.html')}
            ${getSidebarLink('categories', 'Categories', 'categories.html')}
            ${getSidebarLink('units', 'Units', 'units.html')}
        </ul>
    </div>
    `;

    const navContainer = document.getElementById('navbar-container');
    if (navContainer) {
        navContainer.innerHTML = navbarHtml;
    }

    const sideContainer = document.getElementById('sidebar-container');
    if (sideContainer) {
        sideContainer.outerHTML = sidebarHtml;
    }
    
    // Process RBAC DOM masking globally
    if (!isAdmin()) {
        const addButtons = document.querySelectorAll('button[data-bs-toggle="modal"], button.btn-primary');
        addButtons.forEach(btn => {
            if(btn.textContent.includes('Add')) {
                btn.style.display = 'none';
            }
        });
        
        // Also clean up loose header buttons that aren't wrapped in Modals
        const looseButtons = document.querySelectorAll('button');
        looseButtons.forEach(btn => {
            if(btn.textContent.includes('Add Item') || btn.textContent.includes('✚ Add')) {
                btn.style.display = 'none';
            }
        });
    }
    // Set user name in navbar if logged in
    const userNameElem = document.getElementById('userName');
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.username && user.role === 'admin') {
            userNameElem.textContent = `👤 ${user.username}`;
        }
    } catch (e) {
        console.error('Failed to parse user info', e);
    }
}

function showGlobalAlert(message, type = 'info') {
    const defaultBox = document.getElementById('alertBox') || document.getElementById('alertContainer');
    if (!defaultBox) {
        alert(message);
        return;
    }
    
    const alertId = 'alert-' + Date.now();
    defaultBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        const elem = document.getElementById(alertId);
        if (elem) elem.remove();
    }, 5000);
}

// Inject exports explicitly to window namespace for legacy script access
window.isAdmin = isAdmin;
window.renderLayout = renderLayout;
window.showGlobalAlert = showGlobalAlert;

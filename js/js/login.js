// login.js - Externalized CSP-Compliant Event Handlers and API Logic

document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const loginForm = document.getElementById('authForm');
    const registerForm = document.getElementById('registerAuthForm');

    // Get toggle buttons
    const btnShowRegister = document.getElementById('btnShowRegister');
    const btnShowLogin = document.getElementById('btnShowLogin');

    // Get form containers
    const loginBox = document.getElementById('loginForm');
    const registerBox = document.getElementById('registerForm');
    const alertBox = document.getElementById('alertBox');
    
    // Attach Register Toggle Event (Removed onclick)
    if (btnShowRegister) {
        btnShowRegister.addEventListener('click', () => {
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
            alertBox.innerHTML = '';
        });
    }

    // Attach Login Toggle Event (Removed onclick)
    if (btnShowLogin) {
        btnShowLogin.addEventListener('click', () => {
            loginBox.style.display = 'block';
            registerBox.style.display = 'none';
            alertBox.innerHTML = '';
        });
    }

    // Attach Submission Handlers (Removed onsubmit)
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Initialize View
    loadUsersList();
});

// Authenticaton Handlers
async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Logging in...';
    document.getElementById('alertBox').innerHTML = '';
    
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const response = await apiService.login(username, password);
        
        // Store Session Securely
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        document.getElementById('alertBox').innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    } catch (error) {
        document.getElementById('alertBox').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        btn.disabled = false;
        btn.innerHTML = 'Login';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Creating account...';
    document.getElementById('alertBox').innerHTML = '';
    
    try {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        
        const response = await apiService.register(username, password, firstName, lastName);
        
        // Store Session Securely
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        document.getElementById('alertBox').innerHTML = '<div class="alert alert-success">Account created! Redirecting...</div>';
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    } catch (error) {
        document.getElementById('alertBox').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        btn.disabled = false;
        btn.innerHTML = 'Sign Up';
    }
}

// User List Integration
async function loadUsersList() {
    try {
        const response = await apiService.request('GET', '/auth/users/list');
        const usersList = document.getElementById('usersList');
        
        if (!response.users || response.users.length === 0) {
            usersList.innerHTML = '<div class="text-center text-muted py-3"><small>No users available</small></div>';
            return;
        }

        // Generate raw HTML structure securely using unique data attribute
        usersList.innerHTML = response.users.map(user => `
            <div class="user-item" data-username="${user.username}">
                <div class="user-username">${user.username}</div>
                <div class="user-name">${user.firstName} ${user.lastName}</div>
                <span class="user-role ${user.role.toLowerCase()}">${user.role}</span>
            </div>
        `).join('');

        // CSP COMPATIBLE: Bind click events purely via code after DOM injection instead of element 'onclick'
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', function() {
                const unameInput = document.getElementById('username');
                if(unameInput) {
                    unameInput.value = this.getAttribute('data-username');
                    const pwInput = document.getElementById('password');
                    if (pwInput) pwInput.focus();
                }
            });
        });

    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersList').innerHTML = '<div class="text-center text-danger py-3"><small>Error loading users</small></div>';
    }
}

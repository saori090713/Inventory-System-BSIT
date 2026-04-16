// Authentication handling
function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    const alertId = 'alert-' + Date.now();
    alertBox.innerHTML = `
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

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await apiService.login(username, password);

        sessionStorage.setItem('authToken', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));

        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        window.location.href = basePath + 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please check your credentials.', 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'warning');
        return;
    }

    try {
        const response = await apiService.register(username, password, firstName, lastName);

        sessionStorage.setItem('authToken', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));

        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        window.location.href = basePath + 'dashboard.html';
    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again.', 'danger');
    }
}

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
    window.location.href = basePath + 'pages/login.html';
}

// Check authentication on page load
window.addEventListener('load', async () => {
    const token = sessionStorage.getItem('authToken');
    const currentPage = window.location.pathname;
    const basePath = currentPage.includes('/pages/') ? '../' : './';

    if (!token) {
        if (!currentPage.includes('login.html') && !currentPage.includes('index.html')) {
            window.location.href = basePath + 'pages/login.html';
        }
    } else {
        // Update API securely
        apiService.updateToken();

        try {
            await apiService.verifyToken();
            
            // If valid token and we are on the login page... push to dashboard
            if (currentPage.includes('login.html') || currentPage.endsWith('index.html') || currentPage.endsWith('/')) {
                window.location.href = basePath + 'dashboard.html';
            }
        } catch(error) {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            if(!currentPage.includes('login.html')) {
                window.location.href = basePath + 'pages/login.html';
            }
        }

        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const userNameElem = document.getElementById('userName');
            if (userNameElem) {
                userNameElem.textContent = `${user.firstName} ${user.lastName}`;
            }
        }
    }
});

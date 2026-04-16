// ===== LOGIN.JS - Login/Authentication Logic =====

class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const createAccountBtn = document.getElementById('createAccountBtn');
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', (e) => this.handleCreateAccount(e));
        }

        // Clear form when modal closes
        const modal = document.getElementById('createAccountModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => this.clearCreateAccountForm());
        }
    }

    // Handle login
    handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            UIHelper.showAlert('Please enter username and password', 'warning');
            return;
        }

        try {
            // Show loading
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            UIHelper.showLoading(btn);

            // Attempt login
            auth.login(username, password).then(() => {
                UIHelper.showAlert('Login successful! Redirecting...', 'success', 1000);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }).catch((error) => {
                UIHelper.hideLoading(btn, originalText);
                UIHelper.showAlert(error.message, 'danger');
            });
        } catch (error) {
            UIHelper.showAlert('Login failed: ' + error.message, 'danger');
        }
    }

    // Handle create account
    handleCreateAccount(e) {
        e.preventDefault();

        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('newEmail').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!username || !password || !confirmPassword) {
            UIHelper.showAlert('Please fill in all required fields', 'warning', null, 'createAccountAlert');
            return;
        }

        if (password !== confirmPassword) {
            UIHelper.showAlert('Passwords do not match', 'warning', null, 'createAccountAlert');
            return;
        }

        try {
            const btn = document.getElementById('createAccountBtn');
            const originalText = btn.innerHTML;
            UIHelper.showLoading(btn);

            // Attempt registration
            auth.register(username, password, email).then((result) => {
                UIHelper.showAlert('Account created successfully! Redirecting...', 'success', 1500, 'createAccountAlert');
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createAccountModal'));
                    modal.hide();
                    window.location.href = 'dashboard.html';
                }, 1500);
            }).catch((error) => {
                UIHelper.hideLoading(btn, originalText);
                UIHelper.showAlert(error.message, 'danger', null, 'createAccountAlert');
            });
        } catch (error) {
            UIHelper.showAlert('Registration failed: ' + error.message, 'danger', null, 'createAccountAlert');
        }
    }

    // Clear create account form
    clearCreateAccountForm() {
        document.getElementById('createAccountForm').reset();
        document.getElementById('createAccountAlert').innerHTML = '';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});

console.log('✓ Login script loaded');

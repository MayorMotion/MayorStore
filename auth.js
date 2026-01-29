// auth.js - Authentication functionality

// Initialize authentication
function checkAuthStatus() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    window.currentUser = savedUser ? JSON.parse(savedUser) : null;
}

// Update user UI after login/logout
function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.querySelector('.user-info');
    const userName = document.querySelector('.user-name');
    
    if (!loginBtn || !logoutBtn || !registerBtn || !userInfo || !userName) return;
    
    if (window.currentUser) {
        // User is logged in
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userInfo.style.display = 'flex';
        userName.textContent = `Welcome, ${window.currentUser.name}`;
    } else {
        // User is logged out
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// Setup authentication event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login button click
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'flex';
    });

    // Register button click
    document.getElementById('registerBtn').addEventListener('click', () => {
        document.getElementById('registerForm').style.display = 'flex';
    });

    // Close login form
    document.getElementById('closeLoginForm').addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'none';
    });

    // Close register form
    document.getElementById('closeRegisterForm').addEventListener('click', () => {
        document.getElementById('registerForm').style.display = 'none';
    });

    // Login form submit
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);

    // Register form submit
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);

    // Logout button click
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        window.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        updateUserUI();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('loginFormElement').reset();
        
        if (typeof showNotification === 'function') {
            showNotification(`Welcome back, ${user.name}!`);
        }
    } else {
        alert('Invalid email or password');
    }
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    window.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
    updateUserUI();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('registerFormElement').reset();
    
    if (typeof showNotification === 'function') {
        showNotification(`Account created successfully! Welcome, ${name}!`);
    }
}

// Handle logout
function handleLogout() {
    window.currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    
    if (typeof showNotification === 'function') {
        showNotification('You have been logged out');
    }
}
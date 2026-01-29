// app.js - Complete Main Application Logic

// Global application state
const AppState = {
    isInitialized: false,
    user: null,
    cart: null
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initApplication();
    
    // Setup global error handling
    setupErrorHandling();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
});

function initApplication() {
    if (AppState.isInitialized) return;
    
    try {
        console.log('Initializing Mayor\'s Store Application...');
        
        // Wait for cart to be initialized
        if (!window.cart) {
            // If cart isn't loaded yet, wait a bit
            setTimeout(initApplication, 100);
            return;
        }
        
        AppState.cart = window.cart;
        
        // Setup all components
        setupProductHandlers();
        setupFormToggles();
        setupAuthUI();
        setupMobileMenu();
        setupSmoothScrolling();
        setupCartPersistentUpdates();
        setupSessionTracking();
        setupOfflineDetection();
        
        // Check for any saved state
        restoreUserSession();
        checkForPendingCartUpdates();
        
        // Mark as initialized
        AppState.isInitialized = true;
        
        console.log('Application initialized successfully');
        
        // Show welcome notification for first-time visitors
        if (!localStorage.getItem('hasVisitedBefore')) {
            setTimeout(() => {
                showNotification('Welcome to Mayor\'s Store! Enjoy your shopping experience.', 'info', 5000);
                localStorage.setItem('hasVisitedBefore', 'true');
            }, 2000);
        }
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Error initializing application. Please refresh the page.', 'error');
    }
}

// ============================================
// PRODUCT HANDLERS
// ============================================

function setupProductHandlers() {
    // Use event delegation for dynamically loaded products
    document.addEventListener('click', function(e) {
        // Handle "Add to Cart" buttons
        const addToCartBtn = e.target.closest('.btn-add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            handleAddToCart(addToCartBtn);
            return;
        }
        
        // Handle "Shop Now" button
        if (e.target.id === 'shopNowBtn' || e.target.closest('#shopNowBtn')) {
            e.preventDefault();
            document.getElementById('products').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            return;
        }
    });
    
    // Also handle products grid specifically
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        // Setup mutation observer for dynamically loaded products
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Products were added, ensure they have proper event handlers
                    enhanceProductCards();
                }
            });
        });
        
        observer.observe(productsGrid, { childList: true, subtree: true });
        
        // Initial enhancement
        enhanceProductCards();
    }
}

function handleAddToCart(button) {
    if (!button || !AppState.cart) return;
    
    const productId = parseInt(button.dataset.id);
    const product = window.products?.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    // Add to cart
    AppState.cart.addToCart(product);
    
    // Visual feedback on button
    buttonAnimation(button);
    
    // Track this event for analytics
    trackEvent('add_to_cart', {
        product_id: productId,
        product_name: product.name,
        price: product.price
    });
}

function buttonAnimation(button) {
    const originalText = button.textContent;
    const originalBgColor = button.style.backgroundColor;
    
    // Change button state
    button.textContent = '✓ Added';
    button.style.backgroundColor = '#2ecc71';
    button.disabled = true;
    
    // Restore after 1.5 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBgColor;
        button.disabled = false;
    }, 1500);
}

function enhanceProductCards() {
    // Add hover effects and quick view functionality
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Ensure each card has proper data attributes
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        if (addToCartBtn && !addToCartBtn.dataset.id) {
            // Extract product ID from somewhere (you might need to store it in the card)
            const productTitle = card.querySelector('.product-title')?.textContent;
            if (productTitle && window.products) {
                const product = window.products.find(p => p.name === productTitle);
                if (product) {
                    addToCartBtn.dataset.id = product.id;
                }
            }
        }
        
        // Add quick view on click (optional feature)
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking the add to cart button
            if (e.target.closest('.btn-add-to-cart')) return;
            
            const productId = this.querySelector('.btn-add-to-cart')?.dataset.id;
            if (productId) {
                showQuickView(parseInt(productId));
            }
        });
    });
}

function showQuickView(productId) {
    // Optional: Show a quick view modal for the product
    console.log('Show quick view for product:', productId);
    // You can implement this as a modal with more product details
}

// ============================================
// CART PERSISTENT UPDATES
// ============================================

function setupCartPersistentUpdates() {
    if (!AppState.cart) return;
    
    // Listen for cart updates from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'mayorStoreCart') {
            // Cart was updated in another tab
            const newCart = JSON.parse(e.newValue || '[]');
            const oldCart = JSON.parse(e.oldValue || '[]');
            
            // Find what changed
            const changes = findCartChanges(oldCart, newCart);
            
            if (changes.added.length > 0 || changes.removed.length > 0 || changes.updated.length > 0) {
                // Update local cart instance
                AppState.cart.cart = newCart;
                
                // Update UI
                AppState.cart.updateCartCount();
                AppState.cart.updateCartDisplay();
                
                // Show notification about the sync
                showNotification('Cart updated from another tab', 'info', 3000);
            }
        }
    });
    
    // Auto-save cart before page unload
    window.addEventListener('beforeunload', function() {
        if (AppState.cart && AppState.cart.cart.length > 0) {
            // Ensure cart is saved
            AppState.cart.saveCart();
        }
    });
    
    // Periodically save cart (every 30 seconds)
    setInterval(() => {
        if (AppState.cart && AppState.cart.cart.length > 0) {
            AppState.cart.saveCart();
        }
    }, 30000);
    
    // Listen for online/offline status to sync cart
    window.addEventListener('online', function() {
        if (AppState.cart) {
            // If there were pending updates while offline, process them
            syncCartWithServer();
        }
    });
}

function findCartChanges(oldCart, newCart) {
    const changes = {
        added: [],
        removed: [],
        updated: []
    };
    
    // Create maps for easy comparison
    const oldMap = new Map(oldCart.map(item => [item.id, item]));
    const newMap = new Map(newCart.map(item => [item.id, item]));
    
    // Find added items
    newCart.forEach(item => {
        if (!oldMap.has(item.id)) {
            changes.added.push(item);
        }
    });
    
    // Find removed items
    oldCart.forEach(item => {
        if (!newMap.has(item.id)) {
            changes.removed.push(item);
        }
    });
    
    // Find updated quantities
    oldCart.forEach(oldItem => {
        const newItem = newMap.get(oldItem.id);
        if (newItem && newItem.quantity !== oldItem.quantity) {
            changes.updated.push({
                id: oldItem.id,
                oldQuantity: oldItem.quantity,
                newQuantity: newItem.quantity
            });
        }
    });
    
    return changes;
}

function syncCartWithServer() {
    // In a real application, this would sync the cart with a backend server
    // For now, we'll just log it
    console.log('Syncing cart with server...');
    
    if (AppState.cart && AppState.cart.cart.length > 0) {
        // Simulate API call
        setTimeout(() => {
            console.log('Cart synced successfully');
        }, 1000);
    }
}

function checkForPendingCartUpdates() {
    // Check if there are any pending cart updates (e.g., from previous session)
    const pendingUpdates = localStorage.getItem('pendingCartUpdates');
    if (pendingUpdates) {
        try {
            const updates = JSON.parse(pendingUpdates);
            if (updates.length > 0) {
                showNotification('Processing previous cart updates...', 'info');
                // Process updates here
                localStorage.removeItem('pendingCartUpdates');
            }
        } catch (e) {
            console.error('Error parsing pending cart updates:', e);
        }
    }
}

// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

function setupAuthUI() {
    // Check initial auth state
    updateAuthUI();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Listen for auth changes from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'userLoggedIn' || e.key === 'userName' || e.key === 'userEmail') {
            updateAuthUI();
        }
    });
}

function updateAuthUI() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.querySelector('.user-info');
    const userNameSpan = document.querySelector('.user-name');
    
    if (isLoggedIn) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userNameSpan) userNameSpan.textContent = `Welcome, ${userName.split('@')[0]}`;
        
        // Store user in app state
        AppState.user = {
            name: localStorage.getItem('userName') || userName,
            email: localStorage.getItem('userEmail') || ''
        };
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        
        // Clear user from app state
        AppState.user = null;
    }
}

function restoreUserSession() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (isLoggedIn) {
        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
        console.log('Restored user session for:', userName);
        
        // You could fetch fresh user data from server here
        // For now, just update UI
        updateAuthUI();
    }
}

function handleLogout() {
    // Confirm logout
    if (!confirm('Are you sure you want to logout?')) return;
    
    // Clear user data
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Update UI
    updateAuthUI();
    
    // Show message
    showNotification('Logged out successfully', 'info');
    
    // Clear cart (optional - you might want to keep it)
    // if (AppState.cart) {
    //     AppState.cart.clearCart();
    // }
    
    // Track logout event
    trackEvent('logout');
}

// ============================================
// FORM HANDLING
// ============================================

function setupFormToggles() {
    // Login/Register form toggles
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLoginForm = document.getElementById('closeLoginForm');
    const closeRegisterForm = document.getElementById('closeRegisterForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Setup event listeners
    if (loginBtn) loginBtn.addEventListener('click', () => showForm('loginForm'));
    if (registerBtn) registerBtn.addEventListener('click', () => showForm('registerForm'));
    if (closeLoginForm) closeLoginForm.addEventListener('click', () => hideForm('loginForm'));
    if (closeRegisterForm) closeRegisterForm.addEventListener('click', () => hideForm('registerForm'));
    if (switchToRegister) switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms('loginForm', 'registerForm');
    });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms('registerForm', 'loginForm');
    });
    
    // Form submissions
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    // Close forms when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('form-container')) {
            hideForm(e.target.id);
        }
    });
    
    // Close forms with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideForm('loginForm');
            hideForm('registerForm');
        }
    });
}

function showForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = form.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
        
        trackEvent('open_form', { form_type: formId.replace('Form', '') });
    }
}

function hideForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const formElement = form.querySelector('form');
        if (formElement) formElement.reset();
    }
}

function switchForms(fromFormId, toFormId) {
    hideForm(fromFormId);
    setTimeout(() => showForm(toFormId), 300);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('.form-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Store user info
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Update UI
        updateAuthUI();
        
        // Hide form
        hideForm('loginForm');
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success
        showNotification('Login successful! Welcome back.', 'success');
        
        // Track login
        trackEvent('login_success');
        
        // Reset form
        e.target.reset();
        
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('.form-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Store user info
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        
        // Update UI
        updateAuthUI();
        
        // Hide form
        hideForm('registerForm');
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success
        showNotification('Registration successful! Welcome to Mayor\'s Store.', 'success');
        
        // Track registration
        trackEvent('registration_success');
        
        // Reset form
        e.target.reset();
        
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// MOBILE & RESPONSIVE
// ============================================

function setupMobileMenu() {
    // Create mobile menu toggle button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Insert after logo
    const logo = document.querySelector('.logo');
    if (logo && !document.querySelector('.menu-toggle')) {
        logo.parentNode.insertBefore(menuToggle, logo.nextSibling);
    }
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
        
        // Update aria label
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        menuToggle.innerHTML = isExpanded ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (navLinks && navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
    
    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    }, 250));
}

function setupSmoothScrolling() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or if it's a form toggle link
            if (href === '#' || this.classList.contains('form-toggle')) {
                return;
            }
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const menuToggle = document.querySelector('.menu-toggle');
                    if (menuToggle) {
                        menuToggle.setAttribute('aria-expanded', 'false');
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// SESSION & PERFORMANCE
// ============================================

function setupSessionTracking() {
    // Track session start
    const sessionStart = Date.now();
    localStorage.setItem('currentSessionStart', sessionStart.toString());
    
    // Track page views
    trackEvent('page_view', {
        page: window.location.pathname,
        referrer: document.referrer
    });
    
    // Track time on page
    window.addEventListener('beforeunload', () => {
        const sessionEnd = Date.now();
        const sessionStart = parseInt(localStorage.getItem('currentSessionStart') || '0');
        const sessionDuration = sessionEnd - sessionStart;
        
        trackEvent('session_end', {
            duration: sessionDuration,
            cart_items: AppState.cart ? AppState.cart.getCartItemCount() : 0,
            cart_total: AppState.cart ? AppState.cart.getCartTotal() : 0
        });
    });
}

function setupOfflineDetection() {
    // Update UI based on online status
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const statusElement = document.getElementById('onlineStatus') || createOnlineStatusElement();
        
        if (isOnline) {
            statusElement.className = 'online-status online';
            statusElement.innerHTML = '<i class="fas fa-wifi"></i> Online';
        } else {
            statusElement.className = 'online-status offline';
            statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Offline';
            showNotification('You are currently offline. Some features may be limited.', 'warning', 5000);
        }
    }
    
    function createOnlineStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'onlineStatus';
        statusElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(statusElement);
        return statusElement;
    }
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
}

function setupPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
        if (window.performance) {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            console.log(`Page loaded in ${loadTime}ms`);
            
            if (loadTime > 3000) {
                console.warn('Page load time exceeds 3 seconds');
            }
        }
    });
}

function setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error caught:', e.error);
        
        // Don't show notification for common errors
        if (e.message.includes('ResizeObserver') || e.message.includes('fetch')) {
            return;
        }
        
        showNotification('An error occurred. Please try again.', 'error');
        
        // Log error (in production, send to error tracking service)
        trackEvent('error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        showNotification('Something went wrong. Please refresh the page.', 'error');
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        animation: notificationSlide 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add close button for longer notifications
    if (duration > 5000) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 15px;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        notification.appendChild(closeBtn);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after duration
    const removeTimer = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // Allow manual dismissal
    notification.addEventListener('click', () => {
        clearTimeout(removeTimer);
        notification.remove();
    });
}

function trackEvent(eventName, data = {}) {
    // In a real application, send to analytics service
    // For now, just log to console
    console.log(`Event: ${eventName}`, {
        ...data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent
    });
    
    // You could send to Google Analytics, Mixpanel, etc.
    // Example: gtag('event', eventName, data);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// EXPORT FOR TESTING
// ============================================

// Make functions available for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApplication,
        handleAddToCart,
        handleLogin,
        handleRegister,
        showNotification,
        isValidEmail,
        debounce,
        throttle
    };
}

// Initialize the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
} else {
    initApplication();
}
// In your main app.js initialization
function initApplication() {
    // ... existing code ...
    
    // Initialize about section
    if (typeof initAboutSection === 'function') {
        initAboutSection();
    }
    
    // ... rest of your initialization ...
}

// Add smooth scrolling for About link
function setupSmoothScrolling() {
    // ... existing code ...
    
    // Add specific handler for About link
    const aboutLink = document.querySelector('a[href="#about"]');
    if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const menuToggle = document.querySelector('.menu-toggle');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
            
            // Calculate offset for fixed header
            const headerHeight = document.querySelector('header')?.offsetHeight || 80;
            const targetPosition = document.getElementById('about').offsetTop - headerHeight;
            
            // Smooth scroll
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Focus on about section for screen readers
            setTimeout(() => {
                document.getElementById('about').setAttribute('tabindex', '-1');
                document.getElementById('about').focus();
            }, 500);
        });
    }
}
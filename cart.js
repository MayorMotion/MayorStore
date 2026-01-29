// cart.js - COMPLETE FIXED VERSION WITH WORKING CART BUTTONS

class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('mayorStoreCart')) || [];
        this.initializeCart();
    }

    initializeCart() {
        console.log('Initializing cart with', this.cart.length, 'items');
        this.updateCartCount();
        this.setupCartEventListeners();
        this.setupGlobalEventDelegation(); // Handles all button clicks
    }

    setupCartEventListeners() {
        // Cart icon click
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCart();
            });
        }

        // Close cart button
        const closeCartBtn = document.getElementById('closeCart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.checkout();
            });
        }

        // Shop Now button
        const shopNowBtn = document.getElementById('shopNowBtn');
        if (shopNowBtn) {
            shopNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    setupGlobalEventDelegation() {
        console.log('Setting up global event delegation');
        
        // Listen for clicks on the entire document
        document.addEventListener('click', (e) => {
            this.handleButtonClick(e);
        });

        // Also listen specifically on the cart items container
        const cartItemsContainer = document.getElementById('cartItems');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                this.handleCartButtonClick(e);
            });
        }
    }

    handleButtonClick(e) {
        // Handle Add to Cart buttons on product cards
        const addToCartBtn = e.target.closest('.btn-add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = parseInt(addToCartBtn.dataset.id);
            if (productId && window.products) {
                const product = window.products.find(p => p.id === productId);
                if (product) {
                    this.addToCart(product);
                    
                    // Visual feedback
                    const originalText = addToCartBtn.textContent;
                    const originalBg = addToCartBtn.style.backgroundColor;
                    addToCartBtn.textContent = '✓ Added';
                    addToCartBtn.style.backgroundColor = '#2ecc71';
                    addToCartBtn.disabled = true;
                    
                    setTimeout(() => {
                        addToCartBtn.textContent = originalText;
                        addToCartBtn.style.backgroundColor = originalBg;
                        addToCartBtn.disabled = false;
                    }, 1500);
                }
            }
            return;
        }
    }

    handleCartButtonClick(e) {
        // Handle all cart item buttons
        e.stopPropagation();
        
        // Check for decrease button
        const decreaseBtn = e.target.closest('.decrease');
        if (decreaseBtn) {
            e.preventDefault();
            const productId = parseInt(decreaseBtn.dataset.id);
            if (productId) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    if (item.quantity > 1) {
                        this.updateQuantity(productId, item.quantity - 1);
                    } else {
                        this.removeFromCart(productId);
                    }
                }
            }
            return;
        }
        
        // Check for increase button
        const increaseBtn = e.target.closest('.increase');
        if (increaseBtn) {
            e.preventDefault();
            const productId = parseInt(increaseBtn.dataset.id);
            if (productId) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            }
            return;
        }
        
        // Check for remove button
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) {
            e.preventDefault();
            const productId = parseInt(removeBtn.dataset.id);
            if (productId) {
                this.removeFromCart(productId);
            }
            return;
        }
        
        // Check for trash icon inside remove button
        const trashIcon = e.target.closest('.fa-trash');
        if (trashIcon) {
            e.preventDefault();
            const removeBtn = trashIcon.closest('.remove-item');
            if (removeBtn) {
                const productId = parseInt(removeBtn.dataset.id);
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
            return;
        }
    }

    addToCart(product, quantity = 1) {
        console.log('Adding to cart:', product.name);
        
        // Check if product already exists in cart
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            this.showNotification(`${product.name} quantity updated to ${existingItem.quantity}!`, 'success');
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
            this.showNotification(`${product.name} added to cart!`, 'success');
        }

        // Update cart in localStorage
        this.saveCart();
        
        // Update UI
        this.updateCartCount();
        this.updateCartDisplay();
        
        // Show cart briefly if it's closed
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && !cartSidebar.classList.contains('cart-open')) {
            this.showCartBriefly();
        }

        // Add animation to cart icon
        this.animateCartIcon();
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            
            // Update cart in localStorage
            this.saveCart();
            
            // Update UI
            this.updateCartCount();
            this.updateCartDisplay();
            
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
        }
    }

    updateQuantity(productId, newQuantity) {
        console.log('Updating quantity for product', productId, 'to', newQuantity);
        
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = newQuantity;
            
            // Update cart in localStorage
            this.saveCart();
            
            // Update UI immediately
            this.updateCartCount();
            this.updateCartDisplay();
            
            // Show notification for significant changes
            if (Math.abs(newQuantity - oldQuantity) > 0) {
                this.showNotification(`${item.name} quantity: ${newQuantity}`, 'info');
            }
        }
    }

    saveCart() {
        localStorage.setItem('mayorStoreCart', JSON.stringify(this.cart));
        console.log('Cart saved to localStorage:', this.cart.length, 'items');
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            // Show/hide cart count badge
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
            
            console.log('Cart count updated:', totalItems);
        }
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!cartItemsContainer || !cartTotalElement) {
            console.error('Cart elements not found!');
            return;
        }

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p>Add some products to get started</p>
                </div>
            `;
            cartTotalElement.textContent = '$0.00';
            console.log('Cart display updated: Empty');
            return;
        }

        // Calculate total
        let total = 0;
        
        // Build cart items HTML
        cartItemsContainer.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}" 
                                    title="Decrease quantity">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}"
                                    title="Increase quantity">+</button>
                            <button class="remove-item" data-id="${item.id}" 
                                    title="Remove from cart">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update total
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
        
        console.log('Cart display updated:', this.cart.length, 'items, Total: $' + total.toFixed(2));
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            const isOpening = !cartSidebar.classList.contains('cart-open');
            cartSidebar.classList.toggle('cart-open');
            
            if (isOpening) {
                this.addOverlay();
                this.updateCartDisplay();
                console.log('Cart opened');
            } else {
                this.removeOverlay();
                console.log('Cart closed');
            }
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('cart-open');
        }
        this.removeOverlay();
    }

    showCartBriefly() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            this.toggleCart();
            
            // Auto close after 3 seconds
            setTimeout(() => {
                if (cartSidebar.classList.contains('cart-open')) {
                    this.closeCart();
                }
            }, 3000);
        }
    }

    addOverlay() {
        let overlay = document.querySelector('.overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1400;
                display: none;
            `;
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'block';
        console.log('Overlay added');
    }

    removeOverlay() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('Overlay removed');
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty! Add some products first.', 'error');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        this.showNotification(`Proceeding to checkout with $${total.toFixed(2)} total`, 'success');
        
        // Simulate checkout process
        setTimeout(() => {
            // Clear cart after checkout
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.updateCartDisplay();
            this.closeCart();
            
            this.showNotification('Order placed successfully! Thank you for shopping with us.', 'success');
        }, 1500);
    }

    animateCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.classList.add('added-to-cart');
            setTimeout(() => {
                cartIcon.classList.remove('added-to-cart');
            }, 500);
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
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
        `;
        
        // Set background color based on type
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add CSS animation if not already present
        if (!document.querySelector('#notification-animation')) {
            const style = document.createElement('style');
            style.id = 'notification-animation';
            style.textContent = `
                @keyframes notificationSlide {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
        console.log('Notification:', message);
    }

    // Public methods
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    }
    
    // Debug method
    debugCart() {
        console.log('=== CART DEBUG ===');
        console.log('Items:', this.cart);
        console.log('Total items:', this.getCartItemCount());
        console.log('Total price:', this.getCartTotal());
        console.log('LocalStorage:', localStorage.getItem('mayorStoreCart'));
        console.log('==================');
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    // Wait for products to load
    const initCart = () => {
        if (window.products) {
            window.cart = new ShoppingCart();
            console.log('✅ Cart initialized successfully');
            console.log('Available products:', window.products.length);
            
            // Add debug button for testing
            addDebugButton();
        } else {
            setTimeout(initCart, 100);
        }
    };
    
    initCart();
});

// Add debug button for testing
function addDebugButton() {
    if (document.getElementById('debugCartBtn')) return;
    
    const debugBtn = document.createElement('button');
    debugBtn.id = 'debugCartBtn';
    debugBtn.textContent = 'Debug Cart';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 10px;
        padding: 10px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
        font-size: 12px;
    `;
    
    debugBtn.addEventListener('click', () => {
        if (window.cart) {
            window.cart.debugCart();
            alert('Check console for cart debug info!');
        }
    });
    
    document.body.appendChild(debugBtn);
}

// Make cart globally available
window.ShoppingCart = ShoppingCart;
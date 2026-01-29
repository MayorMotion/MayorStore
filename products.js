// products.js - Product Data and Rendering
console.log('products.js loading...');

// Global products array
window.products = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 2,
        name: "Smart Watch Series 5",
        description: "Advanced smartwatch with health monitoring, GPS, and water resistance up to 50m.",
        price: 249.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 3,
        name: "4K Ultra HD Television",
        description: "55-inch 4K UHD Smart TV with HDR and streaming capabilities.",
        price: 699.99,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 4,
        name: "Gaming Laptop Pro",
        description: "High-performance gaming laptop with RTX graphics and 16GB RAM.",
        price: 1299.99,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 5,
        name: "Wireless Mechanical Keyboard",
        description: "Ergonomic wireless mechanical keyboard with RGB lighting and customizable keys.",
        price: 119.99,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 6,
        name: "Smartphone Pro Max",
        description: "Latest smartphone with triple camera system, 5G connectivity, and all-day battery.",
        price: 1099.99,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        id: 7,
        name: "Noise Cancelling Earbuds",
        description: "True wireless earbuds with active noise cancellation and 24-hour battery case.",
        price: 159.99,
        image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: "electronics"
    },
    {
        id: 8,
        name: "Fitness Tracker Band",
        description: "Water-resistant fitness tracker with heart rate monitor and sleep tracking.",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
     {
        id: "9",
        name: "Coffee Mug",
        description: "Ceramic coffee mug with a sleek design and comfortable grip.",
        price: 67.99,
        image: "download (32).jpg",
        category: "home"
    }
];

// Function to render products
function renderProducts() {
    console.log('Rendering products...');
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.error('ERROR: productsGrid element not found!');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    window.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn-add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    console.log('Products rendered:', window.products.length);
    
    // Initialize event listeners after rendering
    if (window.attachProductEventListeners) {
        setTimeout(() => window.attachProductEventListeners(), 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', renderProducts);

// Also render on window load as backup
window.addEventListener('load', function() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid && productsGrid.children.length === 0) {
        console.log('Re-rendering products...');
        renderProducts();
    }
});

console.log('products.js loaded successfully');
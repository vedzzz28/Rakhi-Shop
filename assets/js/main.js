// ===== MAIN JAVASCRIPT FILE - FIXED STOCK HANDLING =====
// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== DOM LOADED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== INITIALIZE APPLICATION =====
function initializeApp() {
    setupNavigation();
    updateCartCount();
    setMinDate();
    handleActiveNavigation();
}

// ===== NAVIGATION FUNCTIONALITY =====
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// ===== CART FUNCTIONALITY =====
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Add animation when count changes
        cartCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
}

function addToCart(productId, productName, productPrice, productImage, productCategory, productStock) {
    // FIXED: Proper stock handling - only use default when stock is missing/empty/null
    let stock;
    if (productStock !== undefined && productStock !== null && productStock !== '') {
        stock = parseInt(productStock);
        // If parseInt returns NaN, use 10 as default
        stock = isNaN(stock) ? 10 : stock;
    } else {
        stock = 10; // Default only when stock is missing/empty/null
    }
    
    console.log(`Adding to cart: ${productName}, productStock param: ${productStock}, parsed stock: ${stock}`);
    
    const existingItem = cart.find(item => item.id === productId);
    
    // Check if out of stock
    if (stock <= 0) {
        showToast('This item is out of stock', 'error');
        return;
    }
    
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showToast(`Only ${stock} items available in stock`, 'error');
            return;
        }
        existingItem.quantity += 1;
        existingItem.stock = stock; // Update stock in cart item
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            category: productCategory,
            quantity: 1,
            stock: stock
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Added to cart successfully!', 'success');
    
    // Update button state temporarily
    const button = document.querySelector(`[onclick*="${productId}"]`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = stock <= 0;
        }, 1500);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Only show essential user notifications (cart actions, etc.)
    if (type === 'info' || type === 'loading') {
        return; // Skip debugging messages
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Apply type-specific styling
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after duration
    const duration = type === 'error' ? 4000 : 3000;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// ===== MODAL FUNCTIONALITY =====
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// ===== FORM VALIDATION =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function validatePincode(pincode) {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.style.borderColor = 'var(--primary-red)';
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.style.borderColor = 'var(--light-gray)';
        errorElement.classList.remove('show');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
    
    const fields = document.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        field.style.borderColor = 'var(--light-gray)';
    });
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
}

function setMinDate() {
    const dateInput = document.getElementById('deliveryDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// ===== ACTIVE NAVIGATION HANDLING =====
function handleActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ===== SMOOTH SCROLLING =====
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== LOADING STATES =====
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// ===== IMAGE LAZY LOADING =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== SEARCH FUNCTIONALITY =====
function handleSearch(searchTerm, products) {
    if (!searchTerm) return products;
    
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// ===== LOCAL STORAGE HELPERS =====
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ===== PRODUCT CARD GENERATION =====
// Add this helper function in main.js
function isSilverRakhi(product) {
    return product.category && product.category.toLowerCase().includes('silver');
}

// Update createProductCard function to show silver note
function createProductCard(product) {
    const isOutOfStock = product.stock <= 0;
    const isSilver = isSilverRakhi(product);
    
    return `
        <div class="product-card" data-category="${product.category.toLowerCase().replace(/\s+/g, '-')}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-badge">${product.category}</div>
                <button class="quick-view-btn" onclick="quickView('${product.id}')" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
                ${isOutOfStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                ${isSilver ? '<div class="silver-note" style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">*Limited coupon discounts applicable</div>' : ''}
                ${product.stock <= 5 && product.stock > 0 ? `<div class="low-stock">Only ${product.stock} left!</div>` : ''}
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name}', '${product.price}', '${product.image}', '${product.category}', '${product.stock}')" ${isOutOfStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
}

// ===== DELIVERY CHARGE CALCULATION =====
function calculateDeliveryCharge(city) {
    const jodhpurKeywords = ['jodhpur', 'जोधपुर'];
    const cityLower = city.toLowerCase();
    
    const isJodhpur = jodhpurKeywords.some(keyword => 
        cityLower.includes(keyword)
    );
    
    return isJodhpur ? 20 : 60; // ₹20 for Jodhpur, ₹60 for outside
}

// ===== ERROR HANDLING =====
function handleError(error, userMessage = 'Something went wrong. Please try again.') {
    console.error('Error:', error);
    showToast(userMessage, 'error');
}

// ===== PERFORMANCE OPTIMIZATION =====
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

// ===== SCROLL TO TOP =====
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button functionality
window.addEventListener('scroll', throttle(() => {
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    }
}, 100));

// Email template preparation functions
function prepareOwnerEmailData(orderData) {
    const itemsList = orderData.items.map(item => 
        `${item.name} (${item.category}) - Qty: ${item.quantity} - Price: ${formatPrice(item.price)} each`
    ).join('\n');

    return {
        to_email: 'ruchirathi@email.com', // Replace with actual owner email
        order_id: orderData.orderId,
        order_date: new Date(orderData.timestamp).toLocaleDateString('en-IN'),
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        customer_alt_phone: orderData.customer.altPhone || 'Not provided',
        customer_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        delivery_area: orderData.delivery.area === 'jodhpur' ? 'Within Jodhpur' : 'Outside Jodhpur',
        delivery_date: orderData.delivery.preferredDate,
        special_instructions: orderData.delivery.instructions || 'None',
        items_list: itemsList,
        subtotal: formatPrice(orderData.payment.subtotal),
        delivery_charge: formatPrice(orderData.payment.deliveryCharge),
        discount: orderData.payment.discount > 0 ? formatPrice(orderData.payment.discount) : 'No discount',
        total_amount: formatPrice(orderData.payment.total),
        payment_method: orderData.payment.method,
        upi_id: orderData.payment.upiId || 'Not applicable',
        coupon_code: orderData.coupon ? orderData.coupon.code : 'None applied'
    };
}

function prepareCustomerEmailData(orderData) {
    const itemsList = orderData.items.map(item => 
        `${item.name} - Qty: ${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    return {
        to_email: orderData.customer.email,
        customer_name: orderData.customer.name,
        order_id: orderData.orderId,
        order_date: new Date(orderData.timestamp).toLocaleDateString('en-IN'),
        items_list: itemsList,
        delivery_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        delivery_area: orderData.delivery.area === 'jodhpur' ? 'Within Jodhpur' : 'Outside Jodhpur',
        subtotal: formatPrice(orderData.payment.subtotal),
        delivery_charge: formatPrice(orderData.payment.deliveryCharge),
        total_amount: formatPrice(orderData.payment.total),
        payment_method: orderData.payment.method,
        upi_id: orderData.payment.upiId || '',
        shop_phone_1: '+91 9460250677',
        shop_phone_2: '+91 8949409523',
        shop_address: 'A-31, Umed Club Road, Raika Bagh, Jodhpur, Rajasthan'
    };
}

// ===== EXPORT FUNCTIONS FOR OTHER MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        showToast,
        showModal,
        hideModal,
        validateEmail,
        validatePhone,
        validatePincode,
        formatPrice,
        generateOrderId,
        calculateDeliveryCharge,
        handleError,
        debounce,
        throttle
    };
}

// ===== CHECK FOR CATEGORY FILTER FROM INDEX PAGE =====
function checkForCategoryFilter() {
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
        // Apply the category filter
        currentFilters.category = selectedCategory;
        
        // Update the desktop filter radio button
        const categoryRadio = document.querySelector(`input[name="category"][value="${selectedCategory}"]`);
        if (categoryRadio) {
            categoryRadio.checked = true;
        }
        
        // Update mobile filter
        const mobileCategoryRadio = document.querySelector(`input[name="mobileCategory"][value="${selectedCategory}"]`);
        if (mobileCategoryRadio) {
            mobileCategoryRadio.checked = true;
        }
        
        // Clear the stored category
        localStorage.removeItem('selectedCategory');
        
        // Apply filters after products are loaded
        setTimeout(() => {
            applyFilters();
            // Show toast message
            const categoryName = getCategoryDisplayName(selectedCategory);
            showToast(`Showing ${categoryName}`, 'success');
        }, 100);
    }
}

function getCategoryDisplayName(category) {
    const categoryNames = {
        'thread': 'Thread Rakhis',
        'designer': 'Designer Rakhis', 
        'lumba': 'Lumba Rakhis',
        'silver': 'Silver Rakhis',
        'kids': 'Kids Rakhis',
        'bhaiya-bhabhi': 'Bhaiya-Bhabhi Sets',
        'sacred-accessories': 'Sacred Accessories'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
}
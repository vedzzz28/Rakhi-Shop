// ===== CART PAGE JAVASCRIPT - ENHANCED VERSION =====
let currentDeliveryArea = 'jodhpur';
let appliedCouponData = null; // Store coupon details instead of just discount amount
let removeItemId = null;

// ===== UPDATED COUPON SYSTEM - 3 SPECIFIC COUPONS + 2 PRIVATE COUPONS =====
const AVAILABLE_COUPONS = {
    'JODHPUR10': { 
        discount: 10, 
        type: 'percentage', 
        minOrder: 0, 
        deliveryArea: 'jodhpur',
        description: '10% off for delivery within Jodhpur',
        maxDiscount: 10000
    },
    'BIGORDER150': { 
        discount: 150, 
        type: 'fixed', 
        minOrder: 2000,
        description: 'Flat ₹150 off on orders above ₹2000'
    },
    'PUJATHALI': { 
        discount: 0, 
        type: 'gift', 
        minOrder: 1500,
        description: 'Free mini puja thali on orders above ₹1500',
        gift: 'Mini Puja Thali'
    },
    'VEDZZZ20': {
        discount: 20,
        type: 'percentage',
        minOrder: 0,
        hidden: true,
        description: '20% off (Exclusive)'
    },
    'VEDZZSP10': {
        discount: 25,
        type: 'percentage',
        minOrder: 2000,
        hidden: true,
        deliveryArea: 'jodhpur',
        description: '25% off (Super Exclusive)'
    }
};

// ===== INITIALIZE CART PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cart.html') || window.location.pathname.endsWith('cart')) {
        initializeCart();
    }
});

function initializeCart() {
    loadCartItems();
    setupDeliveryOptions();
    setupEventListeners();
    restoreCartState(); // Restore coupon state
    updateCartSummary();
    loadRecommendedProducts();
    displayEligibleCoupons(); // Show available coupons
}

// ===== LOAD CART ITEMS =====
function loadCartItems() {
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    
    if (cartItemsList) {
        cartItemsList.innerHTML = cart.map(createCartItem).join('');
    }
}

// ===== CREATE CART ITEM HTML (WITH STOCK LIMITS) =====
function createCartItem(item) {
    const subtotal = item.price * item.quantity;
    const maxStock = item.stock || 10; // Use stock from item, fallback to 10
    
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center'">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.category}</p>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                ${maxStock <= 5 ? `<div class="low-stock" style="color: #f59e0b; font-size: 0.8rem; margin-top: 4px;">Only ${maxStock} left in stock!</div>` : ''}
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')" ${item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       onchange="updateQuantity('${item.id}', this.value)" min="1" max="${maxStock}">
                <button class="quantity-btn" onclick="increaseQuantity('${item.id}')" ${item.quantity >= maxStock ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-subtotal">
                <div class="subtotal-amount">${formatPrice(subtotal)}</div>
                <button class="remove-item-btn" onclick="showRemoveConfirmation('${item.id}')" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== QUANTITY MANAGEMENT (STOCK-BASED LIMITS) =====
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        updateCartData();
    }
}

function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    const maxStock = item.stock || 10; // Use stock from item, fallback to 10
    
    if (item && item.quantity < maxStock) {
        item.quantity += 1;
        updateCartData();
    } else if (item) {
        showToast(`Only ${maxStock} items available in stock`, 'error');
    }
}

function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    const item = cart.find(item => item.id === productId);
    
    if (!item) {
        showToast('Product not found in cart', 'error');
        loadCartItems();
        return;
    }
    
    const maxStock = item.stock || 10; // Use stock from item, fallback to 10
    
    if (isNaN(quantity) || quantity < 1) {
        showToast('Invalid quantity', 'error');
        loadCartItems(); // Reset to original values
        return;
    }
    
    if (quantity > maxStock) {
        showToast(`Only ${maxStock} items available in stock`, 'error');
        loadCartItems(); // Reset to original values
        return;
    }
    
    item.quantity = quantity;
    updateCartData();
}

// ===== UPDATE CART DATA (WITH DYNAMIC DISCOUNT NOTIFICATION) =====
function updateCartData() {
    // Store previous discount for comparison
    const previousDiscount = appliedCouponData ? calculateCurrentDiscount() : 0;
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
    updateCartSummary();
    displayEligibleCoupons(); // Update available coupons
    
    // Show notification if discount changed due to quantity change
    if (appliedCouponData) {
        const newDiscount = calculateCurrentDiscount();
            
        if (newDiscount !== previousDiscount && newDiscount > 0) {
            showToast(`Discount updated to ${formatPrice(newDiscount)} based on new cart total`, 'success');
        }
    }
    
    showToast('Cart updated', 'success');
}

// ===== SETUP DELIVERY OPTIONS =====
function setupDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            currentDeliveryArea = this.value;
            updateCartSummary();
            displayEligibleCoupons(); // Update available coupons based on delivery area
            
            // Check if current coupon is still valid
            if (appliedCouponData && appliedCouponData.deliveryArea && appliedCouponData.deliveryArea !== currentDeliveryArea) {
                removeCoupon();
                showToast('Coupon removed: Not valid for selected delivery area', 'warning');
            }
        });
    });
}

// ===== CALCULATE CURRENT DISCOUNT =====
function calculateCurrentDiscount() {
    if (!appliedCouponData) return 0;
    
    const subtotal = getCartTotal();
    
    if (subtotal < appliedCouponData.minOrder) return 0;
    
    if (appliedCouponData.type === 'percentage') {
        const discount = Math.round((subtotal * appliedCouponData.discount) / 100);
        return appliedCouponData.maxDiscount ? Math.min(discount, appliedCouponData.maxDiscount) : discount;
    } else if (appliedCouponData.type === 'fixed') {
        return appliedCouponData.discount;
    }
    
    return 0; // For gift type coupons
}

// ===== UPDATE CART SUMMARY (WITH DYNAMIC DISCOUNT CALCULATION) =====
function updateCartSummary() {
    const itemCount = document.getElementById('itemCount');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryCharges = document.getElementById('deliveryCharges');
    const totalAmount = document.getElementById('totalAmount');
    
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderDelivery = document.getElementById('orderDelivery');
    const orderTotal = document.getElementById('orderTotal');
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    // Calculate values
    const subtotal = getCartTotal();
    const itemsCount = getCartItemCount();
    let delivery = 0;
    
    if (currentDeliveryArea === 'jodhpur') {
        delivery = 30;
    } else {
        delivery = 70; // Courier charges for outside Jodhpur
    }
    
    // Calculate dynamic discount based on current cart total
    const currentDiscount = calculateCurrentDiscount();
    
    // Check if coupon should be removed due to minimum order not met
    if (appliedCouponData && subtotal < appliedCouponData.minOrder) {
        appliedCouponData = null;
        localStorage.removeItem('appliedCoupon');
        showToast(`Coupon removed: Order total below minimum requirement`, 'warning');
    }
    
    const total = subtotal + delivery - currentDiscount;
    
    // Update cart page elements
    if (itemCount) itemCount.textContent = itemsCount;
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (deliveryCharges) {
        deliveryCharges.textContent = currentDeliveryArea === 'jodhpur' ? 
            formatPrice(delivery) : formatPrice(delivery) + ' (Courier)';
    }
    if (totalAmount) {
        totalAmount.textContent = formatPrice(total);
    }
    
    // Update checkout page elements (if present)
    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
    if (orderDelivery) {
        orderDelivery.textContent = currentDeliveryArea === 'jodhpur' ? 
            formatPrice(delivery) : formatPrice(delivery) + ' (Courier)';
    }
    if (orderTotal) {
        orderTotal.textContent = formatPrice(total);
    }
    
    // Show/hide discount row only if there's a discount
    if (discountRow) {
        if (currentDiscount > 0 && appliedCouponData) {
            discountRow.style.display = 'flex';
            if (discountAmount) {
                let discountText = '-' + formatPrice(currentDiscount);
                if (appliedCouponData.type === 'gift') {
                    discountText = `FREE: ${appliedCouponData.gift}`;
                }
                discountAmount.textContent = discountText;
            }
            
            // Update coupon display with current discount
            const couponInput = document.getElementById('couponCode');
            const couponInputMobile = document.getElementById('couponCodeMobile');
            if (couponInput && appliedCouponData) {
                couponInput.value = appliedCouponData.code;
            }
            if (couponInputMobile && appliedCouponData) {
                couponInputMobile.value = appliedCouponData.code;
            }
            
            console.log('Cart: Showing dynamic discount:', currentDiscount, 'from coupon:', appliedCouponData.code);
        } else {
            discountRow.style.display = 'none';
            console.log('Cart: Hiding discount row, discount:', currentDiscount);
        }
    }
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// ===== DISPLAY ELIGIBLE COUPONS (ONLY SHOW IF ELIGIBLE) =====
function displayEligibleCoupons() {
    const subtotal = getCartTotal();
    const eligibleCoupons = getEligibleCoupons(subtotal, currentDeliveryArea);
    
    // Create coupon suggestions section if it doesn't exist
    let couponSuggestions = document.getElementById('couponSuggestions');
    if (!couponSuggestions && eligibleCoupons.length > 0) {
        couponSuggestions = document.createElement('div');
        couponSuggestions.id = 'couponSuggestions';
        couponSuggestions.className = 'coupon-suggestions';
        couponSuggestions.innerHTML = `
            <h4>🎉 Special Offers Available!</h4>
            <div class="coupon-list" id="couponList"></div>
        `;
        
        // Insert after coupon input section
        const couponSection = document.getElementById('couponSection') || document.querySelector('.coupon-section-mobile');
        if (couponSection) {
            couponSection.parentNode.insertBefore(couponSuggestions, couponSection.nextSibling);
        }
    }
    
    // Update coupon list
    const couponList = document.getElementById('couponList');
    if (couponList) {
        if (eligibleCoupons.length === 0) {
            if (couponSuggestions) couponSuggestions.style.display = 'none';
        } else {
            if (couponSuggestions) couponSuggestions.style.display = 'block';
            couponList.innerHTML = eligibleCoupons.map(createCouponCard).join('');
        }
    }
}

function getEligibleCoupons(subtotal, deliveryArea) {
    const eligible = [];

    Object.entries(AVAILABLE_COUPONS).forEach(([code, coupon]) => {
        if (coupon.hidden) return; // ✅ Skip hidden coupons

        if (appliedCouponData && appliedCouponData.code === code) return;
        if (coupon.deliveryArea && coupon.deliveryArea !== deliveryArea) return;
        if (subtotal >= coupon.minOrder) {
            eligible.push({ code, ...coupon });
        }
    });

    return eligible;
}

function createCouponCard(coupon) {
    let savings = '';
    let icon = '💰';
    
    if (coupon.type === 'percentage') {
        const subtotal = getCartTotal();
        const discount = Math.round((subtotal * coupon.discount) / 100);
        const finalDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
        savings = `Save ${formatPrice(finalDiscount)}`;
        icon = '🏷️';
    } else if (coupon.type === 'fixed') {
        savings = `Save ${formatPrice(coupon.discount)}`;
        icon = '💰';
    } else if (coupon.type === 'gift') {
        savings = `Get ${coupon.gift} FREE`;
        icon = '🎁';
    }
    
    return `
        <div class="coupon-card-suggestion">
            <div class="coupon-info">
                <div class="coupon-header">
                    <span class="coupon-icon">${icon}</span>
                    <div class="coupon-code">${coupon.code}</div>
                </div>
                <div class="coupon-description">${coupon.description}</div>
                <div class="coupon-savings">${savings}</div>
            </div>
            <button class="apply-coupon-quick" onclick="quickApplyCoupon('${coupon.code}')">
                Apply Now
            </button>
        </div>
    `;
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Close remove modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeRemoveModal();
        }
    });
}

// ===== REMOVE ITEM FUNCTIONALITY =====
function showRemoveConfirmation(productId) {
    removeItemId = productId;
    showModal('removeModal');
}

function confirmRemoveItem() {
    if (removeItemId) {
        removeFromCart(removeItemId);
        updateCartData();
        closeRemoveModal();
        showToast('Item removed from cart', 'success');
        removeItemId = null;
        
        // Check if cart is empty
        if (cart.length === 0) {
            const emptyCart = document.getElementById('emptyCart');
            const cartContent = document.getElementById('cartContent');
            if (emptyCart) emptyCart.style.display = 'flex';
            if (cartContent) cartContent.style.display = 'none';
        }
    }
}

function closeRemoveModal() {
    hideModal('removeModal');
    removeItemId = null;
}

// ===== CLEAR CART =====
function clearCart() {
    if (cart.length === 0) {
        showToast('Cart is already empty', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to clear all items from your cart?')) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Clear applied coupons
        appliedCouponData = null;
        localStorage.removeItem('appliedCoupon');
        
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
        
        showToast('Cart cleared successfully', 'success');
    }
}

// ===== ENHANCED COUPON FUNCTIONALITY =====
function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    
    if (!couponInput || !couponMessage) return;
    
    const code = couponInput.value.trim().toUpperCase();
    applyCouponLogic(code, showCouponMessage);
}

function applyCouponLogic(code, messageCallback) {
    if (!code) {
        messageCallback('Please enter a coupon code', 'error');
        return;
    }
    
    const coupon = AVAILABLE_COUPONS[code];
    const subtotal = getCartTotal();
    
    if (!coupon) {
        messageCallback('Invalid coupon code', 'error');
        return;
    }
    
    // Check delivery area requirement
    if (coupon.deliveryArea && coupon.deliveryArea !== currentDeliveryArea) {
        const areaName = coupon.deliveryArea === 'jodhpur' ? 'within Jodhpur' : 'outside Jodhpur';
        messageCallback(`This coupon is only valid for delivery ${areaName}`, 'error');
        return;
    }
    
    if (subtotal < coupon.minOrder) {
        messageCallback(`Minimum order amount ₹${coupon.minOrder} required for this coupon`, 'error');
        return;
    }
    
    // Store coupon data for dynamic calculation
    appliedCouponData = {
        code: code,
        discount: coupon.discount,
        type: coupon.type,
        minOrder: coupon.minOrder,
        deliveryArea: coupon.deliveryArea,
        maxDiscount: coupon.maxDiscount,
        gift: coupon.gift
    };
    if (coupon.hidden) {
    alert('🕵️ This is a private coupon. Discount will be reviewed manually and may not apply.');
    
}
    
    // Calculate current discount for display message
    let messageText = '';
    if (coupon.type === 'percentage') {
        const currentDiscount = calculateCurrentDiscount();
        messageText = `🎉 Coupon applied! You saved ${formatPrice(currentDiscount)} `;
        if (coupon.hidden) {
            messageText = `🔖Coupon applied! ${coupon.description}: ${formatPrice(currentDiscount)}.`, 'info';
        }
    } else if (coupon.type === 'fixed') {
        messageText = `🎉 Coupon applied! You saved ${formatPrice(coupon.discount)}`;
    } else if (coupon.type === 'gift') {
        messageText = `🎁 Coupon applied! You get a FREE ${coupon.gift}`;
    }
    
    // Save coupon data to localStorage for checkout
    localStorage.setItem('appliedCoupon', JSON.stringify(appliedCouponData));
    
    messageCallback(messageText, 'success');
    updateCartSummary();
    displayEligibleCoupons(); // Refresh available coupons
    
    console.log('Applied coupon with dynamic calculation:', appliedCouponData);
}

// ===== QUICK APPLY COUPON =====
function quickApplyCoupon(code) {
    const couponInput = document.getElementById('couponCode');
    const couponInputMobile = document.getElementById('couponCodeMobile');
    
    if (couponInput) {
        couponInput.value = code;
        applyCoupon();
    }
    
    if (couponInputMobile) {
        couponInputMobile.value = code;
        applyCouponLogic(code, showCouponMessageMobile);
    }
}

function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    if (couponMessage) {
        couponMessage.textContent = message;
        couponMessage.className = `coupon-message ${type}`;
        couponMessage.style.display = 'block';
        
        setTimeout(() => {
            couponMessage.style.display = 'none';
        }, 10000);
    }
}

// ===== REMOVE COUPON FUNCTIONALITY (DYNAMIC) =====
function removeCoupon() {
    appliedCouponData = null;
    localStorage.removeItem('appliedCoupon');
    
    const couponInput = document.getElementById('couponCode');
    const couponInputMobile = document.getElementById('couponCodeMobile');
    if (couponInput) {
        couponInput.value = '';
    }
    if (couponInputMobile) {
        couponInputMobile.value = '';
    }
    
    updateCartSummary();
    displayEligibleCoupons(); // Refresh available coupons
    showCouponMessage('Coupon removed', 'success');
    console.log('Coupon removed - dynamic discount reset');
}

// ===== PROCEED TO CHECKOUT (WITH DYNAMIC COUPON DATA) =====
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Save current delivery area and coupon data
    localStorage.setItem('selectedDeliveryArea', currentDeliveryArea);
    if (appliedCouponData) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCouponData));
        console.log('Saving coupon data for checkout:', appliedCouponData);
    }
    
    window.location.href = 'checkout.html';
}

// ===== LOAD RECOMMENDED PRODUCTS (WITH STOCK) =====
function loadRecommendedProducts() {
    const recommendedContainer = document.getElementById('recommendedProducts');
    const recentlyViewedSection = document.getElementById('recentlyViewed');
    
    if (!recommendedContainer) return;
    
    // Get categories from cart items
    const cartCategories = [...new Set(cart.map(item => item.category))];
    
    // Sample products for recommendations
    const sampleProducts = [
        {
            id: 'rec-001',
            name: 'Golden Thread Rakhi',
            price: 149,
            image: 'https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center',
            category: 'Thread',
            stock: 20
        },
        {
            id: 'rec-002',
            name: 'Silver Om Rakhi',
            price: 399,
            image: 'https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center',
            category: 'Silver',
            stock: 8
        },
        {
            id: 'rec-003',
            name: 'Kids Cartoon Rakhi',
            price: 99,
            image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center',
            category: 'Kids',
            stock: 15
        }
    ];
    
    if (sampleProducts.length > 0) {
        recommendedContainer.innerHTML = sampleProducts.map(product => `
            <div class="product-card small">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h4 class="product-title">${product.name}</h4>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <button class="add-to-cart-btn small" onclick="addToCart('${product.id}', '${product.name}', '${product.price}', '${product.image}', '${product.category}', '${product.stock}')">
                        <i class="fas fa-plus"></i>
                        Add
                    </button>
                </div>
            </div>
        `).join('');
        
        if (recentlyViewedSection) {
            recentlyViewedSection.style.display = 'block';
        }
    } else {
        if (recentlyViewedSection) {
            recentlyViewedSection.style.display = 'none';
        }
    }
}

// ===== CONTINUE SHOPPING =====
function continueShopping() {
    window.location.href = 'shop.html';
}

// ===== CART ANIMATIONS =====
function animateCartUpdate() {
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach((item, index) => {
        item.style.animation = 'none';
        setTimeout(() => {
            item.style.animation = 'slideIn 0.3s ease forwards';
        }, index * 100);
    });
}

// ===== VALIDATE CART BEFORE CHECKOUT (WITH STOCK VALIDATION) =====
function validateCartForCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return false;
    }
    
    // Check for any invalid quantities or stock issues
    for (let item of cart) {
        const maxStock = item.stock || 10;
        
        if (!item.quantity || item.quantity <= 0) {
            showToast('Please check item quantities', 'error');
            return false;
        }
        
        if (item.quantity > maxStock) {
            showToast(`${item.name}: Only ${maxStock} items available in stock`, 'error');
            return false;
        }
    }
    
    return true;
}

// ===== LOCAL STORAGE MANAGEMENT =====
function syncCartWithLocalStorage() {
    try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error('Error syncing cart with localStorage:', error);
        cart = [];
    }
}

// ===== RESPONSIVE CART DISPLAY =====
function adjustCartDisplay() {
    const isMobile = window.innerWidth <= 768;
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
        if (isMobile) {
            item.classList.add('mobile-layout');
        } else {
            item.classList.remove('mobile-layout');
        }
    });
}

// Adjust display on window resize
window.addEventListener('resize', debounce(adjustCartDisplay, 250));

// ===== CART PERSISTENCE (WITH DYNAMIC COUPON DATA) =====
function saveCartState() {
    const cartState = {
        items: cart,
        deliveryArea: currentDeliveryArea,
        coupon: appliedCouponData, // Save full coupon data for dynamic calculation
        timestamp: Date.now()
    };
    
    localStorage.setItem('cartState', JSON.stringify(cartState));
}

function restoreCartState() {
    try {
        // Restore applied coupon from localStorage
        const couponData = localStorage.getItem('appliedCoupon');
        if (couponData) {
            const parsedCoupon = JSON.parse(couponData);
            // Check if it's new format with all required properties
            if (parsedCoupon.type && parsedCoupon.minOrder !== undefined) {
                appliedCouponData = parsedCoupon;
                console.log('Restored dynamic coupon data:', appliedCouponData);
            } else {
                // Old format - remove it
                localStorage.removeItem('appliedCoupon');
                appliedCouponData = null;
                console.log('Removed old format coupon data');
            }
        }
        
        const cartState = localStorage.getItem('cartState');
        if (cartState) {
            const state = JSON.parse(cartState);
            
            // Check if cart state is not too old (24 hours)
            const hoursSinceUpdate = (Date.now() - state.timestamp) / (1000 * 60 * 60);
            if (hoursSinceUpdate < 24) {
                currentDeliveryArea = state.deliveryArea || 'jodhpur';
            }
        }
    } catch (error) {
        console.error('Error restoring cart state:', error);
        appliedCouponData = null;
    }
}

// Save cart state when page unloads
window.addEventListener('beforeunload', saveCartState);

// ===== EXPORT FUNCTIONS =====
if (typeof window !== 'undefined') {
    window.decreaseQuantity = decreaseQuantity;
    window.increaseQuantity = increaseQuantity;
    window.updateQuantity = updateQuantity;
    window.showRemoveConfirmation = showRemoveConfirmation;
    window.confirmRemoveItem = confirmRemoveItem;
    window.closeRemoveModal = closeRemoveModal;
    window.clearCart = clearCart;
    window.applyCoupon = applyCoupon;
    window.applyCouponLogic = applyCouponLogic;
    window.removeCoupon = removeCoupon;
    window.quickApplyCoupon = quickApplyCoupon;
    window.proceedToCheckout = proceedToCheckout;
    window.continueShopping = continueShopping;
}

// ===== ADD ENHANCED COUPON SUGGESTION STYLES =====
const couponStyles = document.createElement('style');
couponStyles.textContent = `
    .coupon-suggestions {
        background: linear-gradient(135deg, #fef3c7, #fed7aa);
        border-radius: var(--border-radius);
        padding: 25px;
        margin: 20px 0;
        border: 2px solid var(--primary-gold);
        animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
        from { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
        to { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
    }
    
    .coupon-suggestions h4 {
        color: var(--dark-gray);
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .coupon-list {
        display: grid;
        gap: 15px;
    }
    
    .coupon-card-suggestion {
        background: white;
        border-radius: 12px;
        padding: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border-left: 4px solid var(--primary-red);
        transition: all 0.3s ease;
    }
    
    .coupon-card-suggestion:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .coupon-info {
        flex: 1;
    }
    
    .coupon-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }
    
    .coupon-icon {
        font-size: 1.2rem;
    }
    
    .coupon-code {
        font-weight: 700;
        color: var(--primary-red);
        font-size: 1.1rem;
        font-family: 'Courier New', monospace;
    }
    
    .coupon-description {
        color: var(--gray);
        font-size: 0.9rem;
        margin-bottom: 4px;
        line-height: 1.3;
    }
    
    .coupon-savings {
        color: var(--primary-gold);
        font-weight: 600;
        font-size: 0.95rem;
    }
    
    .apply-coupon-quick {
        background: var(--primary-red);
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }
    
    .apply-coupon-quick:hover {
        background: var(--dark-red);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
    
    @media (max-width: 768px) {
        .coupon-suggestions {
            padding: 20px;
            margin: 15px 0;
        }
        
        .coupon-card-suggestion {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
        }
        
        .apply-coupon-quick {
            width: 100%;
            padding: 12px;
        }
        
        .coupon-header {
            justify-content: flex-start;
        }
    }
`;
document.head.appendChild(couponStyles);
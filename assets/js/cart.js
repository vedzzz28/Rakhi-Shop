// ===== CART PAGE JAVASCRIPT - ENHANCED VERSION WITH PINCODE - FIXED STOCK HANDLING =====
let currentDeliveryArea = null; // Start with null until pincode is entered
let currentDeliveryOption = null; // normal or fasttrack for outside Jodhpur
let selectedPincode = null; // Store selected pincode
let appliedCouponData = null; // Store coupon details instead of just discount amount
let removeItemId = null;

// ===== JODHPUR PINCODES LIST =====
const JODHPUR_PINCODES = [
    // Main Jodhpur City
    '342001', '342002', '342003', '342004', '342005', '342006', '342007', '342008', 
    '342009', '342010', '342011', '342012', '342013', '342014', '342015', '342016',
];

// ===== UPDATED COUPON SYSTEM - 4 SPECIFIC COUPONS + 2 PRIVATE COUPONS =====
const AVAILABLE_COUPONS = {
    'JODHPUR15': { 
        discount: 15, 
        type: 'percentage', 
        minOrder: 300, 
        deliveryArea: 'jodhpur',
        description: 'FLAT 15% off for delivery within Jodhpur',
        maxDiscount: 5000,
        expiryDate: '2025-07-20'
    },
    'FESTIVAL9': { 
        discount: 7.5, 
        type: 'percentage', 
        minOrder: 1500, 
        description: '7.5% off (upto ₹135) on orders above ₹1500',
        maxDiscount: 135
    },
    'BIGORDER200': { 
        discount: 200, 
        type: 'fixed', 
        minOrder: 2000,
        description: 'Flat ₹200 off on orders above ₹2000'
    },
    'PUJATHALI': { 
        discount: 0, 
        type: 'gift', 
        minOrder: 1000,
        description: 'Free mini puja thali worth ₹70 on orders above ₹1000',
        gift: 'Mini Puja Thali'
    },
    'FREEDELIVERY': {
        discount: 80,
        type: 'delivery',
        minOrder: 700,
        description: 'Free delivery (up to ₹50) on orders above ₹700',
        maxDiscount: 50
    },
    'RATHI20': {
        discount: 20,
        type: 'percentage',
        minOrder: 400,
        hidden: true,
        description: 'FLAT 20% off on orders above 400(Exclusive)'
    },
    'VEDZZSP10': {
        discount: 25,
        type: 'percentage',
        minOrder: 1400,
        hidden: true,
        description: 'FLAT 25% off on order above 1400 (Super Exclusive)'
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
    setupPincodeInput(); // Setup pincode input first
    restoreCartState(); // Restore previous state including pincode
    setupEventListeners();
    updateCartSummary();
    loadRecommendedProducts();
    
    // Hide delivery options initially
    hideDeliveryOptionsInitially();
}

// ===== HIDE DELIVERY OPTIONS INITIALLY =====
function hideDeliveryOptionsInitially() {
    const deliverySection = document.querySelector('.delivery-section');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!selectedPincode) {
        if (deliverySection) {
            deliverySection.style.display = 'none';
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<span>Enter Pincode to Continue</span>';
        }
    }
}

// ===== SETUP PINCODE INPUT =====
function setupPincodeInput() {
    // Add pincode input section to cart summary if it doesn't exist
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard && !document.getElementById('pincodeSection')) {
        const pincodeSection = document.createElement('div');
        pincodeSection.id = 'pincodeSection';
        pincodeSection.className = 'pincode-section';
        pincodeSection.innerHTML = `
            <h4><i class="fas fa-map-marker-alt"></i> Enter Delivery Pincode</h4>
            <div class="pincode-input-group">
                <input type="text" id="cartPincode" placeholder="Enter 6-digit pincode" maxlength="6" pattern="[0-9]{6}">
                <button onclick="detectDeliveryFromPincode()" class="detect-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <div class="pincode-message" id="pincodeMessage"></div>
        `;
        
        // Insert before order summary
        const orderSummaryRows = summaryCard.querySelector('.summary-row');
        summaryCard.insertBefore(pincodeSection, orderSummaryRows);
    }
    
    // Setup pincode input event listeners
    const pincodeInput = document.getElementById('cartPincode');
    if (pincodeInput) {
        pincodeInput.addEventListener('input', function() {
            const pincode = this.value.replace(/\D/g, ''); // Only allow digits
            this.value = pincode;
            
            if (pincode.length === 6) {
                detectDeliveryFromPincode();
            } else {
                clearDeliveryInfo();
            }
        });
        
        pincodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                detectDeliveryFromPincode();
            }
        });
    }
}

// ===== DETECT DELIVERY FROM PINCODE =====
function detectDeliveryFromPincode() {
    const pincodeInput = document.getElementById('cartPincode');
    const pincodeMessage = document.getElementById('pincodeMessage');
    
    if (!pincodeInput || !pincodeMessage) return;
    
    const pincode = pincodeInput.value.trim();
    
    if (!/^\d{6}$/.test(pincode)) {
        showPincodeMessage('Please enter a valid 6-digit pincode', 'error');
        clearDeliveryInfo();
        return;
    }
    
    // Store the pincode
    selectedPincode = pincode;
    localStorage.setItem('selectedPincode', pincode);
    
    // Check if it's Jodhpur
    const isJodhpur = JODHPUR_PINCODES.includes(pincode);
    currentDeliveryArea = isJodhpur ? 'jodhpur' : 'outside';
    
    if (isJodhpur) {
        showPincodeMessage(`✅ Delivery within Jodhpur - ₹20`, 'success');
        setupDeliveryOptionsJodhpur();
    } else {
        showPincodeMessage(`📦 Delivery outside Jodhpur - Choose delivery option`, 'info');
        setupDeliveryOptionsOutside();
    }
    
    // Save delivery area
    localStorage.setItem('currentDeliveryArea', currentDeliveryArea);
    
    // Update summary and show delivery section
    updateCartSummary();
    displayEligibleCoupons();
    
    // Check coupon validity for new delivery area
    if (appliedCouponData && appliedCouponData.deliveryArea && appliedCouponData.deliveryArea !== currentDeliveryArea) {
        removeCoupon();
        showToast('Coupon removed: Not valid for this delivery area', 'warning');
    }
}

// ===== SETUP DELIVERY OPTIONS FOR JODHPUR =====
function setupDeliveryOptionsJodhpur() {
    const deliverySection = document.querySelector('.delivery-section');
    if (deliverySection) {
        deliverySection.style.display = 'block';
        deliverySection.innerHTML = `
            <h4>Delivery Options</h4>
            <div class="delivery-options">
                <label class="delivery-option selected">
                    <input type="radio" name="delivery" value="jodhpur" checked>
                    <span class="radio-mark"></span>
                    <div class="delivery-info">
                        <strong>Within Jodhpur</strong>
                        <span class="delivery-time">1-2 business days</span>
                        <span class="delivery-price">₹20</span>
                    </div>
                </label>
            </div>
        `;
        currentDeliveryOption = 'jodhpur';
    }
    
    enableCheckoutButton();
}

function setupDeliveryOptionsOutside() {
    const deliverySection = document.querySelector('.delivery-section');
    if (deliverySection) {
        deliverySection.style.display = 'block';
        deliverySection.innerHTML = `
            <h4>Delivery Options</h4>
            <div class="delivery-options">
                <label class="delivery-option">
                    <input type="radio" name="delivery" value="outside-normal">
                    <span class="radio-mark"></span>
                    <div class="delivery-info">
                        <strong>Normal Delivery</strong>
                        <span class="delivery-time">5-7 business days</span>
                        <span class="delivery-price">₹50</span>
                    </div>
                </label>
                <label class="delivery-option">
                    <input type="radio" name="delivery" value="outside-fasttrack">
                    <span class="radio-mark"></span>
                    <div class="delivery-info">
                        <strong>Fast Track Delivery</strong>
                        <span class="delivery-time">3-4 business days</span>
                        <span class="delivery-price">₹150</span>
                    </div>
                </label>
            </div>
        `;
        
        // Setup event listeners for outside delivery options
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
        deliveryOptions.forEach(option => {
            option.addEventListener('change', function() {
                currentDeliveryOption = this.value;
                localStorage.setItem('currentDeliveryOption', currentDeliveryOption);
                updateCartSummary();
                enableCheckoutButton();
                
                // Update visual selection
                document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('selected'));
                this.closest('.delivery-option').classList.add('selected');
            });
        });
        
        // REMOVED: No automatic selection - user must choose
        // Reset currentDeliveryOption to null so user must select
        currentDeliveryOption = null;
    }
    
    // Keep checkout button disabled until option is selected
    disableCheckoutButton();
}

// ===== ENABLE/DISABLE CHECKOUT BUTTON =====
function enableCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn && selectedPincode && currentDeliveryOption) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<span>Proceed to Checkout</span><i class="fas fa-arrow-right"></i>';
    }
}

function disableCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span>Select Delivery Option</span>';
    }
}

// ===== CLEAR DELIVERY INFO =====
function clearDeliveryInfo() {
    currentDeliveryArea = null;
    currentDeliveryOption = null;
    selectedPincode = null;
    
    const deliverySection = document.querySelector('.delivery-section');
    if (deliverySection) {
        deliverySection.style.display = 'none';
    }
    
    disableCheckoutButtonForPincode();
    updateCartSummary();
}

function disableCheckoutButtonForPincode() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<span>Enter Pincode to Continue</span>';
    }
}

// ===== SHOW PINCODE MESSAGE =====
function showPincodeMessage(message, type) {
    const pincodeMessage = document.getElementById('pincodeMessage');
    if (pincodeMessage) {
        pincodeMessage.textContent = message;
        pincodeMessage.className = `pincode-message ${type}`;
        pincodeMessage.style.display = 'block';
        
        setTimeout(() => {
            if (type !== 'success' && type !== 'info') {
                pincodeMessage.style.display = 'none';
            }
        }, 5000);
    }
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

// ===== CREATE CART ITEM HTML (WITH STOCK LIMITS) - FIXED STOCK HANDLING =====
function createCartItem(item) {
    const subtotal = item.price * item.quantity;
    // FIXED: Proper stock handling
    let maxStock;
    if (item.stock !== undefined && item.stock !== null && item.stock !== '') {
        maxStock = parseInt(item.stock);
        maxStock = isNaN(maxStock) ? 10 : maxStock; // Default to 10 if parsing fails
    } else {
        maxStock = 10; // Default only when stock is missing
    }
    
    console.log(`Cart item ${item.name}: stored stock=${item.stock}, parsed maxStock=${maxStock}`);
    
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center'">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.category}</p>
                <div class="cart-item-price">
                    ${formatPrice(item.price)}
                    <div class="price-note">Per piece</div>
                </div>
                ${maxStock <= 5 && maxStock > 0 ? `<div class="low-stock" style="color: #f59e0b; font-size: 0.8rem; margin-top: 4px;">Only ${maxStock} left in stock!</div>` : ''}
                ${maxStock <= 0 ? `<div class="low-stock" style="color: #dc2626; font-size: 0.8rem; margin-top: 4px;">Out of Stock</div>` : ''}
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')" ${item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       onchange="updateQuantity('${item.id}', this.value)" min="1" max="${maxStock}">
                <button class="quantity-btn" onclick="increaseQuantity('${item.id}')" ${item.quantity >= maxStock || maxStock <= 0 ? 'disabled' : ''}>
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

// ===== CALCULATE DELIVERY CHARGE =====
function getDeliveryCharge() {
    if (!currentDeliveryArea || !currentDeliveryOption) return 0;
    
    if (currentDeliveryArea === 'jodhpur') {
        return 20;
    } else {
        if (currentDeliveryOption === 'outside-normal') {
            return 50;
        } else if (currentDeliveryOption === 'outside-fasttrack') {
            return 150;
        }
    }
    return 0;
}

// ===== CALCULATE CURRENT DISCOUNT =====
function calculateCurrentDiscount() {
    if (!appliedCouponData) return 0;
    
    const subtotal = getCartTotal();
    const deliveryCharge = getDeliveryCharge();
    
    if (subtotal < appliedCouponData.minOrder) return 0;
    
    // Check delivery area requirement for coupon
    if (appliedCouponData.deliveryArea && appliedCouponData.deliveryArea !== currentDeliveryArea) {
        return 0;
    }
    
    if (appliedCouponData.type === 'percentage') {
        const discount = Math.round((subtotal * appliedCouponData.discount) / 100);
        return appliedCouponData.maxDiscount ? Math.min(discount, appliedCouponData.maxDiscount) : discount;
    } else if (appliedCouponData.type === 'fixed') {
        return appliedCouponData.discount;
    } else if (appliedCouponData.type === 'delivery') {
        // For delivery discount, return the minimum of delivery charge or max discount
        return Math.min(deliveryCharge, appliedCouponData.maxDiscount || appliedCouponData.discount);
    }
    
    return 0; // For gift type coupons
}

// ===== UPDATE CART SUMMARY =====
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
    const delivery = getDeliveryCharge();
    
    // Calculate dynamic discount based on current cart total and delivery area
    const currentDiscount = calculateCurrentDiscount();
    
    // Check if coupon should be removed due to minimum order not met or delivery area
    if (appliedCouponData && (subtotal < appliedCouponData.minOrder || 
        (appliedCouponData.deliveryArea && appliedCouponData.deliveryArea !== currentDeliveryArea))) {
        appliedCouponData = null;
        localStorage.removeItem('appliedCoupon');
        
        if (subtotal < appliedCouponData?.minOrder) {
            showToast(`Coupon removed: Order total below minimum requirement`, 'warning');
        }
    }
    
    const total = subtotal + delivery - currentDiscount;
    
    // Update cart page elements
    if (itemCount) itemCount.textContent = itemsCount;
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (deliveryCharges) {
        if (delivery > 0) {
            let deliveryText = formatPrice(delivery);
            if (currentDeliveryOption === 'outside-normal') {
                deliveryText += ' (Normal)';
            } else if (currentDeliveryOption === 'outside-fasttrack') {
                deliveryText += ' (Fast Track)';
            }
            deliveryCharges.textContent = deliveryText;
        } else {
            deliveryCharges.textContent = 'Enter pincode';
        }
    }
    if (totalAmount) {
        totalAmount.textContent = formatPrice(total);
    }
    
    // Update checkout page elements (if present)
    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
    if (orderDelivery) {
        if (delivery > 0) {
            let deliveryText = formatPrice(delivery);
            if (currentDeliveryOption === 'outside-normal') {
                deliveryText += ' (Normal)';
            } else if (currentDeliveryOption === 'outside-fasttrack') {
                deliveryText += ' (Fast Track)';
            }
            orderDelivery.textContent = deliveryText;
        } else {
            orderDelivery.textContent = 'TBD';
        }
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
                } else if (appliedCouponData.type === 'delivery') {
                    discountText = `FREE DELIVERY: -${formatPrice(currentDiscount)}`;
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
        } else {
            discountRow.style.display = 'none';
        }
    }
}

// ===== DISPLAY ELIGIBLE COUPONS (MOBILE ONLY) =====
function displayEligibleCoupons() {
    const subtotal = getCartTotal();
    const eligibleCoupons = getEligibleCoupons(subtotal, currentDeliveryArea);
    
    // Only show coupon suggestions on mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile coupon suggestions
        updateCouponSuggestions(eligibleCoupons, 'couponSuggestionsMobile', '.coupon-section-mobile');
    } else {
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
}

function updateCouponSuggestions(eligibleCoupons, suggestionsId, sectionSelector) {
    // Create coupon suggestions section if it doesn't exist
    let couponSuggestions = document.getElementById(suggestionsId);
    if (!couponSuggestions && eligibleCoupons.length > 0) {
        couponSuggestions = document.createElement('div');
        couponSuggestions.id = suggestionsId;
        couponSuggestions.className = 'coupon-suggestions';
        couponSuggestions.innerHTML = `
            <h4>🎉 Special Offers Available!</h4>
            <div class="coupon-list" id="${suggestionsId}List"></div>
        `;
        
        // Insert after coupon input section
        const couponSection = document.querySelector(sectionSelector);
        if (couponSection) {
            couponSection.parentNode.insertBefore(couponSuggestions, couponSection.nextSibling);
        }
    }
    
    // Update coupon list
    const couponList = document.getElementById(suggestionsId + 'List');
    if (couponList) {
        if (eligibleCoupons.length === 0) {
            if (couponSuggestions) couponSuggestions.style.display = 'none';
        } else {
            if (couponSuggestions) couponSuggestions.style.display = 'block';
            couponList.innerHTML = eligibleCoupons.map(coupon => createCouponCard(coupon, suggestionsId.includes('Mobile'))).join('');
        }
    }
}

function getEligibleCoupons(subtotal, deliveryArea) {
    const eligible = [];
    const currentDate = new Date(); // Get current date

    Object.entries(AVAILABLE_COUPONS).forEach(([code, coupon]) => {
        if (coupon.hidden) return; // Skip hidden coupons

        // CHECK IF COUPON IS EXPIRED - ADD THIS BLOCK
        if (coupon.expiryDate) {
            const expiryDate = new Date(coupon.expiryDate + 'T23:59:59'); // End of the expiry day
            if (currentDate > expiryDate) {
                return; // Skip expired coupons - don't show them
            }
        }

        if (appliedCouponData && appliedCouponData.code === code) return;
        if (coupon.deliveryArea && coupon.deliveryArea !== deliveryArea) return;
        if (subtotal >= coupon.minOrder) {
            eligible.push({ code, ...coupon });
        }
    });

    return eligible;
}

function createCouponCard(coupon, isMobile = false) {
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
    } else if (coupon.type === 'delivery') {
        const deliveryCharge = getDeliveryCharge();
        const actualSavings = Math.min(deliveryCharge, coupon.maxDiscount || coupon.discount);
        savings = `Save ${formatPrice(actualSavings)} on delivery`;
        icon = '🚚';
    } else if (coupon.type === 'gift') {
        savings = `Get ${coupon.gift} FREE`;
        icon = '🎁';
    }
    
    const functionName = isMobile ? 'quickApplyCouponMobile' : 'quickApplyCoupon';
    
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
            <button class="apply-coupon-quick" onclick="${functionName}('${coupon.code}')">
                Apply Now
            </button>
        </div>
    `;
}

// ===== PROCEED TO CHECKOUT WITH VALIDATION =====
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    if (!selectedPincode) {
        showToast('Please enter your delivery pincode', 'error');
        const pincodeInput = document.getElementById('cartPincode');
        if (pincodeInput) pincodeInput.focus();
        return;
    }
    
    if (!currentDeliveryOption) {
        showToast('Please select a delivery option', 'error');
        return;
    }
    
    // Save all delivery data for checkout
    const deliveryData = {
        pincode: selectedPincode,
        area: currentDeliveryArea,
        option: currentDeliveryOption,
        charge: getDeliveryCharge()
    };
    
    localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
    
    if (appliedCouponData) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCouponData));
    }
    
    window.location.href = 'checkout.html';
}

// ===== SAVE AND RESTORE CART STATE =====
function saveCartState() {
    const cartState = {
        items: cart,
        pincode: selectedPincode,
        deliveryArea: currentDeliveryArea,
        deliveryOption: currentDeliveryOption,
        coupon: appliedCouponData,
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
            if (parsedCoupon.type && parsedCoupon.minOrder !== undefined) {
                appliedCouponData = parsedCoupon;
            }
        }
        
        // Restore pincode and delivery data
        selectedPincode = localStorage.getItem('selectedPincode');
        currentDeliveryArea = localStorage.getItem('currentDeliveryArea');
        currentDeliveryOption = localStorage.getItem('currentDeliveryOption');
        
        // Update UI if pincode exists
        if (selectedPincode) {
            const pincodeInput = document.getElementById('cartPincode');
            if (pincodeInput) {
                pincodeInput.value = selectedPincode;
            }
            
            // Setup delivery options based on stored data
            if (currentDeliveryArea === 'jodhpur') {
                setupDeliveryOptionsJodhpur();
                showPincodeMessage(`✅ Delivery within Jodhpur - ₹20`, 'success');
            } else if (currentDeliveryArea === 'outside') {
                setupDeliveryOptionsOutside();
                showPincodeMessage(`📦 Delivery outside Jodhpur - Choose delivery option`, 'info');
                
                // Only restore selected delivery option if one was previously selected
                setTimeout(() => {
                    if (currentDeliveryOption) {
                        const option = document.querySelector(`input[value="${currentDeliveryOption}"]`);
                        if (option) {
                            option.checked = true;
                            option.closest('.delivery-option').classList.add('selected');
                            enableCheckoutButton();
                        }
                    } else {
                        // No option was previously selected, keep checkout disabled
                        disableCheckoutButton();
                    }
                }, 100);
            }
        }
        
    } catch (error) {
        console.error('Error restoring cart state:', error);
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
    } else if (coupon.type === 'delivery') {
        const currentDiscount = calculateCurrentDiscount();
        messageText = `🚚 Coupon applied! Free delivery - You saved ${formatPrice(currentDiscount)}`;
    }else if (coupon.type === 'fixed') {
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

function quickApplyCouponMobile(code) {
    const couponInputMobile = document.getElementById('couponCodeMobile');
    
    if (couponInputMobile) {
        couponInputMobile.value = code;
        applyCouponLogic(code, showCouponMessageMobile);
    }
    
    // Also sync with desktop
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.value = code;
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

// ===== QUANTITY MANAGEMENT - FIXED STOCK HANDLING =====
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        updateCartData();
    }
}

function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    // FIXED: Proper stock handling
    let maxStock;
    if (item.stock !== undefined && item.stock !== null && item.stock !== '') {
        maxStock = parseInt(item.stock);
        maxStock = isNaN(maxStock) ? 10 : maxStock;
    } else {
        maxStock = 10;
    }
    
    console.log(`Increase quantity for ${item.name}: current=${item.quantity}, maxStock=${maxStock}`);
    
    if (item.quantity < maxStock && maxStock > 0) {
        item.quantity += 1;
        updateCartData();
    } else if (maxStock <= 0) {
        showToast(`This item is out of stock`, 'error');
    } else {
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
    
    // FIXED: Proper stock handling
    let maxStock;
    if (item.stock !== undefined && item.stock !== null && item.stock !== '') {
        maxStock = parseInt(item.stock);
        maxStock = isNaN(maxStock) ? 10 : maxStock;
    } else {
        maxStock = 10;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        showToast('Invalid quantity', 'error');
        loadCartItems();
        return;
    }
    
    if (quantity > maxStock) {
        showToast(`Only ${maxStock} items available in stock`, 'error');
        loadCartItems();
        return;
    }
    
    item.quantity = quantity;
    updateCartData();
}

// ===== UPDATE CART DATA =====
function updateCartData() {
    const previousDiscount = appliedCouponData ? calculateCurrentDiscount() : 0;
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
    updateCartSummary();
    displayEligibleCoupons();
    
    if (appliedCouponData) {
        const newDiscount = calculateCurrentDiscount();
        if (newDiscount !== previousDiscount && newDiscount > 0) {
            showToast(`Discount updated to ${formatPrice(newDiscount)} based on new cart total`, 'success');
        }
    }
    
    showToast('Cart updated', 'success');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
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
        
        appliedCouponData = null;
        localStorage.removeItem('appliedCoupon');
        
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
        
        showToast('Cart cleared successfully', 'success');
    }
}

// ===== CONTINUE SHOPPING =====
function continueShopping() {
    window.location.href = 'shop.html';
}

// Save cart state when page unloads
window.addEventListener('beforeunload', saveCartState);

// Handle window resize for mobile coupon suggestions
window.addEventListener('resize', debounce(() => {
    displayEligibleCoupons();
}, 250));

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
    window.quickApplyCoupon = quickApplyCoupon;
    window.quickApplyCouponMobile = quickApplyCouponMobile;
    window.proceedToCheckout = proceedToCheckout;
    window.continueShopping = continueShopping;
    window.detectDeliveryFromPincode = detectDeliveryFromPincode;
}
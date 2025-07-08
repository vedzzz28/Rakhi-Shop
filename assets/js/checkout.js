// ===== CHECKOUT PAGE JAVASCRIPT =====
let checkoutCart = [];
let deliveryArea = 'jodhpur';
let appliedCouponData = null; // Store full coupon data for dynamic calculation
let isSubmitting = false;

// ===== JODHPUR PINCODES LIST =====
const JODHPUR_PINCODES = [
    // Main Jodhpur City
    '342001', '342002', '342003', '342004', '342005', '342006', '342007', '342008', 
    '342009', '342010', '342011', '342012', '342013', '342014', '342015', '342016',
];

// ===== EMAILJS CONFIGURATION =====
const EMAILJS_CONFIG = {
    serviceId: 'service_gx9yqxb', // Replace with your EmailJS service ID
    ownerTemplateId: 'template_8gypj8w', // Replace with your owner email template ID
    customerTemplateId: 'template_7lpidki', // Replace with your customer email template ID
    publicKey: '7zV-8qvZJon1Yps5g' // Replace with your EmailJS public key
};

// ===== INITIALIZE CHECKOUT PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html') || window.location.pathname.endsWith('checkout')) {
        initializeCheckout();
    }
});

async function initializeCheckout() {
    try {
        // Initialize EmailJS
        await initializeEmailJS();
        
        // Load cart and setup page
        loadCheckoutData();
        loadOrderItems();
        setupFormValidation();
        setupPaymentMethodHandling();
        setupPincodeDetection(); // New function for pincode detection
        updateOrderSummary();
        setMinDeliveryDate();
        
        // Check if cart is empty
        if (checkoutCart.length === 0) {
            redirectToCart();
            return;
        }
        
    } catch (error) {
        console.error('Error initializing checkout:', error);
        showToast('Error loading checkout page. Please try again.', 'error');
    }
}

// ===== SETUP PINCODE-BASED DELIVERY DETECTION =====
function setupPincodeDetection() {
    const pincodeInput = document.getElementById('pincode');
    if (pincodeInput) {
        pincodeInput.addEventListener('input', function() {
            const pincode = this.value.trim();
            if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
                detectDeliveryArea(pincode);
            }
        });
        
        pincodeInput.addEventListener('blur', function() {
            const pincode = this.value.trim();
            if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
                detectDeliveryArea(pincode);
            }
        });
    }
}

// ===== DETECT DELIVERY AREA FROM PINCODE =====
function detectDeliveryArea(pincode) {
    const isJodhpur = JODHPUR_PINCODES.includes(pincode);
    const previousArea = deliveryArea;
    
    deliveryArea = isJodhpur ? 'jodhpur' : 'outside';
    
    // Update delivery area display
    updateDeliveryAreaDisplay(isJodhpur);
    
    // Update payment methods based on area
    updatePaymentMethodBasedOnDelivery();
    
    // Update order summary
    updateOrderSummary();
    
    // Show notification if area changed
    if (previousArea !== deliveryArea) {
        const areaName = isJodhpur ? 'within Jodhpur' : 'outside Jodhpur';
        const charge = isJodhpur ? '₹30' : '₹70';
        showToast(`Delivery area detected: ${areaName} (${charge})`, 'info');
        
        // Check if current coupon is still valid
        if (appliedCouponData && appliedCouponData.deliveryArea && appliedCouponData.deliveryArea !== deliveryArea) {
            // Note: If you have coupon functionality, uncomment the next lines
            // removeCoupon();
            // showToast('Coupon removed: Not valid for detected delivery area', 'warning');
        }
    }
}

// ===== UPDATE DELIVERY AREA DISPLAY =====
function updateDeliveryAreaDisplay(isJodhpur) {
    const deliveryDisplay = document.getElementById('deliveryAreaDisplay');
    const deliveryChargeDisplay = document.getElementById('deliveryChargeDisplay');
    
    if (deliveryDisplay) {
        deliveryDisplay.innerHTML = `
            <div class="delivery-area-info">
                <div class="area-icon">
                    <i class="fas fa-${isJodhpur ? 'home' : 'truck'}"></i>
                </div>
                <div class="area-details">
                    <strong>${isJodhpur ? 'Within Jodhpur' : 'Outside Jodhpur'}</strong>
                    <span class="area-description">
                        ${isJodhpur ? 'Local delivery available' : 'Courier delivery required'}
                    </span>
                </div>
                <div class="area-charge">
                    ${isJodhpur ? '₹30' : '₹70'}
                </div>
            </div>
        `;
    }
    
    if (deliveryChargeDisplay) {
        deliveryChargeDisplay.textContent = isJodhpur ? '₹30' : '₹70';
    }
}

// ===== INITIALIZE EMAILJS =====
async function initializeEmailJS() {
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            throw new Error('EmailJS library not loaded');
        }
    } catch (error) {
        console.error('Error initializing EmailJS:', error);
        showToast('Email service initialization failed. Orders will still be processed.', 'warning');
    }
}

// ===== LOAD CHECKOUT DATA =====
function loadCheckoutData() {
    checkoutCart = JSON.parse(localStorage.getItem('cart')) || [];
    deliveryArea = localStorage.getItem('selectedDeliveryArea') || 'jodhpur';
    
    const couponData = localStorage.getItem('appliedCoupon');
    if (couponData) {
        try {
            const parsedCoupon = JSON.parse(couponData);
            if (parsedCoupon.type && parsedCoupon.minOrder) {
                appliedCouponData = parsedCoupon;
                console.log('Loaded coupon data for checkout:', appliedCouponData);
            }
        } catch (error) {
            console.error('Error parsing coupon data:', error);
            appliedCouponData = null;
        }
    }
    
    setTimeout(() => updateOrderSummary(), 100);
}

// ===== LOAD ORDER ITEMS =====
function loadOrderItems() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems || checkoutCart.length === 0) return;
    
    orderItems.innerHTML = checkoutCart.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center'">
            </div>
            <div class="order-item-details">
                <h5>${item.name}</h5>
                <span>${item.category} × ${item.quantity}</span>
            </div>
            <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
}

// ===== UPDATE ORDER SUMMARY =====
function updateOrderSummary() {
    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let deliveryCharge = deliveryArea.toLowerCase() === 'jodhpur' ? 30 : 70;
    
    let currentDiscount = 0;
    if (appliedCouponData && subtotal >= appliedCouponData.minOrder) {
        if (appliedCouponData.type === 'percentage') {
            currentDiscount = Math.round((subtotal * appliedCouponData.discount) / 100);
        } else {
            currentDiscount = appliedCouponData.discount;
        }
    }
    
    const total = subtotal + deliveryCharge - currentDiscount;
    
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderDelivery = document.getElementById('orderDelivery');
    const orderDiscount = document.getElementById('orderDiscount');
    const orderTotal = document.getElementById('orderTotal');
    const discountRow = document.getElementById('discountRow');

    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
    if (orderDelivery) {
        const areaText = deliveryArea === 'jodhpur' ? '' : ' (Courier)';
        orderDelivery.textContent = formatPrice(deliveryCharge) + areaText;
    }

    if (discountRow) {
        if (currentDiscount > 0 && appliedCouponData) {
            discountRow.style.display = 'flex';
            if (orderDiscount) {
                orderDiscount.textContent = `- ${formatPrice(currentDiscount)}`;
            }
        } else {
            discountRow.style.display = 'none';
        }
    }

    if (orderTotal) orderTotal.textContent = formatPrice(total);
}

// ===== SETUP PAYMENT METHOD HANDLING =====
function setupPaymentMethodHandling() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const upiSection = document.getElementById('upiPaymentSection');
    const codNote = document.querySelector('.cod-note');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'online') {
                if (upiSection) upiSection.style.display = 'block';
                if (codNote) codNote.style.display = 'none';
            } else {
                if (upiSection) upiSection.style.display = 'none';
                if (codNote) codNote.style.display = 'flex';
            }
        });
    });
    
    updatePaymentMethodBasedOnDelivery();
}

// ===== UPDATE PAYMENT METHOD BASED ON DELIVERY =====
function updatePaymentMethodBasedOnDelivery() {
    const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');
    const onlineRadio = document.querySelector('input[name="paymentMethod"][value="online"]');
    const upiSection = document.getElementById('upiPaymentSection');
    const codNote = document.querySelector('.cod-note');
    
    if (deliveryArea === 'outside') {
        if (codRadio) {
            codRadio.disabled = true;
            codRadio.parentElement.style.opacity = '0.5';
            
            // Update description to show it's not available
            const codDescription = codRadio.parentElement.querySelector('.payment-description');
            if (codDescription) {
                codDescription.textContent = 'Not available for delivery outside Jodhpur';
                codDescription.style.color = '#dc2626';
            }
        }
        if (onlineRadio) {
            onlineRadio.checked = true;
        }
        if (upiSection) upiSection.style.display = 'block';
        if (codNote) codNote.style.display = 'none';
    } else {
        if (codRadio) {
            codRadio.disabled = false;
            codRadio.parentElement.style.opacity = '1';
            
            // Reset description
            const codDescription = codRadio.parentElement.querySelector('.payment-description');
            if (codDescription) {
                codDescription.textContent = 'Available for delivery within Jodhpur';
                codDescription.style.color = '';
            }
        }
        
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (selectedMethod && selectedMethod.value === 'online') {
            if (upiSection) upiSection.style.display = 'block';
            if (codNote) codNote.style.display = 'none';
        } else {
            if (upiSection) upiSection.style.display = 'none';
            if (codNote) codNote.style.display = 'flex';
        }
    }
}

// ===== COPY UPI ID FUNCTION =====
function copyUpiId() {
    const upiId = '8949409523@pthdfc';
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(upiId).then(() => {
            showToast('UPI ID copied to clipboard!', 'success');
        }).catch(err => {
            fallbackCopyTextToClipboard(upiId);
        });
    } else {
        fallbackCopyTextToClipboard(upiId);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('UPI ID copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy UPI ID. Please copy manually: 8949409523@pthdfc', 'error');
    }
    
    document.body.removeChild(textArea);
}

// ===== SETUP FORM VALIDATION =====
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field.id));
    });
}

// ===== VALIDATE INDIVIDUAL FIELD =====
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    
    clearFieldError(fieldId);
    
    switch (fieldId) {
        case 'fullName':
            if (!value) {
                showFieldError(fieldId, 'Full name is required');
                return false;
            }
            if (value.length < 2) {
                showFieldError(fieldId, 'Name must be at least 2 characters');
                return false;
            }
            break;
            
        case 'email':
            if (!value) {
                showFieldError(fieldId, 'Email is required');
                return false;
            }
            if (!validateEmail(value)) {
                showFieldError(fieldId, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'phone':
            if (!value) {
                showFieldError(fieldId, 'Phone number is required');
                return false;
            }
            if (!validatePhone(value)) {
                showFieldError(fieldId, 'Please enter a valid 10-digit phone number');
                return false;
            }
            break;
            
        case 'address':
            if (!value) {
                showFieldError(fieldId, 'Address is required');
                return false;
            }
            if (value.length < 10) {
                showFieldError(fieldId, 'Please enter a complete address');
                return false;
            }
            break;
            
        case 'city':
            if (!value) {
                showFieldError(fieldId, 'City is required');
                return false;
            }
            break;
            
        case 'pincode':
            if (!value) {
                showFieldError(fieldId, 'PIN code is required');
                return false;
            }
            if (!validatePincode(value)) {
                showFieldError(fieldId, 'Please enter a valid 6-digit PIN code');
                return false;
            }
            // Auto-detect delivery area when pincode is valid
            detectDeliveryArea(value);
            break;
    }
    
    return true;
}

// ===== VALIDATE ENTIRE FORM =====
function validateForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return false;
    
    clearAllErrors();
    let isValid = true;
    
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'pincode'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms && !agreeTerms.checked) {
        showToast('Please agree to the terms and conditions', 'error');
        isValid = false;
    }
    
    return isValid;
}

// ===== HANDLE FORM SUBMISSION =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
        showToast('Please fix the errors and try again', 'error');
        return;
    }
    
    isSubmitting = true;
    showLoadingModal();
    
    try {
        const orderData = collectOrderData();
        await sendOrderEmails(orderData);
        showOrderConfirmation(orderData);
        clearOrderData();
    } catch (error) {
        console.error('Error submitting order:', error);
        showToast('Failed to submit order. Please try again or contact us directly.', 'error');
    } finally {
        isSubmitting = false;
        hideLoadingModal();
    }
}

// ===== COLLECT ORDER DATA =====
function collectOrderData() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = deliveryArea === 'jodhpur' ? 30 : 70;
    
    let currentDiscount = 0;
    if (appliedCouponData && subtotal >= appliedCouponData.minOrder) {
        if (appliedCouponData.type === 'percentage') {
            currentDiscount = Math.round((subtotal * appliedCouponData.discount) / 100);
        } else {
            currentDiscount = appliedCouponData.discount;
        }
    }
    
    const total = subtotal + deliveryCharge - currentDiscount;
    
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = selectedPaymentMethod ? selectedPaymentMethod.value : 'cod';
    
    return {
        orderId: generateOrderId(),
        orderDate: new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        customer: {
            name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            altPhone: formData.get('altPhone') || 'Not provided',
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state') || 'Rajasthan',
            pincode: formData.get('pincode')
        },
        items: checkoutCart,
        delivery: {
            area: deliveryArea,
            charge: deliveryCharge,
            areaName: deliveryArea === 'jodhpur' ? 'Within Jodhpur' : 'Outside Jodhpur'
        },
        payment: {
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            discount: currentDiscount,
            total: total,
            method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI)',
            upiId: paymentMethod === 'online' ? '8949409523@pthdfc' : null
        },
        coupon: appliedCouponData,
        timestamp: new Date().toISOString()
    };
}

// ===== SEND ORDER EMAILS =====
async function sendOrderEmails(orderData) {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not available, skipping email sending');
        return;
    }
    
    try {
        // Prepare email data
        const ownerEmailData = prepareOwnerEmailData(orderData);
        const customerEmailData = prepareCustomerEmailData(orderData);
        
        // Send email to shop owner
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.ownerTemplateId,
            ownerEmailData
        );
        
        // Send confirmation email to customer
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.customerTemplateId,
            customerEmailData
        );
        
        console.log('Order emails sent successfully');
        
    } catch (error) {
        console.error('Error sending emails:', error);
        showToast('Order submitted successfully! Confirmation email may be delayed.', 'warning');
    }
}

// ===== PREPARE OWNER EMAIL DATA =====
function prepareOwnerEmailData(orderData) {
    const itemsList = orderData.items.map(item => 
        `${item.name} (${item.category}) - Qty: ${item.quantity} - ₹${item.price} each = ₹${item.price * item.quantity}`
    ).join('\n');

    return {
        // Order information
        order_id: orderData.orderId,
        order_date: orderData.orderDate,
        
        // Customer details
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        customer_alt_phone: orderData.customer.altPhone,
        customer_full_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        
        // Items and pricing
        items_list: itemsList,
        items_count: orderData.items.length,
        subtotal_amount: `₹${orderData.payment.subtotal}`,
        delivery_charge: `₹${orderData.payment.deliveryCharge}`,
        discount_amount: orderData.payment.discount > 0 ? `₹${orderData.payment.discount}` : 'No discount applied',
        total_amount: `₹${orderData.payment.total}`,
        
        // Delivery and payment
        delivery_area: orderData.delivery.areaName,
        payment_method: orderData.payment.method,
        upi_id: orderData.payment.upiId || 'Not applicable (COD)',
        coupon_applied: orderData.coupon ? `${orderData.coupon.code} (${orderData.coupon.type === 'percentage' ? orderData.coupon.discount + '%' : '₹' + orderData.coupon.discount} off)` : 'None'
    };
}

// ===== PREPARE CUSTOMER EMAIL DATA =====
function prepareCustomerEmailData(orderData) {
    const itemsList = orderData.items.map(item => 
        `${item.name} (${item.category}) - Qty: ${item.quantity} x ₹${item.price} each = ₹${item.price * item.quantity}`
    ).join('\n');


    return {
        // Required by EmailJS
        to_email: orderData.customer.email || 'missing@domain.com',
        customer_name: orderData.customer.name || 'Customer',

        // Order info
        order_id: orderData.orderId || 'N/A',
        order_date: orderData.orderDate || new Date().toLocaleDateString(),

        // Items
        items_list: itemsList || 'No items found',
        items_count: orderData.items.length || 0,
        subtotal_amount: `₹${orderData.payment.subtotal || 0}`,
        delivery_charge: `₹${orderData.payment.deliveryCharge || 0}`,
        discount_amount: orderData.payment.discount > 0 ? `₹${orderData.payment.discount}` : '₹0',
        total_amount: `₹${orderData.payment.total || 0}`,

        // Delivery
        delivery_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        
        // Payment
        payment_method: orderData.payment.method || 'N/A',
        upi_id: '8949409523@pthdfc',

        // Contact
        shop_phone_2: '+91 9460250677',
        shop_phone_1: '+91 8949409523',
        shop_address: 'A-31, Umed Club Road, Raika Bagh, Jodhpur, Rajasthan',

        // Coupon
        coupon_applied: orderData.coupon ? `${orderData.coupon.code} (${orderData.coupon.type === 'percentage' ? orderData.coupon.discount + '%' : '₹' + orderData.coupon.discount} off)` : 'None'
    };
}


// ===== SHOW ORDER CONFIRMATION =====
function showOrderConfirmation(orderData) {
    const confirmationDetails = document.getElementById('confirmationOrderDetails');
    
    if (confirmationDetails) {
        confirmationDetails.innerHTML = `
            <div class="order-confirmation-details">
                <div class="order-id">
                    <h4>Order ID: ${orderData.orderId}</h4>
                    <p class="order-date">${orderData.orderDate}</p>
                </div>
                <div class="customer-details">
                    <h5>Delivery Details:</h5>
                    <p><strong>${orderData.customer.name}</strong></p>
                    <p>${orderData.customer.phone}</p>
                    <p>${orderData.customer.address}, ${orderData.customer.city} - ${orderData.customer.pincode}</p>
                    <p class="delivery-area-info">
                        <i class="fas fa-${orderData.delivery.area === 'jodhpur' ? 'home' : 'truck'}"></i>
                        ${orderData.delivery.areaName} (${formatPrice(orderData.delivery.charge)})
                    </p>
                </div>
                <div class="order-summary">
                    <h5>Order Summary:</h5>
                    <p>Items: ${orderData.items.length}</p>
                    <p>Total: ₹${orderData.payment.total}</p>
                    <p>Payment: ${orderData.payment.method}</p>
                </div>
                ${orderData.payment.method.includes('Online') ? `
                <div class="payment-reminder">
                    <h5 style="color: var(--primary-red);">Payment Required:</h5>
                    <p>Please send payment to UPI ID: <strong>8949409523@pthdfc</strong></p>
                    <p>Include Order ID: <strong>${orderData.orderId}</strong> in payment remarks</p>
                    <p>Send payment screenshot to WhatsApp: <strong>+91 8949409523</strong></p>
                </div>
                ` : ''}
                <div class="next-steps">
                    <h5>What's Next?</h5>
                    <p>We'll contact you within 24 hours to confirm your order and delivery details.</p>
                    ${orderData.payment.method.includes('Online') ? 
                        '<p><strong>Note:</strong> Order will be dispatched after payment confirmation.</p>' : ''}
                </div>
            </div>
        `;
    }
    
    showModal('confirmationModal');
}

// ===== CLEAR ORDER DATA =====
function clearOrderData() {
    localStorage.removeItem('cart');
    localStorage.removeItem('selectedDeliveryArea');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('cartState');
    
    cart = [];
    updateCartCount();
}

// ===== UTILITY FUNCTIONS =====
function setMinDeliveryDate() {
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
        
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 2);
        deliveryDateInput.value = defaultDate.toISOString().split('T')[0];
    }
}

function showLoadingModal() {
    showModal('loadingModal');
}

function hideLoadingModal() {
    hideModal('loadingModal');
}

function showTerms() {
    showModal('termsModal');
}

function closeTerms() {
    hideModal('termsModal');
}

function continueShopping() {
    hideModal('confirmationModal');
    window.location.href = 'shop.html';
}

function goToHome() {
    hideModal('confirmationModal');
    window.location.href = 'index.html';
}

function redirectToCart() {
    showToast('Your cart is empty. Redirecting to cart page...', 'error');
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 2000);
}

// ===== EXPORT FUNCTIONS =====
if (typeof window !== 'undefined') {
    window.showTerms = showTerms;
    window.closeTerms = closeTerms;
    window.continueShopping = continueShopping;
    window.goToHome = goToHome;
    window.copyUpiId = copyUpiId;
    window.detectDeliveryArea = detectDeliveryArea;
}
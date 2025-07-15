// ===== CHECKOUT PAGE JAVASCRIPT - ENHANCED VERSION =====
let checkoutCart = [];
let deliveryData = null; // Will be loaded from cart
let appliedCouponData = null; // Store full coupon data for dynamic calculation
let isSubmitting = false;
// ===== SILVER RAKHI HELPER FUNCTIONS =====
function isSilverRakhi(item) {
    return item.category && item.category.toLowerCase().includes('silver');
}

function calculateSilverRakhiTotal() {
    return checkoutCart.filter(isSilverRakhi)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateNonSilverRakhiTotal() {
    return checkoutCart.filter(item => !isSilverRakhi(item))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
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
        
        // Load data and setup page
        loadCheckoutData();
        
        // Check if required data exists
        if (!validateCheckoutData()) {
            return;
        }
        
        loadOrderItems();
        setupFormValidation();
        setupPaymentMethodHandling();
        autoPopulateFormData(); // Auto-populate form with delivery data
        updateOrderSummary();
        setMinDeliveryDate();
        enhanceTermsCheckbox(); // Make T&C checkbox bigger
        
    } catch (error) {
        console.error('Error initializing checkout:', error);
        showToast('Error loading checkout page. Please try again.', 'error');
    }
}

// ===== VALIDATE CHECKOUT DATA =====
function validateCheckoutData() {
    if (checkoutCart.length === 0) {
        redirectToCart('Your cart is empty');
        return false;
    }
    
    if (!deliveryData || !deliveryData.pincode) {
        redirectToCart('Please select delivery options in cart first');
        return false;
    }
    
    // Check minimum order for Jodhpur home delivery
    if (deliveryData.area === 'jodhpur' && deliveryData.option === 'jodhpur-delivery') {
        const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (subtotal < 150) {
            redirectToCart('Minimum order ₹150 required for home delivery in Jodhpur');
            return false;
        }
    }
    
    return true;
}

// ===== ENHANCE TERMS CHECKBOX =====
function enhanceTermsCheckbox() {
    const termsCheckbox = document.getElementById('agreeTerms');
    const checkboxLabel = termsCheckbox?.closest('.checkbox-label');
    
    if (checkboxLabel) {
        // Add enhanced styling
        checkboxLabel.style.cssText = `
            display: flex !important;
            align-items: flex-start !important;
            gap: 15px !important;
            padding: 20px !important;
            border: 2px solid #e5e7eb !important;
            border-radius: 12px !important;
            background: #f8f9fa !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        `;
        
        // Create custom larger checkbox
        const customCheckbox = document.createElement('div');
        customCheckbox.className = 'custom-checkbox-large';
        customCheckbox.style.cssText = `
            width: 28px !important;
            height: 28px !important;
            border: 3px solid #cbd5e1 !important;
            border-radius: 6px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
            flex-shrink: 0 !important;
            transition: all 0.3s ease !important;
            margin-top: 2px !important;
        `;
        
        // Hide original checkbox
        termsCheckbox.style.display = 'none';
        
        // Insert custom checkbox
        checkboxLabel.insertBefore(customCheckbox, checkboxLabel.firstChild);
        
        // Add click handler
        checkboxLabel.addEventListener('click', function(e) {
            e.preventDefault();
            termsCheckbox.checked = !termsCheckbox.checked;
            updateCustomCheckbox();
            
            // Add visual feedback
            checkboxLabel.style.transform = 'scale(0.98)';
            setTimeout(() => {
                checkboxLabel.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Update appearance function
        function updateCustomCheckbox() {
            if (termsCheckbox.checked) {
                customCheckbox.style.background = '#10b981';
                customCheckbox.style.borderColor = '#10b981';
                customCheckbox.innerHTML = '<i class="fas fa-check" style="color: white; font-size: 16px;"></i>';
                checkboxLabel.style.borderColor = '#10b981';
                checkboxLabel.style.background = '#ecfdf5';
            } else {
                customCheckbox.style.background = 'white';
                customCheckbox.style.borderColor = '#cbd5e1';
                customCheckbox.innerHTML = '';
                checkboxLabel.style.borderColor = '#e5e7eb';
                checkboxLabel.style.background = '#f8f9fa';
            }
        }
        
        // Initial state
        updateCustomCheckbox();
        
        // Listen for checkbox changes
        termsCheckbox.addEventListener('change', updateCustomCheckbox);
        
        // Add hover effect
        checkboxLabel.addEventListener('mouseenter', function() {
            if (!termsCheckbox.checked) {
                checkboxLabel.style.borderColor = '#3b82f6';
                checkboxLabel.style.background = '#f0f9ff';
            }
        });
        
        checkboxLabel.addEventListener('mouseleave', function() {
            if (!termsCheckbox.checked) {
                checkboxLabel.style.borderColor = '#e5e7eb';
                checkboxLabel.style.background = '#f8f9fa';
            }
        });
    }
}

// ===== AUTO-POPULATE FORM DATA =====
function autoPopulateFormData() {
    if (!deliveryData) return;
    
    // Auto-populate pincode
    const pincodeInput = document.getElementById('pincode');
    if (pincodeInput && deliveryData.pincode) {
        pincodeInput.value = deliveryData.pincode;
        pincodeInput.readOnly = true; // Make it read-only
        pincodeInput.style.background = '#f0f9ff';
        pincodeInput.style.border = '2px solid #3b82f6';
    }
    
    // Update delivery area display immediately
    updateDeliveryAreaDisplay();
    
    // Set payment method based on delivery area
    updatePaymentMethodBasedOnDelivery();
}
function getDeliveryTitle() {
    if (!deliveryData) return '';
    
    if (deliveryData.area === 'jodhpur') {
        if (deliveryData.option === 'jodhpur-takeaway') {
            return 'Self Pickup';
        } else {
            return 'Home Delivery (Jodhpur)';
        }
    } else {
        return 'Outside Jodhpur Delivery';
    }
}
// ===== UPDATE DELIVERY AREA DISPLAY =====
function updateDeliveryAreaDisplay() {
    if (!deliveryData) return;
    
    const deliveryDisplay = document.getElementById('deliveryAreaDisplay');
    
    if (deliveryDisplay) {
        const isJodhpur = deliveryData.area === 'jodhpur';
        const deliveryText = getDeliveryOptionText();
        
        deliveryDisplay.innerHTML = `
            <div class="delivery-area-info ${isJodhpur ? 'jodhpur' : 'outside'}">
                <div class="area-icon">
                    <i class="fas fa-${isJodhpur && deliveryData.option === 'jodhpur-takeaway' ? 'store' : isJodhpur ? 'home' : 'truck'}"></i>
                </div>
                <div class="area-details">
                    <strong>${getDeliveryTitle()}</strong>
                    <span class="area-description">${deliveryText}</span>
                </div>
                <div class="area-charge">₹${deliveryData.charge}</div>
            </div>
        `;
    }
}

// ===== GET DELIVERY OPTION TEXT =====
function getDeliveryOptionText() {
    if (!deliveryData) return '';
    
    if (deliveryData.area === 'jodhpur') {
    if (deliveryData.option === 'jodhpur-takeaway') {
        return 'Pick up from our store - A-31, Umed Club Road, Raika Bagh, Jodhpur';
    } else if (deliveryData.option === 'jodhpur-delivery') {
        return 'Home delivery: 1-2 business days';
    }
} else {
        if (deliveryData.option === 'outside-normal') {
            return 'Normal delivery: 5-7 business days';
        } else if (deliveryData.option === 'outside-fasttrack') {
            return 'Fast track delivery: 3-4 business days';
        }
    }
    return '';
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
    
    // Load delivery data from cart
    const savedDeliveryData = localStorage.getItem('deliveryData');
    if (savedDeliveryData) {
        try {
            deliveryData = JSON.parse(savedDeliveryData);
        } catch (error) {
            console.error('Error parsing delivery data:', error);
        }
    }
    
    // Load coupon data
    const couponData = localStorage.getItem('appliedCoupon');
    if (couponData) {
        try {
            const parsedCoupon = JSON.parse(couponData);
            if (parsedCoupon.type && parsedCoupon.minOrder !== undefined) {
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


// ===== FIXED UPDATE ORDER SUMMARY =====
function updateOrderSummary() {
    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let deliveryCharge = deliveryData ? deliveryData.charge : 0;
    
    let currentDiscount = 0;
    if (appliedCouponData && subtotal >= appliedCouponData.minOrder) {
        // Check delivery area requirement for coupon
        if (!appliedCouponData.deliveryArea || appliedCouponData.deliveryArea === deliveryData?.area) {
            const silverTotal = calculateSilverRakhiTotal();
            const nonSilverTotal = calculateNonSilverRakhiTotal();
            
            if (appliedCouponData.type === 'percentage') {
                if (appliedCouponData.hidden) {
                    // Hidden coupons: 5% on silver, full discount on non-silver
                    const silverDiscount = Math.round((silverTotal * 5) / 100);
                    const nonSilverDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                    currentDiscount = silverDiscount + nonSilverDiscount;
                } else if (appliedCouponData.silverDiscount) {
                    // FIXED: Added missing silverDiscount logic
                    const silverDiscount = Math.round((silverTotal * appliedCouponData.silverDiscount) / 100);
                    const nonSilverDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                    currentDiscount = silverDiscount + nonSilverDiscount;
                } else {
                    // Regular coupons: discount only on non-silver items
                    currentDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                }
                
                if (appliedCouponData.maxDiscount) {
                    currentDiscount = Math.min(currentDiscount, appliedCouponData.maxDiscount);
                }
            } else if (appliedCouponData.type === 'fixed') {
                if (appliedCouponData.hidden) {
                    // Hidden coupons: full fixed discount regardless of silver items
                    currentDiscount = appliedCouponData.discount;
                } else {
                    // Regular coupons: fixed discount only if there are non-silver items
                    if (nonSilverTotal > 0) {
                        currentDiscount = appliedCouponData.discount;
                    } else {
                        currentDiscount = 0;
                    }
                }
            } else if (appliedCouponData.type === 'gift') {
                // Gift doesn't affect price calculation
                currentDiscount = 0;
            } else if (appliedCouponData.type === 'delivery') {
                currentDiscount = Math.min(deliveryCharge, appliedCouponData.maxDiscount || appliedCouponData.discount);
            }
        }
    }
    
    const total = subtotal + deliveryCharge - currentDiscount;
    
    // Update UI elements
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderDelivery = document.getElementById('orderDelivery');
    const orderTotal = document.getElementById('orderTotal');
    const discountRow = document.getElementById('discountRow');
    const orderDiscount = document.getElementById('orderDiscount');
    
    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
    if (orderDelivery) orderDelivery.textContent = formatPrice(deliveryCharge);
    
    // Show/hide discount row with proper silver restrictions
    if (discountRow) {
        if (appliedCouponData && currentDiscount > 0) {
            const silverTotal = calculateSilverRakhiTotal();
            const nonSilverTotal = calculateNonSilverRakhiTotal();
            
            let shouldShowDiscount = false;
            let discountText = '';
            
            if (appliedCouponData.type === 'percentage' || appliedCouponData.type === 'delivery') {
                shouldShowDiscount = currentDiscount > 0;
                if (appliedCouponData.type === 'delivery') {
                    discountText = `ON DELIVERY: -${formatPrice(currentDiscount)}`;
                } else {
                    discountText = `-${formatPrice(currentDiscount)}`;
                }
            } else if (appliedCouponData.type === 'fixed') {
                if (appliedCouponData.hidden) {
                    shouldShowDiscount = true;
                    discountText = `-${formatPrice(currentDiscount)}`;
                } else {
                    // Regular fixed coupons: only show if there are non-silver items
                    shouldShowDiscount = nonSilverTotal > 0;
                    if (shouldShowDiscount) {
                        discountText = `-${formatPrice(currentDiscount)}`;
                    }
                }
            } else if (appliedCouponData.type === 'gift') {
                // Gift coupons: Always show - applicable to all items
                shouldShowDiscount = true;
                discountText = `FREE: ${appliedCouponData.gift}`;
            }
            
            if (shouldShowDiscount) {
                discountRow.style.display = 'flex';
                if (orderDiscount) {
                    orderDiscount.textContent = discountText;
                }
            } else {
                discountRow.style.display = 'none';
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
    
    if (deliveryData && deliveryData.area === 'outside') {
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
            // Pincode is pre-filled and validated from cart
            if (!value) {
                showFieldError(fieldId, 'PIN code is required');
                return false;
            }
            if (!validatePincode(value)) {
                showFieldError(fieldId, 'Please enter a valid 6-digit PIN code');
                return false;
            }
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
    if (!agreeTerms.checked) {
        // Show prominent alert for T&C
        const alertMessage = `🚨 IMPORTANT: Terms & Conditions Agreement Required

You must agree to our Terms and Conditions to place your order.

Please check the checkbox above to:
✓ Agree to our delivery policy
✓ Confirm payment terms
✓ Accept our quality assurance policy

This ensures both you and we understand the order process clearly.`;
        
        alert(alertMessage);
        
        // Scroll to and highlight the terms checkbox
        const termsSection = agreeTerms.closest('.checkbox-label');
        if (termsSection) {
            termsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add prominent flashing animation
            termsSection.style.animation = 'flash 0.5s ease-in-out 5';
            termsSection.style.borderColor = '#dc2626';
            termsSection.style.background = '#fee2e2';
            termsSection.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.5)';
            
            setTimeout(() => {
                termsSection.style.animation = '';
                termsSection.style.borderColor = '#e5e7eb';
                termsSection.style.background = '#f8f9fa';
                termsSection.style.boxShadow = '';
            }, 2500);
        }
        
        isValid = false;
    }
    
    return isValid;
}

// ===== HANDLE FORM SUBMISSION =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
        showToast('Please complete the form and try again', 'error');
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

// ===== FIXED COLLECT ORDER DATA =====
function collectOrderData() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = deliveryData ? deliveryData.charge : 0;
    
    let currentDiscount = 0;
    if (appliedCouponData && subtotal >= appliedCouponData.minOrder) {
        if (!appliedCouponData.deliveryArea || appliedCouponData.deliveryArea === deliveryData?.area) {
            const silverTotal = calculateSilverRakhiTotal();
            const nonSilverTotal = calculateNonSilverRakhiTotal();
            
            if (appliedCouponData.type === 'percentage') {
                if (appliedCouponData.hidden) {
                    // Hidden coupons: 5% on silver, full discount on non-silver
                    const silverDiscount = Math.round((silverTotal * 5) / 100);
                    const nonSilverDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                    currentDiscount = silverDiscount + nonSilverDiscount;
                } else if (appliedCouponData.silverDiscount) {
                    // FIXED: Added missing silverDiscount logic
                    const silverDiscount = Math.round((silverTotal * appliedCouponData.silverDiscount) / 100);
                    const nonSilverDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                    currentDiscount = silverDiscount + nonSilverDiscount;
                } else {
                    // Regular coupons: discount only on non-silver items
                    currentDiscount = Math.round((nonSilverTotal * appliedCouponData.discount) / 100);
                }
                
                if (appliedCouponData.maxDiscount) {
                    currentDiscount = Math.min(currentDiscount, appliedCouponData.maxDiscount);
                }
            } else if (appliedCouponData.type === 'fixed') {
                if (appliedCouponData.hidden) {
                    currentDiscount = appliedCouponData.discount;
                } else {
                    if (nonSilverTotal > 0) {
                        currentDiscount = appliedCouponData.discount;
                    } else {
                        currentDiscount = 0;
                    }
                }
            } else if (appliedCouponData.type === 'delivery') {
                currentDiscount = Math.min(deliveryCharge, appliedCouponData.maxDiscount || appliedCouponData.discount);
            }
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
            state: formData.get('state'),
            pincode: formData.get('pincode')
        },
        items: checkoutCart,
        delivery: {
            area: deliveryData?.area || 'unknown',
            option: deliveryData?.option || 'unknown',
            charge: deliveryCharge,
            areaName: deliveryData?.area === 'jodhpur' ? 'Within Jodhpur' : 'Outside Jodhpur',
            optionText: getDeliveryOptionText()
        },
        payment: {
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            discount: currentDiscount,
            total: total,
            method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI)',
            upiId: paymentMethod === 'online' ? formData.get('upiId') : null
        },
        appliedCoupon: appliedCouponData ? {
            code: appliedCouponData.code,
            type: appliedCouponData.type,
            discount: appliedCouponData.discount,
            actualDiscount: currentDiscount
        } : null,
        specialInstructions: formData.get('specialInstructions') || 'None',
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

// ===== PREPARE OWNER EMAIL DATA WITH TABLE =====
function prepareOwnerEmailData(orderData) {
    // Generate HTML table for items
    const itemsTableHTML = generateOwnerItemsTable(orderData.items);

    return {
        // Order information
        order_id: orderData.orderId,
        order_date: orderData.orderDate,
        
        // Customer details
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone,
        customer_alt_phone: orderData.customer.altPhone || 'Not provided',
        customer_full_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        
        // Items and pricing
        items_table: itemsTableHTML,  // ✅ HTML table instead of plain text
        items_count: orderData.items.length,
        subtotal_amount: `₹${orderData.payment.subtotal}`,
        delivery_charge: `₹${orderData.payment.deliveryCharge}`,
        discount_amount: orderData.payment.discount > 0 ? `₹${orderData.payment.discount}` : 'No discount applied',
        total_amount: `₹${orderData.payment.total}`,
        
        // Delivery and payment
        delivery_area: orderData.delivery.areaName,
        delivery_option: orderData.delivery.optionText,
        payment_method: orderData.payment.method,
        upi_id: orderData.payment.upiId || 'Not applicable (COD)',
        coupon_applied: orderData.coupon ? `${orderData.coupon.code} (${orderData.coupon.type === 'percentage' ? orderData.coupon.discount + '%' : '₹' + orderData.coupon.discount} off)` : 'None'
    };
}

// ===== PREPARE CUSTOMER EMAIL DATA WITH TABLE =====
function prepareCustomerEmailData(orderData) {
    // Generate HTML table for items
    const itemsTableHTML = generateCustomerItemsTable(orderData.items);

    return {
        // Required by EmailJS
        to_email: orderData.customer.email || 'missing@domain.com',
        customer_name: orderData.customer.name || 'Customer',

        // Order info
        order_id: orderData.orderId || 'N/A',
        order_date: orderData.orderDate || new Date().toLocaleDateString(),

        // Items (✅ HTML table instead of plain text)
        items_table: itemsTableHTML,
        items_count: orderData.items.length || 0,
        subtotal_amount: `₹${orderData.payment.subtotal || 0}`,
        delivery_charge: `₹${orderData.payment.deliveryCharge || 0}`,
        discount_amount: orderData.payment.discount > 0 ? `₹${orderData.payment.discount}` : '₹0',
        total_amount: `₹${orderData.payment.total || 0}`,

        // Delivery
        delivery_address: `${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} - ${orderData.customer.pincode}`,
        delivery_option: orderData.delivery.optionText,
        
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

// ===== GENERATE OWNER ITEMS TABLE =====
function generateOwnerItemsTable(items) {
    if (!items || items.length === 0) {
        return '<p>No items found</p>';
    }

    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif;">
            <thead>
                <tr style="background: #dc2626; color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">#</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Product Name</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Category</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Qty</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Total</th>
                </tr>
            </thead>
            <tbody>`;

    items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        
        tableHTML += `
            <tr style="background: ${rowColor};">
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #2d3748;">${item.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #4a5568;">
                    <span style="background: #fed7aa; color: #92400e; padding: 3px 8px; border-radius: 12px; font-size: 12px;">
                        ${item.category}
                    </span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #2d3748;">₹${item.price}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #dc2626;">₹${itemTotal}</td>
            </tr>`;
    });

    const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    tableHTML += `
            <tr style="background: #fef3c7; font-weight: bold;">
                <td colspan="5" style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #92400e;">
                    <strong>Items Subtotal:</strong>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #dc2626; font-size: 16px;">
                    <strong>₹${grandTotal}</strong>
                </td>
            </tr>
        </tbody>
    </table>`;

    return tableHTML;
}

// ===== GENERATE CUSTOMER ITEMS TABLE =====
function generateCustomerItemsTable(items) {
    if (!items || items.length === 0) {
        return '<p>No items found</p>';
    }

    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif;">
            <thead>
                <tr style="background: linear-gradient(135deg, #dc2626, #f59e0b); color: white;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Product</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Qty</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Price</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">Total</th>
                </tr>
            </thead>
            <tbody>`;

    items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
        
        tableHTML += `
            <tr style="background: ${rowColor};">
                <td style="padding: 12px; border: 1px solid #ddd;">
                    <div style="font-weight: bold; color: #2d3748; margin-bottom: 4px;">${item.name}</div>
                    <div style="font-size: 12px; color: #4a5568; background: #fed7aa; display: inline-block; padding: 2px 6px; border-radius: 8px;">
                        ${item.category}
                    </div>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #2d3748;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #4a5568;">
                    ₹${item.price}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #dc2626;">
                    ₹${itemTotal}
                </td>
            </tr>`;
    });

    const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    tableHTML += `
            <tr style="background: #fef3c7; font-weight: bold;">
                <td colspan="3" style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #92400e;">
                    <strong>Items Subtotal:</strong>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #dc2626; font-size: 16px;">
                    <strong>₹${grandTotal}</strong>
                </td>
            </tr>
        </tbody>
    </table>`;

    return tableHTML;
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
                        ${orderData.delivery.areaName} - ${orderData.delivery.optionText} (${formatPrice(orderData.delivery.charge)})
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
    localStorage.removeItem('deliveryData');
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

function redirectToCart(message = 'Please complete your cart first') {
    showToast(message, 'error');
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 2000);
}

// ===== ADD FLASH ANIMATION CSS =====
const flashStyle = document.createElement('style');
flashStyle.textContent = `
    @keyframes flash {
        0%, 100% { 
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
            transform: scale(1);
            border-color: #dc2626;
        }
        50% { 
            box-shadow: 0 0 30px rgba(220, 38, 38, 1);
            transform: scale(1.02);
            border-color: #b91c1c;
            background: #fecaca !important;
        }
    }
`;
document.head.appendChild(flashStyle);

// ===== EXPORT FUNCTIONS =====
if (typeof window !== 'undefined') {
    window.showTerms = showTerms;
    window.closeTerms = closeTerms;
    window.continueShopping = continueShopping;
    window.goToHome = goToHome;
    window.copyUpiId = copyUpiId;
}
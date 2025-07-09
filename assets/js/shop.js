// ===== SHOP PAGE JAVASCRIPT - ENHANCED VERSION =====
let allProducts = [];
let filteredProducts = [];
let currentFilters = {
    category: 'all',
    minPrice: null,
    maxPrice: null,
    sortBy: 'name-asc'
};
let autoRefreshInterval = null;
let quickViewQuantity = 1;

// ===== INITIALIZE SHOP PAGE =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('shop.html') || window.location.pathname.endsWith('shop')) {
        initializeShop();
    }
});

async function initializeShop() {
    try {
        showLoading('productsGrid');
        await loadProducts();
        setupFilters();
        setupMobileFilters();
        
        // Check for category filter from index page
        checkForCategoryFilter();
        
        displayProducts();
        startAutoRefresh();
    } catch (error) {
        console.error('Error initializing shop:', error);
        handleLoadingError();
    }
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
        
        // Apply filters
        applyFilters();
        
        // Show toast message
        const categoryName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ');
        showToast(`Showing ${categoryName} rakhis`, 'success');
    }
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
    try {
        if (await loadFromCSV()) {
            return;
        }
        loadSampleData();
    } catch (error) {
        loadSampleData();
    }
}

async function loadFromCSV() {
    try {
        const response = await fetch('products.csv?t=' + Date.now());
        if (!response.ok) return false;
        
        const csvText = await response.text();
        const products = parseCSV(csvText);
        
        if (products.length === 0) return false;
        
        allProducts = products;
        filteredProducts = [...allProducts];
        return true;
    } catch (error) {
        return false;
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];
    
    const nameIndex = headers.indexOf('name');
    const priceIndex = headers.indexOf('price');
    
    if (nameIndex === -1 || priceIndex === -1) return [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        if (values.length < headers.length) continue;
        
        const name = values[nameIndex];
        const price = parseFloat(values[priceIndex]);
        
        if (!name || !price || price <= 0) continue;
        
        const product = {
            id: values[headers.indexOf('id')] || `rakhi-${Date.now()}-${i}`,
            name: name,
            price: price,
            image: values[headers.indexOf('image')] || getDefaultImage(values[headers.indexOf('category')]),
            category: values[headers.indexOf('category')] || 'Designer',
            stock: parseInt(values[headers.indexOf('stock')]) || 10
        };
        
        products.push(product);
    }
    
    return products;
}

function getDefaultImage(category) {
    const defaultImages = {
        'designer': 'https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center',
        'silver': 'https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center',
        'kids': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center',
        'bhaiya-bhabhi': 'https://images.unsplash.com/photo-1583275863106-e45f45bcd2b9?w=400&h=400&fit=crop&crop=center',
        'sacred-accessories': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center',
        'thread': 'https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center',
        'lumba': 'https://images.unsplash.com/photo-1583275863106-e45f45bcd2b9?w=400&h=400&fit=crop&crop=center'
    };
    
    const cat = (category || 'designer').toLowerCase();
    return defaultImages[cat] || defaultImages['designer'];
}

function loadSampleData() {
    allProducts = [
        {
            id: 'rakhi-001',
            name: 'Golden Thread Designer Rakhi',
            price: 299,
            image: 'https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center',
            category: 'Designer',
            stock: 15
        },
        {
            id: 'rakhi-002',
            name: 'Pure Silver Ganesh Rakhi',
            price: 599,
            image: 'https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center',
            category: 'Silver',
            stock: 8
        },
        {
            id: 'rakhi-003',
            name: 'Cartoon Character Kids Rakhi',
            price: 149,
            image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center',
            category: 'Kids',
            stock: 25
        },
        {
            id: 'rakhi-004',
            name: 'Bhaiya Bhabhi Set - Red & Gold',
            price: 449,
            image: 'https://images.unsplash.com/photo-1583275863106-e45f45bcd2b9?w=400&h=400&fit=crop&crop=center',
            category: 'Bhaiya-Bhabhi',
            stock: 12
        },
        {
            id: 'rakhi-005',
            name: 'Kumkum Chawal Traditional Set',
            price: 199,
            image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center',
            category: 'Kumkum-Chawal',
            stock: 20
        },
        {
            id: 'rakhi-006',
            name: 'Simple Thread Rakhi Pack',
            price: 99,
            image: 'https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center',
            category: 'Thread',
            stock: 30
        }
    ];
    
    filteredProducts = [...allProducts];
}

// ===== DESKTOP FILTERS =====
function setupFilters() {
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', handleCategoryFilter);
    });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

function handleCategoryFilter(event) {
    currentFilters.category = event.target.value;
    applyFilters();
}

function handleSortChange(event) {
    currentFilters.sortBy = event.target.value;
    applyFilters();
}

function applyPriceFilter() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    currentFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;
    
    applyFilters();
}

function setPriceRange(min, max) {
    document.getElementById('minPrice').value = min;
    document.getElementById('maxPrice').value = max || '';
    applyPriceFilter();
}

function applyFilters() {
    filteredProducts = [...allProducts];
    
    // Category filter
    if (currentFilters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category.toLowerCase().replace(/\s+/g, '-') === currentFilters.category
        );
    }
    
    // Price filters
    if (currentFilters.minPrice !== null) {
        filteredProducts = filteredProducts.filter(product => 
            product.price >= currentFilters.minPrice
        );
    }
    
    if (currentFilters.maxPrice !== null) {
        filteredProducts = filteredProducts.filter(product => 
            product.price <= currentFilters.maxPrice
        );
    }
    
    // Sort products
    sortProducts();
    displayProducts();
}

function sortProducts() {
    switch (currentFilters.sortBy) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
    }
}

function clearAllFilters() {
    currentFilters = {
        category: 'all',
        minPrice: null,
        maxPrice: null,
        sortBy: 'name-asc'
    };
    
    // Reset form elements
    const categoryAll = document.querySelector('input[name="category"][value="all"]');
    if (categoryAll) categoryAll.checked = true;
    
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'name-asc';
    
    filteredProducts = [...allProducts];
    displayProducts();
}

// ===== MOBILE FILTERS =====
function setupMobileFilters() {
    // Setup event listeners
    setupMobileFilterEventListeners();
}

function setupMobileFilterEventListeners() {
    // Close overlay when clicking outside
    document.addEventListener('click', function(e) {
        const overlay = document.getElementById('mobileFiltersOverlay');
        const container = document.querySelector('.mobile-filters-container');
        
        if (overlay && overlay.classList.contains('show') && e.target === overlay) {
            closeMobileFilters();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('mobileFiltersOverlay');
            if (overlay && overlay.classList.contains('show')) {
                closeMobileFilters();
            }
        }
    });
}

// ===== MOBILE FILTER FUNCTIONS =====
function openMobileFilters() {
    console.log('Opening mobile filters...');
    const overlay = document.getElementById('mobileFiltersOverlay');
    if (overlay) {
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Mobile filters opened');
    } else {
        console.error('Mobile filters overlay not found');
    }
}

function closeMobileFilters() {
    console.log('Closing mobile filters...');
    const overlay = document.getElementById('mobileFiltersOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('Mobile filters closed');
    }
}

function toggleMobileFilterGroup(groupName) {
    console.log('Toggling filter group:', groupName);
    
    const section = document.getElementById('mobile' + groupName.charAt(0).toUpperCase() + groupName.slice(1));
    const button = event.target.closest('.mobile-filter-toggle');
    const icon = button.querySelector('i');
    
    // Close all other sections first
    const allSections = document.querySelectorAll('.mobile-filter-options');
    const allButtons = document.querySelectorAll('.mobile-filter-toggle');
    const allIcons = document.querySelectorAll('.mobile-filter-toggle i');
    
    allSections.forEach(s => {
        if (s !== section) {
            s.classList.remove('show');
        }
    });
    
    allButtons.forEach(b => {
        if (b !== button) {
            b.classList.remove('active');
        }
    });
    
    allIcons.forEach(i => {
        if (i !== icon) {
            i.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current section
    if (section.classList.contains('show')) {
        section.classList.remove('show');
        button.classList.remove('active');
        icon.style.transform = 'rotate(0deg)';
    } else {
        section.classList.add('show');
        button.classList.add('active');
        icon.style.transform = 'rotate(180deg)';
    }
}

function setMobilePriceRange(min, max) {
    const minInput = document.getElementById('mobileMinPrice');
    const maxInput = document.getElementById('mobileMaxPrice');
    
    if (minInput) minInput.value = min;
    if (maxInput) maxInput.value = max || '';
    
    // Highlight the selected preset
    const presets = document.querySelectorAll('.mobile-price-presets button');
    presets.forEach(preset => {
        preset.classList.remove('active');
        if (preset.textContent.includes(min.toString())) {
            preset.classList.add('active');
        }
    });
}

function applyMobileFilters() {
    console.log('Applying mobile filters...');
    
    // Get selected category
    const selectedCategory = document.querySelector('input[name="mobileCategory"]:checked');
    if (selectedCategory) {
        currentFilters.category = selectedCategory.value;
        
        // Sync with desktop
        const desktopCategory = document.querySelector(`input[name="category"][value="${selectedCategory.value}"]`);
        if (desktopCategory) {
            desktopCategory.checked = true;
        }
    }
    
    // Get price range
    const minPrice = document.getElementById('mobileMinPrice').value;
    const maxPrice = document.getElementById('mobileMaxPrice').value;
    
    currentFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;
    
    // Sync with desktop
    const desktopMinPrice = document.getElementById('minPrice');
    const desktopMaxPrice = document.getElementById('maxPrice');
    if (desktopMinPrice) desktopMinPrice.value = minPrice;
    if (desktopMaxPrice) desktopMaxPrice.value = maxPrice;
    
    // Get selected sort
    const selectedSort = document.querySelector('input[name="mobileSort"]:checked');
    if (selectedSort) {
        currentFilters.sortBy = selectedSort.value;
        
        // Sync with desktop
        const desktopSort = document.getElementById('sortSelect');
        if (desktopSort) {
            desktopSort.value = selectedSort.value;
        }
    }
    
    // Apply filters
    applyFilters();
    
    // Close mobile filters
    closeMobileFilters();
    
    // Show success message
    showToast('Filters applied successfully!', 'success');
}

function clearAllMobileFilters() {
    // Reset category
    const allCategory = document.querySelector('input[name="mobileCategory"][value="all"]');
    if (allCategory) allCategory.checked = true;
    
    // Clear price inputs
    const minPrice = document.getElementById('mobileMinPrice');
    const maxPrice = document.getElementById('mobileMaxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    // Reset sort
    const nameSort = document.querySelector('input[name="mobileSort"][value="name-asc"]');
    if (nameSort) nameSort.checked = true;
    
    // Clear presets
    const presets = document.querySelectorAll('.mobile-price-presets button');
    presets.forEach(preset => preset.classList.remove('active'));
    
    // Apply changes
    clearAllFilters();
    
    showToast('All filters cleared!', 'success');
}

// ===== DISPLAY PRODUCTS =====
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productCount = document.getElementById('productCount');
    const noProducts = document.getElementById('noProducts');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Hide loading
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    // Update count
    if (productCount) {
        productCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`;
    }
    
    if (filteredProducts.length === 0) {
        if (productsGrid) productsGrid.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
        return;
    }
    
    if (noProducts) noProducts.style.display = 'none';
    if (productsGrid) {
        productsGrid.style.display = 'grid';
        productsGrid.innerHTML = filteredProducts.map(createProductCard).join('');
    }
    setupMobileQuickView();
}

function createProductCard(product) {
    const isOutOfStock = product.stock <= 0;
    const cartItem = cart.find(item => item.id === product.id);
    const inCartQuantity = cartItem ? cartItem.quantity : 0;
    
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" 
                     onerror="this.src='${getDefaultImage(product.category)}'">
                <div class="product-badge">${product.category}</div>
                <button class="quick-view-btn" onclick="openQuickView('${product.id}')" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
                ${isOutOfStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ${formatPrice(product.price)}
                    <div class="price-note">Per piece</div>
                </div>
                ${product.stock <= 5 && product.stock > 0 ? `<div class="low-stock">Only ${product.stock} left!</div>` : ''}
                
                ${inCartQuantity > 0 ? `
                    <div class="product-quantity-controls show">
                        <button class="product-qty-btn" onclick="decreaseProductQuantity('${product.id}')">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="product-qty-display">${inCartQuantity}</span>
                        <button class="product-qty-btn" onclick="increaseProductQuantity('${product.id}')" 
                                ${inCartQuantity >= product.stock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                ` : `
                    <button class="add-to-cart-btn" 
                            onclick="addToCartFromShop('${product.id}', '${product.name}', '${product.price}', '${product.image}', '${product.category}', '${product.stock}')"
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                `}
            </div>
        </div>
    `;
}

// ===== SETUP MOBILE QUICK VIEW =====
function setupMobileQuickView() {
    // Check if it's a mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Remove any existing click listeners
            card.removeEventListener('click', handleMobileCardClick);
            
            // Add click listener for mobile
            card.addEventListener('click', handleMobileCardClick);
            
            // Add mobile-specific styling
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        });
    }
}

// ===== HANDLE MOBILE CARD CLICK =====
function handleMobileCardClick(event) {
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Don't trigger if clicking on buttons or interactive elements
    if (event.target.closest('button') || 
        event.target.closest('input') || 
        event.target.closest('.product-quantity-controls')) {
        return;
    }
    
    // Get product ID from the card
    const productCard = event.currentTarget;
    const productId = productCard.getAttribute('data-id');
    
    if (productId) {
        // Add a subtle click animation
        productCard.style.transform = 'scale(0.98)';
        setTimeout(() => {
            productCard.style.transform = '';
        }, 150);
        
        // Open quick view modal
        openQuickView(productId);
    }
}

// ===== ENHANCED ADD TO CART FUNCTIONALITY =====
function addToCartFromShop(productId, productName, productPrice, productImage, productCategory, productStock) {
    addToCart(productId, productName, productPrice, productImage, productCategory, productStock);
    // Refresh the product card to show quantity controls
    setTimeout(() => {
        displayProducts();
    }, 100);
}

function increaseProductQuantity(productId) {
    const product = allProducts.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!product || !cartItem) return;
    
    if (cartItem.quantity < product.stock) {
        cartItem.quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayProducts(); // Refresh to update UI
        showToast('Quantity updated!', 'success');
    } else {
        showToast(`Only ${product.stock} items available in stock`, 'error');
    }
}

function decreaseProductQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem) return;
    
    if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayProducts(); // Refresh to update UI
        showToast('Quantity updated!', 'success');
    } else {
        // Remove from cart if quantity becomes 0
        removeFromCart(productId);
        updateCartCount();
        displayProducts(); // Refresh to update UI
        showToast('Item removed from cart', 'success');
    }
}

// ===== ENHANCED QUICK VIEW FUNCTIONALITY =====
function openQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('quickViewModal');
    const modalBody = document.getElementById('quickViewBody');
    
    if (!modal || !modalBody) return;
    
    // Reset quantity
    quickViewQuantity = 1;
    
    // Check if item is already in cart
    const cartItem = cart.find(item => item.id === productId);
    const inCartQuantity = cartItem ? cartItem.quantity : 0;
    
    // Determine stock status
    let stockStatus = '';
    let stockClass = '';
    if (product.stock <= 0) {
        stockStatus = `<i class="fas fa-times-circle"></i> Out of Stock`;
        stockClass = 'out-of-stock';
    } else if (product.stock <= 5) {
        stockStatus = `<i class="fas fa-exclamation-triangle"></i> Only ${product.stock} left in stock`;
        stockClass = 'low-stock';
    } else {
        stockStatus = `<i class="fas fa-check-circle"></i> In Stock (${product.stock} available)`;
        stockClass = 'in-stock';
    }
    
    modalBody.innerHTML = `
        <div class="quick-view-image">
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.src='${getDefaultImage(product.category)}'">
        </div>
        <div class="quick-view-details">
            <div class="quick-view-category">${product.category}</div>
            <h2 class="quick-view-title">${product.name}</h2>
            <div class="quick-view-price">
    ${formatPrice(product.price)}
    <div class="price-note">Per piece</div>
</div>
            <div class="quick-view-stock">
                <span class="stock-status ${stockClass}">${stockStatus}</span>
                ${inCartQuantity > 0 ? `<div class="cart-info"><i class="fas fa-shopping-cart"></i> ${inCartQuantity} in cart</div>` : ''}
            </div>
            
            <div class="quick-view-description">
                <p>Beautiful handcrafted rakhi perfect for celebrating the sacred bond of Raksha Bandhan. Made with premium materials and traditional designs.</p>
            </div>
            
            <div class="quick-view-actions">
                ${product.stock > 0 ? `
                    <div class="quick-view-quantity">
                        <span class="quantity-label">Quantity:</span>
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="decreaseQuickViewQuantity()" ${quickViewQuantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="qty-input" value="${quickViewQuantity}" 
                                   onchange="updateQuickViewQuantity(this.value)" min="1" max="${product.stock}" readonly>
                            <button class="qty-btn" onclick="increaseQuickViewQuantity(${product.stock})" ${quickViewQuantity >= product.stock ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="add-to-cart-large" onclick="addToCartFromQuickView('${product.id}', '${product.name}', '${product.price}', '${product.image}', '${product.category}', '${product.stock}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add ${quickViewQuantity > 1 ? quickViewQuantity + ' items' : ''} to Cart
                    </button>
                ` : `
                    <button class="add-to-cart-large" disabled>
                        <i class="fas fa-times"></i>
                        Out of Stock
                    </button>
                `}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Add CSS for cart info
    if (!document.getElementById('quickViewStyles')) {
        const style = document.createElement('style');
        style.id = 'quickViewStyles';
        style.textContent = `
            .cart-info {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-left: 15px;
                padding: 4px 12px;
                background: #d1fae5;
                color: #065f46;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .quick-view-description {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid var(--primary-red);
            }
            
            .quick-view-description p {
                color: #6b7280;
                font-size: 0.9rem;
                line-height: 1.5;
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    }
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    quickViewQuantity = 1;
}

function increaseQuickViewQuantity(maxStock) {
    if (quickViewQuantity < maxStock) {
        quickViewQuantity += 1;
        updateQuickViewUI();
    }
}

function decreaseQuickViewQuantity() {
    if (quickViewQuantity > 1) {
        quickViewQuantity -= 1;
        updateQuickViewUI();
    }
}

function updateQuickViewQuantity(newQuantity) {
    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity >= 1) {
        quickViewQuantity = quantity;
        updateQuickViewUI();
    }
}

function updateQuickViewUI() {
    const qtyInput = document.querySelector('.qty-input');
    const decreaseBtn = document.querySelector('.qty-btn:first-of-type');
    const increaseBtn = document.querySelector('.qty-btn:last-of-type');
    const addToCartBtn = document.querySelector('.add-to-cart-large');
    
    if (qtyInput) qtyInput.value = quickViewQuantity;
    if (decreaseBtn) decreaseBtn.disabled = quickViewQuantity <= 1;
    
    // For increase button, we need to get the max stock from the button's onclick attribute
    if (increaseBtn) {
        const onclickAttr = increaseBtn.getAttribute('onclick');
        const maxStock = parseInt(onclickAttr.match(/\d+/)[0]);
        increaseBtn.disabled = quickViewQuantity >= maxStock;
    }
    
    // Update add to cart button text
    if (addToCartBtn && !addToCartBtn.disabled) {
        const icon = '<i class="fas fa-shopping-cart"></i>';
        const text = quickViewQuantity > 1 ? `Add ${quickViewQuantity} items to Cart` : 'Add to Cart';
        addToCartBtn.innerHTML = `${icon} ${text}`;
    }
}

function addToCartFromQuickView(productId, productName, productPrice, productImage, productCategory, productStock) {
    for (let i = 0; i < quickViewQuantity; i++) {
        addToCart(productId, productName, productPrice, productImage, productCategory, productStock);
    }
    closeQuickView();
    showToast(`Added ${quickViewQuantity} item(s) to cart!`, 'success');
    // Refresh products to update quantity controls
    setTimeout(() => {
        displayProducts();
    }, 100);
}

// ===== AUTO-REFRESH =====
function startAutoRefresh() {
    autoRefreshInterval = setInterval(async () => {
        try {
            const oldCount = allProducts.length;
            if (await loadFromCSV()) {
                if (allProducts.length !== oldCount) {
                    applyFilters();
                }
            }
        } catch (error) {
            // Silent fail for auto-refresh
        }
    }, 30000);
}

// ===== ERROR HANDLING =====
function handleLoadingError() {
    loadSampleData();
    displayProducts();
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading beautiful rakhis...</p>
            </div>
        `;
        element.style.display = 'flex';
        element.style.justifyContent = 'center';
        element.style.alignItems = 'center';
        element.style.minHeight = '300px';
    }
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// ===== EXPORT FUNCTIONS TO WINDOW =====
if (typeof window !== 'undefined') {
    // Desktop functions
    window.applyPriceFilter = applyPriceFilter;
    window.setPriceRange = setPriceRange;
    window.clearAllFilters = clearAllFilters;
    window.openQuickView = openQuickView;
    window.closeQuickView = closeQuickView;
    
    // Mobile functions
    window.openMobileFilters = openMobileFilters;
    window.closeMobileFilters = closeMobileFilters;
    window.toggleMobileFilterGroup = toggleMobileFilterGroup;
    window.setMobilePriceRange = setMobilePriceRange;
    window.applyMobileFilters = applyMobileFilters;
    window.clearAllMobileFilters = clearAllMobileFilters;
    
    // Quick view functions
    window.increaseQuickViewQuantity = increaseQuickViewQuantity;
    window.decreaseQuickViewQuantity = decreaseQuickViewQuantity;
    window.updateQuickViewQuantity = updateQuickViewQuantity;
    window.addToCartFromQuickView = addToCartFromQuickView;
    
    // Product quantity functions
    window.addToCartFromShop = addToCartFromShop;
    window.increaseProductQuantity = increaseProductQuantity;
    window.decreaseProductQuantity = decreaseProductQuantity;
}


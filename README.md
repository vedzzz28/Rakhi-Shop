# Rakhi Collection by Ruchi Rathi - Complete Website Files

## 📁 File Structure
```
rakhi-store/
├── index.html                 ← Homepage
├── shop.html                  ← Shop page with filters
├── cart.html                  ← Shopping cart
├── checkout.html              ← Checkout with EmailJS
├── products.csv               ← CSV Product Database (MAIN FILE)
├── products.json              ← JSON Backup (optional)
├── assets/
│   ├── css/
│   │   └── style.css          ← Complete responsive CSS
│   ├── js/
│   │   ├── main.js            ← Navigation & utilities
│   │   ├── shop.js            ← CSV loading & filters
│   │   ├── cart.js            ← Cart management
│   │   └── checkout.js        ← EmailJS integration
│   └── images/                ← Rakhi product images
└── README.md                  ← This file
```

## 📊 CSV Database Setup (Primary Method)

### 🎯 **Why CSV?**
- ✅ **Simple & Reliable**: No CORS issues like Excel
- ✅ **Auto-Updates**: Website refreshes every 30 seconds
- ✅ **Easy Editing**: Use Excel, Google Sheets, or text editor
- ✅ **No Server Required**: Works on any hosting
- ✅ **Instant Changes**: Update CSV → Website updates automatically

### 📋 **Creating products.csv File**

**Step 1: Create the File**
- Create a file named exactly `products.csv`
- Place it in the same folder as index.html

**Step 2: CSV Format (First Row = Headers)**
```csv
ID,Name,Price,Image,Category,Stock,Description
```

**Step 3: Add Product Data**
```csv
ID,Name,Price,Image,Category,Stock,Description
rakhi-001,Golden Thread Designer Rakhi,299,https://example.com/image.jpg,Designer,15,Elegant golden thread rakhi
rakhi-002,Pure Silver Ganesh Rakhi,599,,Silver,8,Pure silver rakhi with Ganesh motif
rakhi-003,Kids Cartoon Rakhi,149,,Kids,25,Colorful cartoon character rakhi
```

**Step 4: Column Details**
- **ID**: Unique identifier (rakhi-001, rakhi-002, etc.)
- **Name**: Product name (Required)
- **Price**: Number only, no currency symbol (Required)
- **Image**: Full URL or leave empty for default images
- **Category**: Must be one of: Designer, Silver, Kids, Bhaiya-Bhabhi, Sacred-Accessories
- **Stock**: Available quantity (0 = out of stock)
- **Description**: Product description

### 💡 **CSV Editing Tips**

**Using Excel/Google Sheets:**
1. Open Excel or Google Sheets
2. Create your data in columns
3. File → Save As → CSV format
4. Upload to your website folder

**Using Text Editor:**
1. Open Notepad/TextEdit
2. Type data with commas separating columns
3. Save as .csv file

**Handling Special Characters:**
- If text contains commas, wrap in quotes: `"Red, Gold, and Silver Rakhi"`
- For quotes in text, use double quotes: `"The ""Premium"" Rakhi Set"`

### 🔄 **Auto-Update Features**

**Automatic Refresh:**
- Website checks for CSV updates every 30 seconds
- No page reload needed - products update automatically
- Manual refresh button available in admin status bar

**Live Editing:**
1. Edit your products.csv file
2. Save the file
3. Website automatically detects changes
4. Products update within 30 seconds

### 📱 **How to Update Products**

**Method 1: Quick Edit**
1. Open products.csv in Excel/Google Sheets
2. Change stock numbers, prices, or add new products
3. Save as CSV
4. Upload to website - changes appear automatically

**Method 2: Bulk Updates**
1. Download current products.csv
2. Edit in spreadsheet software
3. Upload updated file
4. Website updates automatically

## Sample CSV Data

```csv
ID,Name,Price,Image,Category,Stock,Description
rakhi-001,Golden Thread Designer Rakhi,299,https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center,Designer,15,Elegant golden thread rakhi with traditional design
rakhi-002,Pure Silver Ganesh Rakhi,599,https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center,Silver,8,Pure silver rakhi with Lord Ganesh motif
rakhi-003,Cartoon Character Kids Rakhi,149,https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center,Kids,25,Colorful cartoon character rakhi for kids
rakhi-004,Bhaiya Bhabhi Set - Red & Gold,449,https://images.unsplash.com/photo-1583275863106-e45f45bcd2b9?w=400&h=400&fit=crop&crop=center,Bhaiya-Bhabhi,12,Beautiful red and gold rakhi set
rakhi-005,Kumkum Chawal Traditional Set,199,https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center,Kumkum-Chawal,20,Traditional rakhi with kumkum and chawal set
```

## 🔧 CSV Troubleshooting

### **Common Issues & Solutions:**

**❌ CSV Not Loading**
- Ensure file is named exactly `products.csv`
- Check file is in same folder as index.html
- Verify CSV format is correct (comma-separated)

**❌ Products Not Showing**
- Check first row has correct headers: ID,Name,Price,Image,Category,Stock,Description
- Ensure Name and Price columns have data
- Verify no special characters in CSV

**❌ Auto-Update Not Working**
- File must be uploaded to web server (not local computer)
- Wait 30 seconds for automatic refresh
- Use manual refresh button if needed

**❌ Images Not Showing**
- Use full URL for images (https://...)
- Leave Image column empty for default images
- Check image URLs are accessible

### **Testing Your CSV:**
1. Open shop page in browser
2. Check status bar at top of page
3. Use "Refresh Now" button to manually update
4. Look for error messages in browser console (F12)

## 🚀 Deployment & Hosting

### **Local Development:**
```bash
# Navigate to your rakhi-store folder
cd rakhi-store

# Start local server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### **Online Hosting Options:**

**1. Netlify (Recommended)**
- Drag & drop your rakhi-store folder
- Auto-deployed with SSL
- Easy CSV updates via file manager

**2. GitHub Pages**
- Push files to GitHub repository
- Enable Pages in repository settings
- Update CSV by editing file on GitHub

**3. Any Web Hosting**
- Upload all files via FTP
- Update products.csv as needed
- Website updates automatically

## 💡 Pro Tips

### **Managing Inventory:**
- Set Stock to 0 when item is sold out
- Website automatically shows "Out of Stock"
- Update stock numbers as you sell products

### **Adding New Products:**
- Add new rows to CSV file
- Use unique ID for each product
- Upload updated CSV - appears immediately

### **Bulk Price Updates:**
- Download current products.csv
- Update prices in Excel/Google Sheets
- Upload updated file

### **Seasonal Updates:**
- Keep backup copies of CSV files
- Easy to switch between product catalogs
- Update descriptions for festivals/sales

## 🎯 Quick Start Guide

1. **Download the sample products.csv file**
2. **Edit it with your products and prices**
3. **Upload to your website folder**
4. **Website automatically loads your products!**

Your CSV database will update automatically, keeping your website inventory in sync with your actual stock!

| ID | Name | Price | Image | Category | Stock | Description |
|----|------|-------|--------|----------|-------|-------------|
| rakhi-001 | Golden Thread Designer Rakhi | 299 | https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center | Designer | 15 | Elegant golden thread rakhi with traditional design |
| rakhi-002 | Pure Silver Ganesh Rakhi | 599 | https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center | Silver | 8 | Pure silver rakhi with Lord Ganesh motif |
| rakhi-003 | Cartoon Character Kids Rakhi | 149 | https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center | Kids | 25 | Colorful cartoon character rakhi for kids |
| rakhi-004 | Bhaiya Bhabhi Set - Red & Gold | 449 | https://images.unsplash.com/photo-1583275863106-e45f45bcd2b9?w=400&h=400&fit=crop&crop=center | Bhaiya-Bhabhi | 12 | Beautiful red and gold rakhi set |
| rakhi-005 | Kumkum Chawal Traditional Set | 199 | https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center | Kumkum-Chawal | 20 | Traditional rakhi with kumkum and chawal |
| rakhi-006 | Peacock Feather Designer Rakhi | 349 | https://images.unsplash.com/photo-1628191081813-a97dd6f46ae8?w=400&h=400&fit=crop&crop=center | Designer | 10 | Artistic peacock feather design |
| rakhi-007 | Diamond Cut Silver Rakhi | 799 | https://images.unsplash.com/photo-1606407762584-d681bf2167e3?w=400&h=400&fit=crop&crop=center | Silver | 6 | Premium diamond cut silver rakhi |
| rakhi-008 | Superhero Kids Rakhi Pack | 199 | https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&crop=center | Kids | 18 | Pack of 3 superhero themed rakhis |

### Column Descriptions:
- **ID**: Unique product identifier
- **Name**: Product name
- **Price**: Price in INR (numbers only)
- **Image**: URL to product image or local path
- **Category**: One of: Designer, Silver, Kids, Bhaiya-Bhabhi, Kumkum-Chawal
- **Stock**: Available quantity
- **Description**: Product description

## EmailJS Setup Instructions

1. **Create EmailJS Account**:
   - Go to [emailjs.com](https://www.emailjs.com/)
   - Create a free account

2. **Setup Email Service**:
   - Add an email service (Gmail, Outlook, etc.)
   - Note the Service ID

3. **Create Email Templates**:

   **Owner Notification Template** (`template_owner_order`):
   ```
   Subject: New Rakhi Order - {{order_id}}
   
   New order received from Rakhi Collection website!
   
   ORDER DETAILS:
   Order ID: {{order_id}}
   Date: {{order_date}}
   
   CUSTOMER INFORMATION:
   Name: {{customer_name}}
   Email: {{customer_email}}
   Phone: {{customer_phone}}
   Alt Phone: {{customer_alt_phone}}
   Address: {{customer_address}}
   
   DELIVERY:
   Area: {{delivery_area}}
   Preferred Date: {{delivery_date}}
   Instructions: {{special_instructions}}
   
   ITEMS ORDERED:
   {{items_list}}
   
   PAYMENT SUMMARY:
   Subtotal: {{subtotal}}
   Delivery: {{delivery_charge}}
   Discount: {{discount}}
   Total: {{total_amount}}
   Payment Method: {{payment_method}}
   UPI ID: {{upi_id}}
   Coupon: {{coupon_code}}
   ```

   **Customer Confirmation Template** (`template_customer_order`):
   ```
   Subject: Order Confirmation - {{order_id}} | Rakhi Collection by Ruchi Rathi
   
   Dear {{customer_name}},
   
   Thank you for your order! We're excited to craft your beautiful rakhis.
   
   ORDER SUMMARY:
   Order ID: {{order_id}}
   Order Date: {{order_date}}
   
   ITEMS:
   {{items_list}}
   
   DELIVERY ADDRESS:
   {{delivery_address}}
   Delivery Area: {{delivery_area}}
   
   PAYMENT:
   Subtotal: {{subtotal}}
   Delivery: {{delivery_charge}}
   Total: {{total_amount}}
   Payment: {{payment_method}}
   {{#if upi_id}}UPI ID: {{upi_id}}{{/if}}
   
   {{#if upi_id}}
   PAYMENT INSTRUCTIONS:
   Please send payment to UPI ID: {{upi_id}}
   Include Order ID {{order_id}} in payment remarks
   Send payment screenshot to WhatsApp: {{shop_phone_1}}
   {{/if}}
   
   WHAT'S NEXT:
   We'll contact you within 24 hours to confirm delivery details.
   {{#if upi_id}}Order will be dispatched after payment confirmation.{{/if}}
   
   Contact us:
   Phone: {{shop_phone_1}}, {{shop_phone_2}}
   Address: {{shop_address}}
   
   Thank you for choosing Rakhi Collection by Ruchi Rathi!
   ```

4. **Update JavaScript**:
   - Replace `EMAILJS_CONFIG` values in `checkout.js`:
     ```javascript
     const EMAILJS_CONFIG = {
         serviceId: 'your_service_id',
         ownerTemplateId: 'template_owner_order',
         customerTemplateId: 'template_customer_order',
         publicKey: 'your_public_key'
     };
     ```
   - Replace owner email: `to_email: 'ruchirathi@email.com'`

## How to Run the Website

### 🖥️ **Local Development**

**Important**: Excel loading requires a local server (not opening files directly in browser)

**Option 1: Python Server** (Recommended)
```bash
# Navigate to your rakhi-store folder
cd rakhi-store

# Start server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Open in browser
http://localhost:8000
```

**Option 2: Node.js Server**
```bash
# Install http-server globally
npm install -g http-server

# Navigate to folder and start
cd rakhi-store
http-server

# Open in browser
http://localhost:8080
```

**Option 3: PHP Server**
```bash
cd rakhi-store
php -S localhost:8000
```

**Option 4: VS Code Live Server**
- Install "Live Server" extension in VS Code
- Right-click index.html → "Open with Live Server"

### 🌐 **Online Deployment**

### Option 1: Local Testing
1. Use a local server (not file://)
2. Python: `python -m http.server 8000`
3. Open `http://localhost:8000`

### Option 2: Free Hosting
1. **Netlify**:
   - Drag & drop the `rakhi-store` folder
   - Auto-deployed with SSL

2. **Vercel**:
   - Connect to GitHub repository
   - Auto-deploy on push

3. **GitHub Pages**:
   - Push to GitHub repository
   - Enable Pages in settings

## Delivery & Payment Policy

### Delivery Charges:
- **Within Jodhpur**: ₹20 flat rate
- **Outside Jodhpur**: ₹60 courier charges

### Payment Methods:
- **Within Jodhpur**: Cash on Delivery (COD) OR Online Payment (UPI)
- **Outside Jodhpur**: Online Payment (UPI) ONLY - COD not available

### UPI Payment Details:
- **UPI ID**: ruchirathi@paytm
- Include Order ID in payment remarks
- Send payment screenshot to WhatsApp: +91 9460250677
- Order dispatched after payment confirmation

✅ **Responsive Design**: Mobile, tablet, desktop
✅ **Dynamic Product Loading**: From Excel file
✅ **Advanced Filtering**: Category, price, search
✅ **Shopping Cart**: Add, remove, quantity management
✅ **Delivery Calculator**: Jodhpur vs outside charges
✅ **Checkout Form**: Complete validation
✅ **EmailJS Integration**: Owner & customer notifications
✅ **Local Storage**: Cart persistence
✅ **SEO Optimized**: Meta tags, structured data
✅ **Performance**: Lazy loading, optimized images
✅ **Accessibility**: Screen reader friendly

## Customization

### Adding New Products
1. Open `products.xlsx`
2. Add new rows with product data
3. Re-upload/deploy the file
4. Website auto-updates!

### Changing Colors/Branding
Edit CSS variables in `style.css`:
```css
:root {
    --primary-red: #dc2626;
    --primary-gold: #f59e0b;
    /* Modify these colors */
}
```

### Contact Information
Update in all HTML files:
- Phone numbers
- Address
- Email addresses

## Browser Support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE11+ (with polyfills)

## Security Features
- Input validation
- XSS protection
- No sensitive data storage
- HTTPS recommended

## Performance
- Optimized images
- Minified CSS/JS (for production)
- Lazy loading
- Local storage for cart

## Support
For technical support or customization:
- Contact: Ruchi Rathi
- Phone: +91 9460250677, +91 8949409523
- Address: A-31, Umed Club Road, Raika Bagh, Jodhpur, Rajasthan
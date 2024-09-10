// Product Data (This would normally come from the backend)
const products = [
    { id: 1, name: 'Chart Paper', price: 20, image: 'images/chart-paper.jpg' },
    { id: 2, name: 'Glue Stick', price: 10, image: 'images/glue-stick.jpg' },
    { id: 3, name: 'Colored Markers', price: 50, image: 'images/markers.jpg' }
];

// Cart Array to hold added products
let cart = [];
let cartTotal = 0;
const deliveryCharge = 500; // Fixed delivery charge

// Display Products
const productList = document.querySelector('.product-list');

products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.classList.add('product-item');
    
    productItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Price: ₹${product.price}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    
    productList.appendChild(productItem);
});

// Add to Cart Function
function addToCart(productId) {
    const product = products.find(prod => prod.id === productId);
    cart.push(product);
    cartTotal += product.price;
    updateCart();
}

// Update Cart Display
function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = ''; // Clear existing items
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `<p>${item.name} - ₹${item.price}</p>`;
        cartItems.appendChild(cartItem);
    });

    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = cartTotal + deliveryCharge;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items in cart.</p>';
    }
}

// Function to generate a UPI QR code
function generateQRCode() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const totalWithFee = cartTotal + deliveryCharge;
    const upiId = "maratheratnakar-2@okaxis";  // Replace with your actual UPI ID
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";
    
    // Construct the UPI link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalWithFee}&tn=${encodeURIComponent(transactionNote)}`;

    // Generate the Google Chart QR Code URL
    const qrCodeURL = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(upiLink)}`;

    // Set the QR code image source and make it visible
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeURL;
    qrCodeImg.style.display = 'block';
    
    // Log the URL for debugging purposes
    console.log('Generated QR Code URL: ', qrCodeURL);
}


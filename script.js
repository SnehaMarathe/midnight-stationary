// Product Data (This would normally come from the backend)
const products = [
    { id: 1, name: 'Chart Paper', price: 20, image: 'images/chart-paper.jpg' },
    { id: 2, name: 'Glue Stick', price: 10, image: 'images/glue-stick.jpg' },
    { id: 3, name: 'Colored Markers', price: 50, image: 'images/markers.jpg' }
];

// Cart Array
let cart = [];

// Display Products
const productList = document.getElementById('product-list');
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
    updateCart();
}

// Update Cart Display
function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `<p>${item.name} - ₹${item.price}</p>`;
        cartItems.appendChild(cartItem);
    });

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items in cart.</p>';
    }

    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + 500}`;
}

// Function to generate a UPI QR code
function generateQRCode() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    const totalWithFee = cartTotal + 500;
    const upiId = "maratheratnakar-1@okaxis";  // Replace with your UPI ID
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";

    // Create the UPI payment link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalWithFee}&tn=${encodeURIComponent(transactionNote)}`;

    // Generate QR code URL
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
    
    // Set the QR code image
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeURL;
    qrCodeImg.style.display = 'block';
}

// Function to get the user location and generate a WhatsApp share link
function shareLocation() {
    const locationInfo = document.getElementById('location-info');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        locationInfo.textContent = "Geolocation is not supported by this browser.";
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationMessage = `Hey! I am here: https://www.google.com/maps?q=${lat},${lng}`;

        // Get cart items as a list
        const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');

        // If the cart is empty
        const cartMessage = cart.length > 0 ? `I have ordered the following items: ${cartItems}` : "No items in the cart.";

        // Final message with location and cart details
        const message = `${locationMessage}\n\n${cartMessage}`;

        // Specify the recipient phone number (including country code)
        const phoneNumber = '919146028969'; 

        // Create WhatsApp share link with pre-filled message and phone number
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        // Directly open WhatsApp with the pre-filled message
        window.location.href = whatsappURL;
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                locationInfo.textContent = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                locationInfo.textContent = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                locationInfo.textContent = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                locationInfo.textContent = "An unknown error occurred.";
                break;
        }
    }
}

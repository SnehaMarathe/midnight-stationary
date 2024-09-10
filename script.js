// Fetch Products
fetch('products.json')
    .then(response => response.json())
    .then(products => {
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
    })
    .catch(error => console.error('Error loading product data:', error));

// Cart Array
let cart = [];
let cartTotal = 0;
const deliveryCharge = 500;

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

    // Update Cart Total
    cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + deliveryCharge}`;
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
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    // Set the QR code image source and make it visible
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeURL;
    qrCodeImg.style.display = 'block';
}

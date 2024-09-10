// Product Data (This would normally come from the backend)
const products = [
    { id: 1, name: 'Chart Paper', price: 20, image: 'images/chart-paper.jpg' },
    { id: 2, name: 'Glue Stick', price: 10, image: 'images/glue-stick.jpg' },
    { id: 3, name: 'Colored Markers', price: 50, image: 'images/markers.jpg' }
];

// Cart Array
let cart = [];

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
}

let cartTotal = 0;
const deliveryCharge = 500;

// Function to add items to the cart
function addToCart(price) {
    cartTotal += price;
    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = cartTotal + deliveryCharge;
}

// Function to generate a UPI QR code
function generateQRCode() {
    const totalWithFee = cartTotal + deliveryCharge;
    const upiId = "maratheratnakar-2@okaxis";  // Replace with your UPI ID
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";
    
    // UPI QR code generation URL
    const qrCodeURL = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=upi://pay?pa=${upiId}&pn=${name}&am=${totalWithFee}&tn=${transactionNote}`;

    // Set the QR code image
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeURL;
    qrCodeImg.style.display = 'block';
}

let cart = [];

// Haversine Formula to calculate distance between two lat/long points in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon1 - lon2);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Check if current location is within 10km of the specified lat/long
function checkProximity(lat, lon) {
    const targetLat = 18.489754;
    const targetLon = 73.866688;
    const distance = getDistanceFromLatLonInKm(lat, lon, targetLat, targetLon);

    return distance <= 10; // Check if distance is within 10km
}

// Disable the "Share My Location" and other relevant buttons by default
document.addEventListener('DOMContentLoaded', function() {
    // Disable the "Share My Location" button by default
    document.getElementById('share-location-btn').disabled = true;

    // Disable the "Generate QR Code" button by default
    document.getElementById('generate-qr-btn').disabled = true;

    // Disable all "Add to Cart" buttons by default
    document.querySelectorAll('button.add-to-cart-btn').forEach(button => {
        button.disabled = true;
    });

    // Fetch Product Data and Display Products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            // Populate Chart Paper Tab
            const chartPaperContainer = document.getElementById('chart-paper');
            chartPaperContainer.innerHTML = data.chartPaper.map(product => `
                <div class="product-item">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>Price: ₹${product.price}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" disabled>Add to Cart</button>
                </div>
            `).join('');

            // Populate Glues Tab
            const gluesContainer = document.getElementById('glue');
            gluesContainer.innerHTML = data.glues.map(product => `
                <div class="product-item">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>Price: ₹${product.price}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" disabled>Add to Cart</button>
                </div>
            `).join('');

            // Populate Craft Materials Tab
            const craftMaterialsContainer = document.getElementById('craft-materials');
            craftMaterialsContainer.innerHTML = data.craftMaterials.map(product => `
                <div class="product-item">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>Price: ₹${product.price}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" disabled>Add to Cart</button>
                </div>
            `).join('');

            // Open the first tab by default
            document.querySelector(".tab-links div").click();

            // Check location and update UI accordingly
            getLocation();
        })
        .catch(error => console.error('Error loading the product data:', error));
});

// Add to Cart Function
function addToCart(productId) {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            const allProducts = [...data.chartPaper, ...data.glues, ...data.craftMaterials];
            const product = allProducts.find(prod => prod.id === productId);
            cart.push(product);
            updateCart();
        })
        .catch(error => console.error('Error fetching product data:', error));
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
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + 150}`;
}

// Function to get the user location and enable/disable buttons based on proximity
function getLocation() {
    const locationInfo = document.getElementById('location-info');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        locationInfo.textContent = "Geolocation is not supported by this browser.";
    }

    function showPosition(position) { 
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Check if within 10km
        if (checkProximity(lat, lng)) {
            alert('GREAT YOU ARE IN OUR 30min DELIVERY RANGE');
            locationInfo.innerHTML = `Latitude: ${lat}<br>Longitude: ${lng}`;

            // Enable relevant buttons since the user is within the delivery range
            document.querySelectorAll('button.add-to-cart-btn').forEach(button => {
                button.disabled = false;
            });
            document.getElementById('generate-qr-btn').disabled = false;
            document.getElementById('share-location-btn').disabled = false;
        } else {
            alert('You are not within the delivery range (10 km from store).');
            locationInfo.textContent = "You are not within the delivery range (10 km from store).";

            // Disable buttons since the user is out of delivery range
            document.querySelectorAll('button.add-to-cart-btn').forEach(button => {
                button.disabled = true;
            });
            document.getElementById('generate-qr-btn').disabled = true;
            document.getElementById('share-location-btn').disabled = true;
        }
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

// Function to generate a UPI QR code
function generateQRCode() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    // Check if cart is empty, do not generate QR code if empty
    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to generate a QR code.');
        document.getElementById('qr-code').style.display = 'none';
        document.getElementById('share-location-btn').disabled = true;  // Disable Share Location button
        return;
    }

    const totalWithFee = cartTotal + 150;
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

    // Call the UPI link generator
    generateUPILink();

    // Enable the Share Location button after QR code is generated
    document.getElementById('share-location-btn').disabled = false;
}

// Fetch the visitor counter value from the raw GitHub URL
async function fetchVisitorCounter() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/SnehaMarathe/midnight-stationary/main/counter.txt');
        if (response.ok) {
            const text = await response.text();
            document.getElementById('visitor-counter').textContent = text.trim();
        } else {
            document.getElementById('visitor-counter').textContent = "Error fetching visitor count";
        }
    } catch (error) {
        console.error('Error fetching visitor counter:', error);
        document.getElementById('visitor-counter').textContent = "Error";
    }
}

// Call the function to update the visitor counter
fetchVisitorCounter();

// Function to generate a UPI deep link
function generateUPILink() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    // Check if cart is empty
    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to proceed.');
        document.getElementById('upi-link').style.display = 'none';
        document.getElementById('share-location-btn').disabled = true;  // Disable Share Location button
        return;
    }

    const totalWithFee = cartTotal + 150;
    const upiId = "maratheratnakar-1@okaxis";  // Replace with your UPI ID
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";

    // Create the UPI deep link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalWithFee}&tn=${encodeURIComponent(transactionNote)}`;

    // Update the UPI button link and show it
    const upiLinkButton = document.getElementById('upi-link');
    upiLinkButton.href = upiLink;
    upiLinkButton.style.display = 'inline-block';

    // Enable the Share Location button after UPI link is generated
    document.getElementById('share-location-btn').disabled = false;
}

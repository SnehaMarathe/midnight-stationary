// Cart Array
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

// Disable the "Share My Location" button by default
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('share-location-btn').disabled = true;
});

// Add to Cart Function
function addToCart(productId) {
    // Assuming products are globally available or fetched again
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
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + 500}`;
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

    // Enable the Share Location button after QR code is generated
    document.getElementById('share-location-btn').disabled = false;
}

// Function to get the user location and generate a WhatsApp share link
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
            const locationMessage = `Hey! I am here: https://www.google.com/maps?q=${lat},${lng}`;

            // Display the location information
            locationInfo.innerHTML = `Latitude: ${lat}<br>Longitude: ${lng}`;

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
            
            // Provide the user with a link to share on WhatsApp
            locationInfo.innerHTML += `<br><a href="${whatsappURL}" target="_blank">Share My Location and Cart via WhatsApp</a>`;
        } else {
            // Notify the user that they are not within range
            locationInfo.textContent = "You are not within the delivery range (10 km from store).";
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

// Function to handle tab switching
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-links")[0].children;
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "#00796b";
    }
    document.getElementById(tabName).style.display = "grid";
    evt.currentTarget.style.backgroundColor = "#004d40";
}

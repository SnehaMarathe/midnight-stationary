// Cart Array initialization
let cart = [];

// Haversine Formula to calculate distance between two lat/long points in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Function to check if the current location is within 10km of any target locations
function checkProximity(lat, lon, targetLocations) {
    return targetLocations.some(({ lat: targetLat, lon: targetLon }) => {
        const distance = getDistanceFromLatLonInKm(lat, lon, targetLat, targetLon);
        return distance <= 10; // Check if distance is within 10km
    });
}

// Target locations
const targetLocations = [
    { lat: 18.489754, lon: 73.866688 }, // Location 1 - Head Office
    { lat: 17.676095, lon: 73.986140 }, // Location 2 - Satara
    // Add more locations as needed
];

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Disable the "Share My Location" button by default
    document.getElementById('share-location-btn').disabled = true;

    // Fetch Product Data and Display Products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            // Populate product tabs
            populateTab('chart-paper', data.chartPaper);
            populateTab('glue', data.glues);
            populateTab('craft-materials', data.craftMaterials);

            // Open the first tab by default
            document.querySelector(".tab-links div").click();

            // Check location and update UI accordingly
            getLocation();
        })
        .catch(error => console.error('Error loading the product data:', error));
});

// Function to populate product tabs
function populateTab(tabId, products) {
    const container = document.getElementById(tabId);
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

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

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-content">
                <p>${item.name} - ₹${item.price}</p>
                <button onclick="removeFromCart(${index})" class="remove-button">X</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items in cart.</p>';
    }

    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + 150}`;
}

// Remove item from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Function to initiate Razorpay UPI payment
function initiateRazorpayPayment() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to proceed.');
        return;
    }

    const totalWithFee = cartTotal + 150; // Add convenience fee

    const options = {
        "key": "rzp_live_qFVcFW1dSmAW0M", // Replace with your Razorpay API key
        "amount": totalWithFee * 100, // Razorpay accepts amount in paise (INR * 100)
        "currency": "INR",
        "name": "Latenight Stationery",
        "description": "Stationery Order Payment",
        "image": "https://your-logo-url.com/logo.png", // Optional logo
        "handler": function(response) {
            // Handle the success callback
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            sendWhatsAppMessage(); // Send cart details via WhatsApp after payment success
        },
        "prefill": {
            "name": "Customer Name", // You can prefill customer details here
            "email": "customer@example.com",
            "contact": "9999999999"
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// Function to send WhatsApp message with cart details
function sendWhatsAppMessage() {
    const locationInfo = document.getElementById('location-info');
    let lat = 0, lon = 0;

    // Get latitude and longitude from location info (if available)
    if (locationInfo.textContent.includes("Latitude")) {
        lat = locationInfo.textContent.split('Latitude: ')[1].split('<br>')[0];
        lon = locationInfo.textContent.split('Longitude: ')[1];
    }

    const locationMessage = lat && lon 
        ? `Hey! I am sending my location for delivery: https://www.google.com/maps?q=${lat},${lon}` 
        : "Location not available.";

    const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');
    const cartMessage = cart.length > 0 
        ? `I have ordered the following items: ${cartItems}` 
        : "No items in the cart.";

    const message = `${locationMessage}\n\n${cartMessage}`;

    const phoneNumber = '919146028969'; // Replace with your phone number
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp with cart and location details
    window.open(whatsappURL, '_blank');
}

// Function to get user location and check proximity
function getLocation() {
    const locationInfo = document.getElementById('location-info');
    const qrCodeButton = document.getElementById('generate-qr-code-btn'); // Correct reference

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            if (checkProximity(lat, lon, targetLocations)) {
                alert('GREAT YOU ARE IN OUR DELIVERY RANGE');
                const locationMessage = `Hey! I am sending location for delivery: https://www.google.com/maps?q=${lat},${lon}`;

                locationInfo.innerHTML = `Latitude: ${lat}<br>Longitude: ${lon}`;
                const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');
                const cartMessage = cart.length > 0 ? `I have ordered the following items: ${cartItems}` : "No items in the cart.";
                const message = `${locationMessage}\n\n${cartMessage}`;

                const phoneNumber = '919146028969';
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                locationInfo.innerHTML += `<br><a href="${whatsappURL}" target="_blank">Share My Location and Cart via WhatsApp</a>`;

                document.getElementById('share-location-btn').disabled = false;
                qrCodeButton.disabled = false;
            } else {
                alert('You are not within the delivery range (10 km from any of our stores).');
                locationInfo.textContent = "You are not within the delivery range (10 km from any of our stores).";
                qrCodeButton.disabled = true;
            }
        }, showError);
    } else {
        locationInfo.textContent = "Geolocation is not supported by this browser.";
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


/*
// Cart Array initialization
let cart = [];

// Haversine Formula to calculate distance between two lat/long points in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon1 - lon2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Function to check if the current location is within 10km of any target locations
function checkProximity(lat, lon, targetLocations) {
    return targetLocations.some(({ lat: targetLat, lon: targetLon }) => {
        const distance = getDistanceFromLatLonInKm(lat, lon, targetLat, targetLon);
        return distance <= 10; // Check if distance is within 10km
    });
}

// Target locations
const targetLocations = [
    { lat: 18.489754, lon: 73.866688 }, // Location 1 - Head Office
    { lat: 17.676095, lon: 73.986140 }, // Location 2 - Satara
    // Add more locations as needed
];

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Disable the "Share My Location" button by default
    document.getElementById('share-location-btn').disabled = true;

    // Fetch Product Data and Display Products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            // Populate product tabs
            populateTab('chart-paper', data.chartPaper);
            populateTab('glue', data.glues);
            populateTab('craft-materials', data.craftMaterials);

            // Open the first tab by default
            document.querySelector(".tab-links div").click();

            // Check location and update UI accordingly
            getLocation();
        })
        .catch(error => console.error('Error loading the product data:', error));
});

// Function to populate product tabs
function populateTab(tabId, products) {
    const container = document.getElementById(tabId);
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

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

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item-content">
                <p>${item.name} - ₹${item.price}</p>
                <button onclick="removeFromCart(${index})" class="remove-button">X</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items in cart.</p>';
    }

    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    document.getElementById('cart-total').innerText = `Total: ₹${cartTotal}`;
    document.getElementById('total-with-fee').innerText = `Total with Delivery: ₹${cartTotal + 150}`;
}

// Remove item from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Function to generate a UPI QR code
function generateQRCode() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to generate a QR code.');
        document.getElementById('qr-code').style.display = 'none';
        document.getElementById('share-location-btn').disabled = true;
        return;
    }

    const totalWithFee = cartTotal + 150;
    const upiId = "maratheratnakar-1@okaxis";
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalWithFee}&tn=${encodeURIComponent(transactionNote)}`;
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = qrCodeURL;
    qrCodeImg.style.display = 'block';

    generateUPILink();
    document.getElementById('share-location-btn').disabled = false;
}

// Function to get user location and check proximity
function getLocation() {
    const locationInfo = document.getElementById('location-info');
    const qrCodeButton = document.getElementById('generate-qr-code-btn'); // Correct reference

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            if (checkProximity(lat, lon, targetLocations)) {
                alert('GREAT YOU ARE IN OUR DELIVERY RANGE');
                const locationMessage = `Hey! I am sending location for delivery: https://www.google.com/maps?q=${lat},${lon}`;

                locationInfo.innerHTML = `Latitude: ${lat}<br>Longitude: ${lon}`;
                const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');
                const cartMessage = cart.length > 0 ? `I have ordered the following items: ${cartItems}` : "No items in the cart.";
                const message = `${locationMessage}\n\n${cartMessage}`;

                const phoneNumber = '919146028969';
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                locationInfo.innerHTML += `<br><a href="${whatsappURL}" target="_blank">Share My Location and Cart via WhatsApp</a>`;

                document.getElementById('share-location-btn').disabled = false;
                qrCodeButton.disabled = false;
            } else {
                alert('You are not within the delivery range (10 km from any of our stores).');
                locationInfo.textContent = "You are not within the delivery range (10 km from any of our stores).";
                qrCodeButton.disabled = true;
            }
        }, showError);
    } else {
        locationInfo.textContent = "Geolocation is not supported by this browser.";
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
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tab-links")[0].children;
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "#00796b";
    }
    document.getElementById(tabName).style.display = "grid";
    evt.currentTarget.style.backgroundColor = "#004d40";
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

    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to proceed.');
        document.getElementById('upi-link').style.display = 'none';
        document.getElementById('share-location-btn').disabled = true;
        return;
    }

    const totalWithFee = cartTotal + 150;
    const upiId = "maratheratnakar-1@okaxis";
    const name = "Midnight Stationary";
    const transactionNote = "Stationery Order Payment";

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalWithFee}&tn=${encodeURIComponent(transactionNote)}`;

    const upiLinkButton = document.getElementById('upi-link');
    upiLinkButton.href = upiLink;
    upiLinkButton.style.display = 'inline-block';

    document.getElementById('share-location-btn').disabled = false;
}

// Function to initiate Razorpay UPI payment
function initiateRazorpayPayment() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to proceed.');
        return;
    }

    const totalWithFee = cartTotal + 150; // Add convenience fee

    const options = {
        "key": "YOUR_RAZORPAY_KEY", // Replace with your Razorpay API key
        "amount": totalWithFee * 100, // Razorpay accepts amount in paise (INR * 100)
        "currency": "INR",
        "name": "Latenight Stationery",
        "description": "Stationery Order Payment",
        //"image": "https://your-logo-url.com/logo.png", // Optional logo
        "handler": function(response) {
            // Handle the success callback
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            sendWhatsAppMessage(); // Send cart details via WhatsApp after payment success
        },
        "prefill": {
            "name": "Customer Name", // You can prefill customer details here
            "email": "customer@example.com",
            "contact": "9999999999"
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}
*/

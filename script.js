
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
    { lat: 17.676095, lon: 73.986140 } // Location 2 - Satara
    // Add more locations as needed
];

// Function to handle tab switching
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    
    // Hide all tab content
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Reset background color for all tabs
    const tablinks = document.getElementsByClassName("tab-links")[0].children;
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "#00796b";  // Adjust tab color
    }
    
    // Show the selected tab
    document.getElementById(tabName).style.display = "grid";
    
    // Change the background of the clicked tab
    evt.currentTarget.style.backgroundColor = "#004d40";
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Disable the "Share My Location" button by default
    // document.getElementById('share-location-btn').disabled = true;

    // Fetch Product Data and Display Products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            // Populate product tabs
            populateTab('chart-paper', data.chartPaper);
            populateTab('glue', data.glues);
            populateTab('craft-materials', data.craftMaterials);

            // Open the first tab by default
            document.querySelector(".tab-links div").click(); // Ensures the first tab opens by default

            // Check location and update UI accordingly
            getLocation();
        })
        .catch(error => console.error('Error loading the product data:', error));
});

// Function to populate product tabs
function populateTab(tabId, products) {
    const container = document.getElementById(tabId);
    
    // Ensure each product has its respective content
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <button data-product-id="${product.id}" onclick="addToCart(${product.id})">Add to Cart</button>
            <div class="cart-icon">🛒</div>
        </div>
    `).join('');
}

// Add to Cart Function
function addToCart(productId) {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            const allProducts = [...data.chartPaper, ...data.glues, ...data.craftMaterials];
            const product = allProducts.find(prod => prod.id == productId); // Use == to handle type coercion

            if (product) {
                cart.push(product); // Only push the product if it exists
                updateCart();
            } else {
                console.error(`Product with ID ${productId} not found.`);
                alert(`Error: Product with ID ${productId} not found.`);
            }
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

    // Collect customer details
    var customerName = document.getElementById('customer-name').value;
    var customerEmail = document.getElementById('customer-email').value;
    var customerContact = document.getElementById('customer-contact').value;

    // Validate form inputs
    if (!customerName || !customerEmail || !customerContact) {
        alert('Please fill out all customer details.');
        return;
    }

    // Ensure the cart has items
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    if (cart.length === 0) {
        alert('Cart is empty. Add items to the cart to proceed.');
        return;
    }

    const totalWithFee = cartTotal + 150; // Add convenience fee

    const options = {
        "key": "rzp_test_2wFKfqydF2XePp", // Replace with your Razorpay API key
        "amount": totalWithFee * 100, // Razorpay accepts amount in paise (INR * 100)
        "currency": "INR",
        "name": "Latenight Stationery",
        "description": "Stationery Order Payment",
        "image": "https://your-logo-url.com/logo.png", // Optional logo
        "handler": function(response) {
            // Handle the success callback
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            // Call sendWhatsAppMessage with the transaction ID
            sendWhatsAppMessage(customerName, customerContact, response.razorpay_payment_id); 
        },
        "prefill": {
            "name": customerName, // Prefill customer name from the form
            "email": customerEmail, // Prefill customer email from the form
            "contact": customerContact // Prefill customer contact from the form
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// Global variables to store latitude and longitude
let currentLat = null;
let currentLon = null;

// Function to get user location and check proximity
function getLocation() {
    const locationInfo = document.getElementById('location-info');
    const qrCodeButton = document.getElementById('generate-qr-code-btn'); // Correct reference

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;

            if (checkProximity(currentLat, currentLon, targetLocations)) {
                alert('GREAT YOU ARE IN OUR DELIVERY RANGE v4');
                locationInfo.innerHTML = `Latitude: ${currentLat}<br>Longitude: ${currentLon}`;
                // Ensure buttons are rendered before enabling them
                enableAddToCartButtons(true); 
                /*
                const locationMessage = `Hey! I am sending location for delivery: https://www.google.com/maps?q=${currentLat},${currentLon}`;
                const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');
                const cartMessage = cart.length > 0 ? `I have ordered the following items: ${cartItems}` : "No items in the cart.";
                const message = `${locationMessage}\n\n${cartMessage}`;
                
                qrCodeButton.addEventListener('click', () => generateQRCode(message));
                */
            } else {
                alert('Sorry, you are outside our delivery range.');
                locationInfo.innerHTML = `Location: Outside Delivery Range (Latitude: ${currentLat}, Longitude: ${currentLon})`;
                enableAddToCartButtons(false); 
            }
        });
    } else {
        locationInfo.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// Function to send WhatsApp message with cart details
function sendWhatsAppMessage(customerName, customerContact, transactionId) {
    // If location data is available, construct the URL correctly with a comma between lat and lon
    const locationMessage = currentLat && currentLon
        ? `Hey! I am sending my location for delivery: https://www.google.com/maps?q=${currentLat},${currentLon}` // Ensure proper formatting
        : "Location not available.";

    const cartItems = cart.map(item => `${item.name} (₹${item.price})`).join(', ');
    const cartMessage = cart.length > 0 
        ? `I have ordered the following items: ${cartItems}` 
        : "No items in the cart.";
    
    const customerDetails = `Customer Name: ${customerName}\nContact: ${customerContact}`;
    const transactionMessage = `Transaction ID: ${transactionId}`;
    
    const message = `${locationMessage}\n\n${cartMessage}\n\n${customerDetails}\n${transactionMessage}`;

    const phoneNumber = '919146028969'; // Replace with your phone number
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp with cart and location details
    window.open(whatsappURL, '_blank');
}

/*
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
*/
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
// QR Code Generation (Your implementation should be included here)
function generateQRCode(message) {
    // Your QR code logic should go here
}

// Function to enable or disable all "Add to Cart" buttons and rebind click events
function enableAddToCartButtons(enable) {
    // Ensure that product buttons exist before proceeding
    const addToCartButtons = document.querySelectorAll('.product-item button');
    
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.disabled = !enable; // Disable if out of range
            button.style.backgroundColor = enable ? '#00796b' : '#4f4f4f'; // Change color if disabled
            
            // Rebind the click event if enabling the button
            if (enable) {
                const productId = button.getAttribute('data-product-id');
                button.onclick = () => addToCart(productId);
            } else {
                button.onclick = null; // Disable click if not enabled
            }
        });
    } else {
        console.error('Add to Cart buttons not found!');
    }
}


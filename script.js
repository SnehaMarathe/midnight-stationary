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
    { lat: 17.676095, lon: 73.986140 }, // Location 2 - Satara
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
    enableAddToCartButtons(false);

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

    // Add animation to cart icon on "Add to Cart" button click
    document.querySelectorAll('.product-item button').forEach(button => {
        button.addEventListener('click', () => {
            const cartIcon = document.querySelector('.cart-icon');
            
            // Add animation class
            cartIcon.classList.add('animate');
            
            // Remove animation class after animation ends
            setTimeout(() => {
                cartIcon.classList.remove('animate');
            }, 500); // Match the duration of the animation
        });
    });
});

// Function to populate product tabs
function populateTab(tabId, products) {
    const container = document.getElementById(tabId);

    // Populate product items with disabled buttons by default
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})" disabled>Add to Cart</button>
            <div class="cart-icon">
                🛒
            </div>
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

    // Collect customer details
    var customerName = document.getElementById('customer-name').value;
    var customerContact = document.getElementById('customer-contact').value;

    // Validate form inputs
    if (!customerName || !customerContact) {
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
                alert('GREAT YOU ARE IN OUR DELIVERY RANGE');
                qrCodeButton.disabled = false;
                locationInfo.textContent = `Location: Lat ${currentLat}, Lon ${currentLon}`;
            } else {
                alert('SORRY YOU ARE OUT OF OUR DELIVERY RANGE');
                qrCodeButton.disabled = true;
                locationInfo.textContent = 'You are outside the delivery range.';
            }
        }, () => {
            alert('Unable to retrieve your location.');
            qrCodeButton.disabled = true;
            locationInfo.textContent = 'Location access denied.';
        });
    } else {
        alert('Geolocation is not supported by this browser.');
        qrCodeButton.disabled = true;
        locationInfo.textContent = 'Geolocation not supported.';
    }
}

// Function to generate QR Code
function generateQRCode() {

}

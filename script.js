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

// Modify generateQRCode to call generateUPILink as well
function generateQRCode() {
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);

    // Check if cart is empty
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
}

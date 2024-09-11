/* Global Styles */
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #e0f7fa, #b2dfdb);
    color: #333;
    line-height: 1.5;
}

/* Header */
header {
    background: linear-gradient(135deg, #004d40, #00796b);
    color: #fff;
    padding: 1em 0;
    text-align: center;
    font-size: 1.4em;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    border-bottom: 3px solid #004d40;
}

header h1 {
    font-size: 1.8em;
    margin: 0;
}

header p {
    font-size: 1em;
    margin-top: 5px;
    font-weight: 300;
    color: #e0f2f1;
}

/* Main Container */
.container {
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* Headings */
h1, h2, h3 {
    color: #004d40;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

h1 {
    font-size: 2em;
    margin-bottom: 10px;
}

h2 {
    font-size: 1.6em;
    margin: 20px 0;
}

h3 {
    font-size: 1.3em;
    margin: 15px 0;
    color: #00796b;
}

/* Tabs */
.tabs {
    overflow: hidden;
    border-bottom: 2px solid #00796b;
    margin-bottom: 15px;
}

.tab-links {
    display: flex;
    cursor: pointer;
    background: #00796b;
    color: white;
    padding: 8px;
    border-radius: 6px 6px 0 0;
    font-size: 1.1em;
}

.tab-links div {
    padding: 8px 16px;
    flex: 1;
    text-align: center;
    font-weight: bold;
    transition: background 0.3s, color 0.3s;
}

.tab-links div:hover {
    background: #004d40;
    color: #e0f2f1;
}

.tab-content {
    display: none;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 0 0 6px 6px;
    background: #fff;
}

/* Active Tab */
.active-tab {
    display: block;
}

/* Product List */
.product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.product-item {
    background: #e0f2f1;
    border: 1px solid #b2dfdb;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-item img {
    width: 70%;
    border-radius: 6px;
}

.product-item h3 {
    margin: 10px 0;
    font-size: 1.2em;
    color: #004d40;
}

.product-item button {
    background: #0288d1;
    border: none;
    color: white;
    padding: 8px 16px;
    font-size: 1em;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s, box-shadow 0.3s;
}

.product-item button:hover {
    background: #0277bd;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.product-item:hover {
    transform: translateY(-5px);
}

/* Cart Section */
.cart-items {
    margin-bottom: 15px;
}

.cart-item {
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
}

#cart-total, #total-with-fee {
    font-size: 1.4em;
    font-weight: bold;
    color: #333;
    margin: 10px 0;
}

/* Buttons */
button {
    background: #0288d1;
    border: none;
    color: white;
    padding: 10px 20px;
    font-size: 1.1em;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s, box-shadow 0.3s;
}

button:hover {
    background: #0277bd;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* QR Code */
.qr-container {
    text-align: center;
    margin: 20px 0;
}

#qr-code {
    display: block;
    margin: 20px auto;
    border: 1px solid #ddd;
    padding: 8px;
    border-radius: 10px;
}

/* Footer */
footer {
    background: linear-gradient(135deg, #004d40, #00796b);
    color: #fff;
    padding: 15px;
    text-align: center;
    font-size: 1em;
    box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.1);
}

footer p {
    margin: 0;
    font-size: 0.9em;
    color: #e0f2f1;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .product-list {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .product-list {
        grid-template-columns: 1fr;
    }

    h1 {
        font-size: 1.8em;
    }

    h2 {
        font-size: 1.5em;
    }

    h3 {
        font-size: 1.1em;
    }

    button {
        padding: 8px 16px;
    }

    #cart-total, #total-with-fee {
        font-size: 1.2em;
    }
}

#location-info {
    margin-top: 15px;
    font-size: 14px;
    font-weight: bold;
    color: #d32f2f; /* Red text for out of range */
}

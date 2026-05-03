function renderCart() {

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // grab the cart container div from the HTML
    const container = document.querySelector('.cart-container');

    // remove any old cart items, the total, and the purchase button
    // so we don't end up with duplicates every time this function runs
    document.querySelectorAll('.cart-item, .cart-total, .purchase').forEach(function(el) {
        el.remove();
    });

    // if the cart is empty, show a message and stop here
    if (cart.length === 0) {
        container.insertAdjacentHTML('beforeend', '<p>Your cart is empty.</p>');
        return;
    }

    // keep a running total starting at 0
    let total = 0;

    // loop through every item in the cart
    cart.forEach(function(item, index) {

        // add this item's total cost to the running total
        // (price × quantity)
        total += item.price * item.quantity;

        // build the HTML for this cart item and add it to the page
        // index is the item's position in the array (0, 1, 2...)
        // we pass it to updateQty and removeItem so they know WHICH item to change
        container.insertAdjacentHTML('beforeend', `
            <div class="cart-item">
                <div class="item-info">
                    <img src="${item.imgSrc}" alt="${item.name}">
                    <h4>${item.name} (${item.size})</h4>
                </div>
                <h4>$${item.price.toFixed(2)}</h4>
                <div class="quantity">
                    <input type="number" value="${item.quantity}" min="1"
                        onchange="updateQty(${index}, this.value)">
                    <button class="btn-remove" onclick="removeItem(${index})">REMOVE</button>
                </div>
            </div>
        `);
    });

    // after the loop, add the total and purchase button at the bottom
    // .toFixed(2) makes sure the number always shows 2 decimal places ex: 25.00
    container.insertAdjacentHTML('beforeend', `
        <div class="cart-total">
            <h3>Total</h3>
            <h4>$${total.toFixed(2)}</h4>
        </div>
        <button class="purchase">PURCHASE</button>
    `);
}


function updateQty(index, value) {

    // load the cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // update the quantity of the item at this index
    // Math.max(1, ...) makes sure quantity never goes below 1
    cart[index].quantity = Math.max(1, parseInt(value) || 1);

    // save it back and re-render so the page updates
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}


function removeItem(index) {

    // load the cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // .splice(index, 1) removes 1 item at that position from the array
    cart.splice(index, 1);

    // save it back and re-render
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}


// this runs automatically when the checkout page loads
renderCart();

document.querySelector('.purchase').addEventListener('click',function(){
    localStorage.clear();
    renderCart();
    alert('Thank you for purchase');
});

function goCheckout(){
    window.location.href="checkout.html";
}

function goHomePage(){
    window.location.href="main.html";
}

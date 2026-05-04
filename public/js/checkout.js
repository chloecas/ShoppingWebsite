async function renderCart() {
    const res = await fetch('/api/cart');
    const data = await res.json();

    const cart = data.cart || [];
    const container = document.querySelector('.cart-container');

    document.querySelectorAll('.cart-item, .cart-total, .purchase').forEach(el => el.remove());

    if (cart.length === 0) {
        container.insertAdjacentHTML('beforeend', '<p>Your cart is empty.</p>');
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

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

    container.insertAdjacentHTML('beforeend', `
        <div class="cart-total">
            <h3>Total</h3>
            <h4>$${total.toFixed(2)}</h4>
        </div>
        <button class="purchase">PURCHASE</button>
    `);

    document.querySelector('.purchase')?.addEventListener('click', checkout);
}

async function updateQty(index, value) {
    const res = await fetch('/api/cart');
    const data = await res.json();

    const cart = data.cart || [];
    cart[index].quantity = Math.max(1, parseInt(value) || 1);

    await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
    });

    renderCart();
}

async function removeItem(index) {
    const res = await fetch('/api/cart');
    const data = await res.json();

    const cart = data.cart || [];
    cart.splice(index, 1);

    await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
    });

    renderCart();
}

async function checkout() {
    try {
        const res = await fetch('/api/cart');
        const data = await res.json();

        const cart = data.cart || [];

        const cleanCart = cart.map(item => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity
        }));

        const checkoutRes = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cleanCart })
        });

        if (!checkoutRes.ok) {
            const err = await checkoutRes.json();
            throw new Error(err.error || "Checkout failed");
        }

        await checkoutRes.json();

        alert('Order placed!');

        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: [] })
        });

        renderCart();

    } catch (err) {
        console.error(err);
    }
}

renderCart();

function goCheckout(){
    window.location.href="/checkout";
}

function goHomePage(){
    window.location.href="/";
}
async function addToCart(button) {
    const item = button.closest('.item');
    const productId = item.querySelector('input[type="radio"]').name.split('-')[1];
    const selectedSize = item.querySelector('input[type="radio"]:checked');

    if (!selectedSize) {
        alert("Please select a size!");
        return;
    }

    const sizeValue = selectedSize.value; // small, medium, large

    // Look up the sizeId from the database
    const sizeRes = await fetch(`/api/sizes?productId=${productId}&size=${sizeValue}`);
    const sizeData = await sizeRes.json();

    if (!sizeData.sizeId) {
        alert("Size not available!");
        return;
    }

    // Get current cart
    const cartRes = await fetch('/api/cart');

    if (cartRes.status === 401) {
        alert("Please log in to add items to cart!");
        window.location.href = "/account";
        return;
    }

    const cartData = await cartRes.json();
    const cart = cartData.cart || [];

    const existing = cart.find(i => i.productId == productId && i.sizeId === sizeData.sizeId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: parseInt(productId),
            sizeId: sizeData.sizeId,        // ← correct sizeId from DB
            name: item.querySelector('.productName').textContent,
            price: parseFloat(item.querySelector('.productPrice').textContent.replace('$', '')),
            imgSrc: item.querySelector('.productImg').src,
            size: sizeValue,
            quantity: 1
        });
    }

    await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
    });

    alert(`Added to cart!`);
}
function addToCart(button) {

    const item = button.closest('.item');

    const productId = parseInt(item.dataset.productId);
    const selectedSize = item.querySelector('input[type="radio"]:checked');

    if (!selectedSize) {
        alert('Please select a size first!');
        return;
    }

    const sizeId = parseInt(selectedSize.value);

    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existing = cart.find(i => {
         i.productId === productId && i.sizeId === sizeId
    });

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ 
            productId, 
            sizeId, 
            quantity:1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert('item has been added');

}




function addToCart(button) {

    const item = button.closest('.item');
    // closests() goes to html, and finds the product 

    const name = item.querySelector('.productName').textContent;
    const imgSrc = item.querySelector('.productImg').getAttribute('src');

    const priceText = item.querySelector('.productPrice').textContent;
    const price = parseFloat(priceText.replace('$',''));
    const selectedSize = item.querySelector('input[type="radio"]:checked');

    if (!selectedSize) {
        alert('Please select a size first!');
        return;
    }

    const size = selectedSize.value;

    // this part will be changed once database are done
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existing = cart.find(function(i) {
        return i.name === name & i.size === size && i.price === price;
    });

    if (existing) {
        existing.quantity += 1; // automatic ally adds 1 more if already in cart
    } else {
        cart.push({name, price, imgSrc, size, quantity:1});
    }

    localStorage.setItem('cart',JSON.stringify(cart));

    alert('item has been added');

}
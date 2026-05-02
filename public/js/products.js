console.log("products.js loaded");

fetch("/api/products")
    .then(res => res.json())
    .then(products => {
            const container = document.getElementById("wrapper");
            container.innerHTML = products.map(product => `
                <div class="item">
                <img class="productImg" src="${product.productImage}" alt="T-Shirt">
                
                <div class="productName">${product.productName}</div>

                <div class="productPrice">$${product.productPrice}</div>

                <div class="productSize">
                    <input class="choice" type="radio" name="size-${product.productId}" value="small">
                    <label for="small-${product.productId}">Small</label>

                    <input class="choice" type="radio" name="size-${product.productId}" value="medium">
                    <label for="medium-${product.productId}">Medium</label>
                    
                    <input class="choice" type="radio" name="size-${product.productId}" value="large">
                    <label for="large-${product.productId}">Large</label>

                    <br>
                    <br><br>

                    <button type ="button">Add To Cart</button>
                </div>
                </div>
                `).join("");     
    });
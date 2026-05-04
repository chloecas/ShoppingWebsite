
// -- Signup
function goTo(page) {
    window.location.href=`/${page}`;
}

document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    const formData = {
        user: form.username.value,
        fname: form.userFirst.value,
        lname: form.userLast.value,
        email: form.userEmail.value,
        passwd: form.userPassword.value,
        address: form.userAddress.value,
        phone: form.userPhone.value
    };

    const res = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        alert('Registration successful! Welcome to Shirtify!');
        form.reset();
    } else {
        alert("Error: " + (data.error || "Registration failed"));
    }
});

// -- Login

document.querySelector(".existingCustomer form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    const formData = {
        email: form.email.value,
        passwd: form.passwd.value
    };

    const res = await fetch ("/api/login" , {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        alert(`Login successful! Welcome to Shirtify!`);
        goTo("");
    } else {
        alert(data.error || "Login Failed");
    }

})

// Past orders

document.addEventListener("DOMContentLoaded", async () => {
    const ordersList = document.getElementById("order-list");

    try {
        const res = await fetch("/api/orders");
        const orders = await res.json();

        if (!res.ok) throw new Error(orders.error);

        if (orders.length === 0) {
            ordersList.innerHTML = "<tr><td colspan='3'>No orders found.</td></tr>";
            return;
        }

        // Loop through orders and create rows
        ordersList.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.orderid}</td>
                <td>${new Date(order.orderdate).toLocaleDateString()}</td>
                <td>$${order.ordertotal}</td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        ordersList.innerHTML = `<tr><td colspan='3'>Error: ${err.message}</td></tr>`;
    }
});

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
        headers: { "Content-Type ":"application/json"},
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        alert('Welcome back');
        goTo("");
    } else {
        alert(data.error || "Login Failed");
    }

})
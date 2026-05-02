function goTo(page) {
    window.location.href=`/${page}`;
}

document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    const formData = {
        username: form.username.value,
        userFirst: form.userFirst.value,
        userLast: form.userLast.value,
        userEmail: form.userEmail.value,
        userPassword: form.userPassword.value,
        userAddress: form.userAddress.value,
        userPhone: form.userPhone.value
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
// Handle Login
document.getElementById("loginForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let data = await response.json();
    if (response.ok) {
        window.location.href = data.redirect;
    } else {
        alert(data.error);
    }
});

// Handle Signup
document.getElementById("signupForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    let username = document.getElementById("signupUsername").value;
    let password = document.getElementById("signupPassword").value;

    let response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    let data = await response.json();
    if (response.ok) {
        window.location.href = data.redirect;
    } else {
        alert(data.error);
    }
});

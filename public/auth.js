document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const isSignup = window.location.pathname.includes("signup");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const endpoint = isSignup ? "/signup" : "/login";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                window.location.href = data.redirect;
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert(`${isSignup ? "Signup" : "Login"} failed. Please try again.`);
        }
    });
});


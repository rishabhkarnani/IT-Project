document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
  
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (res.ok) {
      window.location.href = data.redirect;
    } else {
      alert(data.error);
    }
  });
  
  document.getElementById("signupForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
  
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (res.ok) {
      window.location.href = data.redirect;
    } else {
      alert(data.error);
    }
  });
  
const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, "users.json");

app.use(express.json());
app.use((req, res, next) => {
    if (!req.session) {
        return next();
    }

    if (!req.session.user && !req.path.startsWith("/login") && !req.path.startsWith("/signup")) {
        return res.redirect("/login.html");
    }

    next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: "expenseTrackerSecretKey",
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false } 
}));



// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Signup Route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    let users = JSON.parse(fs.readFileSync(USERS_FILE));

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));

    req.session.user = username;
    res.json({ message: "Signup successful!", redirect: "/home.html" });
});

// Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let users = JSON.parse(fs.readFileSync(USERS_FILE));

    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    req.session.user = username;
    res.json({ message: "Login successful!", redirect: "/home.html" });
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login.html");
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    next();
}

// Protect Expense Tracker Page
app.get("/home.html", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    res.sendFile(path.join(__dirname, "public", "home.html"));
});


//  Start Server
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});

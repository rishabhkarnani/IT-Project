const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const csv = require("csv-parser");
const ObjectsToCsv = require('object-to-csv');

const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration, setup before routes
app.use(session({
    secret: "expenseTrackerSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Authentication Gate Middleware
app.use((req, res, next) => {
    const allowedPaths = [
        "/login",
        "/signup",
        "/login.html",
        "/signup.html",
        "/auth.js",
        "/style.css"
    ];

    const isPublicAsset = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/);

    if (!req.session?.user && !allowedPaths.includes(req.path) && !isPublicAsset) {
        return res.redirect("/login.html");
    }

    next();
});
// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

const EXPENSES_FILE = path.join(__dirname, "expenses.csv");

// Ensure expenses.csv exists with headers
if (!fs.existsSync(EXPENSES_FILE)) {
    fs.writeFileSync(EXPENSES_FILE, "Name,Amount,Category,Type,Date\n");
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

// Home Page Route
app.get("/home.html", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }
    res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Root Route - default landing page
app.get("/", (req, res) => {
    if (req.session.user) {
        return res.redirect("/home.html");
    } else {
        return res.redirect("/login.html");
    }
});


// Export CSV Route
app.get("/export", (req, res) => {
    const filePath = path.join(__dirname, "expenses.csv");

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("No expenses file found.");
    }

    res.setHeader("Content-disposition", "attachment; filename=expenses.csv");
    res.setHeader("Content-type", "text/csv");

    fs.createReadStream(filePath).pipe(res);
});


//Save CSV Route
app.post("/add-expense", (req, res) => {
    const { name, amount, category, type, date } = req.body;
    const newLine = `"${name}",${amount},"${category}","${type}","${date}"\n`;

    fs.appendFile(EXPENSES_FILE, newLine, (err) => {
        if (err) {
            console.error("Error writing to CSV:", err);
            return res.status(500).json({ error: "Failed to save expense." });
        }
        res.status(200).json({ message: "Expense saved successfully!" });
    });
});

// Get all expenses
app.get("/expenses", (req, res) => {
    const expenses = [];
    fs.createReadStream("expenses.csv")
        .pipe(csv())
        .on("data", (data) => expenses.push(data))
        .on("end", () => res.json(expenses))
        .on("error", (err) => {
            console.error("Error reading CSV:", err);
            res.status(500).json({ error: "Failed to read expenses." });
        });
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = 5000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: "User already exists" });
  }
  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users));
  res.json({ redirect: "index.html" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ redirect: "index.html" });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

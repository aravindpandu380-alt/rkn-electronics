const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "rknadmin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-before-deploying";
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "bookings.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]");

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

function readBookings() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function writeBookings(rows) {
  fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2));
}
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please login again." });
  }
}

app.post("/api/login", async (req, res) => {
  const { userId, password } = req.body || {};
  if (userId !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong User ID or password." });
  }
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

app.get("/api/bookings", auth, (req, res) => {
  res.json(readBookings().sort((a, b) => b.id - a.id));
});

app.patch("/api/bookings/:id", auth, (req, res) => {
  const rows = readBookings();
  const item = rows.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Booking not found." });
  const { status, warranty, warrantyStart, warrantyEnd } = req.body || {};
  const allowed = ["New", "Contacted", "In Progress", "Completed", "Cancelled"];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
  if (status) item.status = status;
  item.warranty = String(warranty || "");
  item.warrantyStart = String(warrantyStart || "");
  item.warrantyEnd = String(warrantyEnd || "");
  writeBookings(rows);
  res.json({ ok: true, booking: item });
});

app.post("/api/bookings", (req, res) => {
  const { name, phone, serviceType, brand, model, issue, address, preferredDate } = req.body || {};
  if (![name, phone, serviceType, issue, address].every(v => String(v || "").trim())) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }
  const rows = readBookings();
  const booking = {
    id: rows.length ? Math.max(...rows.map(x => x.id)) + 1 : 1,
    name: String(name).trim(), phone: String(phone).trim(),
    serviceType: String(serviceType).trim(), brand: String(brand || "").trim(),
    model: String(model || "").trim(), issue: String(issue).trim(),
    address: String(address).trim(), preferredDate: String(preferredDate || ""),
    status: "New", warranty: "", warrantyStart: "", warrantyEnd: "",
    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };
  rows.push(booking);
  writeBookings(rows);
  res.status(201).json({ ok: true, bookingId: booking.id });
});



app.listen(PORT, () => console.log(`RKN website running on port ${PORT}`));
app.get("/health", (req, res) => res.json({ ok: true, app: "RKN Electrics & Electronics" }));

app.listen(PORT, () => console.log(`RKN website running on port ${PORT}`));
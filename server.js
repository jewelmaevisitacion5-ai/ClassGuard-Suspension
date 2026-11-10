require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "students.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readStudents() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function saveStudents(rows) {
  fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "CLASSGUARD server is running." });
});

app.post("/api/register", (req, res) => {
  const { name, email, phone, location, level, consent } = req.body || {};
  if (!name || !email || !phone || !location || !level || consent !== true) {
    return res.status(400).json({ error: "Complete all fields and agree to receive class alerts." });
  }
  const students = readStudents();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (students.some(s => s.email === normalizedEmail)) {
    return res.status(409).json({ error: "This email is already registered." });
  }
  students.push({
    id: Date.now().toString(),
    name: String(name).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    location: String(location).trim(),
    level: String(level).trim(),
    createdAt: new Date().toISOString()
  });
  saveStudents(students);
  res.json({ ok: true, message: "Registration saved. This prototype does not verify email or phone ownership." });
});

app.post("/api/notify", async (req, res) => {
  const suppliedKey = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || suppliedKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Admin key is missing or incorrect." });
  }

  const { location, status, advisory, dateTime } = req.body || {};
  if (!location || !status || !advisory) {
    return res.status(400).json({ error: "Enter location, class status, and advisory details." });
  }

  const students = readStudents().filter(s => s.location.toLowerCase() === String(location).trim().toLowerCase());
  if (!students.length) return res.status(404).json({ error: "No students are registered for that exact location." });

  const subject = `CLASSGUARD ALERT: ${status} - ${location}`;
  const message = `CLASSGUARD CLASS SUSPENSION UPDATE\n\nLocation: ${location}\nStatus: ${status}\nDate/time: ${dateTime || new Date().toLocaleString()}\nAdvisory: ${advisory}\n\nPlease verify announcements from your local government/LGU and school. PAGASA issues weather advisories; it does not itself announce every class suspension.`;

  let emailSent = 0, smsSent = 0;
  const errors = [];

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      for (const student of students) {
        try {
          await transporter.sendMail({ from: process.env.EMAIL_FROM, to: student.email, subject, text: message });
          emailSent++;
        } catch (e) { errors.push(`Email to ${student.email}: ${e.message}`); }
      }
    } catch (e) { errors.push(`Email setup: ${e.message}`); }
  } else {
    errors.push("Email is not configured. Add SMTP settings to .env.");
  }

  if (process.env.SEMAPHORE_API_KEY) {
    for (const student of students) {
      try {
        const body = new URLSearchParams({
          apikey: process.env.SEMAPHORE_API_KEY,
          number: student.phone,
          message,
          sendername: process.env.SEMAPHORE_SENDER_NAME || "CLASSGUARD"
        });
        const response = await fetch("https://api.semaphore.co/api/v4/messages", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });
        if (response.ok) smsSent++;
        else errors.push(`SMS to ${student.phone}: provider returned ${response.status}`);
      } catch (e) { errors.push(`SMS to ${student.phone}: ${e.message}`); }
    }
  } else {
    errors.push("SMS is not configured. Add a Semaphore API key to .env.");
  }

  res.json({
    ok: true,
    matchedStudents: students.length,
    emailSent,
    smsSent,
    note: "Only registered students in the exact matching location were targeted. Check provider delivery reports for final delivery status.",
    errors
  });
});

app.listen(PORT, () => console.log(`CLASSGUARD running at http://localhost:${PORT}`));

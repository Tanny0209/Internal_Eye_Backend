const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

const SENSITIVE_KEYWORDS = [
    "password","passcode","otp","pin","credentials",
    "login","username","auth","authentication",
    "2fa","mfa","token","api key","secret key",
    "private key","ssh key","encryption key",
    "confidential","classified","restricted","internal",
    "private","sensitive","proprietary","nda",
    "bank details","account number","credit card",
    "debit card","cvv","invoice","financial report",
    "salary","payroll","aadhaar","passport",
    "personal data","employee data",
    "send file","transfer data","upload","download",
    "copy data","export data","leak","dump",
    "delete logs","bypass security","unauthorized",
    "external access","third party","gmail",
    "dropbox","google drive","usb",
    "source code","database dump","backup",
    "admin access","urgent","asap","secret"
];

function extractKeywords(text) {
  const keywords = new Set();
  const lowerText = text ? text.toLowerCase() : "";
  
  SENSITIVE_KEYWORDS.forEach(t => {
    if (lowerText.includes(t)) keywords.add(t);
  });
  
  return Array.from(keywords).join(", ") || "none";
}

function parseDate(dateObj) {
  if (!dateObj) return new Date();
  if (dateObj.$date) return new Date(dateObj.$date); 
  return new Date(dateObj); 
}

function formatDDMMYYYY(rawDate) {
  const d = new Date(rawDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function mapEmail(email, user) {
  const emailDateObj = email.date || email.created_at;
  const parsedDate = parseDate(emailDateObj);
  const rawDate = parsedDate.getTime();

  const riskLevelStr = email.risk_level || (email.risk_score > 75 ? "High" : email.risk_score > 40 ? "Medium" : "Low");
  const riskLevel = riskLevelStr.charAt(0).toUpperCase() + riskLevelStr.slice(1).toLowerCase();

  const combinedText = (email.subject || "") + " " + (email.body || "") + " " + (email.text || "");

  return {
    id: email.email_id || Math.random().toString(36).substr(2, 9),
    risk: riskLevel,
    subject: email.subject || "No Subject",
    sender: email.from_user || user.email || "Unknown",
    to: email.to_users ? email.to_users.join(", ") : "Unknown",
    intent: email.intent || "Unknown",
    sentiment: email.sentiment || "Unknown",
    keywords: extractKeywords(combinedText),
    attachment_count: email.attachment_count || 0,
    attachment_types: email.attachment_types || [],
    rawDate: rawDate
  };
}

async function getRecentAlerts() {
  const client = await getClient();
  const allEmails = [];

  for (const dept of DEPARTMENTS) {
    const db = client.db(dept);
    const collection = db.collection("Users");
    const docs = await collection.find({}).toArray();

    docs.forEach((doc) => {
      if (!doc.users) return;
      Object.values(doc.users).forEach((user) => {
        if (!user.emails) return;
        Object.values(user.emails).forEach((email) => {
          allEmails.push(mapEmail(email, user));
        });
      });
    });
  }

  allEmails.sort((a, b) => b.rawDate - a.rawDate);
  const topEmails = allEmails.slice(0, 20); // Top 20 latest globally

  return topEmails.map(e => {
    // Force formatting explicitly to dd/mm/yyyy hh:mm
    return { ...e, time: formatDDMMYYYY(e.rawDate) };
  });
}

// 1. GET /recent -> Top 20 latest globally
router.get("/recent", async (req, res) => {
  try {
    const formattedEmails = await getRecentAlerts();
    res.json(formattedEmails);
  } catch (err) {
    console.error("ALERTS RECENT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch alerts data" });
  }
});

// SSE GET /stream -> Pushes top 20 latest on any DB change
router.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`data: {"type": "connected"}\n\n`);

  try {
    const client = await getClient();
    const changeStreams = [];

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");
      const changeStream = collection.watch();
      changeStreams.push(changeStream);

      changeStream.on("change", async (change) => {
        try {
          const formattedEmails = await getRecentAlerts();
          res.write(`data: ${JSON.stringify(formattedEmails)}\n\n`);
        } catch (err) {
          console.error("Error in changeStream callback:", err);
        }
      });
    }

    req.on("close", () => {
      changeStreams.forEach(stream => stream.close());
    });
  } catch (err) {
    console.error("ALERTS STREAM ERROR:", err);
    res.end();
  }
});

// 2. GET /users -> Tree of { department: [ { id, name } ] }
router.get("/users", async (req, res) => {
  try {
    const client = await getClient();
    const deptUsers = {};

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");
      const docs = await collection.find({}).toArray();
      
      const parsedUsers = [];
      docs.forEach((doc) => {
        if (!doc.users) return;
        Object.values(doc.users).forEach((user) => {
          parsedUsers.push({
            id: user.user_id,
            name: user.name || user.email || user.user_id
          });
        });
      });
      deptUsers[dept] = parsedUsers;
    }

    res.json(deptUsers);
  } catch (err) {
    console.error("ALERTS USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users data" });
  }
});

// 3. GET /user-emails -> All emails for specific user
router.get("/user-emails", async (req, res) => {
  try {
    const { department, userId } = req.query;
    if (!department || !userId) return res.status(400).json({ message: "Missing params" });

    const client = await getClient();
    const db = client.db(department);
    const collection = db.collection("Users");
    const docs = await collection.find({}).toArray();

    const userEmails = [];
    docs.forEach((doc) => {
      if (!doc.users) return;
      Object.values(doc.users).forEach((user) => {
        if (user.user_id === userId && user.emails) {
          Object.values(user.emails).forEach((email) => {
            userEmails.push(mapEmail(email, user));
          });
        }
      });
    });

    userEmails.sort((a, b) => b.rawDate - a.rawDate);

    const formattedEmails = userEmails.map(e => {
      // Force formatting explicitly to dd/mm/yyyy hh:mm
      return { ...e, time: formatDDMMYYYY(e.rawDate) };
    });

    res.json(formattedEmails);
  } catch (err) {
    console.error("ALERTS USER EMAILS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user emails" });
  }
});

module.exports = router;

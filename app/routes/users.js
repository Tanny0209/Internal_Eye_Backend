const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

// List of databases (departments)
const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

router.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const allUsers = [];

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.values(doc.users).forEach((user) => {
          allUsers.push({
            _id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: dept,

            emailsSent: user.emails
              ? Object.keys(user.emails).length
              : 0,

            riskScore: user.user_risk_score,
            riskLevel: user.user_risk_level,
          });
        });
      });
    }

    res.json(allUsers);
  } catch (error) {
    console.error("MULTI-DB FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;

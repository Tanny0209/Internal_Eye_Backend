const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

router.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const emailRisks = [];

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.values(doc.users).forEach((user) => {
          if (!user.emails) return;

          Object.values(user.emails).forEach((email) => {
            if (!email.risk_level) return;

            emailRisks.push({
              department: dept,
              userId: user.user_id,
              userName: user.name,
              emailId: email.email_id,
              riskLevel: email.risk_level.toUpperCase(), // normalize
            });
          });
        });
      });
    }

    res.json(emailRisks);
  } catch (err) {
    console.error("EMAIL RISK ERROR:", err);
    res.status(500).json({ message: "Failed to fetch email risk data" });
  }
});

module.exports = router;

const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

router.get("/", async (req, res) => {
  try {
    const client = await getClient();

    const nodes = {};
    const links = {};
    const emailToUserId = {};

    // ===============================
    // STEP 1: Collect INTERNAL users
    // ===============================
    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.values(doc.users).forEach((user) => {
          nodes[user.user_id] = {
            id: user.user_id,
            name: user.name,
            department: dept,
            type: "internal"
          };

          if (user.email) {
            emailToUserId[user.email.toLowerCase()] = user.user_id;
          }
        });
      });
    }

    // ===============================
    // STEP 2: Build Links + Risk Breakdown
    // ===============================
    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.values(doc.users).forEach((user) => {
          if (!user.emails) return;

          Object.values(user.emails).forEach((email) => {

            const recipients = [
              ...(email.to_users || []),
              ...(email.cc_users || []),
              ...(email.bcc_users || [])
            ];

            recipients.forEach((recipientEmail) => {
              if (!recipientEmail) return;

              const normalizedEmail = recipientEmail.toLowerCase();
              let recipientId = emailToUserId[normalizedEmail];

              // External user handling
              if (!recipientId) {
                recipientId = normalizedEmail;

                if (!nodes[recipientId]) {
                  nodes[recipientId] = {
                    id: recipientId,
                    name: normalizedEmail,
                    department: "External",
                    type: "external"
                  };
                }
              }

              const linkKey = `${user.user_id}-${recipientId}`;

              if (!links[linkKey]) {
                links[linkKey] = {
                  source: user.user_id,
                  target: recipientId,
                  emailCount: 0,
                  highRisk: 0,
                  mediumRisk: 0,
                  lowRisk: 0
                };
              }

              links[linkKey].emailCount += 1;

              // 🔥 Risk Breakdown Logic
              const riskLevel = (email.risk_level || "").toLowerCase();

              if (riskLevel === "high") {
                links[linkKey].highRisk += 1;
              } else if (riskLevel === "medium") {
                links[linkKey].mediumRisk += 1;
              } else {
                links[linkKey].lowRisk += 1;
              }
            });
          });
        });
      });
    }

    res.json({
      nodes: Object.values(nodes),
      links: Object.values(links)
    });

  } catch (error) {
    console.error("GRAPH FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to build graph" });
  }
});

module.exports = router;

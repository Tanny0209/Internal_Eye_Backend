const express = require("express");
const router = express.Router();

const { getClient } = require("../db");
const reportService = require("../service/reports/reportService");

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

router.get("/quick", async (req, res) => {
  try {
    const client = await getClient();

    let mergedUsers = {};
    let departmentStats = {};

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      let deptHighRisk = 0;

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.entries(doc.users).forEach(([userId, user]) => {
          mergedUsers[userId] = user;

          if ((user.user_risk_level || "").toLowerCase() === "high") {
            deptHighRisk++;
          }
        });
      });

      departmentStats[dept] = deptHighRisk;
    }

    const deptDoc = {
      department: "ALL",
      users: mergedUsers,
      departmentStats,
    };

    await reportService.quickReport(deptDoc, "ALL", res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/user", async (req, res) => {
  try {
    const client = await getClient();

    let mergedUsers = {};

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.entries(doc.users).forEach(([id, user]) => {
          mergedUsers[id] = user;
        });
      });
    }

    const data = { users: mergedUsers };

    await reportService.userReport(data, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/email", async (req, res) => {
  try {
    const client = await getClient();

    let allEmails = [];

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach(doc => {
        if (!doc.users) return;

        Object.values(doc.users).forEach(user => {
          if (!user.emails) return;

          Object.values(user.emails).forEach(email => {
            allEmails.push({
              ...email,
              userName: user.name,
              department: dept
            });
          });
        });
      });
    }

    await reportService.emailReport({ emails: allEmails }, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/communication", async (req, res) => {
  try {
    const client = await getClient();

    let allEmails = [];

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const docs = await db.collection("Users").find({}).toArray();

      docs.forEach(doc => {
        if (!doc.users) return;

        Object.values(doc.users).forEach(user => {
          Object.values(user.emails || {}).forEach(e => {
            allEmails.push({
              ...e,
              userName: user.name
            });
          });
        });
      });
    }

    await reportService.communicationReport({ emails: allEmails }, res);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/department", async (req, res) => {
  try {
    const client = await getClient();

    let departments = {};

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const docs = await db.collection("Users").find({}).toArray();

      let users = {};

      docs.forEach(doc => {
        if (!doc.users) return;

        Object.entries(doc.users).forEach(([id, user]) => {
          users[id] = user;
        });
      });

      departments[dept] = users;
    }

    await reportService.departmentReport({ departments }, res);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/anomaly", async (req, res) => {
  try {
    const client = await getClient();

    let mergedUsers = {};

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach(doc => {
        if (!doc.users) return;

        Object.entries(doc.users).forEach(([userId, user]) => {
          mergedUsers[userId] = user;
        });
      });
    }

    // 🔥 SAME PATTERN AS QUICK REPORT
    await reportService.anomalyReport({ users: mergedUsers }, res);

  } catch (err) {
    console.error("ANOMALY ROUTE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

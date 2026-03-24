const express = require("express");
const { getClient } = require("../db");
const modelMetrics = require("../config/modelMetrics.json");

const router = express.Router();

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];

router.get("/", async (req, res) => {
  try {
    const client = await getClient();

    let totalUsers = 0;
    let totalEmails = 0;

    let totalRiskScore = 0;
    let totalGraphScore = 0;
    let graphScoreCount = 0;

    /* ===============================
       FETCH DATA FROM ALL DEPARTMENTS
    =============================== */

    for (const dept of DEPARTMENTS) {
      const db = client.db(dept);
      const collection = db.collection("Users");

      const docs = await collection.find({}).toArray();

      docs.forEach((doc) => {
        if (!doc.users) return;

        Object.values(doc.users).forEach((user) => {
          totalUsers++;

          // Count emails
          if (user.emails) {
            totalEmails += Object.keys(user.emails).length;
          }

          // Sum risk scores
          if (typeof user.user_risk_score === "number") {
            totalRiskScore += user.user_risk_score;
          }

          // Sum graph scores
          if (typeof user.cached_user_graph_score === "number") {
            totalGraphScore += user.cached_user_graph_score;
            graphScoreCount++;
          }
        });
      });
    }

    /* ===============================
       CALCULATE AVERAGES
    =============================== */

    const avgRiskScore =
      totalUsers > 0 ? totalRiskScore / totalUsers : 0;

    const avgGraphScore =
      graphScoreCount > 0
        ? totalGraphScore / graphScoreCount
        : 0;

    /* ===============================
       MODEL METRICS (FROM JSON)
    =============================== */

    const {
      gnnAccuracy,
      intentAccuracy,
      sentimentAccuracy,
      fusionWeights
    } = modelMetrics;

    /* ===============================
       OVERALL CONFIDENCE CALCULATION
       R = α(Intent) + β(Sentiment) + γ(Graph)
    =============================== */

    const overallConfidence =
      fusionWeights.intent * intentAccuracy +
      fusionWeights.sentiment * sentimentAccuracy +
      fusionWeights.graph * gnnAccuracy;

    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      system: {
        serverStatus: "running",
        databaseStatus: "connected",
        departmentsScanned: DEPARTMENTS.length
      },

      models: {
        gnnAccuracy,
        intentAccuracy,
        sentimentAccuracy,
        overallConfidence: Number(overallConfidence.toFixed(2))
      },

      monitoring: {
        totalUsers,
        totalEmails,
        avgRiskScore: Number(avgRiskScore.toFixed(3)),
        avgGraphScore: Number(avgGraphScore.toFixed(3))
      }
    });

  } catch (error) {
    console.error("SYSTEM STATUS ERROR:", error);

    res.status(500).json({
      system: {
        serverStatus: "running",
        databaseStatus: "disconnected"
      },
      message: "Failed to fetch system status"
    });
  }
});

module.exports = router;

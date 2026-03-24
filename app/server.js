const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/users");
const emailRiskRoutes = require("./routes/emailRisk");
const graphRoutes = require("./routes/graph");
const systemStatus = require("./routes/systemStatus");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");
const alertRoutes = require("./routes/alerts");

const app = express();

app.use(cors({
  origin: "https://internal-eye.netlify.app",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email-risk", emailRiskRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/system-status", systemStatus);
app.use("/api/reports", reportRoutes);
app.use("/api/alerts", alertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

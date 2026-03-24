const pageTemplate = require("./pageTemplate");

function generateAnomalyReport(data) {
  const users = Object.values(data.users || {});

  let anomalies = [];
  let typeCount = {};
  let userCount = {};
  let timeMap = {};

  users.forEach(user => {
    const emails = Object.values(user.emails || []);

    if (!emails.length) return;

    const total = emails.length;
    const avg = user.avg_daily_emails || 1;

    const external = emails.filter(e => e.is_external).length;
    const afterHours = emails.filter(e => e.is_after_hours).length;
    const highRisk = emails.filter(e => e.risk_level === "high").length;
    const attachments = emails.filter(e => e.has_attachment).length;

    /* ---------- BASELINE ---------- */
    const externalRate = external / total;
    const afterRate = afterHours / total;

    /* ---------- DETECTION ---------- */

    function add(type, severity, desc) {
      anomalies.push({
        user: user.name,
        type,
        severity,
        desc
      });

      typeCount[type] = (typeCount[type] || 0) + 1;
      userCount[user.name] = (userCount[user.name] || 0) + 1;
    }

    // 🔥 1. Volume Spike
    if (total > avg * 2) {
      add(
        "Volume Spike",
        "High",
        `Sent ${total} emails vs baseline ${avg}`
      );
    }

    // 🔥 2. External Spike
    if (externalRate > 0.6) {
      add(
        "External Spike",
        "High",
        `${(externalRate * 100).toFixed(1)}% external communication`
      );
    }

    // 🔥 3. After Hours Spike
    if (afterRate > 0.5) {
      add(
        "After Hours Activity",
        "Medium",
        `${(afterRate * 100).toFixed(1)}% emails sent after hours`
      );
    }

    // 🔥 4. Risk Burst
    if (highRisk > 5) {
      add(
        "High Risk Burst",
        "High",
        `${highRisk} high-risk emails detected`
      );
    }

    // 🔥 5. Attachment Anomaly
    if (attachments > total * 0.7) {
      add(
        "Attachment Spike",
        "Medium",
        `${attachments} emails with attachments`
      );
    }

    // 🔥 6. Time-based anomaly
    emails.forEach(e => {
      let hour = e.hour ?? 0;

      if (hour >= 0 && hour <= 4) {
        add(
          "Night Activity",
          "Medium",
          `Email sent at ${hour}:00`
        );
      }

      const day = new Date(e.date).toLocaleDateString();
      timeMap[day] = (timeMap[day] || 0) + 1;
    });
  });

  /* ---------- TOP USERS ---------- */
  const topUsers = Object.entries(userCount)
    .map(([u, c]) => ({ u, c }))
    .sort((a, b) => b.c - a.c)
    .slice(0, 5);

  /* ---------- CHARTS ---------- */

  const typeChart = `
  <div class="section">
    <h2>Anomaly Types</h2>
    <div class="chart-container">
      <canvas id="typeChart"></canvas>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
     new Chart(document.getElementById('typeChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(Object.keys(typeCount))},
    datasets: [{
      data: ${JSON.stringify(Object.values(typeCount))},
      backgroundColor: '#ef4444'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // ✅ FIX
      }
    }
  }
});
    </script>
  </div>
  `;


  /* ---------- TABLE ---------- */

  const table = `
  <div class="section">
    <h2>Detected Anomalies</h2>
    <table>
      <tr>
        <th>User</th>
        <th>Type</th>
        <th>Description</th>
        <th>Severity</th>
      </tr>
      ${anomalies.slice(0, 50).map(a => `
        <tr>
          <td>${a.user}</td>
          <td>${a.type}</td>
          <td>${a.desc}</td>
          <td>${a.severity}</td>
        </tr>
      `).join("")}
    </table>
  </div>
  `;

  /* ---------- TOP USERS ---------- */

  const userTable = `
  <div class="section">
    <h2>Top Anomalous Users</h2>
    <table>
      <tr><th>User</th><th>Anomalies</th></tr>
      ${topUsers.map(u => `
        <tr><td>${u.u}</td><td>${u.c}</td></tr>
      `).join("")}
    </table>
  </div>
  `;

  /* ---------- INSIGHTS ---------- */

  const insights = `
  <div class="section">
    <h2>Key Insights</h2>
    <ul class="bullet-list">
      ${anomalies.length > 20 ? "<li>High anomaly activity detected</li>" : ""}
      ${topUsers[0] ? `<li>${topUsers[0].u} shows highest anomalous behavior</li>` : ""}
      ${Object.keys(typeCount).length > 3 ? "<li>Multiple anomaly types detected</li>" : ""}
    </ul>
  </div>
  `;

  const sections = [
    `
    <div class="section">
      <h2>Executive Summary</h2>
      <p>${anomalies.length} anomalies detected across users.</p>
    </div>
    `,
    typeChart,
    table,
    userTable,
    insights
  ];

  return pageTemplate(
    "Anomaly Detection Report",
    "Behavioral Anomaly Intelligence",
    sections
  );
}

module.exports = { generateAnomalyReport };
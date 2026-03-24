const pageTemplate = require("./pageTemplate");

function generateDepartmentReport(data) {
  const departments = data.departments || {};

  let rows = [];

  Object.entries(departments).forEach(([dept, users]) => {
    let totalUsers = 0;
    let totalEmails = 0;
    let highRisk = 0;
    let external = 0;
    let afterHours = 0;

    Object.values(users).forEach(user => {
      totalUsers++;

      const emails = Object.values(user.emails || []);
      totalEmails += emails.length;

      if ((user.user_risk_level || "").toLowerCase() === "high") {
        highRisk++;
      }

      emails.forEach(e => {
        if (e.is_external) external++;
        if (e.is_after_hours) afterHours++;
      });
    });

    const externalPercent = totalEmails ? (external / totalEmails) * 100 : 0;
    const afterPercent = totalEmails ? (afterHours / totalEmails) * 100 : 0;

    // 🔥 COMPOSITE RISK SCORE (UNIQUE)
    const riskScore =
      (highRisk * 3) +
      (externalPercent * 0.5) +
      (afterPercent * 0.5);

    rows.push({
      dept,
      totalUsers,
      totalEmails,
      highRisk,
      externalPercent: externalPercent.toFixed(1),
      afterPercent: afterPercent.toFixed(1),
      riskScore: riskScore.toFixed(1)
    });
  });

  // 🔥 SORT BY RISK
  rows.sort((a, b) => b.riskScore - a.riskScore);

  /* ---------- CHART (STACKED) ---------- */

  const chart = `
  <div class="section">
    <h2>Department Risk Breakdown</h2>
    <div class="chart-container">
      <canvas id="deptChart"></canvas>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      new Chart(document.getElementById('deptChart'), {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(rows.map(r => r.dept))},
          datasets: [
            {
              label: 'External %',
              data: ${JSON.stringify(rows.map(r => r.externalPercent))},
              backgroundColor: '#6366f1'
            },
            {
              label: 'After Hours %',
              data: ${JSON.stringify(rows.map(r => r.afterPercent))},
              backgroundColor: '#f59e0b'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }
      });
    </script>
  </div>
  `;

  /* ---------- TABLE ---------- */

  const table = `
  <div class="section">
    <h2>Department Intelligence Table</h2>
    <table>
      <tr>
        <th>Rank</th>
        <th>Department</th>
        <th>Users</th>
        <th>Emails</th>
        <th>High Risk</th>
        <th>External %</th>
        <th>After Hours %</th>
        <th>Risk Score</th>
      </tr>
      ${rows.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.dept}</td>
          <td>${r.totalUsers}</td>
          <td>${r.totalEmails}</td>
          <td>${r.highRisk}</td>
          <td>${r.externalPercent}%</td>
          <td>${r.afterPercent}%</td>
          <td><strong>${r.riskScore}</strong></td>
        </tr>
      `).join("")}
    </table>
  </div>
  `;

  /* ---------- ALERT FLAGS ---------- */

  const alerts = `
  <div class="section">
    <h2>Alert Flags</h2>
    <ul class="bullet-list">
      ${rows.map(r => `
        ${r.externalPercent > 40 ? `<li>${r.dept}: High external communication</li>` : ""}
        ${r.afterPercent > 30 ? `<li>${r.dept}: High after-hours activity</li>` : ""}
        ${r.highRisk > 5 ? `<li>${r.dept}: Multiple high-risk users</li>` : ""}
      `).join("")}
    </ul>
  </div>
  `;

  /* ---------- BEHAVIOR PROFILE ---------- */

  const profiles = `
  <div class="section">
    <h2>Department Behavior Profiles</h2>
    <ul class="bullet-list">
      ${rows.map(r => `
        <li>
          <strong>${r.dept}:</strong>
          ${r.externalPercent > r.afterPercent ? "External-heavy communication" : "After-hours heavy behavior"}
        </li>
      `).join("")}
    </ul>
  </div>
  `;

  /* ---------- INSIGHTS ---------- */

  const insights = `
  <div class="section">
    <h2>Key Insights</h2>
    <ul class="bullet-list">
      ${rows[0] ? `<li>${rows[0].dept} is the highest risk department</li>` : ""}
      ${rows.length > 1 ? `<li>${rows[1].dept} shows moderate risk behavior</li>` : ""}
      <li>Risk scores combine behavior, external exposure, and user risk</li>
    </ul>
  </div>
  `;

  const sections = [
    `
    <div class="section">
      <h2>Executive Summary</h2>
      <p>Advanced department-level behavioral and risk intelligence analysis.</p>
    </div>
    `,
    chart,
    table,
    alerts,
    profiles,
    insights
  ];

  return pageTemplate(
    "Department Intelligence Report",
    "Advanced Risk & Behavioral Comparison",
    sections
  );
}

module.exports = { generateDepartmentReport };
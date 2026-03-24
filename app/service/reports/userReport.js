const pageTemplate = require("./pageTemplate");

/* ---------- CHARTS ---------- */
function buildCharts(data) {
  return `
    <div class="section">
      <h2>Visual Analytics</h2>

      <div class="chart-row">

        <div class="chart-card">
          <div class="chart-title">User Activity</div>
          <div class="chart-container">
            <canvas id="activityChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">After Hours Activity</div>
          <div class="chart-container">
            <canvas id="afterChart"></canvas>
          </div>
        </div>

      </div>

      <div class="chart-row">

        <div class="chart-card">
          <div class="chart-title">External Communication</div>
          <div class="chart-container">
            <canvas id="externalChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">Risk Score Comparison</div>
          <div class="chart-container">
            <canvas id="riskScoreChart"></canvas>
          </div>
        </div>

      </div>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

      <script>
        const common = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        };

        new Chart(document.getElementById('activityChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.users.map(u => u.name))},
            datasets: [{
              data: ${JSON.stringify(data.users.map(u => u.totalEmails))},
              backgroundColor: '#3b82f6'
            }]
          },
          options: common
        });

        new Chart(document.getElementById('afterChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.users.map(u => u.name))},
            datasets: [{
              data: ${JSON.stringify(data.users.map(u => u.afterHours))},
              backgroundColor: '#f59e0b'
            }]
          },
          options: common
        });

        new Chart(document.getElementById('externalChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.users.map(u => u.name))},
            datasets: [{
              data: ${JSON.stringify(data.users.map(u => u.external))},
              backgroundColor: '#6366f1'
            }]
          },
          options: common
        });

        new Chart(document.getElementById('riskScoreChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.users.map(u => u.name))},
            datasets: [{
              data: ${JSON.stringify(data.users.map(u => u.score))},
              backgroundColor: '#ef4444'
            }]
          },
          options: common
        });
      </script>
    </div>
  `;
}

/* ---------- MAIN REPORT ---------- */
function generateUserReport(data) {
  const users = Object.values(data.users || []);

  let rows = [];

  users.forEach(user => {
    const emails = Object.values(user.emails || []);

    rows.push({
      name: user.name,
      email: user.email,
      score: user.user_risk_score,
      totalEmails: emails.length,
      afterHours: emails.filter(e => e.is_after_hours).length,
      external: emails.filter(e => e.is_external).length
    });
  });

  /* -------- CHART DATA -------- */
  const chartUsers = rows.slice(0, 10); // limit for better UI

  /* -------- SECTIONS -------- */
  const sections = [

    /* SUMMARY */
    `
    <div class="section">
      <h2>Executive Summary</h2>
      <p class="narrative">
        ${users.length} users analyzed. 
        Report highlights behavioral comparison across users.
      </p>
    </div>
    `,

    /* CHARTS */
    buildCharts({ users: chartUsers }),

    /* TABLE */
    `
    <div class="section">
      <h2>User Overview</h2>
      <table>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Risk Score</th>
          <th>Total Emails</th>
          <th>After Hours</th>
          <th>External</th>
        </tr>
        ${rows.map(r => `
          <tr>
            <td>${r.name}</td>
            <td>${r.email}</td>
            <td>${r.score}</td>
            <td>${r.totalEmails}</td>
            <td>${r.afterHours}</td>
            <td>${r.external}</td>
          </tr>
        `).join("")}
      </table>
    </div>
    `
  ];

  return pageTemplate(
    "User Intelligence Report",
    "User Behavior & Risk Comparison",
    sections
  );
}

module.exports = { generateUserReport };
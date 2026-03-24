const pageTemplate = require("./pageTemplate");

const INTERNAL_DOMAIN = "company.com";

/* ---------- CHARTS ---------- */
function buildCharts(data) {
  return `
    <div class="section">
      <h2>Visual Analytics</h2>

      <div class="chart-row">

        <div class="chart-card">
          <div class="chart-title">Email Time Distribution</div>
          <div class="chart-container">
            <canvas id="timeClassChart"></canvas>
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
          <div class="chart-title">Attachment Risk</div>
          <div class="chart-container">
            <canvas id="attachChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">Top Users</div>
          <div class="chart-container">
            <canvas id="userChart"></canvas>
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

        // TIME DISTRIBUTION
        new Chart(document.getElementById('timeClassChart'), {
          type: 'bar',
          data: {
            labels: ['Night','Morning','Afternoon','Evening'],
            datasets: [{
              label: 'Emails',
              data: [
                ${data.timeBuckets.night},
                ${data.timeBuckets.morning},
                ${data.timeBuckets.afternoon},
                ${data.timeBuckets.evening}
              ],
              backgroundColor: '#3b82f6'
            }]
          },
          options: common
        });

        // AFTER HOURS
        new Chart(document.getElementById('afterChart'), {
          type: 'bar',
          data: {
            labels: ['After Hours','Normal'],
            datasets: [{
              label: 'Emails',
              data: [${data.afterHours}, ${data.normalHours}],
              backgroundColor: ['#f59e0b','#10b981']
            }]
          },
          options: common
        });

        // ATTACHMENTS
        new Chart(document.getElementById('attachChart'), {
          type: 'pie',
          data: {
            labels: ['Suspicious','Normal'],
            datasets: [{
              data: [${data.suspiciousAttach}, ${data.normalAttach}],
              backgroundColor: ['#ef4444','#22c55e']
            }]
          }
        });

        // USERS
        new Chart(document.getElementById('userChart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.topUsers.map(u => u.name))},
            datasets: [{
              label: 'Emails',
              data: ${JSON.stringify(data.topUsers.map(u => u.count))},
              backgroundColor: '#3b82f6'
            }]
          },
          options: common
        });
      </script>
    </div>
  `;
}

/* ---------- MAIN REPORT ---------- */
function generateEmailReport(data) {
  const emails = data.emails || [];

  let afterHours = 0, normalHours = 0;
  let suspiciousAttach = 0, normalAttach = 0;

  let timeBuckets = {
    night: 0,
    morning: 0,
    afternoon: 0,
    evening: 0
  };

  let userMap = {};
  let domainMap = {};
  let userRiskMap = {};
  let attachTypes = {};

  emails.forEach(e => {

    /* ---------- TIME FIX ---------- */
    let hour = 0;

    if (e.hour !== undefined && e.hour !== null) {
      hour = e.hour;
    } else if (e.date) {
      const d = new Date(e.date);
      if (!isNaN(d)) hour = d.getHours();
    }

    if (hour < 6) timeBuckets.night++;
    else if (hour < 12) timeBuckets.morning++;
    else if (hour < 18) timeBuckets.afternoon++;
    else timeBuckets.evening++;

    /* ---------- AFTER HOURS ---------- */
    if (e.is_after_hours) afterHours++;
    else normalHours++;

    /* ---------- ATTACHMENTS ---------- */
    if (e.suspicious_attachment) suspiciousAttach++;
    else normalAttach++;

    /* ---------- USER COUNT ---------- */
    userMap[e.userName] = (userMap[e.userName] || 0) + 1;

    /* ---------- ATTACH TYPES ---------- */
    (e.attachment_types || []).forEach(type => {
      attachTypes[type] = (attachTypes[type] || 0) + 1;
    });
  });

  const total = emails.length || 1;

  const topUsers = Object.entries(userMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  /* ---------- TABLES ---------- */

  const timeTable = `
    <div class="section">
      <h2>Email Time Classification</h2>
      <table>
        <tr><th>Time Slot</th><th>Count</th><th>%</th></tr>
        ${Object.entries(timeBuckets).map(([k,v])=>`
          <tr>
            <td>${k}</td>
            <td>${v}</td>
            <td>${((v/total)*100).toFixed(1)}%</td>
          </tr>
        `).join("")}
      </table>
    </div>
  `;

  const riskyTable = `
    <div class="section">
      <h2>Top High Risk Emails</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>User</th>
          <th>Subject</th>
          <th>Risk</th>
          <th>External</th>
          <th>Attachment</th>
        </tr>
        ${emails
          .filter(e => e.risk_level === "high")
          .slice(0,20)
          .map(e => `
            <tr>
              <td>${new Date(e.date).toLocaleString()}</td>
              <td>${e.userName}</td>
              <td>${e.subject}</td>
              <td>${e.risk_level}</td>
              <td>${e.is_external ? "Yes" : "No"}</td>
              <td>${e.has_attachment ? "Yes" : "No"}</td>
            </tr>
          `).join("")}
      </table>
    </div>
  `;

  const attachTable = `
    <div class="section">
      <h2>Attachment Types</h2>
      <table>
        <tr><th>Type</th><th>Count</th></tr>
        ${Object.entries(attachTypes)
          .sort((a,b)=>b[1]-a[1])
          .slice(0,10)
          .map(([t,c])=>`
            <tr><td>${t}</td><td>${c}</td></tr>
          `).join("")}
      </table>
    </div>
  `;

  const insights = `
    <div class="section">
      <h2>Key Insights</h2>
      <ul class="bullet-list">
        ${afterHours > normalHours * 0.3 ? "<li>High after-hours activity detected</li>" : ""}
        ${suspiciousAttach > 0 ? "<li>Suspicious attachments detected</li>" : ""}
        ${Object.keys(domainMap).length > 10 ? "<li>High external communication diversity</li>" : ""}
      </ul>
    </div>
  `;

  /* ---------- SECTIONS ---------- */

  const sections = [
    `
    <div class="section">
      <h2>Executive Summary</h2>
      <p>${emails.length} emails analyzed with behavioral insights.</p>
    </div>
    `,
    buildCharts({
      timeBuckets,
      afterHours,
      normalHours,
      suspiciousAttach,
      normalAttach,
      topUsers
    }),
    timeTable,
    riskyTable,
    attachTable,
    insights
  ];

  return pageTemplate(
    "Email Intelligence Report",
    "Advanced Behavioral Email Analytics",
    sections
  );
}

module.exports = { generateEmailReport };
function section(title, content) {
  return `<div class="section"><h2>${title}</h2>${content}</div>`;
}

/* ---------- EXISTING SECTIONS ---------- */

function statCard(label, value) {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
}

function buildStatsSection(stats) {
  return `
    <div class="section">
      <h2>Key Metrics</h2>
      <div class="stat-grid">
        ${statCard("Total Users", stats.totalUsers)}
        ${statCard("High Risk Users", stats.highRiskUsers)}
        ${statCard("External Emails (%)", stats.externalPercentage + "%")}
        ${statCard("After Hours (%)", stats.afterHoursPercentage + "%")}
      </div>
    </div>
  `;
}

function buildRiskDistributionSection(dist) {
  return `
    <div class="section">
      <h2>Risk Distribution</h2>
      <ul class="bullet-list">
        <li>High Risk: ${dist.high}</li>
        <li>Medium Risk: ${dist.medium}</li>
        <li>Low Risk: ${dist.low}</li>
      </ul>
    </div>
  `;
}

function buildTopUsersSection(users) {
  const rows = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.risk_score}</td>
      <td><span class="badge ${u.risk_level.toLowerCase()}">${u.risk_level}</span></td>
    </tr>
  `).join("");

  return `
    <div class="section">
      <h2>Top Risk Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Risk Score</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function buildInsightsSection(insights) {
  return `
    <div class="section">
      <h2>Key Insights</h2>
      <ul class="bullet-list">
        ${insights.map(i => `<li>${i}</li>`).join("")}
      </ul>
    </div>
  `;
}

function buildRecommendationsSection(recs) {
  return `
    <div class="section">
      <h2>Recommendations</h2>
      <ul class="bullet-list">
        ${recs.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  `;
}

/* ---------- NEW ADVANCED SECTIONS ---------- */

function buildExecutiveSummary(stats) {
  return section(
    "Executive Summary",
    `<p class="narrative">
      The organization shows ${stats.highRiskUsers} high-risk users with 
      ${stats.externalPercentage}% external communication and 
      ${stats.afterHoursPercentage}% after-hours activity.
    </p>`
  );
}

function buildActivitySection(stats) {
  return section(
    "Activity Overview",
    `<ul class="bullet-list">
      <li>Total Emails: ${stats.totalEmails}</li>
      <li>External: ${stats.externalPercentage}%</li>
      <li>After Hours: ${stats.afterHoursPercentage}%</li>
    </ul>`
  );
}

function buildRiskFactors(f) {
  return section(
    "Top Risk Factors",
    `<ul class="bullet-list">
      <li>Sensitive Emails: ${f.sensitive}</li>
      <li>Suspicious Attachments: ${f.attachments}</li>
    </ul>`
  );
}

function buildDepartmentBreakdown(deptStats) {
  return section(
    "Department Breakdown",
    `<table>
      <tr><th>Department</th><th>High Risk Users</th></tr>
      ${Object.entries(deptStats)
        .map(([d, v]) => `<tr><td>${d}</td><td>${v}</td></tr>`)
        .join("")}
    </table>`
  );
}


function buildAnomalySection(anomalies) {
  return section(
    "Anomaly Highlights",
    `<ul class="bullet-list">
      ${anomalies.map(a => `<li>${a}</li>`).join("")}
    </ul>`
  );
}


exports.buildUserOverviewSection = (user) => `
  <div class="section">
    <h2>User Overview</h2>
    <p><b>${user.name}</b> (${user.email})</p>
    <p>Role: ${user.role || "-"}</p>
    <p>Risk: ${user.user_risk_level} (${user.user_risk_score})</p>
  </div>
`;

exports.buildUserActivitySection = (data) => `
  <div class="section">
    <h2>Activity Summary</h2>
    <ul class="bullet-list">
      <li>Total Emails: ${data.totalEmails}</li>
      <li>External: ${data.externalPercent}%</li>
      <li>After Hours: ${data.afterHoursPercent}%</li>
    </ul>
  </div>
`;

exports.buildUserRiskSection = (data) => `
  <div class="section">
    <h2>Risk Indicators</h2>
    <ul class="bullet-list">
      <li>Sensitive Emails: ${data.sensitive}</li>
    </ul>
  </div>
`;

exports.buildUserDomainsSection = (domains) => `
  <div class="section">
    <h2>Top Domains</h2>
    <table>
      <tr><th>Domain</th><th>Count</th></tr>
      ${domains.map(([d,c]) => `<tr><td>${d}</td><td>${c}</td></tr>`).join("")}
    </table>
  </div>
`;

exports.buildUserTimelineSection = (timeline) => `
  <div class="section">
    <h2>Activity Timeline</h2>
    <ul class="bullet-list">
      ${timeline.map(t => `<li>${t.date} → ${t.subject} (${t.risk})</li>`).join("")}
    </ul>
  </div>
`;
/* ---------- EXPORT EVERYTHING ---------- */

module.exports = {
  buildStatsSection,
  buildRiskDistributionSection,
  buildTopUsersSection,
  buildInsightsSection,
  buildRecommendationsSection,
  buildExecutiveSummary,
  buildActivitySection,
  buildRiskFactors,
  buildDepartmentBreakdown,
  buildAnomalySection,
};
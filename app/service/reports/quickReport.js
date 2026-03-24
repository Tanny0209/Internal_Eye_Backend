const pageTemplate = require("./pageTemplate");

const {
  analyzeDepartmentData,
  generateInsights
} = require("./analyzers");

const {
  buildExecutiveSummary,
  buildActivitySection,
  buildRiskFactors,
  buildDepartmentBreakdown,
  buildDomainSection,
  buildAnomalySection,
  buildStatsSection,
  buildRiskDistributionSection,
  buildTopUsersSection,
  buildInsightsSection,
  buildRecommendationsSection
} = require("./sectionBuilders");

function buildCharts(data) {
  return `
    <div class="section">
      <h2>Visual Analytics</h2>

      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-title">Risk Distribution</div>
          <div class="chart-container">
            <canvas id="riskChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">External vs Internal</div>
          <div class="chart-container">
            <canvas id="activityChart"></canvas>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

      <script>
        const commonOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 10 }
              }
            }
          }
        };

        // 🔴 Risk Distribution Chart
        new Chart(document.getElementById('riskChart'), {
          type: 'bar',
          data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
              label: 'Users',
              data: [
                ${data.distribution.high},
                ${data.distribution.medium},
                ${data.distribution.low}
              ],
              backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
              borderRadius: 6
            }]
          },
          options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // 🔥 cleaner (optional)
      }
    },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { font: { size: 10 } },
                grid: { color: '#e5e7eb' }
              },
              x: {
                ticks: { font: { size: 10 } },
                grid: { display: false }
              }
            }
          }
        });

        // 🔵 External vs Internal Pie
        new Chart(document.getElementById('activityChart'), {
          type: 'doughnut',
          data: {
            labels: ['External', 'Internal'],
            datasets: [{
              data: [
                ${data.stats.externalPercentage},
                ${100 - data.stats.externalPercentage}
              ],
              backgroundColor: ['#3b82f6', '#94a3b8'],
              borderWidth: 0
            }]
          },
          options: {
            ...commonOptions,
            cutout: '65%'
          }
        });
      </script>
    </div>
  `;
}
function generateQuickReport(deptDoc) {
  const data = analyzeDepartmentData(deptDoc);
  const insights = generateInsights(data.stats, data.distribution);

  const sections = [
    buildExecutiveSummary(data.stats),

    buildCharts(data), // 🔥 NEW

    buildStatsSection(data.stats),
    buildActivitySection(data.stats),
    buildRiskDistributionSection(data.distribution),
    buildRiskFactors(data.factors),
    buildDepartmentBreakdown(deptDoc.departmentStats || {}),
    buildAnomalySection(data.anomalies),
    buildTopUsersSection(data.topUsers),
    buildInsightsSection(insights),
    buildRecommendationsSection([
      "Monitor high-risk users",
      "Restrict external sharing",
      "Audit anomalies",
    ])
  ];

  return pageTemplate(
    "Quick Risk Overview Report",
    "Advanced Insider Threat Intelligence Summary",
    sections
  );
}

module.exports = { generateQuickReport };
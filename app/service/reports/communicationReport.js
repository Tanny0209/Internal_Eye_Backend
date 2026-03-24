const pageTemplate = require("./pageTemplate");

const INTERNAL_DOMAIN = "company.com";

function generateCommunicationReport(data) {
  const emails = data.emails || [];

  let pairMap = {};

  emails.forEach(e => {
    const from = e.from_user || e.userName || "Unknown";

    const recipients = [
      ...(e.to_users || []),
      ...(e.cc_users || []),
      ...(e.bcc_users || [])
    ];

    recipients.forEach(to => {
      const key = `${from}||${to}`;

      pairMap[key] = (pairMap[key] || 0) + 1;
    });
  });

  /* ---------- BUILD PAIRS ---------- */

  const pairs = Object.entries(pairMap)
    .map(([k, count]) => {
      const [from, to] = k.split("||");

      const isExternal = !to.endsWith(INTERNAL_DOMAIN);

      return {
        from,
        to,
        count,
        type: isExternal ? "External" : "Internal"
      };
    })
    .sort((a,b)=>b.count-a.count);

  /* ---------- TOP STRONG LINKS ---------- */

  const topPairs = pairs.slice(0, 20);

  /* ---------- MAIN TABLE ---------- */

  const pairTable = `
  <div class="section">
    <h2>Communication Relationships</h2>
    <table>
      <tr>
        <th>From</th>
        <th>To</th>
        <th>Emails</th>
        <th>Type</th>
      </tr>
      ${pairs.map(p => `
        <tr>
          <td>${p.from}</td>
          <td>${p.to}</td>
          <td>${p.count}</td>
          <td>${p.type}</td>
        </tr>
      `).join("")}
    </table>
  </div>
  `;

  /* ---------- STRONG LINKS ---------- */

  const strongTable = `
  <div class="section">
    <h2>Strongest Communication Links</h2>
    <table>
      <tr>
        <th>From</th>
        <th>To</th>
        <th>Emails</th>
      </tr>
      ${topPairs.map(p => `
        <tr>
          <td>${p.from}</td>
          <td>${p.to}</td>
          <td>${p.count}</td>
        </tr>
      `).join("")}
    </table>
  </div>
  `;

  /* ---------- CHART (PAIRS, NOT USERS) ---------- */

const chart = `
<div class="section">
  <h2>Top Communication Pairs</h2>
  <div class="chart-container">
    <canvas id="pairChart"></canvas>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const labels = ${JSON.stringify(
      topPairs.slice(0, 8).map(p => {
        const from = p.from.split("@")[0];
        const to = p.to.split("@")[0];
        return from + " → " + to;
      })
    )};

    const dataValues = ${JSON.stringify(
      topPairs.slice(0, 8).map(p => p.count)
    )};

    new Chart(document.getElementById('pairChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Emails',
          data: dataValues,
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          barThickness: 18
        }]
      },
      options: {
        indexAxis: 'y', // 🔥 horizontal chart
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => "Emails: " + ctx.raw
            }
          }
        },

        scales: {
          x: {
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              color: '#475569'
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#334155',
              font: { size: 11 }
            }
          }
        }
      }
    });
  </script>
</div>
`;

  /* ---------- INSIGHTS ---------- */

  const insights = `
  <div class="section">
    <h2>Key Insights</h2>
    <ul class="bullet-list">
      ${pairs.length > 50 ? "<li>Large communication network detected</li>" : ""}
      ${topPairs.length > 0 ? `<li>Strongest link: ${topPairs[0].from} → ${topPairs[0].to}</li>` : ""}
    </ul>
  </div>
  `;

  const sections = [
    `
    <div class="section">
      <h2>Executive Summary</h2>
      <p>${emails.length} emails analyzed to map communication relationships.</p>
    </div>
    `,
    chart,
    strongTable,
    pairTable,
    insights
  ];

  return pageTemplate(
    "Communication Relationship Report",
    "Who Communicates With Whom",
    sections
  );
}

module.exports = { generateCommunicationReport };
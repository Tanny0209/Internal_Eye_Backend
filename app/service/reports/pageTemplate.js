function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageTemplate(title, subtitle, sections) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page {
            margin: 28px;
          }

          body {
            font-family: Arial, sans-serif;
            color: #1f2937;
            font-size: 12px;
            line-height: 1.45;
            margin: 0;
            background: #f6f8fb;
          }

          .page {
            background: #ffffff;
            border: 1px solid #dbe3ee;
            padding: 28px;
          }

          .hero {
            background: linear-gradient(135deg, #0f172a, #1d4ed8);
            color: #ffffff;
            padding: 24px;
            border-radius: 18px;
            margin-bottom: 22px;
          }

          .eyebrow {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            opacity: 0.85;
          }

          h1 {
            margin: 10px 0 8px;
            font-size: 28px;
          }

          .subtitle {
            margin: 0;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.86);
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-top: 18px;
            font-size: 11px;
            opacity: 0.9;
          }

          .section {
            margin-bottom: 20px;
          }

          h2 {
            font-size: 16px;
            margin: 0 0 10px;
            color: #0f172a;
          }

          .narrative {
            margin: 0;
            color: #334155;
          }

          .stat-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }

          .stat-card {
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            padding: 14px;
            background: #f8fbff;
          }

          .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .stat-value {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            margin: 8px 0 4px;
          }

          .stat-help {
            font-size: 11px;
            color: #475569;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #dbe3ee;
            border-radius: 12px;
            overflow: hidden;
          }

          th {
            text-align: left;
            background: #eaf1fb;
            color: #0f172a;
            font-size: 11px;
            padding: 10px;
          }

          td {
            border-top: 1px solid #e5edf7;
            padding: 10px;
            color: #334155;
            vertical-align: top;
          }

          .empty {
            text-align: center;
            color: #64748b;
            padding: 18px;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: bold;
          }

          .high {
            background: #fee2e2;
            color: #991b1b;
          }

          .medium {
            background: #fef3c7;
            color: #92400e;
          }

          .low {
            background: #dcfce7;
            color: #166534;
          }

          .bullet-list {
            margin: 0;
            padding-left: 18px;
          }

          .bullet-list li {
            margin-bottom: 8px;
            color: #334155;
          }

          .footer-note {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #dbe3ee;
            color: #64748b;
            font-size: 10px;
          }
            .chart-row {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.chart-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}

.chart-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #0f172a;
}

.chart-container {
  height: 180px; /* 🔥 perfect PDF height */
}
        </style>
      </head>

      <body>
        <div class="page">
          <div class="hero">
            <div class="eyebrow">Internal Eye Intelligence Report</div>

            <h1>${escapeHtml(title)}</h1>
            <p class="subtitle">${escapeHtml(subtitle)}</p>

            <div class="meta-row">
              <span>
                Generated: ${escapeHtml(
                  new Date().toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })
                )}
              </span>
              <span>Classification: Internal Monitoring Use</span>
            </div>
          </div>

          ${sections.join("")}

          <div class="footer-note">
            This report is an analytical aid generated from currently available monitoring data.
            Findings should be validated through investigator review before action.
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = pageTemplate;
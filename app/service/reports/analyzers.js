function analyzeDepartmentData(deptDoc) {
  let totalUsers = 0;
  let high = 0, medium = 0, low = 0;

  let totalEmails = 0;
  let externalEmails = 0;
  let afterHoursEmails = 0;

  let sensitiveCount = 0;
  let suspiciousAttachments = 0;

  let domainMap = {};
  let anomalies = [];

  let usersArray = [];

  for (const user of Object.values(deptDoc.users || {})) {
    totalUsers++;

    const risk = (user.user_risk_level || "low").toLowerCase();

    if (risk === "high") high++;
    else if (risk === "medium") medium++;
    else low++;

    let userEmailCount = 0;

    for (const email of Object.values(user.emails || {})) {
      totalEmails++;
      userEmailCount++;

      if (email.is_external) externalEmails++;
      if (email.is_after_hours) afterHoursEmails++;
      if (email.contains_sensitive_keywords) sensitiveCount++;
      if (email.suspicious_attachment) suspiciousAttachments++;

      // domains
      if (email.from_domain) {
        domainMap[email.from_domain] =
          (domainMap[email.from_domain] || 0) + 1;
      }

      // anomaly detection
      if (
        email.emails_sent_day &&
        email.avg_daily_emails &&
        email.emails_sent_day > email.avg_daily_emails * 2
      ) {
        anomalies.push(
          `${user.name} sent unusually high emails (${email.emails_sent_day})`
        );
      }
    }

    usersArray.push({
      name: user.name || "Unknown",
      email: user.email || "-",
      risk_score: user.user_risk_score || 0,
      risk_level: user.user_risk_level || "low",
      emails_sent: userEmailCount,
    });
  }

  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    stats: {
      totalUsers,
      totalEmails,
      highRiskUsers: high,
      externalPercentage: totalEmails
        ? ((externalEmails / totalEmails) * 100).toFixed(1)
        : 0,
      afterHoursPercentage: totalEmails
        ? ((afterHoursEmails / totalEmails) * 100).toFixed(1)
        : 0,
    },
    distribution: { high, medium, low },
    topUsers: usersArray.sort((a, b) => b.risk_score - a.risk_score).slice(0, 5),
    factors: {
      sensitive: sensitiveCount,
      attachments: suspiciousAttachments,
    },
    domains: topDomains,
    anomalies,
  };
}

function generateInsights(stats, dist) {
  const insights = [];

  if (stats.afterHoursPercentage > 30)
    insights.push("High after-hours activity detected");

  if (stats.externalPercentage > 40)
    insights.push("Heavy external communication observed");

  if (dist.high > 0)
    insights.push(`${dist.high} high-risk users detected`);

  return insights.length ? insights : ["No major anomalies detected"];
}

module.exports = { analyzeDepartmentData, generateInsights };

function analyzeUserData(user) {
  let totalEmails = 0;
  let external = 0;
  let afterHours = 0;
  let sensitive = 0;

  let domainMap = {};
  let timeline = [];

  for (const email of Object.values(user.emails || {})) {
    totalEmails++;

    if (email.is_external) external++;
    if (email.is_after_hours) afterHours++;
    if (email.contains_sensitive_keywords) sensitive++;

    if (email.from_domain) {
      domainMap[email.from_domain] =
        (domainMap[email.from_domain] || 0) + 1;
    }

    timeline.push({
      date: email.date,
      subject: email.subject,
      risk: email.risk_level,
    });
  }

  return {
    totalEmails,
    externalPercent: totalEmails ? ((external / totalEmails) * 100).toFixed(1) : 0,
    afterHoursPercent: totalEmails ? ((afterHours / totalEmails) * 100).toFixed(1) : 0,
    sensitive,
    domains: Object.entries(domainMap).slice(0, 5),
    timeline: timeline.sort((a, b) => new Date(a.date) - new Date(b.date)),
  };
}

module.exports.analyzeUserData = analyzeUserData;
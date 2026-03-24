const { generateQuickReport } = require("./quickReport");
const { generatePDF } = require("./pdfGenerator");

exports.quickReport = async (deptDoc, departmentName, res) => {
  try {
    const html = generateQuickReport(deptDoc);
    const pdfBuffer = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=quick-report-${departmentName}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("SERVICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
const { generateUserReport } = require("./userReport");

exports.userReport = async (data, res) => {
  try {
    const html = generateUserReport(data);
    const pdfBuffer = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=user-report.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const { generateEmailReport } = require("./emailReport");

exports.emailReport = async (data, res) => {
  try {
    const html = generateEmailReport(data);
    const pdfBuffer = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=email-report.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const { generateCommunicationReport } = require("./communicationReport");

exports.communicationReport = async (data, res) => {
  const html = generateCommunicationReport(data);
  const pdf = await generatePDF(html);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=communication-report.pdf"
  });

  res.send(pdf);
};

const { generateDepartmentReport } = require("./departmentReport");

exports.departmentReport = async (data, res) => {
  const html = generateDepartmentReport(data);
  const pdf = await generatePDF(html);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=department-report.pdf"
  });

  res.send(pdf);
};

const { generateAnomalyReport } = require("./anomalyReport");

exports.anomalyReport = async (data, res) => {
  try {
    const html = generateAnomalyReport(data);
    const pdf = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=anomaly-report.pdf"
    });

    res.send(pdf);
  } catch (err) {
    console.error("SERVICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
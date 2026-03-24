const puppeteer = require("puppeteer");

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  // 🔥 WAIT FOR CHARTS TO RENDER
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdf;
}

module.exports = { generatePDF };
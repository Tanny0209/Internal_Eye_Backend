const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const fs = require("fs");
const path = require("path");

async function generatePDF(html) {
  try {
    // 🔥 Get original chromium path
    const executablePath = await chromium.executablePath();

    // 🔥 Copy to /tmp to avoid ETXTBSY
    const tmpPath = "/tmp/chromium";

    if (!fs.existsSync(tmpPath)) {
      fs.copyFileSync(executablePath, tmpPath);
      fs.chmodSync(tmpPath, 0o755);
    }

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ],
      executablePath: tmpPath, // ✅ use copied binary
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return pdf;

  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
}

module.exports = { generatePDF };
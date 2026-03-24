const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

async function generatePDF(html) {
  try {
    console.log("Launching Chromium...");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
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
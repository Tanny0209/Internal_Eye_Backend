const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

let browserInstance = null; // 🔥 reuse browser

async function getBrowser() {
  if (browserInstance) return browserInstance;

  browserInstance = await puppeteer.launch({
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  return browserInstance;
}

async function generatePDF(html) {
  try {
    const browser = await getBrowser(); // ✅ reuse
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // 🔥 reduce delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await page.close(); // ✅ close page, NOT browser

    return pdf;

  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
}

module.exports = { generatePDF };
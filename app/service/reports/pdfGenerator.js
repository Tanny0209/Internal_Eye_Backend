const puppeteer = require("puppeteer");

async function generatePDF(html) {
  try {
    console.log("Launching browser...");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
      // 🔥 THIS LINE FIXES EVERYTHING
      executablePath: puppeteer.executablePath(),
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
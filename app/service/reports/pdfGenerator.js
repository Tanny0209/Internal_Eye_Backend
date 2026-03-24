const puppeteer = require("puppeteer-core");

async function generatePDF(html) {
  try {
    console.log("Launching Chromium...");

    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium", // ✅ Render path
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
    });

    const page = await browser.newPage();

    console.log("Loading HTML...");
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // wait for charts/rendering
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Generating PDF...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    console.log("PDF success!");
    return pdf;

  } catch (err) {
    console.error("PDF ERROR:", err);
    throw err;
  }
}

module.exports = { generatePDF };
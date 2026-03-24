const puppeteer = require("puppeteer");

async function generatePDF(html) {
  try {
    console.log("Starting PDF generation...");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    console.log("Setting HTML content...");
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    console.log("Closing browser...");
    await browser.close();

    // 🔥 DEBUG: bypass puppeteer PDF generation
    console.log("Returning dummy buffer...");
    return Buffer.from("hello");

  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    throw err;
  }
}

module.exports = { generatePDF };asdf
const puppeteer = require("puppeteer");

async function generatePDF(html) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/opt/render/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome", // 🔥 FIX
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

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
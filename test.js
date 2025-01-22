const puppeteer = require("puppeteer-extra");
const amazonCaptchaPlugin = require("./amazon-capcha-plugin.js");

async function test() {
  // Add the plugin to puppeteer
  puppeteer.use(
    amazonCaptchaPlugin({
      maxRetries: 30,
      inputSelector: "#captchacharacters",
    })
  );

  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: false, // Set to true if you don't want to see the browser
      defaultViewport: null,
    });

    // Create a new page
    const page = await browser.newPage();

    // Go to an Amazon page that has CAPTCHA
    console.log("Navigating to Amazon...");
    await page.goto("https://www.amazon.com/errors/validateCaptcha");

    // Wait for a while to see the result
    await new Promise((r) => setTimeout(r, 15000));

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
console.log("Starting test...");
test();

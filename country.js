const puppeteer = require("puppeteer");
const axios = require("axios");
const {
  getRandomBrowserConfig,
  generateRequestHeaders,
} = require("./browser-config");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const convertToDateTime = (reviewDate) => {
  const date = new Date(reviewDate);
  return date.toISOString();
};

(async () => {
  const url = process.env.SHOPIFY;

  if (!url) {
    console.error("Error: SHOPIFY is not defined in .env file");
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "load" });
    await delay(300);
    await waitForResults(page);
    // await delay(300);
    // await scrollToReview(page);
    await delay(300);
    const data = await extractDataProduct(page);
    console.log("product : ", data);
    // const review = await extractReviews(page);
    // console.log("review : ", review);
    // review
  } catch (error) {
    console.error("Error scraping Amazon:", error.message);
  } finally {
    await browser.close();
  }
})();

const extractDataProduct = async (page) => {
  console.log("Extract Data Product .....");
  const data = await page.evaluate(() => {
    const title = document.querySelector("h1.product-title")?.innerText.trim();
    let salePrice =
      parseFloat(
        document.querySelector("p.product-price span")?.innerText.trim()
      ) || null;
    const thumbnail =
      document.querySelector("a.product-single__thumbnail-link img")?.src ||
      null;
    return {
      thumbnail,
      title,
      salePrice,
    };
  });
  console.log("extract data successfully");
  return data;
};

const waitForResults = async (page) => {
  console.log("Wait for result");
  console.time("Results Load Time");
  try {
    await page.waitForSelector("h1.product-title", {
      timeout: 60000,
    });
  } catch (error) {
    console.error("Failed to find review button:", error);
    throw error;
  }
  console.timeEnd("Results Load Time");
};

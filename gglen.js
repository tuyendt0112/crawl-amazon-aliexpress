const puppeteer = require("puppeteer");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
require("dotenv").config();

(async () => {
  const imageUrl = process.env.GG_LEN;

  if (!imageUrl) {
    console.error("Error: GOOGLE_IMAGE_URL is not defined in .env file");
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to Google Lens for image: ${imageUrl}`);
    const lensUrl = process.env.GG_LEN;

    await page.goto(lensUrl, { waitUntil: "networkidle2" });
    await delay(3000);
    // console.log("Waiting for search results to load...");
    // await waitForResults(page);

    // console.log("Clicking 'Find image source' button...");
    // await clickExactMatchesButton(page);

    // console.log("Loading more results...");
    // await loadMoreExactMatches(page);

    console.log("Extracting related sources...");
    const relatedSources = await extractRelatedSources(page);
    console.log("Extracted sources:", relatedSources);
  } catch (error) {
    console.error("Error scraping Google Lens:", error.message);
  } finally {
    await browser.close();
  }
})();

// Wait for results to load
const waitForResults = async (page) => {
  console.log("Waiting for results to load...");
  console.time("Results Load Time");
  try {
    await page.waitForSelector("div.POgoBd span.mIZQhd", {
      timeout: 60000,
    });
  } catch (error) {
    console.error("Results did not load in time:", error);
    throw new Error("Results did not load in time");
  }
  console.timeEnd("Results Load Time");
};

// Click the 'Find image source' button
const clickExactMatchesButton = async (page) => {
  console.log("Clicking 'Find image source' button...");
  console.time("Click 'Find image source' Button Time");

  const buttonSelector = "a.LBcIee";
  try {
    await page.waitForSelector(buttonSelector, {
      visible: true,
      timeout: 60000,
    });
    const button = await page.$(buttonSelector);
    if (button) {
      await button.click();
      console.log("Clicked 'Find image source' button.");
    } else {
      console.log("Button not found.");
    }
  } catch (error) {
    console.error("Error waiting for the button:", error);
    throw new Error("Error clicking the 'Find image source' button");
  }
  console.timeEnd("Click 'Find image source' Button Time");
};

// Load more exact matches
const loadMoreExactMatches = async (page) => {
  const footerSelector = "a.Fx4vi wHYlTd ZYHQ7";
  let footer = await page.$(footerSelector);
  while (footer !== null) {
    console.log("Clicking 'More exact matches' button...");
    await page.click(footerSelector);
    console.log("Waiting for more exact matches to load...");
    await delay(3000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    footer = await page.$(footerSelector);
  }
};

// Extract related sources
const extractRelatedSources = async (page) => {
  console.log("Extracting related sources...");
  console.time("Extraction Time");
  const relatedSources = await page.evaluate(() => {
    const sourceList = [];
    const elements = document.querySelectorAll("div.dURPMd");

    elements.forEach((element, index) => {
      const title =
        element
          .querySelector("img.dimg_CMSBZ_WeGL7O2roP3tuIUA_5")
          ?.innerText.trim() || null;
      const source =
        element.querySelector(".ngTNl ggLgoc")?.innerText.trim() || null;
      const sourceLogo = element.querySelector(".XNo5Ab img")?.src || null;
      const link = element.href;
      const thumbnail =
        element.querySelector(".dimg_IZB7Z8_RFJSevr0PypjH-Ac_5 img")?.src ||
        null;
      const dimensions =
        element.querySelector(".cyspcb DH9lqb VBZLA")?.innerText.trim() || null;

      let [actualImageWidth, actualImageHeight] = dimensions
        ? dimensions.split("x").map((dim) => parseInt(dim, 10))
        : [null, null];

      sourceList.push({
        position: index + 1,
        title,
        source,
        source_logo: sourceLogo,
        link,
        thumbnail,
        actual_image_width: actualImageWidth,
        actual_image_height: actualImageHeight,
      });
    });

    return sourceList;
  });
  console.timeEnd("Extraction Time");
  return relatedSources;
};

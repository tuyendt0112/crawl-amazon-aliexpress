const puppeteer = require("puppeteer");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const url = process.env.AEPRESS_URL;

  if (!url) {
    console.error("Error: AMAZON_URL is not defined in .env file");
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

    await delay(300);
    console.log("start extract");
    const data = await extractDataProduct(page);
    console.log("product : ", data);
  } catch (error) {
    console.error("Error scraping Amazon:", error.message);
  } finally {
    await browser.close();
  }
})();
const extractDataProduct = async (page) => {
  console.log("Extract Data Product .....");
  const data = await page.evaluate(() => {
    const title = document
      .querySelector(`h1[data-pl="product-title"]`)
      ?.innerText.trim();

    let salePrice = document
      .querySelector("span.product-price-value")
      ?.innerText.trim();
    let originalPrice = document
      .querySelector("span.price--originalText--gxVO5_d")
      ?.innerText.trim();

    const thumbnail = document.querySelector(
      "img.magnifier--image--EYYoSlr"
    )?.src;
    const soldText = document
      .querySelector("div.reviewer--box--wVguYsD span.reviewer--sold--ytPeoEy")
      ?.innerText.trim();
    // const sold = soldText ? soldText.split(" ")[0] : null;

    const stock = document
      .querySelector("div.quantity--info--jnoo_pD span")
      ?.innerText.trim();

    const ratingText = document
      .querySelector("div.reviewer--box--wVguYsD strong")
      ?.innerText.trim();
    // const avg_rating = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

    const totalReviewsText = document
      .querySelector(`div.reviewer--box--wVguYsD a.reviewer--reviews--cx7Zs_V`)
      ?.innerText.trim();
    // const total_reviews = totalReviewsText
    //   ? parseFloat(totalReviewsText.split(" ")[0])
    //   : null;

    // const findCountry = () => {
    //   const labels = Array.from(
    //     document.querySelectorAll(
    //       "#prodDetails tr, #productDetails_detailBullets_sections1 tr"
    //     )
    //   );
    //   for (const row of labels) {
    //     const label = row.querySelector("th")?.innerText.trim() || "";
    //     if (/Country of Origin/i.test(label)) {
    //       return (
    //         row.querySelector("td")?.innerText.trim().toLocaleLowerCase() ||
    //         null
    //       );
    //     }
    //   }
    //   return "us";
    // };
    // const country = findCountry();
    return {
      thumbnail,
      title,
      originalPrice,
      salePrice,
      ratingText,
      totalReviewsText,
      // country,
      stock,
      soldText,
    };
  });
  console.log("extract data successfully");
  return data;
};

const waitForResults = async (page) => {
  console.log("Waiting for results to load...");
  console.time("Results Load Time");
  try {
    await page.waitForSelector("button.extend--btn--TWsP5SV", {
      timeout: 60000,
    });
  } catch (error) {
    console.error("Results did not load in time:", error);
    throw new Error("Results did not load in time");
  }
  console.timeEnd("Results Load Time");
};

// const scrollUntilViewMore = async (page) => {
//   console.log("Scrolling until 'View More' button is visible...");
//   const viewMoreSelector = "div.recommend-platform--viewMore--tZ54knc"; // CSS selector của nút "View More"
//   try {
//     while (true) {
//       const isVisible = await page.evaluate((selector) => {
//         const button = document.querySelector(selector);
//         // Kiểm tra nếu nút hiển thị trên màn hình
//       }, viewMoreSelector);

//       if (isVisible) {
//         console.log("'View More' button is visible!");
//         break;
//       }

//       // Nếu chưa hiển thị, cuộn xuống
//       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
//       await delay(1000); // Chờ để tải nội dung
//     }
//   } catch (error) {
//     console.error("Error while scrolling:", error);
//     throw new Error("Failed to find 'View More' button");
//   }
// };

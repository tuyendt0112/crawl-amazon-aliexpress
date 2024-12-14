const puppeteer = require("puppeteer");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const url = process.env.AMAZON_URL;

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
    const title = document.querySelector("#productTitle")?.innerText.trim();

    let salePrice = document
      .querySelector("span.a-size-small .a-price  span.a-offscreen")
      ?.innerText.trim();
    let originalPrice = document
      .querySelector(".a-price  span.a-offscreen")
      ?.innerText.trim();
    if (salePrice) {
      salePrice = originalPrice;
      originalPrice = document
        .querySelector("span.a-size-small .a-price  span.a-offscreen")
        ?.innerText.trim();
    }
    const thumbnail = document.querySelector("img.a-dynamic-image")?.src;
    const soldText = document
      .querySelector("#social-proofing-faceout-title-tk_bought")
      ?.innerText.trim();
    const sold = soldText
      ? (() => {
          const numberPart = soldText.split(" ")[0];
          if (numberPart.endsWith("K+")) {
            return parseFloat(numberPart) * 1000;
          } else if (numberPart.endsWith("M+")) {
            return parseFloat(numberPart) * 1000000;
          } else {
            return parseFloat(numberPart);
          }
        })()
      : null;
    const ratingText = document.querySelector(".a-icon-alt")?.innerText || null;
    const avg_rating = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

    const totalReviewsText =
      document.querySelector("#acrCustomerReviewText")?.innerText || null;
    const total_reviews = totalReviewsText
      ? parseFloat(totalReviewsText.split(" ")[0])
      : null;

    const findCountry = () => {
      const labels = Array.from(
        document.querySelectorAll(
          "#prodDetails tr, #productDetails_detailBullets_sections1 tr"
        )
      );
      for (const row of labels) {
        const label = row.querySelector("th")?.innerText.trim() || "";
        if (/Country of Origin/i.test(label)) {
          return (
            row.querySelector("td")?.innerText.trim().toLocaleLowerCase() ||
            null
          );
        }
      }
      return "us";
    };
    const country = findCountry();
    return {
      thumbnail,
      title,
      originalPrice,
      salePrice,
      avg_rating,
      total_reviews,
      country,
      sold,
    };
  });
  console.log("extract data successfully");
  return data;
};

const waitForResults = async (page) => {
  console.log("Waiting for results to load...");
  console.time("Results Load Time");
  try {
    console.log("load until see all review link foot");
    await page.waitForSelector('[data-hook="see-all-reviews-link-foot"]', {
      timeout: 60000,
    });
  } catch (error) {
    console.error("Results did not load in time:", error);
    throw new Error("Results did not load in time");
  }
  console.timeEnd("Results Load Time");
};

// const waitForReview = async (page) => {
//   console.log("Waiting for reviews to load...");
//   console.time("Results Load Time");
//   try {
//     const reviewSelector = `[data-hook="see-all-reviews-link-foot"]`;
//     let reviewsLoaded = false;

//     while (!reviewsLoaded) {
//       // Cuộn xuống một khoảng chiều cao của cửa sổ
//       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
//       await delay(3000); // Delay để cho trang tải nội dung mới

//       // Kiểm tra sự hiện diện của phần tử
//       reviewsLoaded = await page.evaluate((selector) => {
//         return !!document.querySelector(selector); // Trả về true nếu phần tử tồn tại
//       }, reviewSelector);
//     }

//     console.log("Reviews loaded successfully.");
//   } catch (error) {
//     console.error("Review did not load in time:", error);
//     throw new Error("Review did not load in time");
//   }

//   console.timeEnd("Results Load Time");
// };
// Click the 'Find image source' button

const waitForReview = async (page, minReviews = 10, timeout = 30000) => {
  console.log("Waiting for reviews to load...");
  console.time("Results Load Time");

  const navSelector = "span.navFooterBackToTopText";
  try {
    while (true) {
      // Cuộn xuống trang
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1000); // Chờ nội dung tải
      // Kiểm tra số lượng review đã tải
      const reviewsCount = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, navSelector);
      console.log(`Current reviews count: ${reviewsCount}`);
      // Nếu có đủ review, thoát khỏi vòng lặp
      if (reviewsCount >= minReviews) {
        console.log("Sufficient reviews loaded.");
        break;
      }
    }
  } catch (error) {
    console.error("Error while loading reviews:", error);
    throw new Error("Error while loading reviews");
  }
  console.timeEnd("Results Load Time");
};

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
    await scrollToReview(page);
    await delay(300);
    const data = await extractDataProduct(page);
    console.log("product : ", data);
    const review = await extractReviews(page);
    console.log("review : ", review);
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
    const title = document.querySelector("#productTitle")?.innerText.trim();

    // testing
    const check = document
      .querySelector("div.a-profile-content span.a-profile-name")
      ?.innerText.trim();
    ///========

    let salePrice =
      parseFloat(
        document
          .querySelector("span.a-size-small .a-price  span.a-offscreen")
          ?.innerText.trim()
          .replace(/[^0-9.]/g, "")
      ) || null;
    let originalPrice =
      parseFloat(
        document
          .querySelector(".a-price  span.a-offscreen")
          ?.innerText.trim()
          .replace(/[^0-9.]/g, "")
      ) || null;
    if (salePrice) {
      salePrice = originalPrice;
      originalPrice =
        parseFloat(
          document
            .querySelector("span.a-size-small .a-price  span.a-offscreen")
            ?.innerText.trim()
            .replace(/[^0-9.]/g, "")
        ) || null;
    }
    const thumbnail = document.querySelector("img.a-dynamic-image")?.src;
    const soldText =
      document
        .querySelector("#social-proofing-faceout-title-tk_bought")
        ?.innerText.trim() || null;
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
      check,
    };
  });
  console.log("extract data successfully");
  return data;
};

const waitForResults = async (page) => {
  console.log("Scrolling to find review button...");
  console.time("Results Load Time");
  try {
    await page.waitForSelector("div#prodDetails", {
      timeout: 60000,
    });
    // let reviewButton = await page.$("div#prodDetails");

    // while (reviewButton === null) {
    //   console.log("Scrolling down...");
    //   await page.evaluate(() => window.scrollBy(0, 500));
    //   await delay(1000);
    //   reviewButton = await page.$("div#prodDetails");
    // }
    // await page.evaluate(() => window.scrollBy(0, 1200));
    console.log("Review button found!");
    // await delay(2000);
  } catch (error) {
    console.error("Failed to find review button:", error);
    throw error;
  }
  console.timeEnd("Results Load Time");
};

const scrollToReview = async (page) => {
  const reviewButtonSelector = '[data-hook="see-all-reviews-link-foot"]'; // Selector của nút View More Reviews
  console.log("Scrolling to 'View More Reviews' button...");

  try {
    let attempts = 0; // Đếm số lần cuộn
    const maxAttempts = 20; // Giới hạn số lần cuộn để tránh vòng lặp vô hạn

    while (attempts < maxAttempts) {
      // Kiểm tra nếu nút đã có trong DOM
      const reviewButton = await page.$(reviewButtonSelector);

      if (reviewButton) {
        // Đảm bảo nút nằm trong viewport
        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, reviewButtonSelector);

        console.log("'View More Reviews' button is now visible!");
        return; // Thoát hàm vì nút đã được cuộn đến tầm nhìn
      }

      // Cuộn xuống theo chiều cao màn hình
      console.log("Scrolling down...");
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1000); // Chờ 1 giây để trang tải thêm nội dung

      // Kiểm tra nếu đã cuộn đến cuối trang
      const isAtBottom = await page.evaluate(() => {
        return (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 2
        );
      });

      if (isAtBottom) {
        console.log(
          "Reached the bottom of the page, 'View More Reviews' button not found."
        );
        break;
      }

      attempts++; // Tăng bộ đếm số lần cuộn
    }

    console.log("'View More Reviews' button not found after scrolling.");
  } catch (error) {
    console.error(
      "Error while scrolling to 'View More Reviews' button:",
      error
    );
  }
};

const extractReviews = async (page) => {
  console.log("Extracting all reviews on the current page...");

  const reviews = await page.evaluate(() => {
    // Lấy danh sách tất cả các phần tử chứa review
    const reviewElements = document.querySelectorAll('[data-hook="review"]');

    // Duyệt qua từng phần tử để lấy dữ liệu
    return Array.from(reviewElements).map((reviewElement) => {
      const author =
        reviewElement.querySelector("span.a-profile-name")?.innerText.trim() ||
        null;

      const ratingText =
        reviewElement.querySelector("span.a-icon-alt")?.innerText.trim() ||
        null;
      const star = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

      const content =
        reviewElement
          .querySelector('[data-hook="review-body"] span')
          ?.innerText.trim() || null;

      const reviewDate =
        reviewElement
          .querySelector('[data-hook="review-date"]')
          ?.innerText.trim() || null;

      const country = reviewDate.split(" in ")[1].split(" on ")[0];
      const dateTime = reviewDate.split(" on ")[1];
      const date = new Date(dateTime).toISOString();
      const avatar =
        reviewElement.querySelector("div.a-profile-avatar img")?.src || null;
      const images = Array.from(
        reviewElement.querySelectorAll('[data-hook="review-image-tile"]')
      ).map((tile) => tile.getAttribute("data-src") || null);

      return {
        author: author,
        content: content,
        country: country,
        review_date: date,
        media: images,
        star: star,
        avatar: avatar,
      };
    });
  });

  console.log("Extracted reviews:", reviews.length);
  return reviews;
};

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
    // console.log("product : ", data);
    const token = await getDataState(page);
    const { asin, lazyWidgetCsrfToken } = token;

    await getDataReviews(
      "B0CN9319S7",
      "hKvVKcJaEeYJQ0zKUY23/ATaNaPRK695u5fTcQJhZl1pAAAAAGdf6YEAAAAB"
    );
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
    const code = document
      .querySelector("span.cr-widget-PageState .cr-state-object")
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
      // thumbnail,
      // title,
      // originalPrice,
      // salePrice,
      // avg_rating,
      // total_reviews,
      // country,
      // sold,
      code,
    };
  });
  console.log("extract data successfully");
  return data;
};

const waitForResults = async (page) => {
  console.log("Scrolling to find review button...");
  console.time("Results Load Time");
  try {
    let reviewButton = await page.$('[data-hook="write-review-button"]');

    while (reviewButton === null) {
      console.log("Scrolling down...");
      await page.evaluate(() => window.scrollBy(0, 500));
      await delay(1000);
      reviewButton = await page.$('[data-hook="write-review-button"]');
    }
    await page.evaluate(() => window.scrollBy(0, 1200));
    console.log("Review button found!");
    await delay(2000);
  } catch (error) {
    console.error("Failed to find review button:", error);
    throw error;
  }
  console.timeEnd("Results Load Time");
};
// hKQWqcAh6+0DkTY18seNCfO90evH6x/NLvCu7eDDFlUOAAAAAGdf69M1NzE4NDgzNy04ZjliLTRkNTItOWI3ZC0yNzBhMmM2ZTA5Mjg
const getDataState = async (page) => {
  try {
    // Chọn phần tử có id="cr-state-object" và lấy giá trị trong data-state
    const dataState = await page.$eval("#cr-state-object", (element) =>
      element.getAttribute("data-state")
    );

    // Chuyển đổi giá trị JSON từ chuỗi nếu cần
    const stateObject = JSON.parse(dataState);

    // console.log("Data State:", stateObject);

    return stateObject;
  } catch (error) {
    console.error("Failed to retrieve data-state:", error);
  }
};
const getDataReviews = async (asin, csrf) => {
  const language = "en_US";
  try {
    const response = await fetchDataReview(asin, csrf, language);
    console.log("Reviews Data successful-->>".response);
    // return await extractDataReviews(response?.data?.evaViewList);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
  }
};
const fetchDataReview = async (asin, csrf, language) => {
  const url = `https://www.amazon.com/hz/reviews-render/ajax/lazy-widgets/stream?asin=${asin}&csrf=${csrf}&language=${language}&lazyWidget=cr-age-recommendation&lazyWidget=cr-solicitation`;
  console.log("URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    console.log("Response Data:", response);

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

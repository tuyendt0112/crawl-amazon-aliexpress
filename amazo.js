const puppeteer = require("puppeteer");
const axios = require("axios");
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
    // await page.goto(url, { waitUntil: "load" });
    // await delay(300);
    // await waitForResults(page);
    // await delay(300);
    // const data = await extractDataProduct(page);
    // // console.log("product : ", data);
    // const token = await getDataState(page);
    // const { asin, lazyWidgetCsrfToken } = token;

    // await getDataReviews(
    //   "B0CN9319S7",
    //   "hKvVKcJaEeYJQ0zKUY23/ATaNaPRK695u5fTcQJhZl1pAAAAAGdf6YEAAAAB"
    // );

    // Example usage
    const asin = "B0B42JCKR7";
    const countryDomain = "www.amazon.com";
    const filterOptions = {
      page: 1,
      sortBy: "recent",
      //   reviewerType: "all_reviews",
      scope: "reviewsAjax1",
    };

    fetchReviews(countryDomain, asin, filterOptions)
      .then((reviews) => {
        console.log("Fetched reviews:", reviews);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
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

function buildReviewUrl(countryDomain) {
  return `https://${countryDomain}/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt`;
}
function buildFormData(asin, filterOptions) {
  const formData = new URLSearchParams();

  // Required fields
  formData.append("language", filterOptions.language || "en_US");
  formData.append("asin", asin);
  formData.append("sortBy", filterOptions.sortBy || "recent");
  formData.append("scope", filterOptions.scope || "reviewsAjax1");

  // Optional fields
  if (filterOptions.filterByStar) {
    formData.append("filterByStar", filterOptions.filterByStar);
  }

  if (filterOptions.pageNumber) {
    formData.append("pageNumber", filterOptions.pageNumber.toString());
  }

  if (filterOptions.reviewerType) {
    formData.append("reviewerType", filterOptions.reviewerType);
  }

  return formData;
}
const fetchReviews = async (countryDomain, asin, filterOptions) => {
  try {
    // Build the URL with query parameters
    const reviewUrl = buildReviewUrl(countryDomain);
    const formData = buildFormData(asin, filterOptions);

    console.log("reviewUrl", reviewUrl);
    console.log("formData", formData);
    const response = await axios.post(reviewUrl, {
      headers: {
        "User-Agent": randomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "content-encoding": "gzip",
        "content-language": "en-US",
        "content-security-policy-report-only":
          "default-src https://*.amazon.com https://*.media-amazon.com https://*.ssl-images-amazon.com https://*.amazon-adsystem.com; script-src https://*.amazon.com https://*.media-amazon.com https://*.ssl-images-amazon.com https://*.amazon-adsystem.com 'unsafe-inline' 'unsafe-eval'; style-src https://*.amazon.com https://*.media-amazon.com https://*.ssl-images-amazon.com https://*.amazon-adsystem.com 'unsafe-inline'; report-uri /1/batch/2/OE/mid=ATVPDKIKX0DER:sid=133-3657465-2676401:rid=FTNKZH1GCPJ6XXQTYJAZ:sn=www.amazon.com",
        "content-type": "application/json-amazonui-streaming;charset=UTF-8",
      },
      formData: formData,
    });
    if (response.data.includes("BAAAAAAD ASIN")) {
      throw new Error("Invalid ASIN or request blocked by Amazon");
    }
    console.log("response.data", response.data.toString());
    // const htmlStrings = parseAjaxResponse(response.data);
    // // const reviews = await parseReviews(htmlStrings, filterOptions.preset);
    // console.log("htmlStrings", htmlStrings);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    throw error;
  }
};

function parseAjaxResponse(data) {
  try {
    const records = data.split("&&&");
    console.log("record", records);
    // Process each segment
    const result = records
      .map((segment) => {
        // Remove whitespace
        const trimmed = segment.trim();

        // Skip empty segments
        if (!trimmed) return null;

        // Skip HTML comments
        if (trimmed.startsWith("<!--") || trimmed.startsWith("</")) {
          return null;
        }

        // Try to parse as JSON while handling potential issues
        const cleanedSegment = trimmed
          // Remove any HTML comments that might be at the start
          .replace(/^<!--[\s\S]*?-->/, "")
          // Remove any trailing HTML or script tags
          .replace(/<\/script>$/, "")
          .trim();

        // Parse the JSON array string
        const parsed = JSON.parse(cleanedSegment);

        // Validate that it's an array with expected structure
        if (Array.isArray(parsed) && parsed.length === 3) {
          return {
            command: parsed[0],
            selector: parsed[1],
            content: parsed[2],
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Remove null entries
  } catch (error) {
    throw new Error(`Failed to parse Ajax response: ${error.message}`);
  }
}
// async function parseReviews(htmlStrings, preset) {
//   try {
//     const reviewPromises = htmlStrings.map((html) =>
//       parseReviewHTML(html, preset)
//     );
//     const reviews = await Promise.all(reviewPromises);
//     return reviews.filter(Boolean); // Remove null values
//   } catch (error) {
//     throw new Error(`Failed to parse reviews: ${error.message}`);
//   }
// }
// Generate random User-Agent
function randomUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

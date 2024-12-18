const puppeteer = require("puppeteer");
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const convertToDateTime = (reviewDate) => {
  const date = new Date(reviewDate);
  return date.toISOString();
};
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
    const { subdomain, productId } = extractDetails(url);

    await page.goto(url, { waitUntil: "load" });
    await delay(300);
    await waitForResults(page);
    await loadViewMoreSpecification(page);
    await delay(1000);
    console.log("start extract");
    const data = await extractDataProduct(page);
    console.log("product : ", data);
    const reviews = await getDataReviews(productId, subdomain);
    console.log("reviews : ", reviews);
  } catch (error) {
    console.error("Error scraping Amazon:", error.message);
  } finally {
    await browser.close();
  }
})();
// Extract Data Product
const extractDataProduct = async (page) => {
  console.log("Extract Data Product .....");
  const data = await page.evaluate(() => {
    const title = document
      .querySelector(`h1[data-pl="product-title"]`)
      ?.innerText.trim();

    let salePrice = parseFloat(
      document
        .querySelector("span.product-price-value")
        ?.innerText.trim()
        .replace(/[^0-9.]/g, "")
    );
    let originalPrice = parseFloat(
      document
        .querySelector("span.price--originalText--gxVO5_d")
        ?.innerText.trim()
        .replace(/[^0-9.]/g, "")
    );

    const thumbnail = document.querySelector(
      "img.magnifier--image--EYYoSlr"
    )?.src;

    const soldText = document
      .querySelector("div.reviewer--box--wVguYsD span.reviewer--sold--ytPeoEy")
      ?.innerText.trim();
    const sold = soldText
      ? parseInt(soldText.split(" ")[0].replace(/[^0-9]/g, ""), 10)
      : null;

    const stockText = document
      .querySelector("div.quantity--info--jnoo_pD span")
      ?.innerText.trim();
    const stock = stockText ? parseFloat(stockText.split(" ")[0]) : null;
    const avg_rating = parseFloat(
      document
        .querySelector("div.reviewer--box--wVguYsD strong")
        ?.innerText.trim()
    );

    const totalReviewsText = document
      .querySelector(`div.reviewer--box--wVguYsD a.reviewer--reviews--cx7Zs_V`)
      ?.innerText.trim();
    const total_reviews = totalReviewsText
      ? parseFloat(totalReviewsText.split(" ")[0])
      : null;

    let country;
    const originElement = Array.from(
      document.querySelectorAll("div.specification--title--SfH3sA8")
    ).find((el) => el.textContent.includes("Origin"));

    if (originElement) {
      country = originElement.nextElementSibling
        ? originElement.nextElementSibling.innerText.trim()
        : "us";
    }
    return {
      thumbnail,
      title,
      originalPrice,
      salePrice,
      avg_rating,
      total_reviews,
      country,
      stock,
      sold,
    };
  });
  console.log("extract data successfully");
  return data;
};
// Wait for result to load
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
// Click 'View More' button if available
const loadViewMoreSpecification = async (page) => {
  const moreButtonSelector = "button.specification--btn--Y4pYc4b";
  let moreButton = await page.$(moreButtonSelector);
  while (moreButton !== null) {
    console.log("Clicking 'View More' button...");
    await page.click(moreButtonSelector);
    console.log("Waiting for more data to load...");
    await delay(2000); // Adjust timeout as needed
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    moreButton = await page.$(moreButtonSelector);
  }
};
const getDataReviews = async (productId, country) => {
  const lang = "en_US";
  const page = 1;
  const pageSize = 10;
  const filter = "all";
  const sort = "complex_default";
  try {
    const response = await fetchDataReview(
      productId,
      lang,
      country,
      page,
      pageSize,
      filter,
      sort
    );
    console.log("Reviews Data successful");
    return await extractDataReviews(response?.data?.evaViewList);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
  }
};
const fetchDataReview = async (
  productId,
  lang,
  country,
  page,
  pageSize,
  filter,
  sort
) => {
  const url = `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&lang=${lang}&country=${country}&page=${page}&pageSize=${pageSize}&filter=${filter}&sort=${sort}`;

  // Gọi API và đợi phản hồi
  const response = await fetch(url, {
    method: "GET", // Hoặc 'POST' nếu API yêu cầu POST
    headers: {
      "Content-Type": "application/json", // Thêm headers nếu cần
    },
  });

  // Kiểm tra nếu phản hồi từ API thành công
  if (!response.ok) {
    throw new Error("API call failed");
  }

  // Chuyển phản hồi sang JSON
  const data = await response.json();
  return data;
};
const extractDataReviews = async (data) => {
  const reviews = data.map((item) => {
    return {
      author: item.anonymous ? "Anonymous" : item.buyerName,
      content: item.buyerTranslationFeedback,
      country: item.buyerCountry,
      review_date: convertToDateTime(item.evalDate),
      media: item.images,
      star: item.upVoteCount,
      avatar: item.buyerHeadPortrait,
    };
  });

  return reviews;
};
const extractDetails = (url) => {
  const urlObj = new URL(url);

  let subdomain = urlObj.hostname.split(".")[0];

  const regex = /\/item\/(\d+)\.html/;
  const match = url.match(regex);
  const productId = match ? match[1] : null;

  if (subdomain === "vi") {
    subdomain = "VN";
  } else if (subdomain === "www") {
    subdomain = "US";
  }
  return { subdomain, productId };
};

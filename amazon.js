const puppeteer = require("puppeteer");
const axios = require("axios");
const { getRandomBrowserConfig,generateRequestHeaders } = require("./browser-config")
require("dotenv").config();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const url = process.env.AMAZON_URL;

  if (!url) {
    console.error("Error: AMAZON_URL is not defined in .env file");
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    // console.log(`Navigating to ${url}`);
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
    const asin = "B0DG7H487F";

    const countryDomain = "www.amazon.com";
    const filterOptions = {
      language: "en_US",
      sortBy: "recent",
      scope: "reviewsAjax1",
      // reviewerType: "all_reviews",
    };
    const preset = { Locale: "en-US" };
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

const reviewURLBuilder = (countryDomain, asin, filterOptions) => {
  const baseURL = new URL("https://" + countryDomain);
  baseURL.pathname =process.env.AMAZON_REVIEW_URI

  const params = new URLSearchParams({
    language: filterOptions.language,
    asin: asin,
    sortBy: filterOptions.sortBy,
    scope: filterOptions.scope,
    // pageNumber: filterOptions.page.toString(),
    // reviewerType: "all_reviews",
  });

  if (filterOptions.filterByStar) {
    params.append("filterByStar", filterOptions.filterByStar);
  }


  const requestBody = params.toString();
  // baseURL.search = params.toString();
  return {url :baseURL.toString(), requestBody:requestBody}
};

const fetchReviews = async (countryDomain, asin, filterOptions) => {
  try {

    // Build the URL with query parameters
    const {url,requestBody} = reviewURLBuilder(countryDomain, asin, filterOptions);
    const browser = getRandomBrowserConfig();
    const body = "language=en_US&asin=B0DG7H487F&sortBy=recent&scope=reviewsAjax1";
     const headers = generateRequestHeaders(browser);
    // const headers = {
    //   'accept': 'text/html,*/*',
    //
    //   'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    //   'device-memory': '8',
    //   'dpr': '1.125',
    //   'ect': '4g',
    //   'priority': 'u=1, i',
    //   'rtt': '100',
    //   'sec-ch-device-memory': '8',
    //   'sec-ch-dpr': '1.125',
    //   'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    //   'sec-ch-ua-mobile': '?0',
    //   'sec-ch-ua-platform': 'Windows',
    //   'sec-ch-ua-platform-version': '15.0.0',
    //   'sec-ch-viewport-width': '753',
    //   'sec-fetch-dest': 'empty',
    //   'sec-fetch-mode': 'cors',
    //   'sec-fetch-site': 'same-origin',
    //   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    //   'viewport-width': '753',
    //   'x-requested-with': 'XMLHttpRequest',
    //   'origin':'https://www.amazon.com',
    //   'referer': 'https://www.amazon.com/AceZone-Spire-Cancellation-Enhancing-Microphone/dp/B0C8276HMM/ref=sr_1_1_sspa?_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&dib=eyJ2IjoiMSJ9.PJpFmttg_jaap8hCJqMtChyHNSZFZcxh9PxSdNssUoZLlqDncqCEcFcpT1e82y0z8dQGGKLYPF4WzJwQZ3HgnLJUv2OmFL6PoLqH1voRIjeWII4RvbZRjdDPw6dRt9DPcCP5ZSf30BJARqZ2yWuQUKOJALmUTHXIJ5qRAeWo8gLvAjtRSkTirrVRITj2S75Z7EW5qvy1aL-ja92kPlVUVjAuHTiEsf8dDBg5yLAZvWs.MaeUv4C3zFSXZuoaENeGPXWOSQuybTEm2giHa5QA2bg&dib_tag=se&keywords=gaming+headsets&pd_rd_r=3663e2b7-739d-42fc-a531-8c8612869fe1&pd_rd_w=Hpa4n&pd_rd_wg=EXBI0&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=EXN6FF7VPQV8ZQ4X5XY5&qid=1734874521&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1',
    //   // 'Cookie': 'lc-main=en_US; session-id=133-1098879-2455236; session-id-time=2082787201l; session-token=x9yM37JHMDDiAvKGCXjjoNjq6tPMoT8XjDTFc3Wzxq7CLRBZfFi1rKeRCID0Ch45opTOy/irbXGRmVKGA1U+1hEek/oCzh6S3ax7enGcNKTOHG9Tb7mA7CSePKIzFq7pcqbiq2cHAbe8xyglwkbbnIVj6Dxf4qRTN/qq7ZlmElEReh6w158vSvRN4RG8HPfbWDCJUXPDUopM2bUAeyq8TqX+lNNNWoGMIogNUuNf0dN/hqWN5z49t5m6REINxGLEQi07s5O8bT0QvEMPHsfvtGnmIMpuXg782yi+rLmGzEpq/bqBLS7c3DBcpLYbOajrYa2+R64+Gr4oMlQC5caEQHTAQuXonGaX; ubid-main=131-5098464-6271323'
    // };
    const data = {
      "language": "en_US",
      "asin": "B0DG7H487F",
      "sortBy": "recent",
      "scope": "reviewsAjax1",
    }

    console.log("reviewUrl", url);
    console.log("requestBody", requestBody);
    console.log("headers", headers);
    const response = await axios.post(url,data ,{
       headers: headers,

    });
    console.log(
      "check response ==========================================> ",
      response
    );

  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    console.log("Error fetching reviews:");
    // throw error;
  }
};

const axios = require("axios");
const qs = require("querystring");

function buildReviewURL(countryDomain, asin, filterOptions) {
  const baseURL = `https://${countryDomain}/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt`;

  const query = {
    scope: "reviewsAjax16",
    asin,
    pageNumber: filterOptions.page,
    sortBy: filterOptions.sortBy,
    reviewerType: "all_reviews",
  };

  if (filterOptions.filterByStar) {
    query.filterByStar = filterOptions.filterByStar;
  }

  return `${baseURL}?${qs.stringify(query)}`;
}

const fetchData = async () => {
  // Query parameters
  const queryParams = new URLSearchParams({
    asin: "B0842JCKR7",
    csrf: "hC5PonWO92cP/6KPugLzRmE7J1jYaIghpuEWtI03gQYMAAAAAGdix+0AAAAB",
    language: "en_US",
    lazyWidget: "cr-age-recommendation",
  });

  // API URL với query string
  const url = `https://www.amazon.com/hz/reviews-render/ajax/lazy-widgets/stream?${queryParams.toString()}`;

  // Form Data
  const formData = new URLSearchParams();
  formData.append("pd_rd_w", "nA7Zd");
  formData.append(
    "content-id",
    "amzn1.sym.9cb932c3-e29e-44db-929c-bdc1460b3774"
  );
  formData.append("pf_rd_p", "9cb932c3-e29e-44db-929c-bdc1460b3774");
  formData.append("pf_rd_r", "QFTZZQHB7PCBASGEECXM");
  formData.append("pd_rd_wg", "Sa6T1");
  formData.append("pd_rd_r", "58dc7348-d7e9-4a24-b1b2-bd09631926eb");
  formData.append("pd_rd_i", "B0842JCKR7");
  formData.append("th", "1");
  formData.append("scope", "reviewsAjax0");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      body: formData.toString(), // Truyền form data
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API Response:", result);
    return result;
  } catch (error) {
    console.error("Error in API request:", error);
  }
};

fetchData();

async function parseCommands(data) {
  try {
    const commands = parseAjaxResponse(data); // Implement this to match your Go logic
    const reviews = [];

    for (const cmd of commands) {
      if (cmd.command === "appendFadeIn") {
        reviews.push(cmd.content);
      }
    }

    return reviews;
  } catch (err) {
    console.error("Error parsing commands", err);
    throw err;
  }
}

function randomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Example usage
(async () => {
  const countryDomain = "www.amazon.com";
  const asin = "B0CVZGR2PH";
  const filterOptions = {
    page: 1,
    sortBy: "recent",
    // filterByStar: "five_star",
  };

  const preset = {
    locale: "en_US",
  };

  const targetURL = buildReviewURL(countryDomain, asin, filterOptions);
  const reviews = await fetchData();
  console.log(reviews);
})();

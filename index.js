const axios = require("axios");

const fetchAmazonReviews = async () => {
  try {
    // Using the exact URL from your cURL request
    const url =
      "https://www.amazon.com/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt";

    const headers = {
      accept: "text/html,*/*",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "device-memory": "8",
      dpr: "1.125",
      ect: "4g",
      priority: "u=1, i",
      rtt: "100",
      "sec-ch-device-memory": "8",
      "sec-ch-dpr": "1.125",
      "sec-ch-ua":
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-ch-ua-platform-version": "15.0.0",
      "sec-ch-viewport-width": "753",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "viewport-width": "753",
      "x-requested-with": "XMLHttpRequest",
      Cookie:
        "lc-main=en_US; session-id=133-1098879-2455236; session-id-time=2082787201l; session-token=x9yM37JHMDDiAvKGCXjjoNjq6tPMoT8XjDTFc3Wzxq7CLRBZfFi1rKeRCID0Ch45opTOy/irbXGRmVKGA1U+1hEek/oCzh6S3ax7enGcNKTOHG9Tb7mA7CSePKIzFq7pcqbiq2cHAbe8xyglwkbbnIVj6Dxf4qRTN/qq7ZlmElEReh6w158vSvRN4RG8HPfbWDCJUXPDUopM2bUAeyq8TqX+lNNNWoGMIogNUuNf0dN/hqWN5z49t5m6REINxGLEQi07s5O8bT0QvEMPHsfvtGnmIMpuXg782yi+rLmGzEpq/bqBLS7c3DBcpLYbOajrYa2+R64+Gr4oMlQC5caEQHTAQuXonGaX; ubid-main=131-5098464-6271323",
    };

    // Using the exact form data from your cURL request
    const formData = new URLSearchParams({
      language: "en_US",
      asin: "B0DG7H487F",
      sortBy: "recent",
      scope: "reviewsAjax1",
    });

    console.log("Making request...");
    const response = await axios({
      method: "post", // Changed back to POST as in your original cURL
      url: url,
      headers: headers,
      data: formData,
      timeout: 30000,
    });

    console.log("Response Status:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error?.config?.url,
      data: error.response?.data, // Adding response data for more detail
    });
    throw error;
  }
};

// Add delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Usage with retry logic
const fetchWithRetry = async (maxRetries = 3, delayMs = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} of ${maxRetries}`);
      const data = await fetchAmazonReviews();
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
};

// Example usage
fetchWithRetry()
  .then((data) => {
    console.log("Success! Data received");
    require("fs").writeFileSync("amazon_response.html", data);
  })
  .catch((error) => {
    console.error("Final error:", error);
  });

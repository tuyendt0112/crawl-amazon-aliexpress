// // index.js
// const { fetchReviews } = require("./review");

// // Danh sách ASINs cần fetch
// const products = [
//   {
//     asin: "B0DG7H487F",
//     domain: "www.amazon.com",
//   },
//   // Thêm sản phẩm khác nếu cần
// ];

// // Delay helper
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const getAllReviews = async () => {
//   try {
//     const options = {
//       page: 1,
//       sortBy: "recent",
//       language: "en_US",
//     };

//     // Fetch reviews cho từng sản phẩm
//     for (const product of products) {
//       console.log(`\nFetching reviews for ASIN: ${product.asin}`);

//       try {
//         const reviews = await fetchReviews(
//           product.domain,
//           product.asin,
//           options
//         );

//         console.log(`Found ${reviews.length} reviews`);
//         console.log("Sample review:", JSON.stringify(reviews[0], null, 2));

//         // Delay trước khi fetch sản phẩm tiếp theo
//         await delay(2000);
//       } catch (error) {
//         console.error(
//           `Error fetching reviews for ${product.asin}:`,
//           error.message
//         );
//         continue; // Tiếp tục với sản phẩm tiếp theo nếu có lỗi
//       }
//     }
//   } catch (error) {
//     console.error("Error in main process:", error);
//   }
// };

// // Chạy với error handling
// getAllReviews()
//   .then(() => console.log("\nDone!"))
//   .catch((error) => console.error("\nFatal error:", error));
const axios = require("axios");

const fetchReviews = async () => {
  try {
    const url = "https://www.amazon.com/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt";

    const headers = {
      "accept": "text/html,*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "cookie": "session-id=133-3657465-2676401; i18n-prefs=USD; sp-cdn=\"L5Z9:VN\"; ubid-main=132-3841684-6325434; lc-main=en_US; regStatus=pre-register;",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "origin": "https://www.amazon.com",
      "referer": "https://www.amazon.com/dp/B0DG7H487F/ref=sspa_dk_detail_2",
      "x-requested-with": "XMLHttpRequest"
    };

    const formData = new URLSearchParams();
    formData.append("language", "en_US");
    formData.append("asin", "B0DG7H487F");
    formData.append("sortBy", "recent");
    formData.append("scope", "reviewsAjax16");

    const response = await axios.post(url, formData, { headers });
    console.log("Response Data:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

fetchReviews();

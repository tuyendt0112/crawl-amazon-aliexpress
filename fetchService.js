// Hàm fetch với timeout
const fetchWithTimeout = (url, timeout) => {
  return Promise.race([
    fetch(url), // Chỉ fetch mà không parse JSON vì sẽ dùng cho cả isShopifyLink
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};

// Hàm kiểm tra nội dung của link có chứa từ khóa 'myshopify.com' hay không
const checkShopifyContent = async (url) => {
  try {
    const response = await fetchWithTimeout(url, 5000); // Timeout 5 giây
    const html = await response.text();
    return html.includes("myshopify.com");
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return false;
  }
};

// Hàm kiểm tra link có đúng cấu trúc Shopify hay không
const isShopifyStructure = (url) => {
  const regex = /^https?:\/\/([^\/]+)\/products\/([^\/]+)\/?$/;
  return regex.test(url);
};

// Hàm fetch tất cả các link và kiểm tra Shopify với giới hạn đồng thời
const fetchAllLinks = async (links, timeout, concurrencyLimit = 5) => {
  const queue = [...links]; // Tạo một queue chứa tất cả các link
  const results = []; // Mảng lưu trữ kết quả

  const workers = Array(concurrencyLimit)
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const link = queue.shift(); // Lấy link tiếp theo từ queue
        try {
          const isStructureValid = isShopifyStructure(link); // Kiểm tra cấu trúc
          const isContentShopify = isStructureValid
            ? await checkShopifyContent(link)
            : false; // Chỉ kiểm tra nội dung nếu cấu trúc đúng

          results.push({
            link,
            isShopifyStructure: isStructureValid,
            isShopifyContent: isContentShopify,
          });
        } catch (error) {
          results.push({
            link,
            error: error.message,
            isShopifyStructure: false,
            isShopifyContent: false,
          });
        }
      }
    });

  await Promise.all(workers); // Chờ tất cả workers hoàn thành

  // Phân loại kết quả
  const successfulResults = results.filter(
    (result) => result.isShopifyStructure || result.isShopifyContent
  );
  const failedResults = results.filter(
    (result) => !result.isShopifyStructure && !result.isShopifyContent
  );

  return {
    successfulResults,
    failedResults,
    shopifyResults: successfulResults.filter(
      (result) => result.isShopifyContent
    ), // Những link thực sự là Shopify
  };
};

module.exports = { fetchAllLinks };

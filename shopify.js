const { fetchAllLinks } = require("./fetchService");

(async () => {
  // Danh sách các link cần kiểm tra
  const links = [
    "https://themondayfoodco.com/products/300g-keto-granola-pack-10-off", // Shopify
    "https://www.allbirds.com/products/mens-wool-runners", // Non-Shopify
    "https://www.gymshark.com/products/gymshark-critical-tee-black", // Invalid
    "https://deathwishcoffee.com/products/death-wish-coffee-1-lb-bag", // Non-Shopify
    "https://www.kyliecosmetics.com/products/candy-k-matte-lip-kit", // Shopify (giả định)
  ];

  // Timeout cho mỗi request là 5 giây
  const timeout = 5000;

  // Fetch tất cả các link
  const { successfulResults, failedResults, shopifyResults } =
    await fetchAllLinks(links, timeout, 3);

  // In kết quả
  console.log("Kết quả thành công:", successfulResults);
  console.log("Kết quả thất bại:", failedResults);
  console.log("Kết quả Shopify:", shopifyResults);
})();

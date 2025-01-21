const axios = require("axios");
// const fs = require("fs");
// const path = require("path");
// const sharp = require("sharp");
// const tesseract = require("tesseract.js");
// const cv = require("opencv4nodejs");

// async function straightenImage(imagePath) {
//   const image = await cv.imreadAsync(imagePath);

//   // Chuyển đổi hình ảnh sang đen trắng
//   const grayImage = image.bgrToGray();

//   // Tìm cạnh
//   const edges = grayImage.canny(50, 150);

//   // Tìm đường viền
//   const contours = edges.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

//   // Lấy đường viền lớn nhất
//   const largestContour = contours.sort((a, b) => b.area - a.area)[0];

//   // Tính toán góc và điều chỉnh (cần thêm mã để thực hiện điều chỉnh góc)
//   // Đây là một ví dụ đơn giản, bạn cần điều chỉnh thêm tùy theo yêu cầu

//   return image; // Trả về hình ảnh chưa được điều chỉnh
// }

// // URL của ảnh CAPTCHA
// const captchaUrl =
//   "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg";

// // Tên file tạm sau khi tải về
// const downloadedImagePath = path.join(__dirname, "downloaded_captcha.jpg");

// // Tên file sau khi xử lý ảnh
// const processedImagePath = path.join(__dirname, "processed_captcha.jpg");

// // Hàm tải ảnh từ URL
// async function downloadImage(url, outputPath) {
//   try {
//     const response = await axios({
//       url,
//       method: "GET",
//       responseType: "stream",
//     });
//     const writer = fs.createWriteStream(outputPath);
//     response.data.pipe(writer);
//     return new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });
//   } catch (error) {
//     console.error("Lỗi khi tải ảnh:", error);
//     throw error;
//   }
// }

// // Hàm xử lý ảnh trước khi OCR
// async function preprocessImage(inputPath, outputPath) {
//   try {
//     await sharp(inputPath)
//       .greyscale() // Chuyển sang ảnh xám
//       .threshold(128) // Tăng độ tương phản, loại bỏ nhiễu
//       .toFile(outputPath);
//     console.log("Hình ảnh đã được xử lý trước.");
//   } catch (error) {
//     console.error("Lỗi xử lý hình ảnh:", error);
//     throw error;
//   }
// }

// // Hàm nhận dạng CAPTCHA
// async function solveCaptcha() {
//   try {
//     // Bước 1: Tải ảnh từ URL
//     console.log("Đang tải ảnh...");
//     await downloadImage(captchaUrl, downloadedImagePath);
//     console.log("Tải ảnh thành công.");

//     // Bước 2: Xử lý ảnh trước
//     console.log("Đang xử lý ảnh...");
//     await preprocessImage(downloadedImagePath, processedImagePath);

//     // Bước 3: Làm thẳng hình ảnh (nếu cần)
//     console.log("Đang làm thẳng hình ảnh...");
//     const straightenedImage = await straightenImage(processedImagePath);
//     const straightenedImagePath = path.join(
//       __dirname,
//       "straightened_captcha.jpg"
//     );
//     await cv.imwriteAsync(straightenedImagePath, straightenedImage);

//     // Bước 4: Chạy OCR
//     console.log("Đang nhận dạng văn bản...");
//     const {
//       data: { text },
//     } = await tesseract.recognize(straightenedImagePath, "eng", {
//       tessedit_char_whitelist:
//         "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // Hạn chế ký tự
//     });

//     console.log("Kết quả CAPTCHA:", text.trim());
//   } catch (error) {
//     console.error("Lỗi trong quá trình giải CAPTCHA:", error);
//   }
// }

// // Gọi hàm giải CAPTCHA
// solveCaptcha();
const Tesseract = require("tesseract.js");
const fs = require("fs");

async function downloadImage(url, outputPath) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    throw error;
  }
}

async function captchaToText(imagePath) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });
    console.log("The CAPTCHA text is:", text.trim());
  } catch (error) {
    console.error("Error:", error);
  }
}

(async () => {
  const imageUrl =
    "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg"; // Replace with your CAPTCHA image URL
  const imagePath = "captcha_image.png";

  await downloadImage(imageUrl, imagePath);
  await captchaToText(imagePath);
})();

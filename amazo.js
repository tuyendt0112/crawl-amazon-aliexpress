const fs = require("fs");
const axios = require("axios");
const sharp = require("sharp");
const Tesseract = require("tesseract.js");

const imageUrl =
  "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg";
const imagePath = "./temp/captcha.jpg";

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

async function getCaptchaText(imagePath) {
  try {
    const processedImage = await sharp(imagePath)
      .greyscale()
      .normalize() // Tăng cường độ tương phản
      .threshold(200) // Chuyển sang đen trắng
      .resize(300) // Thay đổi kích thước
      .toBuffer();

    const {
      data: { text },
    } = await Tesseract.recognize(processedImage, "eng", {
      logger: (m) => console.log(m),
      config: "--psm 6", // Thay đổi giá trị cho phù hợp với hình ảnh
    });

    return text.trim();
  } catch (error) {
    console.error("Lỗi khi đọc hình ảnh:", error);
    throw error;
  }
}

(async () => {
  // Tải về hình ảnh CAPTCHA
  await downloadImage(imageUrl, imagePath);
  console.log("Captcha image downloaded.");

  // Nhận diện văn bản trong hình ảnh CAPTCHA
  try {
    const captchaText = await getCaptchaText(imagePath);
    console.log("Detected CAPTCHA text:", captchaText);
  } catch (error) {
    console.error("Không thể nhận diện CAPTCHA:", error);
  }

  // Xoá hình ảnh sau khi xử lý
  // fs.unlinkSync(imagePath);
})();

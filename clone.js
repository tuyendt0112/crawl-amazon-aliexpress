// // // const { createCanvas, loadImage } = require("canvas");
// // // const Tesseract = require("tesseract.js");
// // // const axios = require("axios");
// // // const fs = require("fs").promises;
// // // const path = require("path");

// // // async function preprocessImage(imageBuffer) {
// // //   const image = await loadImage(imageBuffer);
// // //   const canvas = createCanvas(image.width, image.height);
// // //   const ctx = canvas.getContext("2d");

// // //   // Draw original image
// // //   ctx.drawImage(image, 0, 0);

// // //   // Get image data
// // //   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// // //   const data = imageData.data;

// // //   // Calculate average brightness
// // //   let totalBrightness = 0;
// // //   for (let i = 0; i < data.length; i += 4) {
// // //     totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
// // //   }
// // //   const avgBrightness = totalBrightness / (data.length / 4);

// // //   // Process each pixel
// // //   for (let i = 0; i < data.length; i += 4) {
// // //     const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

// // //     // Dynamic threshold based on average brightness
// // //     const threshold = brightness < avgBrightness * 0.8 ? 0 : 255;

// // //     data[i] = threshold; // R
// // //     data[i + 1] = threshold; // G
// // //     data[i + 2] = threshold; // B
// // //   }

// // //   ctx.putImageData(imageData, 0, 0);

// // //   // Split into segments
// // //   const segments = [];
// // //   const segmentWidth = Math.floor(canvas.width / 6);

// // //   for (let i = 0; i < 6; i++) {
// // //     const segCanvas = createCanvas(segmentWidth, canvas.height);
// // //     const segCtx = segCanvas.getContext("2d");

// // //     // Copy segment
// // //     segCtx.drawImage(
// // //       canvas,
// // //       i * segmentWidth,
// // //       0,
// // //       segmentWidth,
// // //       canvas.height,
// // //       0,
// // //       0,
// // //       segmentWidth,
// // //       canvas.height
// // //     );

// // //     segments.push(segCanvas.toBuffer("image/png"));
// // //   }

// // //   return segments;
// // // }

// // // async function recognizeSegment(imageBuffer) {
// // //   try {
// // //     const result = await Tesseract.recognize(imageBuffer, "eng", {
// // //       tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
// // //       tessedit_pageseg_mode: "10", // Treat as single character
// // //       logger: (m) => {
// // //         if (m.status === "recognizing text") {
// // //           console.log("Processing...");
// // //         }
// // //       },
// // //     });

// // //     const text = result.data.text.trim().replace(/[^A-Z]/g, "");
// // //     return text.length > 0 ? text[0] : "";
// // //   } catch (error) {
// // //     console.error("Error recognizing segment:", error);
// // //     return "";
// // //   }
// // // }

// // // async function solveCaptcha(imageUrl) {
// // //   try {
// // //     console.log("Downloading image...");
// // //     const response = await axios({
// // //       url: imageUrl,
// // //       responseType: "arraybuffer",
// // //     });

// // //     console.log("Processing image...");
// // //     const segments = await preprocessImage(response.data);

// // //     console.log("Recognizing characters...");
// // //     let captchaText = "";
// // //     for (let i = 0; i < segments.length; i++) {
// // //       const char = await recognizeSegment(segments[i]);
// // //       captchaText += char;
// // //       console.log(`Character ${i + 1}: ${char}`);
// // //     }

// // //     console.log("Complete CAPTCHA:", captchaText);
// // //     return captchaText;
// // //   } catch (error) {
// // //     console.error("Error:", error);
// // //     throw error;
// // //   }
// // // }

// // // // Test function
// // // async function main() {
// // //   try {
// // //     const url =
// // //       "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg";
// // //     const result = await solveCaptcha(url);
// // //     console.log("Final result:", result);
// // //   } catch (error) {
// // //     console.error("Failed:", error.message);
// // //   }
// // // }

// // // main();
// // const { createCanvas, loadImage } = require("canvas");
// // const Tesseract = require("tesseract.js");
// // const axios = require("axios");
// // const fs = require("fs").promises;
// // const path = require("path");

// // // Tạo một mảng các phương pháp xử lý ảnh khác nhau
// // const preprocessingMethods = [
// //   // Method 1: Dynamic threshold
// //   async function preprocessMethod1(imageBuffer) {
// //     const image = await loadImage(imageBuffer);
// //     const canvas = createCanvas(image.width * 2, image.height * 2);
// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

// //     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// //     const data = imageData.data;

// //     let sum = 0;
// //     for (let i = 0; i < data.length; i += 4) {
// //       const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
// //       sum += brightness;
// //     }
// //     const threshold = sum / (data.length / 4);

// //     for (let i = 0; i < data.length; i += 4) {
// //       const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
// //       const value = brightness < threshold ? 0 : 255;
// //       data[i] = data[i + 1] = data[i + 2] = value;
// //     }

// //     ctx.putImageData(imageData, 0, 0);
// //     return canvas;
// //   },

// //   // Method 2: High contrast
// //   async function preprocessMethod2(imageBuffer) {
// //     const image = await loadImage(imageBuffer);
// //     const canvas = createCanvas(image.width * 2, image.height * 2);
// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

// //     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// //     const data = imageData.data;

// //     for (let i = 0; i < data.length; i += 4) {
// //       const brightness =
// //         data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
// //       const contrast = Math.max(0, Math.min(255, (brightness - 128) * 2 + 128));
// //       const value = contrast < 180 ? 0 : 255;
// //       data[i] = data[i + 1] = data[i + 2] = value;
// //     }

// //     ctx.putImageData(imageData, 0, 0);
// //     return canvas;
// //   },

// //   // Method 3: Multiple thresholds
// //   async function preprocessMethod3(imageBuffer) {
// //     const image = await loadImage(imageBuffer);
// //     const canvas = createCanvas(image.width * 2, image.height * 2);
// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

// //     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// //     const data = imageData.data;

// //     for (let i = 0; i < data.length; i += 4) {
// //       const r = data[i],
// //         g = data[i + 1],
// //         b = data[i + 2];
// //       const brightness = (r + g + b) / 3;

// //       // Multiple threshold levels
// //       let value = 255;
// //       if (brightness < 100) value = 0;
// //       else if (brightness < 150) value = 128;

// //       data[i] = data[i + 1] = data[i + 2] = value;
// //     }

// //     ctx.putImageData(imageData, 0, 0);
// //     return canvas;
// //   },
// // ];

// // async function preprocessImage(imageBuffer, methodIndex) {
// //   const processedCanvas = await preprocessingMethods[methodIndex](imageBuffer);

// //   // Split into segments
// //   const segments = [];
// //   const segmentWidth = Math.floor(processedCanvas.width / 6);

// //   for (let i = 0; i < 6; i++) {
// //     const segCanvas = createCanvas(segmentWidth, processedCanvas.height);
// //     const segCtx = segCanvas.getContext("2d");

// //     // Copy segment with rotation
// //     const rotation = i % 2 === 0 ? 15 : -15;
// //     segCtx.translate(segmentWidth / 2, processedCanvas.height / 2);
// //     segCtx.rotate((rotation * Math.PI) / 180);
// //     segCtx.drawImage(
// //       processedCanvas,
// //       i * segmentWidth,
// //       0,
// //       segmentWidth,
// //       processedCanvas.height,
// //       -segmentWidth / 2,
// //       -processedCanvas.height / 2,
// //       segmentWidth,
// //       processedCanvas.height
// //     );

// //     segments.push(segCanvas.toBuffer("image/png"));
// //   }

// //   return segments;
// // }

// // async function recognizeSegment(imageBuffer) {
// //   try {
// //     const result = await Tesseract.recognize(imageBuffer, "eng", {
// //       tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
// //       tessedit_pageseg_mode: "10",
// //       logger: (m) => {
// //         if (m.status === "recognizing text") {
// //           process.stdout.write(".");
// //         }
// //       },
// //     });

// //     const text = result.data.text.trim().replace(/[^A-Z]/g, "");
// //     return text.length > 0 ? text[0] : "";
// //   } catch (error) {
// //     return "";
// //   }
// // }

// // async function solveCaptchaOnce(imageUrl, methodIndex) {
// //   try {
// //     console.log(`\nUsing preprocessing method ${methodIndex + 1}`);
// //     console.log("Downloading image...");

// //     const response = await axios({
// //       url: imageUrl,
// //       responseType: "arraybuffer",
// //       timeout: 5000,
// //     });

// //     console.log("Processing image...");
// //     const segments = await preprocessImage(response.data, methodIndex);

// //     console.log("Recognizing characters...");
// //     let captchaText = "";
// //     let segmentResults = [];

// //     for (let i = 0; i < segments.length; i++) {
// //       const char = await recognizeSegment(segments[i]);
// //       captchaText += char;
// //       segmentResults.push(char);
// //       process.stdout.write(`Segment ${i + 1}: ${char}\n`);
// //     }

// //     console.log("\nComplete text:", captchaText);

// //     return {
// //       text: captchaText,
// //       segments: segmentResults,
// //       method: methodIndex + 1,
// //     };
// //   } catch (error) {
// //     console.error("Error in attempt:", error);
// //     return null;
// //   }
// // }

// // async function solveCaptchaWithRetries(imageUrl, maxRetries = 5) {
// //   const results = [];

// //   for (let i = 0; i < maxRetries; i++) {
// //     console.log(`\nAttempt ${i + 1} of ${maxRetries}`);
// //     const result = await solveCaptchaOnce(
// //       imageUrl,
// //       i % preprocessingMethods.length
// //     );

// //     if (result && result.text.length === 6) {
// //       results.push(result.text);
// //       console.log(
// //         `Complete CAPTCHA using method ${result.method}: ${result.text}`
// //       );

// //       const counts = {};
// //       results.forEach((r) => (counts[r] = (counts[r] || 0) + 1));

// //       const mostCommon = Object.entries(counts).sort(
// //         ([, a], [, b]) => b - a
// //       )[0];

// //       if (mostCommon[1] >= 2) {
// //         console.log("\nFound consistent result:", mostCommon[0]);
// //         console.log("Results history:", results);
// //         return mostCommon[0];
// //       }
// //     }
// //   }

// //   if (results.length > 0) {
// //     console.log("\nNo consistent result found. Results:", results);
// //     return results[results.length - 1];
// //   }

// //   throw new Error("Failed to get valid CAPTCHA result");
// // }
// // async function main() {
// //   try {
// //     const url =
// //       "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg";
// //     const result = await solveCaptchaWithRetries(url);
// //     console.log("\nFinal result:", result);
// //   } catch (error) {
// //     console.error("Failed:", error.message);
// //   }
// // }

// // if (require.main === module) {
// //   main();
// // }

// // module.exports = { solveCaptchaWithRetries };
// // const { createWorker } = require("tesseract.js");

// // (async () => {
// //   const worker = await createWorker("eng");
// //   const ret = await worker.recognize(
// //     "https://images-na.ssl-images-amazon.com/captcha/dgbcpgrn/Captcha_jzfvyetbcn.jpg"
// //   );

// //   console.log(ret.data.text);

// //   await worker.terminate();
// // })();
// const { chromium } = require("playwright-core");
// const { solve } = require("recaptcha-solver");

// const EXAMPLE_PAGE = "https://www.google.com/recaptcha/api2/demo";

// main();

// async function main() {
//   const browser = await chromium.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(EXAMPLE_PAGE);

//   await solve(page);
//   console.log("reCAPTCHA solved!");

//   await page.click("#recaptcha-demo-submit");

//   page.on("close", async () => {
//     await browser.close();
//     process.exit(0);
//   });
// }
// C:\Users\dangt\Desktop\crawl\crawl-amazon-aliexpress\captcha.jpg

const axios = require("axios");

const formData = new FormData();
formData.append(
  "base64",
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
); // your base64 image data

const config = {
  method: "post",
  url: "https://picturetotext.info/picture-to-text",
  headers: {
    accept: "*/*",
    "x-requested-with": "XMLHttpRequest",
    "x-csrf-token": "kbpHS61tBt2qUND90I71R7ohazAu1HIFcTzZ7fWk",
    Cookie:
      "XSRF-TOKEN=eyJpdiI6InpJUVJRMVdqRUFCVHM1Nk1neC9KdUE9PSIsInZhbHVlIjoiVlBxd1drc3d0c0dkL2dzanRlakFuNFJpN1g1ank4UlV1QXZNNWViOWQwbGpaMXp6UFpwSTJLWnZNc1V1MXJqZk5kWUp3dTZTNjhuY2pCTDI0WDBHRSttUml1NDV1TTRNSFJjRCs4bVZ2czdvNzBmR3lyVk11emc3YTBZbUdmNkUiLCJtYWMiOiI1NGM2ZTE4MWM3M2RlZDc2YzYxNzQwMWNlZTE0NmYzNDdkM2Q4ODlmOTY0YWMxOTMxNDQwOTczZDY1N2E3YjhhIiwidGFnIjoiIn0; laravel_session=eyJpdiI6InpJUVJRMVdqRUFCVHM1Nk1neC9KdUE9PSIsInZhbHVlIjoiVlBxd1drc3d0c0dkL2dzanRlakFuNFJpN1g1ank4UlV1QXZNNWViOWQwbGpaMXp6UFpwSTJLWnZNc1V1MXJqZk5kWUp3dTZTNjhuY2pCTDI0WDBHRSttUml1NDV1TTRNSFJjRCs4bVZ2czdvNzBmR3lyVk11emc3YTBZbUdmNkUiLCJtYWMiOiI1NGM2ZTE4MWM3M2RlZDc2YzYxNzQwMWNlZTE0NmYzNDdkM2Q4ODlmOTY0YWMxOTMxNDQwOTczZDY1N2E3YjhhIiwidGFnIjoiIn0",
  },
  data: formData,
};

axios(config)
  .then((response) => {
    console.log("Response:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

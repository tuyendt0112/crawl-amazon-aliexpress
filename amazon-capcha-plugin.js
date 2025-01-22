const { createWorker } = require("tesseract.js");
const { PuppeteerExtraPlugin } = require("puppeteer-extra-plugin");

class PuppeteerExtraPluginAmazonCaptcha extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts);
  }

  get name() {
    return "amazon-captcha";
  }

  get defaults() {
    return {
      maxRetries: 30,
      inputSelector: "#captchacharacters",
    };
  }

  async _solveAmazonCaptcha(page, url) {
    const worker = await createWorker("eng");
    try {
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      });
      const {
        data: { text },
      } = await worker.recognize(url);
      await page.type(
        this.opts.inputSelector,
        text.toUpperCase().replace(" ", "")
      );
      await page.keyboard.press("Enter");
    } finally {
      await worker.terminate();
    }
  }

  async onPageCreated(page) {
    let retry = 0;
    await page.setRequestInterception(true);

    page.on("request", (req) => {
      req.continue();
    });

    page.on("response", async (res) => {
      const req = res.request();
      const url = req.url();
      if (
        url.toLowerCase().includes("amazon") &&
        url.toLowerCase().includes("captcha") &&
        req.resourceType() === "image" &&
        retry <= this.opts.maxRetries
      ) {
        try {
          await this._solveAmazonCaptcha(page, url);
          retry++;
        } catch (error) {
          console.error("Error solving CAPTCHA:", error);
        }
      }
    });
  }
}

// Plugin factory
const amazonCaptchaPlugin = (opts = {}) =>
  new PuppeteerExtraPluginAmazonCaptcha(opts);
module.exports = amazonCaptchaPlugin;

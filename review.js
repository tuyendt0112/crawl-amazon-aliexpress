const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

const buildReviewUrl = (countryDomain, asin, filterOptions) => {
  const baseUrl = new URL(
    `https://${countryDomain}/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt`
  );

  const params = new URLSearchParams({
    scope: "reviewsAjax1",
    asin: asin,
    // pageNumber: filterOptions.page || "1",
    sortBy: filterOptions.sortBy || "recent",
    reviewerType: "all_reviews",
  });

  baseUrl.search = params.toString();
  return baseUrl.toString();
};

const parseCommands = (data) => {
  if (!data || typeof data !== "string") return [];

  try {
    return data
      .split("&&&")
      .map((record) => {
        try {
          const commandArray = JSON.parse(record.trim());
          if (!Array.isArray(commandArray) || commandArray.length !== 3)
            return null;
          return {
            command: commandArray[0],
            selector: commandArray[1],
            content: commandArray[2],
          };
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean)
      .filter((cmd) => cmd.command === "appendFadeIn")
      .map((cmd) => cmd.content);
  } catch (err) {
    console.error("Error parsing commands:", err);
    return [];
  }
};

const parseStarRating = ($starEl) => {
  try {
    const starClass = $starEl.attr("class") || "";
    const starMatch = starClass.match(/a-star-(\d)/);
    return starMatch ? parseInt(starMatch[1]) : 0;
  } catch {
    return 0;
  }
};

const parseContent = (content) => {
  try {
    return content
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim()
      .replace(/\s+/g, " ");
  } catch {
    return content;
  }
};

const parseReviewHtml = (html) => {
  try {
    const $ = cheerio.load(html);
    const reviewDiv = $('div[data-hook="review"]');
    if (!reviewDiv.length) return null;

    return {
      amazonId: reviewDiv.attr("id"),
      author: $("span.a-profile-name").first().text().trim(),
      avatar: $("div.a-profile-avatar img").attr("data-src"),
      star: parseStarRating($('i[data-hook="review-star-rating"]').first()),
      content: parseContent($(".reviewText").text()),
      date: $('span[data-hook="review-date"]').text(),
      images: $("img.cr-lightbox-image-thumbnail")
        .map((_, el) => $(el).attr("src")?.replace("_SY88.", ""))
        .get()
        .filter(Boolean),
      verified: $('[data-hook="avp-badge"]').length > 0,
    };
  } catch (err) {
    console.error("Error parsing review HTML:", err);
    return null;
  }
};

const fetchReviews = async (countryDomain, asin, options = {}) => {
  try {
    const url = buildReviewUrl(countryDomain, asin, options);
    console.log("url >>>>>>>>>", url);
    const response = await axios({
      method: "POST",
      url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,*/*",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    console.log("respinse >>>>>>>>>>", response);
    // const htmlStrings = parseCommands(response.data);
    // const reviews = htmlStrings
    //   .map((html) => parseReviewHtml(html))
    //   .filter(Boolean);

    return reviews;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    throw err;
  }
};

module.exports = {
  fetchReviews,
  parseReviewHtml,
  parseCommands,
};

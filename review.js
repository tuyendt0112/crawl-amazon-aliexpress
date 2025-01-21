const axios = require("axios");

const url = "https://picturetotext.info/picture-to-text";
const data = "data=yourDataHere"; // Dữ liệu bạn muốn gửi

const headers = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-CSRF-TOKEN":
    "eyJpdiI6IlFwY3VJUEVnWFhhUWd3L2tQRkhBMXc9PSIsInZhbHVlIjoiZUJibkdFcjA2c3pncGlCS0lHNjlFSDFka0NaVnllS3FZb2syaWY1SDl3eGtUZ0Fjd2ExL1picXQ4VUJ2aTNteEZXOHhkY3lnMnowL084L3M1UThrVlBjTlh4RFU0b3ZPYXRMRWlNcW9ZV1VTYmZyUjFVaHh5RitwS2oyUjBQVG8iLCJtYWMiOiIzYmM2NmM0ZWNlYWE3NWQwZjc2MzJkNjc4M2MxYzBmZDM3MzE1YTA1MmY5NjYxYWM3YTU2OWVjYjc1MDM3ZDRmIiwidGFnIjoiIn0%3D", // CSRF token
  "x-requested-with": "XMLHttpRequest",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://picturetotext.info",
  Referer: "https://picturetotext.info/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "XSRF-TOKEN":
    "eyJpdiI6IlFwY3VJUEVnWFhhUWd3L2tQRkhBMXc9PSIsInZhbHVlIjoiZUJibkdFcjA2c3pncGlCS0lHNjlFSDFka0NaVnllS3FZb2syaWY1SDl3eGtUZ0Fjd2ExL1picXQ4VUJ2aTNteEZXOHhkY3lnMnowL084L3M1UThrVlBjTlh4RFU0b3ZPYXRMRWlNcW9ZV1VTYmZyUjFVaHh5RitwS2oyUjBQVG8iLCJtYWMiOiIzYmM2NmM0ZWNlYWE3NWQwZjc2MzJkNjc4M2MxYzBmZDM3MzE1YTA1MmY5NjYxYWM3YTU2OWVjYjc1MDM3ZDRmIiwidGFnIjoiIn0%3D",
  laravel_session:
    "eyJpdiI6Imp1N04yZU9GeTRRV3V4V2ZLYStzcHc9PSIsInZhbHVlIjoiTzVvbVFEaTAxbWwwM3B6Zi9rNE9MTDZuZmsvZHJxTmFTd1VDcjRRQzZtYUtoNndROHp1WDlUVWpyUVQyT2tQbWthMFZuaE1ZWFhZWjU4Mlhleitka3J1NTdrS1d6akxHbEdRTU9MMk45NkZxbGNtMmNaZTRrdXVSdWNGZG9HMTUiLCJtYWMiOiIwMWM0NThkMzFlMjhkNmJhNGU5MmI1NTVmZTc3NWVkZDUxYTNmZGViM2U0NmE0ZTE4MjUyZDhkZjc5YWM3MDE0IiwidGFnIjoiIn0%3D",
};

// Gửi yêu cầu POST
axios
  .post(url, data, { headers })
  .then((response) => {
    console.log("Response:", response.data);
  })
  .catch((error) => {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  });

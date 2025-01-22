// const axios = require('axios');
// const { URLSearchParams } = require('url');

// async function fetchAmazonReviews(asin) {
//     const headers = {
//         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
//         'accept-language': 'en-US,en;q=0.9',
//         'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
//         'device-memory': '8',
//         'dpr': '1.125',
//         'ect': '4g',
//         'priority': 'u=1, i',
//         'rtt': '100',
//         'sec-ch-device-memory': '8',
//         'sec-ch-dpr': '1.125',
//         'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-ch-ua-platform': '"Windows"',
//         'sec-ch-ua-platform-version': '"15.0.0"',
//         'sec-ch-viewport-width': '753',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'same-origin',
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
//         'viewport-width': '753',
//         'x-requested-with': 'XMLHttpRequest',
//         'referer': `https://www.amazon.com/dp/${asin}`,
//         'cookie': 'session-id=135-5159283-7619048; session-id-time=2082787201l; i18n-prefs=USD; sp-cdn="L5Z9:VN"; skin=noskin; ubid-main=133-4657676-8622252; lc-main=en_US; session-token=IPx8GcqU+27zdERkhIMKbJ+eFsBjIjw41rOEGzdwVRTtSIZKzuYLl5qO83A3KqEym+4v38+2OJ1WAUl7Iemsm6TYOFrez05wG0kBEI/le96o9kjUZQRk9nwggmnGM7xYywS+yLGyXQit/bSlHeBcV1GRFEgK7bP0+s4PmDa1h/WTGCVQVN+PjArd3bbWYR1jJRavLyblClzjNwuGZ4IeODhbRiSiE2Rb5ZXN4Svlw0x4JZOLd2uDMObmv8pLWVVOQVWmRgiusFZLp5H/mEx5xMEmGc3k3WeSHzk1G41o2xXVmSnnXF0U8IAfUznpoxIgIzA9MnjWqQ+k/uPknAZtAm4N9xfi6C6V; csm-hit=tb:X8NRM6A5N0PSKX3YMPE0+s-0VZXCJFX2DRH7DCMYD1W|1734852281940&t:1734852281940&adb:adblk_yes',
//     };

//     const data = new URLSearchParams();
//     data.append('language', 'en_US');
//     data.append('asin', asin);
//     data.append('sortBy', 'recent');
//     data.append('scope', 'reviewsAjax1');
// console.log("data",data);
//     try {
//         const response = await axios.post(
//             'https://www.amazon.com/hz/reviews-render/ajax/medley-filtered-reviews/get/ref=cm_cr_dp_d_fltrs_srt',
//             data,
//             { headers, withCredentials: true, maxRedirects: 5 }
//         );

//         console.log('Response Status:', response.status);
//         // console.log('Response Data:', response.data);
//         // return response.data;
//     } catch (error) {
//         if (error.response) {
//             console.error('Error Response Status:', error.response.status);
//             // console.error('Error Response Data:', error.response.data);
//         } else {
//             // console.error('Error:', error.message);
//         }
//         throw new Error('Không thể lấy dữ liệu reviews từ Amazon.');
//     }
// }

// // Gọi hàm để thử với ASIN cụ thể
// fetchAmazonReviews('B0D383C2F3')
//     .then(data => {
//         // console.log('Dữ liệu reviews:', data);
//     })
//     .catch(error => {
//         console.error('Lỗi:', error.message);
//     });

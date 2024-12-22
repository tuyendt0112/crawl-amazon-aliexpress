const crypto = require("crypto");

const browserConfigs = [
    {
        name: "Chrome",
        version: "120.0.0.0",
        platform: "Windows NT 10.0; Win64; x64",
        osVersion: "Windows NT 10.0",
        engine: "WebKit",
        engineVersion: "537.36",
    },
    {
        name: "Firefox",
        version: "121.0",
        platform: "Windows NT 10.0; Win64; x64",
        osVersion: "Windows NT 10.0",
        engine: "Firefox",
        engineVersion: "20231212",
    },
    {
        name: "Safari",
        version: "17.2",
        platform: "Macintosh; Intel Mac OS X 10_15_7",
        osVersion: "Mac OS X 10_15_7",
        engine: "WebKit",
        engineVersion: "605.1.15",
    },
    {
        name: "Edge",
        version: "120.0.0.0",
        platform: "Windows NT 10.0; Win64; x64",
        osVersion: "Windows NT 10.0",
        engine: "WebKit",
        engineVersion: "537.36",
    },
];

const getRandomInt = (max)=> {
    return crypto.randomInt(max);
}

module.exports.getRandomBrowserConfig = ()=> {
    return browserConfigs[getRandomInt(browserConfigs.length)];
}

function generateUserAgent(browser) {
    switch (browser.name) {
        case "Chrome":
            return `Mozilla/5.0 (${browser.platform}) AppleWebKit/${browser.engineVersion} (KHTML, like Gecko) Chrome/${browser.version} Safari/${browser.engineVersion}`;
        case "Firefox":
            return `Mozilla/5.0 (${browser.platform}; rv:${browser.version}) Gecko/${browser.engineVersion} Firefox/${browser.version}`;
        case "Safari":
            return `Mozilla/5.0 (${browser.platform}) AppleWebKit/${browser.engineVersion} (KHTML, like Gecko) Version/${browser.version} Safari/${browser.engineVersion}`;
        case "Edge":
            return `Mozilla/5.0 (${browser.platform}) AppleWebKit/${browser.engineVersion} (KHTML, like Gecko) Chrome/${browser.version} Safari/${browser.engineVersion} Edge/${browser.version}`;
        default:
            return "";
    }
}

function getRandomCHUA(browser) {
    switch (browser.name) {
        case "Chrome":
            return `"Google Chrome";v="${browser.version}", "Chromium";v="${browser.version}", "Not_A Brand";v="24"`;
        case "Firefox":
            return `"Firefox";v="${browser.version}", "Not_A Brand";v="24"`;
        case "Safari":
            return `"Safari";v="${browser.version}", "Not_A Brand";v="24"`;
        case "Edge":
            return `"Microsoft Edge";v="${browser.version}", "Chromium";v="${browser.version}", "Not_A Brand";v="24"`;
        default:
            return `"Not_A Brand";v="24"`;
    }
}

module.exports.generateRequestHeaders = (browser) =>  {
    const deviceMemoryOptions = ["4", "8", "16"];
    const dprOptions = ["1", "1.5", "2"];
    const ectOptions = ["4g", "3g"];
    const viewportWidth = (800 + getRandomInt(800)).toString(); // Random between 800 and 1600

    return {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": generateUserAgent(browser),
        "Accept": "text/html,*/*",
        "Device-Memory": deviceMemoryOptions[getRandomInt(deviceMemoryOptions.length)],
        Downlink: (0.5 + Math.random() * 2.0).toFixed(2), // Random between 0.5 and 2.5
        DPR: dprOptions[getRandomInt(dprOptions.length)],
        ECT: ectOptions[getRandomInt(ectOptions.length)],
        Priority: "u=1, i",
        RTT: (200 + getRandomInt(400)).toString(), // Random between 200 and 600
        "Sec-CH-Device-Memory": deviceMemoryOptions[getRandomInt(deviceMemoryOptions.length)],
        "Sec-CH-DPR": dprOptions[getRandomInt(dprOptions.length)],
        "Sec-CH-UA": getRandomCHUA(browser),
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": `"${browser.osVersion}"`,
        "Sec-CH-Viewport-Width": viewportWidth,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Viewport-Width": viewportWidth,
        "X-Requested-With": "XMLHttpRequest",
    };
}



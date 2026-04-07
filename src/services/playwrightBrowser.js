const { chromium } = require("playwright");

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) {
    return browserInstance;
  }

  browserInstance = await chromium.launch({
    headless: true,
  });

  return browserInstance;
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = {
  getBrowser,
  closeBrowser,
};
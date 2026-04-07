const { getBrowser } = require("../../../../services/playwrightBrowser");
const extractAmazonAsin = require("./extractAmazonAsin");
const parseAmazonPrice = require("./parseAmazonPrice");

async function getTextBySelectors(page, selectors = []) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();

      if (await locator.count()) {
        const text = await locator.textContent();

        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (error) {
      // seguimos con el siguiente selector
    }
  }

  return null;
}

const amazonProvider = {
  id: "amazon",

  canHandle(purchaseUrl = "") {
    const normalizedUrl = String(purchaseUrl).toLowerCase();

    return (
      normalizedUrl.includes("amazon.com") ||
      normalizedUrl.includes("amazon.com.mx")
    );
  },

  async fetch(wishlistItem) {
    const purchaseUrl = wishlistItem?.purchaseUrl || "";
    const asin = extractAmazonAsin(purchaseUrl);

    if (!asin) {
      return {
        success: false,
        errorCode: "INVALID_AMAZON_URL",
        message: "Could not extract Amazon ASIN from URL.",
        store: "amazon",
        source: "amazon-playwright",
        availability: "unknown",
      };
    }

    let context = null;
    let page = null;

    try {
      const browser = await getBrowser();

      context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        locale: "es-MX",
        viewport: { width: 1440, height: 900 },
      });

      page = await context.newPage();

      await page.goto(purchaseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      await page.waitForTimeout(2500);

      const title = await page.title();

      if (
        title.toLowerCase().includes("robot check") ||
        title.toLowerCase().includes("captcha")
      ) {
        return {
          success: false,
          errorCode: "BOT_PROTECTION",
          message: "Amazon bot protection detected.",
          store: "amazon",
          source: "amazon-playwright",
          availability: "unknown",
        };
      }

      const priceSelectors = [
        "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
        "#corePrice_feature_div .a-price .a-offscreen",
        "#apex_desktop .a-price .a-offscreen",
        "#price_inside_buybox",
        "#priceblock_ourprice",
        "#priceblock_dealprice",
        ".a-price .a-offscreen",
      ];

      const availabilitySelectors = [
        "#availability span",
        "#availabilityInsideBuyBox_feature_div span",
        "#outOfStock span",
      ];

      const priceText = await getTextBySelectors(page, priceSelectors);
      const availabilityText = await getTextBySelectors(
        page,
        availabilitySelectors,
      );

      const price = parseAmazonPrice(priceText || "");

      let availability = "unknown";
      const normalizedAvailability = String(
        availabilityText || "",
      ).toLowerCase();

      if (
        normalizedAvailability.includes("in stock") ||
        normalizedAvailability.includes("disponible") ||
        normalizedAvailability.includes("available")
      ) {
        availability = "in_stock";
      } else if (
        normalizedAvailability.includes("out of stock") ||
        normalizedAvailability.includes("no disponible") ||
        normalizedAvailability.includes("temporarily out of stock")
      ) {
        availability = "out_of_stock";
      }

      if (!price) {
        return {
          success: false,
          errorCode: "PRICE_NOT_FOUND",
          message: "Could not extract price from Amazon page.",
          store: "amazon",
          source: "amazon-playwright",
          availability,
          raw: {
            asin,
            title,
            priceText,
            availabilityText,
          },
        };
      }

      return {
        success: true,
        price,
        currency: wishlistItem.currency || "MXN",
        store: "amazon",
        source: "amazon-playwright",
        availability,

        title,

        metadata: {
          asin,
          rawPriceText: priceText,
          rawAvailabilityText: availabilityText,
        },
      };
    } catch (error) {
      return {
        success: false,
        errorCode: "SCRAPER_ERROR",
        message: error.message || "Unknown Amazon scraping error.",
        store: "amazon",
        source: "amazon-playwright",
        availability: "unknown",
      };
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }

      if (context) {
        await context.close().catch(() => {});
      }
    }
  },
};

module.exports = amazonProvider;

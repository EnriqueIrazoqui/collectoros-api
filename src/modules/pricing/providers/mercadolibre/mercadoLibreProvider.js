const { getBrowser } = require("../../../../services/playwrightBrowser");
const getTextBySelectors = require("../helpers/getTextBySelectors");
const parseMercadoLibrePrice = require("./parseMercadoLibrePrice");
const normalizeMercadoLibreAvailability = require("./normalizeMercadoLibreAvailability");

const mercadoLibreProvider = {
  id: "mercadolibre",

  canHandle(purchaseUrl = "") {
    const normalizedUrl = String(purchaseUrl).toLowerCase();

    return (
      normalizedUrl.includes("mercadolibre.com") ||
      normalizedUrl.includes("mercadolibre.com.mx") ||
      normalizedUrl.includes("articulo.mercadolibre")
    );
  },

  async fetch(wishlistItem) {
    const purchaseUrl = wishlistItem?.purchaseUrl || "";

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

      const normalizedTitle = String(title || "").toLowerCase();

      if (
        normalizedTitle.includes("captcha") ||
        normalizedTitle.includes("robot") ||
        normalizedTitle.includes("verifica que no eres un robot")
      ) {
        return {
          success: false,
          errorCode: "BOT_PROTECTION",
          message: "Mercado Libre bot protection detected.",
          store: "mercadolibre",
          source: "mercadolibre-playwright",
          availability: "unknown",
        };
      }

      const metaPrice = await page
        .locator('meta[itemprop="price"]')
        .first()
        .getAttribute("content")
        .catch(() => null);

      const priceSelectors = [
        '[data-testid="price-part"]',
        ".ui-pdp-price__second-line .andes-money-amount__fraction",
        ".ui-pdp-price__main-container .andes-money-amount__fraction",
        ".andes-money-amount__fraction",
        ".price-tag-fraction",
      ];

      const availabilitySelectors = [
        ".ui-pdp-buybox__quantity__available",
        ".ui-pdp-stock-information__title",
        ".ui-pdp-color--BLACK",
        ".ui-pdp-buybox .ui-pdp-color--BLACK",
      ];

      const priceText =
        metaPrice || (await getTextBySelectors(page, priceSelectors));
      const availabilityText = await getTextBySelectors(
        page,
        availabilitySelectors,
      );

      const price = parseMercadoLibrePrice(priceText || "");
      const availability = normalizeMercadoLibreAvailability(
        availabilityText || "",
      );

      if (!price) {
        return {
          success: false,
          errorCode: "PRICE_NOT_FOUND",
          message: "Could not extract price from Mercado Libre page.",
          store: "mercadolibre",
          source: "mercadolibre-playwright",
          availability,
          raw: {
            title,
            priceText,
            availabilityText,
            purchaseUrl,
          },
        };
      }

      return {
        success: true,
        price,
        currency: wishlistItem?.currency || "MXN",
        store: "mercadolibre",
        source: "mercadolibre-playwright",
        availability,

        title,

        metadata: {
          rawPriceText: priceText,
          rawAvailabilityText: availabilityText,
          purchaseUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        errorCode: "SCRAPER_ERROR",
        message: error.message || "Unknown Mercado Libre scraping error.",
        store: "mercadolibre",
        source: "mercadolibre-playwright",
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

module.exports = mercadoLibreProvider;

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

module.exports = getTextBySelectors;
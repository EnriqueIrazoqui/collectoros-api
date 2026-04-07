require("dotenv").config();
const amazonProvider = require("../src/modules/pricing/providers/amazon/amazonProvider");

async function main() {
  const result = await amazonProvider.fetch({
    purchaseUrl:
      "https://www.amazon.com.mx/Samsung-Galaxy-S25-Navy-128GB/dp/B0FLKYKKNC/?_encoding=UTF8&pd_rd_w=Lv4pO&content-id=amzn1.sym.e34e482b-23a6-48bd-8e7a-0f5d4108039a&pf_rd_p=e34e482b-23a6-48bd-8e7a-0f5d4108039a&pf_rd_r=1PW55YD0PM048WD991D1&pd_rd_wg=DNXne&pd_rd_r=202be2ee-d680-4983-8f0f-a57546b694fb&ref_=pd_hp_d_atf_unk",
    currency: "MXN",
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
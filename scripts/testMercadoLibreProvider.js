require("dotenv").config();
const fetchObservedPrice = require("../src/modules/pricing/services/fetchObservedPrice");

async function main() {
  const result = await fetchObservedPrice({
    purchaseUrl:
      "https://www.mercadolibre.com.mx/teclado-alambrico-gaming-pro-x-tkl-rapid-color-blanco-logitech/p/MLM46182342#reco_item_pos=0&reco_backend=item_decorator&reco_backend_type=function&reco_client=home_items-decorator-legacy&reco_id=6bf66e26-6b86-4d58-9959-b4004c68876e&reco_model=&c_id=/home/navigation-trends-recommendations/element&c_uid=c1d8aae4-7b03-481a-9c59-6d37c55aae82&da_id=navigation_trend&da_position=0&id_origin=/home/dynamic_access&da_sort_algorithm=ranker",
    currency: "MXN",
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
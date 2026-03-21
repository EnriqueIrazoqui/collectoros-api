-- DropForeignKey
ALTER TABLE "price_history" DROP CONSTRAINT "price_history_item_id_fkey";

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "last_availability" TEXT,
ADD COLUMN     "last_provider_source" TEXT,
ADD COLUMN     "store" TEXT;

-- CreateIndex
CREATE INDEX "wishlist_items_store_idx" ON "wishlist_items"("store");

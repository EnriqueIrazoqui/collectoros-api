-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "is_tracking_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_availability" TEXT,
ADD COLUMN     "last_check_status" TEXT,
ADD COLUMN     "last_checked_at" TIMESTAMP(3),
ADD COLUMN     "last_error_message" TEXT,
ADD COLUMN     "last_price_change_at" TIMESTAMP(3),
ADD COLUMN     "last_provider_source" TEXT,
ADD COLUMN     "next_check_at" TIMESTAMP(3),
ADD COLUMN     "store" TEXT,
ADD COLUMN     "tracking_frequency_hours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "tracking_url" TEXT;

-- AlterTable
ALTER TABLE "price_history" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "previous_price" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "inventory_items_user_id_idx" ON "inventory_items"("user_id");

-- CreateIndex
CREATE INDEX "inventory_items_store_idx" ON "inventory_items"("store");

-- CreateIndex
CREATE INDEX "inventory_items_is_tracking_enabled_next_check_at_idx" ON "inventory_items"("is_tracking_enabled", "next_check_at");

-- CreateIndex
CREATE INDEX "inventory_items_last_checked_at_idx" ON "inventory_items"("last_checked_at");

-- CreateIndex
CREATE INDEX "price_history_item_id_idx" ON "price_history"("item_id");

-- CreateIndex
CREATE INDEX "price_history_item_id_created_at_idx" ON "price_history"("item_id", "created_at");

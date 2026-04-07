-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "is_tracking_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_check_status" TEXT,
ADD COLUMN     "last_checked_at" TIMESTAMP(3),
ADD COLUMN     "last_error_message" TEXT,
ADD COLUMN     "last_price_change_at" TIMESTAMP(3),
ADD COLUMN     "next_check_at" TIMESTAMP(3),
ADD COLUMN     "tracking_frequency_hours" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "wishlist_price_history" (
    "id" SERIAL NOT NULL,
    "wishlist_item_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "previous_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "source" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_alerts" (
    "id" SERIAL NOT NULL,
    "wishlist_item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "triggered_price" DOUBLE PRECISION,
    "previous_price" DOUBLE PRECISION,
    "target_price" DOUBLE PRECISION,
    "percentage_change" DOUBLE PRECISION,
    "metadata" JSONB,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_price_history_wishlist_item_id_idx" ON "wishlist_price_history"("wishlist_item_id");

-- CreateIndex
CREATE INDEX "wishlist_price_history_wishlist_item_id_detected_at_idx" ON "wishlist_price_history"("wishlist_item_id", "detected_at");

-- CreateIndex
CREATE INDEX "wishlist_alerts_user_id_status_triggered_at_idx" ON "wishlist_alerts"("user_id", "status", "triggered_at");

-- CreateIndex
CREATE INDEX "wishlist_alerts_wishlist_item_id_triggered_at_idx" ON "wishlist_alerts"("wishlist_item_id", "triggered_at");

-- CreateIndex
CREATE INDEX "wishlist_alerts_type_triggered_at_idx" ON "wishlist_alerts"("type", "triggered_at");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_items_is_tracking_enabled_next_check_at_idx" ON "wishlist_items"("is_tracking_enabled", "next_check_at");

-- CreateIndex
CREATE INDEX "wishlist_items_last_checked_at_idx" ON "wishlist_items"("last_checked_at");

-- AddForeignKey
ALTER TABLE "wishlist_price_history" ADD CONSTRAINT "wishlist_price_history_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_alerts" ADD CONSTRAINT "wishlist_alerts_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_alerts" ADD CONSTRAINT "wishlist_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

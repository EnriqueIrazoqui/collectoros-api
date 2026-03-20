-- CreateTable
CREATE TABLE "inventory_item_images" (
    "id" SERIAL NOT NULL,
    "inventory_item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "drive_item_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_item_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_item_images_inventory_item_id_idx" ON "inventory_item_images"("inventory_item_id");

-- CreateIndex
CREATE INDEX "inventory_item_images_user_id_idx" ON "inventory_item_images"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_images_inventory_item_id_position_key" ON "inventory_item_images"("inventory_item_id", "position");

-- AddForeignKey
ALTER TABLE "inventory_item_images" ADD CONSTRAINT "inventory_item_images_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_item_images" ADD CONSTRAINT "inventory_item_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

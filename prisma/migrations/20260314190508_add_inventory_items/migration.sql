-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "purchase_date" TIMESTAMP(3),
    "current_estimated_value" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "WhatsNewType" AS ENUM ('feature', 'improvement', 'fix', 'announcement');

-- CreateTable
CREATE TABLE "whats_new" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "summary" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "WhatsNewType" NOT NULL DEFAULT 'improvement',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whats_new_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_whats_new_views" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "whats_new_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_whats_new_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whats_new_is_published_published_at_idx" ON "whats_new"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "whats_new_created_by_idx" ON "whats_new"("created_by");

-- CreateIndex
CREATE INDEX "user_whats_new_views_user_id_viewed_at_idx" ON "user_whats_new_views"("user_id", "viewed_at");

-- CreateIndex
CREATE INDEX "user_whats_new_views_whats_new_id_idx" ON "user_whats_new_views"("whats_new_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_whats_new_views_user_id_whats_new_id_key" ON "user_whats_new_views"("user_id", "whats_new_id");

-- AddForeignKey
ALTER TABLE "whats_new" ADD CONSTRAINT "whats_new_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_whats_new_views" ADD CONSTRAINT "user_whats_new_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_whats_new_views" ADD CONSTRAINT "user_whats_new_views_whats_new_id_fkey" FOREIGN KEY ("whats_new_id") REFERENCES "whats_new"("id") ON DELETE CASCADE ON UPDATE CASCADE;

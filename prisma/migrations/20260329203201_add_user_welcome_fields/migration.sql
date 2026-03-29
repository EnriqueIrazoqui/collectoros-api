-- AlterTable
ALTER TABLE "users" ADD COLUMN     "has_seen_welcome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "welcome_seen_at" TIMESTAMP(3);

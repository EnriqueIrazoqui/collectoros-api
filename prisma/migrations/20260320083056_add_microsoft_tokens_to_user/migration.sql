-- AlterTable
ALTER TABLE "users" ADD COLUMN     "microsoft_access_token" TEXT,
ADD COLUMN     "microsoft_account_id" TEXT,
ADD COLUMN     "microsoft_refresh_token" TEXT,
ADD COLUMN     "microsoft_token_expires_at" TIMESTAMP(3);

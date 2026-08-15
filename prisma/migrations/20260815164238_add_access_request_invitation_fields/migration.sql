-- AlterTable
ALTER TABLE "access_requests" ADD COLUMN     "invitation_accepted_at" TIMESTAMP(3),
ADD COLUMN     "invitation_expires_at" TIMESTAMP(3),
ADD COLUMN     "invitation_token_hash" TEXT;

-- CreateIndex
CREATE INDEX "access_requests_invitation_token_hash_idx" ON "access_requests"("invitation_token_hash");

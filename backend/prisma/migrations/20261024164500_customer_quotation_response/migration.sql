-- Add customer quotation response fields, enum values, and constraints.
-- Rollback guide:
-- 1. In destructive rollback, export any Quotation records with status IN ('ACCEPTED', 'REJECTED') or non-null respondedAt.
-- 2. Drop constraints Quotation_response_metadata_check, Quotation_rejection_reason_check, Quotation_respondedById_fkey.
-- 3. Drop index Quotation_respondedById_respondedAt_idx.
-- 4. Drop columns respondedById, respondedAt, rejectionReason from Quotation.

-- AlterEnum
ALTER TYPE "QuotationStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "QuotationStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN "respondedById" TEXT,
ADD COLUMN "respondedAt" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX "Quotation_respondedById_respondedAt_idx" ON "Quotation"("respondedById", "respondedAt");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraints
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_response_metadata_check" CHECK (
  ("status" NOT IN ('ACCEPTED', 'REJECTED') AND "respondedAt" IS NULL AND "respondedById" IS NULL) OR
  ("status" IN ('ACCEPTED', 'REJECTED') AND "respondedAt" IS NOT NULL AND "respondedById" IS NOT NULL)
);

ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_rejection_reason_check" CHECK (
  ("status" = 'REJECTED') OR ("rejectionReason" IS NULL)
);

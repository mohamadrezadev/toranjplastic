-- Backup before deploy: export quotation tables with pg_dump once rows exist.
-- Application rollback is additive-safe. Destructive rollback must export quotation rows first,
-- then drop QuotationItem, Quotation, and QuotationStatus in that order.

CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'SUPERSEDED');

CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "editVersion" INTEGER NOT NULL DEFAULT 0,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotalRials" BIGINT NOT NULL,
    "discountRials" BIGINT NOT NULL DEFAULT 0,
    "taxRials" BIGINT NOT NULL DEFAULT 0,
    "additionalCostRials" BIGINT NOT NULL DEFAULT 0,
    "totalRials" BIGINT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "deliveryTerms" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "sentById" TEXT,
    "sentAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Quotation_positive_version_check" CHECK ("version" > 0 AND "editVersion" >= 0),
    CONSTRAINT "Quotation_nonnegative_amounts_check" CHECK ("subtotalRials" >= 0 AND "discountRials" >= 0 AND "taxRials" >= 0 AND "additionalCostRials" >= 0 AND "totalRials" >= 0),
    CONSTRAINT "Quotation_total_check" CHECK ("totalRials" = "subtotalRials" - "discountRials" + "taxRials" + "additionalCostRials"),
    CONSTRAINT "Quotation_send_metadata_check" CHECK (("status" = 'DRAFT' AND "sentAt" IS NULL AND "sentById" IS NULL) OR ("status" <> 'DRAFT' AND "sentAt" IS NOT NULL AND "sentById" IS NOT NULL))
);

CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPriceRials" BIGINT NOT NULL,
    "lineTotalRials" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QuotationItem_position_check" CHECK ("position" BETWEEN 1 AND 50),
    CONSTRAINT "QuotationItem_amounts_check" CHECK ("unitPriceRials" >= 0 AND "lineTotalRials" >= 0),
    CONSTRAINT "QuotationItem_quantity_format_check" CHECK ("quantity" ~ '^[0-9]+(\.[0-9]{1,3})?$')
);

CREATE UNIQUE INDEX "Quotation_inquiryId_version_key" ON "Quotation"("inquiryId", "version");
CREATE UNIQUE INDEX "Quotation_quotationNumber_version_key" ON "Quotation"("quotationNumber", "version");
CREATE UNIQUE INDEX "Quotation_one_draft_per_inquiry_key" ON "Quotation"("inquiryId") WHERE "status" = 'DRAFT';
CREATE UNIQUE INDEX "Quotation_one_current_sent_per_inquiry_key" ON "Quotation"("inquiryId") WHERE "status" = 'SENT';
CREATE INDEX "Quotation_inquiryId_status_version_idx" ON "Quotation"("inquiryId", "status", "version");
CREATE INDEX "Quotation_createdById_createdAt_idx" ON "Quotation"("createdById", "createdAt");
CREATE INDEX "Quotation_sentById_sentAt_idx" ON "Quotation"("sentById", "sentAt");
CREATE UNIQUE INDEX "QuotationItem_quotationId_position_key" ON "QuotationItem"("quotationId", "position");
CREATE INDEX "QuotationItem_quotationId_idx" ON "QuotationItem"("quotationId");

ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
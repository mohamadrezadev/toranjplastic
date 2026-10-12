CREATE TYPE "InquiryType" AS ENUM ('PRODUCT', 'INJECTION_SERVICE', 'MATERIAL', 'GENERAL_CONTACT');
CREATE TYPE "InquiryStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');
CREATE TYPE "MaterialRequestKind" AS ENUM ('PRICE_QUOTE', 'SUPPLY_REQUEST', 'AVAILABILITY_REVIEW');
CREATE TYPE "MaterialCondition" AS ENUM ('NEW', 'RECYCLED');

CREATE TABLE "Inquiry" (
  "id" TEXT NOT NULL,
  "type" "InquiryType" NOT NULL,
  "status" "InquiryStatus" NOT NULL DEFAULT 'SUBMITTED',
  "ownerId" TEXT NOT NULL,
  "productId" TEXT,
  "injectionServiceId" TEXT,
  "materialId" TEXT,
  "catalogItemName" TEXT,
  "description" TEXT,
  "approximateQuantity" TEXT,
  "quantityUnit" TEXT,
  "deliveryCity" TEXT,
  "requestedTiming" TEXT,
  "partDescription" TEXT,
  "moldStatus" TEXT,
  "materialName" TEXT,
  "color" TEXT,
  "materialRequestKind" "MaterialRequestKind",
  "polymerName" TEXT,
  "grade" TEXT,
  "brand" TEXT,
  "materialCondition" "MaterialCondition",
  "application" TEXT,
  "specifications" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InquiryStatusHistory" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "fromStatus" "InquiryStatus",
  "toStatus" "InquiryStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Inquiry_ownerId_createdAt_idx" ON "Inquiry"("ownerId", "createdAt");
CREATE INDEX "Inquiry_ownerId_type_createdAt_idx" ON "Inquiry"("ownerId", "type", "createdAt");
CREATE INDEX "Inquiry_ownerId_status_createdAt_idx" ON "Inquiry"("ownerId", "status", "createdAt");
CREATE INDEX "Inquiry_productId_idx" ON "Inquiry"("productId");
CREATE INDEX "Inquiry_injectionServiceId_idx" ON "Inquiry"("injectionServiceId");
CREATE INDEX "Inquiry_materialId_idx" ON "Inquiry"("materialId");
CREATE INDEX "InquiryStatusHistory_inquiryId_createdAt_idx" ON "InquiryStatusHistory"("inquiryId", "createdAt");
CREATE INDEX "InquiryStatusHistory_actorId_createdAt_idx" ON "InquiryStatusHistory"("actorId", "createdAt");

ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_injectionServiceId_fkey" FOREIGN KEY ("injectionServiceId") REFERENCES "InjectionService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InquiryStatusHistory" ADD CONSTRAINT "InquiryStatusHistory_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InquiryStatusHistory" ADD CONSTRAINT "InquiryStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

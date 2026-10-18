-- Additive media-management foundation.
-- Backup before deploy: capture a PostgreSQL dump and a checksum manifest of the media root.
-- Application rollback is non-destructive: deploy the previous application while retaining
-- these tables, columns, and stored files. Destructive rollback is allowed only after export;
-- drop MediaReference before MediaAsset and remove enum types last.

CREATE TYPE "MediaAssetStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'DELETION_PENDING', 'DELETED');
CREATE TYPE "MediaReferenceUsage" AS ENUM ('PRODUCT_GALLERY', 'ARTICLE_FEATURED');

ALTER TABLE "Product" ADD COLUMN "contentVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "contentVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PROCESSING',
    "objectPrefix" TEXT NOT NULL,
    "sourceChecksumSha256" TEXT,
    "sourceMimeType" TEXT,
    "sourceWidth" INTEGER,
    "sourceHeight" INTEGER,
    "variants" JSONB NOT NULL DEFAULT '[]',
    "defaultAlt" TEXT,
    "failureCode" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MediaAsset_dimensions_check" CHECK ("sourceWidth" IS NULL OR ("sourceWidth" > 0 AND "sourceHeight" > 0 AND ("sourceWidth"::BIGINT * "sourceHeight"::BIGINT) <= 40000000)),
    CONSTRAINT "MediaAsset_checksum_check" CHECK ("sourceChecksumSha256" IS NULL OR "sourceChecksumSha256" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "MediaAsset_mime_check" CHECK ("sourceMimeType" IS NULL OR "sourceMimeType" IN ('image/jpeg', 'image/png', 'image/webp')),
    CONSTRAINT "MediaAsset_alt_check" CHECK ("defaultAlt" IS NULL OR length(btrim("defaultAlt")) BETWEEN 1 AND 300),
    CONSTRAINT "MediaAsset_ready_metadata_check" CHECK ("status" IN ('PROCESSING', 'FAILED') OR ("sourceChecksumSha256" IS NOT NULL AND "sourceMimeType" IS NOT NULL AND "sourceWidth" IS NOT NULL AND "sourceHeight" IS NOT NULL AND "defaultAlt" IS NOT NULL AND jsonb_array_length("variants") > 0)),
    CONSTRAINT "MediaAsset_deleted_at_check" CHECK (("status" = 'DELETED' AND "deletedAt" IS NOT NULL) OR ("status" <> 'DELETED' AND "deletedAt" IS NULL))
);

CREATE TABLE "MediaReference" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "usage" "MediaReferenceUsage" NOT NULL,
    "productId" TEXT,
    "articleId" TEXT,
    "position" INTEGER,
    "alt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaReference_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MediaReference_owner_usage_check" CHECK (
      ("usage" = 'PRODUCT_GALLERY' AND "productId" IS NOT NULL AND "articleId" IS NULL AND "position" BETWEEN 0 AND 5)
      OR
      ("usage" = 'ARTICLE_FEATURED' AND "articleId" IS NOT NULL AND "productId" IS NULL AND "position" IS NULL)
    ),
    CONSTRAINT "MediaReference_alt_check" CHECK (length(btrim("alt")) BETWEEN 1 AND 300)
);

CREATE UNIQUE INDEX "MediaAsset_objectPrefix_key" ON "MediaAsset"("objectPrefix");
CREATE INDEX "MediaAsset_status_createdAt_idx" ON "MediaAsset"("status", "createdAt");
CREATE INDEX "MediaAsset_createdById_createdAt_idx" ON "MediaAsset"("createdById", "createdAt");
CREATE UNIQUE INDEX "MediaReference_productId_position_key" ON "MediaReference"("productId", "position");
CREATE UNIQUE INDEX "MediaReference_articleId_key" ON "MediaReference"("articleId");
CREATE INDEX "MediaReference_mediaAssetId_idx" ON "MediaReference"("mediaAssetId");
CREATE INDEX "MediaReference_usage_mediaAssetId_idx" ON "MediaReference"("usage", "mediaAssetId");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MediaReference" ADD CONSTRAINT "MediaReference_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MediaReference" ADD CONSTRAINT "MediaReference_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaReference" ADD CONSTRAINT "MediaReference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

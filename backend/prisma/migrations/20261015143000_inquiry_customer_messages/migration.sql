-- Inquiry messages are deliberately separate from staff-only internal notes.
CREATE TYPE "InquiryMessageSender" AS ENUM ('CUSTOMER', 'STAFF');

CREATE TABLE "InquiryMessage" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "senderType" "InquiryMessageSender" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InquiryMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InquiryMessage_inquiryId_createdAt_id_idx" ON "InquiryMessage"("inquiryId", "createdAt", "id");
CREATE INDEX "InquiryMessage_authorId_createdAt_idx" ON "InquiryMessage"("authorId", "createdAt");

ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_inquiryId_fkey"
  FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Inquiry"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "assignedAdminId" TEXT;

CREATE TABLE "InquiryInternalNote" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryInternalNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InquiryAssignmentHistory" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "fromAdminId" TEXT,
  "toAdminId" TEXT,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryAssignmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
CREATE INDEX "Inquiry_assignedAdminId_status_createdAt_idx" ON "Inquiry"("assignedAdminId", "status", "createdAt");
CREATE INDEX "InquiryInternalNote_inquiryId_createdAt_idx" ON "InquiryInternalNote"("inquiryId", "createdAt");
CREATE INDEX "InquiryInternalNote_authorId_createdAt_idx" ON "InquiryInternalNote"("authorId", "createdAt");
CREATE INDEX "InquiryAssignmentHistory_inquiryId_createdAt_idx" ON "InquiryAssignmentHistory"("inquiryId", "createdAt");
CREATE INDEX "InquiryAssignmentHistory_fromAdminId_createdAt_idx" ON "InquiryAssignmentHistory"("fromAdminId", "createdAt");
CREATE INDEX "InquiryAssignmentHistory_toAdminId_createdAt_idx" ON "InquiryAssignmentHistory"("toAdminId", "createdAt");
CREATE INDEX "InquiryAssignmentHistory_actorId_createdAt_idx" ON "InquiryAssignmentHistory"("actorId", "createdAt");

ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InquiryInternalNote" ADD CONSTRAINT "InquiryInternalNote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InquiryInternalNote" ADD CONSTRAINT "InquiryInternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InquiryAssignmentHistory" ADD CONSTRAINT "InquiryAssignmentHistory_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InquiryAssignmentHistory" ADD CONSTRAINT "InquiryAssignmentHistory_fromAdminId_fkey" FOREIGN KEY ("fromAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InquiryAssignmentHistory" ADD CONSTRAINT "InquiryAssignmentHistory_toAdminId_fkey" FOREIGN KEY ("toAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InquiryAssignmentHistory" ADD CONSTRAINT "InquiryAssignmentHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add fixed staff roles. PostgreSQL enum values are intentionally additive.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OPERATOR';

-- Existing accounts keep their role and begin at version zero.
ALTER TABLE "User" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;


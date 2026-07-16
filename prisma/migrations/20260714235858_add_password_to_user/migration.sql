-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT;

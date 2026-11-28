-- AlterTable
ALTER TABLE "DeviceCategory" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "tagline" TEXT;

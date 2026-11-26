-- CreateTable
CREATE TABLE "DesignCategory" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DesignCategory_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "deviceSlugs" TEXT[],
    "priceInPaise" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Design_slug_key" ON "Design"("slug");

-- CreateIndex
CREATE INDEX "Design_categorySlug_position_idx" ON "Design"("categorySlug", "position");

-- CreateIndex
CREATE INDEX "Design_active_idx" ON "Design"("active");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "DesignCategory"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

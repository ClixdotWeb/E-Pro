-- DropIndex
DROP INDEX "CartItem_cartId_variantId_key";

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

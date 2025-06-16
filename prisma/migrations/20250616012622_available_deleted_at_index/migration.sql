-- CreateIndex
CREATE INDEX "Product_available_deletedAt_idx" ON "Product"("available", "deletedAt");

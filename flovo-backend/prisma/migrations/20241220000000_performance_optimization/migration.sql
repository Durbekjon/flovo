-- CreateIndex
CREATE INDEX "idx_orders_user_created" ON "orders"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_orders_customer_contact" ON "orders"("customerContact");

-- CreateIndex
CREATE INDEX "idx_orders_user_status" ON "orders"("userId", "status");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "orders"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_user_created_status" ON "orders"("userId", "createdAt" DESC, "status");

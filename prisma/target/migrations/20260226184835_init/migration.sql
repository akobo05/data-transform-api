-- CreateTable
CREATE TABLE "ProcessedData" (
    "id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "transformed_text" TEXT NOT NULL,
    "strategy_used" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedData_pkey" PRIMARY KEY ("id")
);

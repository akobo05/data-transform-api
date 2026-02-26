-- CreateTable
CREATE TABLE "RawData" (
    "id" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawData_pkey" PRIMARY KEY ("id")
);

/*
  Warnings:

  - You are about to drop the `ProcessedData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ProcessedData";

-- CreateTable
CREATE TABLE "ClinicalRecord" (
    "id" TEXT NOT NULL,
    "person_source_value" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "condition_code" TEXT NOT NULL,
    "condition_description" TEXT NOT NULL,
    "visit_status" TEXT NOT NULL,
    "age_at_visit" INTEGER NOT NULL,
    "migrated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalRecord_pkey" PRIMARY KEY ("id")
);

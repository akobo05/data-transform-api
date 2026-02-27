/*
  Warnings:

  - You are about to drop the `RawData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RawData";

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "pac_cod" TEXT NOT NULL,
    "pac_primer_nombre" TEXT NOT NULL,
    "pac_apellido" TEXT NOT NULL,
    "pac_fec_nac" TEXT NOT NULL,
    "pac_genero" TEXT NOT NULL,
    "pac_dx" TEXT NOT NULL,
    "pac_dx_desc" TEXT NOT NULL,
    "pac_estado" TEXT NOT NULL,
    "pac_edad" INTEGER NOT NULL,
    "fec_registro" TEXT NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

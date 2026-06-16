-- AlterTable
ALTER TABLE "HistoriaClinica" DROP COLUMN "cie",
DROP COLUMN "datosExtra",
DROP COLUMN "diagnosticoDefinitivo",
DROP COLUMN "diagnosticoPresuntivo",
DROP COLUMN "examenFisico",
DROP COLUMN "motivo",
DROP COLUMN "plan",
DROP COLUMN "proximaCita",
DROP COLUMN "pulso",
ADD COLUMN     "enfCurso" TEXT,
ADD COLUMN     "enfInicio" TEXT,
ADD COLUMN     "enfRelato" TEXT,
ADD COLUMN     "examenGeneral" TEXT,
ADD COLUMN     "fc" TEXT,
ADD COLUMN     "fr" TEXT,
ADD COLUMN     "procedimientos" TEXT;

-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "antEpidemiologicos" TEXT,
ADD COLUMN     "antOtros" TEXT,
ADD COLUMN     "antPersonales" TEXT,
ADD COLUMN     "antQuirurgicos" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "familiarDni" TEXT,
ADD COLUMN     "familiarNombre" TEXT,
ADD COLUMN     "familiarParentesco" TEXT;

-- AlterTable
ALTER TABLE "Profesional" ADD COLUMN     "codigoSalud" TEXT,
ADD COLUMN     "consultorio" TEXT,
ADD COLUMN     "turno" TEXT;

-- CreateTable
CREATE TABLE "Diagnostico" (
    "id" SERIAL NOT NULL,
    "historiaId" INTEGER NOT NULL,
    "cie10" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tratamiento" (
    "id" SERIAL NOT NULL,
    "historiaId" INTEGER NOT NULL,
    "medicamento" TEXT NOT NULL,
    "presentacion" TEXT,
    "cantidad" TEXT,
    "dosis" TEXT,
    "dias" TEXT,

    CONSTRAINT "Tratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cie10" (
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Cie10_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE INDEX "Cie10_descripcion_idx" ON "Cie10"("descripcion");

-- AddForeignKey
ALTER TABLE "Diagnostico" ADD CONSTRAINT "Diagnostico_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "HistoriaClinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "HistoriaClinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;


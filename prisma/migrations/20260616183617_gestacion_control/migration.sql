-- DropForeignKey
ALTER TABLE "AntecedenteObstetrico" DROP CONSTRAINT "AntecedenteObstetrico_pacienteId_fkey";

-- AlterTable
ALTER TABLE "ControlPrenatal" ADD COLUMN     "consejeria" TEXT,
ADD COLUMN     "diagDefinitivo" TEXT,
ADD COLUMN     "exAux" TEXT,
ADD COLUMN     "gestacionId" INTEGER,
ADD COLUMN     "glucosa" TEXT,
ADD COLUMN     "hemoglobina" TEXT,
ADD COLUMN     "perfilBiofisico" TEXT,
ADD COLUMN     "presentacion" TEXT,
ADD COLUMN     "pulso" TEXT,
ADD COLUMN     "serologia" TEXT,
ADD COLUMN     "sulfatoFerroso" TEXT,
ADD COLUMN     "temperatura" TEXT,
ADD COLUMN     "vih" TEXT;

-- DropTable
DROP TABLE "AntecedenteObstetrico";

-- CreateTable
CREATE TABLE "Gestacion" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Abierta',
    "gestas" INTEGER,
    "partos" INTEGER,
    "abortos" INTEGER,
    "cesareas" INTEGER,
    "vaginales" INTEGER,
    "nacidosVivos" INTEGER,
    "viven" INTEGER,
    "nacidosMuertos" INTEGER,
    "fum" TIMESTAMP(3),
    "fpp" TIMESTAMP(3),
    "ecoeg" TEXT,
    "tipoSangre" TEXT,
    "factorRh" TEXT,
    "orina" TEXT,
    "urea" TEXT,
    "creatinina" TEXT,
    "bk" TEXT,
    "torch" TEXT,
    "observaciones" TEXT,
    "fechaCierre" TIMESTAMP(3),
    "motivoCierre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gestacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gestacion_pacienteId_idx" ON "Gestacion"("pacienteId");

-- CreateIndex
CREATE INDEX "Gestacion_estado_idx" ON "Gestacion"("estado");

-- CreateIndex
CREATE INDEX "ControlPrenatal_gestacionId_idx" ON "ControlPrenatal"("gestacionId");

-- AddForeignKey
ALTER TABLE "ControlPrenatal" ADD CONSTRAINT "ControlPrenatal_gestacionId_fkey" FOREIGN KEY ("gestacionId") REFERENCES "Gestacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestacion" ADD CONSTRAINT "Gestacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


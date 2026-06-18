-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "pediatrico" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ControlPrenatal" ADD COLUMN     "cerrada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaCierre" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "HistoriaClinica" ADD COLUMN     "cerrada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaCierre" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TipoConsulta" ADD COLUMN     "pediatrico" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HistoriaPediatrica" (
    "id" SERIAL NOT NULL,
    "consultaId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "especialistaId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cama" TEXT,
    "informante" TEXT,
    "lugarNacimiento" TEXT,
    "procedencia" TEXT,
    "seguro" TEXT,
    "madreNombre" TEXT,
    "padreNombre" TEXT,
    "servicioIngreso" TEXT,
    "referido" TEXT,
    "motivoConsulta" TEXT,
    "tiempoEnfermedad" TEXT,
    "formaInicio" TEXT,
    "relato" TEXT,
    "datosNegativos" TEXT,
    "funcionesBiologicas" TEXT,
    "revisionSistemas" TEXT,
    "antPerinatales" TEXT,
    "pesoNacer" TEXT,
    "tallaNacer" TEXT,
    "apgar" TEXT,
    "antNutricionales" TEXT,
    "desarrollo" TEXT,
    "escolaridad" TEXT,
    "inmunizaciones" TEXT,
    "antPatologicos" TEXT,
    "antFamiliares" TEXT,
    "antSocioeconomicos" TEXT,
    "peso" TEXT,
    "talla" TEXT,
    "pc" TEXT,
    "perimetroAbdominal" TEXT,
    "imc" TEXT,
    "fc" TEXT,
    "fr" TEXT,
    "ta" TEXT,
    "temperatura" TEXT,
    "percentiles" TEXT,
    "inspeccionGeneral" TEXT,
    "dxPatologia" TEXT,
    "dxCrecimiento" TEXT,
    "planEstudio" TEXT,
    "planManejo" TEXT,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCierre" TIMESTAMP(3),
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoriaPediatrica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoriaPediatrica_consultaId_key" ON "HistoriaPediatrica"("consultaId");

-- CreateIndex
CREATE INDEX "HistoriaPediatrica_pacienteId_idx" ON "HistoriaPediatrica"("pacienteId");

-- AddForeignKey
ALTER TABLE "HistoriaPediatrica" ADD CONSTRAINT "HistoriaPediatrica_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "TipoConsulta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "especialidad" TEXT,
    "prenatal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoConsulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pacienteId" INTEGER NOT NULL,
    "atencionId" INTEGER,
    "tipoConsultaId" INTEGER,
    "tipoNombre" TEXT NOT NULL,
    "especialidad" TEXT,
    "prenatal" BOOLEAN NOT NULL DEFAULT false,
    "especialistaId" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "sedeId" INTEGER,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriaClinica" (
    "id" SERIAL NOT NULL,
    "consultaId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "especialistaId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "presionArterial" TEXT,
    "pulso" TEXT,
    "temperatura" TEXT,
    "peso" TEXT,
    "talla" TEXT,
    "examenFisico" TEXT,
    "diagnosticoPresuntivo" TEXT,
    "diagnosticoDefinitivo" TEXT,
    "cie" TEXT,
    "plan" TEXT,
    "observaciones" TEXT,
    "proximaCita" TEXT,
    "datosExtra" JSONB,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoriaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlPrenatal" (
    "id" SERIAL NOT NULL,
    "consultaId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "especialistaId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "semanaGestacional" INTEGER,
    "peso" TEXT,
    "presionArterial" TEXT,
    "fcf" TEXT,
    "alturaUterina" TEXT,
    "movimientosFetales" TEXT,
    "edema" TEXT,
    "examenFisico" TEXT,
    "diagnostico" TEXT,
    "plan" TEXT,
    "proximaCita" TEXT,
    "observaciones" TEXT,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlPrenatal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntecedenteObstetrico" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "gestas" INTEGER,
    "partos" INTEGER,
    "abortos" INTEGER,
    "cesareas" INTEGER,
    "hijosVivos" INTEGER,
    "fum" TIMESTAMP(3),
    "fpp" TIMESTAMP(3),
    "tipoSangre" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AntecedenteObstetrico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consulta_pacienteId_idx" ON "Consulta"("pacienteId");

-- CreateIndex
CREATE INDEX "Consulta_estado_idx" ON "Consulta"("estado");

-- CreateIndex
CREATE INDEX "Consulta_fecha_idx" ON "Consulta"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "HistoriaClinica_consultaId_key" ON "HistoriaClinica"("consultaId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlPrenatal_consultaId_key" ON "ControlPrenatal"("consultaId");

-- CreateIndex
CREATE UNIQUE INDEX "AntecedenteObstetrico_pacienteId_key" ON "AntecedenteObstetrico"("pacienteId");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "Atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_tipoConsultaId_fkey" FOREIGN KEY ("tipoConsultaId") REFERENCES "TipoConsulta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_especialistaId_fkey" FOREIGN KEY ("especialistaId") REFERENCES "Profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPrenatal" ADD CONSTRAINT "ControlPrenatal_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntecedenteObstetrico" ADD CONSTRAINT "AntecedenteObstetrico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


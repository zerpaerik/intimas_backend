-- CreateTable
CREATE TABLE "PlantillaInforme" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaInforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resultado" (
    "id" SERIAL NOT NULL,
    "atencionItemId" INTEGER NOT NULL,
    "atencionId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipo" TEXT,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Completado',
    "plantillaId" INTEGER,
    "informeHtml" TEXT,
    "archivoNombre" TEXT,
    "archivoMime" TEXT,
    "archivoTamano" INTEGER,
    "archivoPath" TEXT,
    "laboratorioId" INTEGER,
    "profesionalId" INTEGER,
    "observaciones" TEXT,
    "fechaResultado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlantillaInforme_tipo_idx" ON "PlantillaInforme"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_atencionItemId_key" ON "Resultado"("atencionItemId");

-- CreateIndex
CREATE INDEX "Resultado_atencionId_idx" ON "Resultado"("atencionId");

-- CreateIndex
CREATE INDEX "Resultado_pacienteId_idx" ON "Resultado"("pacienteId");

-- CreateIndex
CREATE INDEX "Resultado_categoria_idx" ON "Resultado"("categoria");

-- CreateIndex
CREATE INDEX "Resultado_fechaResultado_idx" ON "Resultado"("fechaResultado");

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_atencionItemId_fkey" FOREIGN KEY ("atencionItemId") REFERENCES "AtencionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "Atencion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "PlantillaInforme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "Laboratorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

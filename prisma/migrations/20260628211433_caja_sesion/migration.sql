-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "cajaSesionId" INTEGER;

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "cajaSesionId" INTEGER;

-- CreateTable
CREATE TABLE "CajaSesion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sedeId" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'Abierta',
    "montoInicial" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "observacionApertura" TEXT,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "cerradaPorId" INTEGER,
    "observacionCierre" TEXT,
    "arqueo" JSONB,
    "totalIngresos" DECIMAL(10,2),
    "totalGastos" DECIMAL(10,2),
    "totalDiferencia" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaSesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CajaSesion_usuarioId_idx" ON "CajaSesion"("usuarioId");

-- CreateIndex
CREATE INDEX "CajaSesion_estado_idx" ON "CajaSesion"("estado");

-- CreateIndex
CREATE INDEX "CajaSesion_sedeId_idx" ON "CajaSesion"("sedeId");

-- CreateIndex
CREATE INDEX "CajaSesion_fechaApertura_idx" ON "CajaSesion"("fechaApertura");

-- CreateIndex
CREATE INDEX "Gasto_cajaSesionId_idx" ON "Gasto"("cajaSesionId");

-- CreateIndex
CREATE INDEX "Pago_cajaSesionId_idx" ON "Pago"("cajaSesionId");

-- AddForeignKey
ALTER TABLE "CajaSesion" ADD CONSTRAINT "CajaSesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaSesion" ADD CONSTRAINT "CajaSesion_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaSesion" ADD CONSTRAINT "CajaSesion_cerradaPorId_fkey" FOREIGN KEY ("cerradaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cajaSesionId_fkey" FOREIGN KEY ("cajaSesionId") REFERENCES "CajaSesion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_cajaSesionId_fkey" FOREIGN KEY ("cajaSesionId") REFERENCES "CajaSesion"("id") ON DELETE SET NULL ON UPDATE CASCADE;


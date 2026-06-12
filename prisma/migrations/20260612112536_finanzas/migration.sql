-- AlterTable
ALTER TABLE "Analisis" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "costo" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Atencion" DROP COLUMN "abono",
ADD COLUMN     "anulada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "anuladaAt" TIMESTAMP(3),
ADD COLUMN     "anuladaPorId" INTEGER,
ADD COLUMN     "motivoAnulacion" TEXT,
ADD COLUMN     "pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "saldo" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "AtencionItem" DROP COLUMN "abono",
DROP COLUMN "pago",
ALTER COLUMN "monto" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Paquete" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Servicio" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "atencionId" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" TEXT NOT NULL DEFAULT 'Efectivo',
    "tipo" TEXT NOT NULL DEFAULT 'ABONO_INICIAL',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sedeId" INTEGER,
    "usuarioId" INTEGER,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" TEXT NOT NULL DEFAULT 'Efectivo',
    "proveedor" TEXT,
    "sedeId" INTEGER,
    "usuarioId" INTEGER,
    "anulada" BOOLEAN NOT NULL DEFAULT false,
    "anuladaAt" TIMESTAMP(3),
    "anuladaPorId" INTEGER,
    "motivoAnulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pago_fecha_idx" ON "Pago"("fecha");

-- CreateIndex
CREATE INDEX "Pago_sedeId_idx" ON "Pago"("sedeId");

-- CreateIndex
CREATE INDEX "Pago_metodo_idx" ON "Pago"("metodo");

-- CreateIndex
CREATE INDEX "Pago_atencionId_idx" ON "Pago"("atencionId");

-- CreateIndex
CREATE INDEX "Pago_anulado_idx" ON "Pago"("anulado");

-- CreateIndex
CREATE INDEX "Gasto_fecha_idx" ON "Gasto"("fecha");

-- CreateIndex
CREATE INDEX "Gasto_sedeId_idx" ON "Gasto"("sedeId");

-- CreateIndex
CREATE INDEX "Gasto_categoria_idx" ON "Gasto"("categoria");

-- CreateIndex
CREATE INDEX "Gasto_anulada_idx" ON "Gasto"("anulada");

-- CreateIndex
CREATE INDEX "Atencion_sedeId_idx" ON "Atencion"("sedeId");

-- CreateIndex
CREATE INDEX "Atencion_anulada_idx" ON "Atencion"("anulada");

-- AddForeignKey
ALTER TABLE "Atencion" ADD CONSTRAINT "Atencion_anuladaPorId_fkey" FOREIGN KEY ("anuladaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "Atencion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


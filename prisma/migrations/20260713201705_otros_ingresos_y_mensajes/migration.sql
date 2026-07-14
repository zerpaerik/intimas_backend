-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "concepto" TEXT,
ALTER COLUMN "atencionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "deId" INTEGER NOT NULL,
    "paraId" INTEGER NOT NULL,
    "pacienteId" INTEGER,
    "asunto" TEXT,
    "cuerpo" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "leidoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mensaje_paraId_leido_idx" ON "Mensaje"("paraId", "leido");

-- CreateIndex
CREATE INDEX "Mensaje_deId_idx" ON "Mensaje"("deId");

-- CreateIndex
CREATE INDEX "Mensaje_createdAt_idx" ON "Mensaje"("createdAt");

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_deId_fkey" FOREIGN KEY ("deId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_paraId_fkey" FOREIGN KEY ("paraId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;


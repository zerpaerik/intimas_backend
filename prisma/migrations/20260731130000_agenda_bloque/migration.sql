-- CreateTable
CREATE TABLE "AgendaBloque" (
    "id" SERIAL NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "sedeId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "slotMin" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendaBloque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgendaBloque_medicoId_fecha_idx" ON "AgendaBloque"("medicoId", "fecha");

-- AddForeignKey
ALTER TABLE "AgendaBloque" ADD CONSTRAINT "AgendaBloque_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaBloque" ADD CONSTRAINT "AgendaBloque_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;


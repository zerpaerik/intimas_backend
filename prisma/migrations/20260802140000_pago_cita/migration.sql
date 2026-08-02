-- Enlaza los pagos al ledger con la cita: cada abono/cobro de cita es un Pago
-- fechado (cuenta en caja y reportes el día que se paga).
ALTER TABLE "Pago" ADD COLUMN "citaId" INTEGER;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Pago_citaId_idx" ON "Pago"("citaId");

-- Pago parcial en citas: monto abonado (el saldo = monto - pagado).
ALTER TABLE "Cita" ADD COLUMN "pagado" DECIMAL(10,2) NOT NULL DEFAULT 0;

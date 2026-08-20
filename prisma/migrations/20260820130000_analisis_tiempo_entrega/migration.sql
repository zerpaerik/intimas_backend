-- Tiempo de entrega del análisis: MENOS_24 (agrupa) | MAS_24 (individual).
-- Los análisis ya registrados quedan como MAS_24 (comportamiento actual, individual).
ALTER TABLE "Analisis" ADD COLUMN "tiempoEntrega" TEXT;
UPDATE "Analisis" SET "tiempoEntrega" = 'MAS_24' WHERE "tiempoEntrega" IS NULL;

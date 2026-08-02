-- Triaje (funciones vitales) en la consulta, llenado por recepción.
ALTER TABLE "Consulta" ADD COLUMN "triajePeso" TEXT;
ALTER TABLE "Consulta" ADD COLUMN "triajeFc" TEXT;
ALTER TABLE "Consulta" ADD COLUMN "triajeFr" TEXT;
ALTER TABLE "Consulta" ADD COLUMN "triajePa" TEXT;
ALTER TABLE "Consulta" ADD COLUMN "triajeTalla" TEXT;
ALTER TABLE "Consulta" ADD COLUMN "triajeTemp" TEXT;

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "gineco" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TipoConsulta" ADD COLUMN     "gineco" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: tipos/consultas ginecológicos existentes -> formato ginecológico + flag
UPDATE "TipoConsulta" SET "gineco" = true, "formato" = 'ginecologica'
  WHERE "especialidad" ILIKE '%gineco%';
UPDATE "Consulta" SET "gineco" = true
  WHERE "especialidad" ILIKE '%gineco%' OR "tipoNombre" ILIKE '%gineco%';

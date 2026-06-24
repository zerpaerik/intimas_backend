-- AlterTable
ALTER TABLE "TipoConsulta" ADD COLUMN     "formato" TEXT NOT NULL DEFAULT 'general';

-- Backfill desde los flags existentes
UPDATE "TipoConsulta" SET "formato" = CASE
  WHEN "pediatrico" THEN 'pediatrico'
  WHEN "prenatal"   THEN 'prenatal'
  ELSE 'general'
END;

-- Conversión cita -> atención: enlaza la atención con la cita de origen.
ALTER TABLE "Atencion" ADD COLUMN "citaId" INTEGER;
ALTER TABLE "Atencion" ADD CONSTRAINT "Atencion_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Atencion_citaId_idx" ON "Atencion"("citaId");

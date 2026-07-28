-- Colegiatura del doctor en su USUARIO + relación para jalarla en la historia que llena.
ALTER TABLE "User" ADD COLUMN "colegiatura" TEXT;
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

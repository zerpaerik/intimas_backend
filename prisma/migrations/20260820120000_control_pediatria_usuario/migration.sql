-- Relación usuario (médico que atendió) en control prenatal e historia pediátrica,
-- para imprimir al médico logueado en sus comprobantes (igual que la historia clínica).
ALTER TABLE "HistoriaPediatrica" ADD CONSTRAINT "HistoriaPediatrica_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlPrenatal" ADD CONSTRAINT "ControlPrenatal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

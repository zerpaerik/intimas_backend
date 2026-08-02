import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** Turno de caja abierto de la SEDE (no por usuario), o null. Acepta el cliente Prisma o una transacción. */
export async function getCajaAbierta(client: Prisma.TransactionClient, sedeId?: number | null) {
  if (!sedeId) return null;
  return client.cajaSesion.findFirst({
    where: { sedeId, estado: 'Abierta' },
    orderBy: { id: 'desc' },
  });
}

/** Exige un turno de caja abierto en la sede para registrar operaciones; lanza 403 si no hay. */
export async function requireCajaAbierta(client: Prisma.TransactionClient, sedeId?: number | null) {
  const caja = await getCajaAbierta(client, sedeId);
  if (!caja) {
    throw new ForbiddenException('No hay un turno de caja abierto en esta sede. Abre un turno para registrar operaciones.');
  }
  return caja;
}

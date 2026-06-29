import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** Caja abierta del usuario, o null. Acepta el cliente Prisma o una transacción. */
export async function getCajaAbierta(client: Prisma.TransactionClient, usuarioId?: number | null) {
  if (!usuarioId) return null;
  return client.cajaSesion.findFirst({
    where: { usuarioId, estado: 'Abierta' },
    orderBy: { id: 'desc' },
  });
}

/** Exige una caja abierta para registrar operaciones; lanza 403 si no hay. */
export async function requireCajaAbierta(client: Prisma.TransactionClient, usuarioId?: number | null) {
  const caja = await getCajaAbierta(client, usuarioId);
  if (!caja) {
    throw new ForbiddenException('Debes abrir tu caja antes de registrar operaciones.');
  }
  return caja;
}

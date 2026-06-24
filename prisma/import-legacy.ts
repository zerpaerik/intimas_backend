/**
 * Importa data del sistema viejo (Intimas Laravel) al esquema nuevo.
 * Lee el JSON generado por parse_intimas.py y carga pacientes / servicios / analisis.
 *
 * Idempotente: omite registros que ya existan (paciente por numDoc, servicio/analisis por nombre),
 * así que se puede correr varias veces sin duplicar.
 *
 * Uso:
 *   IMPORT_FILE=~/Downloads/intimas_import.json npx ts-node prisma/import-legacy.ts
 *   (DATABASE_URL define a qué base se importa: local o producción)
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const prisma = new PrismaClient();
const FILE = process.env.IMPORT_FILE || path.join(os.homedir(), 'Downloads', 'intimas_import.json');

type Pac = {
  nombres: string; apellidos: string; tipoDoc: string; numDoc: string;
  fechaNacimiento: string | null; sexo: string | null; telefono: string | null;
  email: string | null; ocupacion: string | null; estadoCivil: string | null; direccion: string | null;
};
type Ser = { nombre: string; tipo: string | null; precio: number; porcentajePers: number; porcentajeProf: number; porcentajeTecn: number };
type Ana = { nombre: string; precio: number; costo: number; porcentaje: number; tiempo: string | null; material: string | null };

const norm = (s: string) => (s || '').trim().toUpperCase();
const toDate = (d: string | null) => (d ? new Date(`${d}T12:00:00`) : null);

async function chunked<T>(rows: T[], size: number, fn: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
    process.stdout.write(`\r  ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
  if (rows.length) process.stdout.write('\n');
}

async function main() {
  if (!fs.existsSync(FILE)) {
    console.error(`No se encontró el archivo de importación: ${FILE}`);
    console.error('Genera primero el JSON con: python3 parse_intimas.py');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8')) as { pacientes: Pac[]; servicios: Ser[]; analisis: Ana[] };
  console.log(`Archivo: ${FILE}`);
  console.log(`Origen  -> pacientes:${data.pacientes.length} servicios:${data.servicios.length} analisis:${data.analisis.length}`);

  // ---- Servicios ----
  const servExist = new Set((await prisma.servicio.findMany({ select: { nombre: true } })).map((s) => norm(s.nombre)));
  const servNew = data.servicios.filter((s) => s.nombre && !servExist.has(norm(s.nombre)));
  console.log(`\nServicios nuevos: ${servNew.length} (ya existían ${servExist.size})`);
  await chunked(servNew, 500, (batch) =>
    prisma.servicio.createMany({
      data: batch.map((s) => ({
        nombre: s.nombre, tipo: s.tipo, precio: s.precio,
        porcentajePers: s.porcentajePers, porcentajeProf: s.porcentajeProf, porcentajeTecn: s.porcentajeTecn,
      })),
    }),
  );

  // ---- Análisis ----
  const anaExist = new Set((await prisma.analisis.findMany({ select: { nombre: true } })).map((a) => norm(a.nombre)));
  const anaNew = data.analisis.filter((a) => a.nombre && !anaExist.has(norm(a.nombre)));
  console.log(`Análisis nuevos: ${anaNew.length} (ya existían ${anaExist.size})`);
  await chunked(anaNew, 500, (batch) =>
    prisma.analisis.createMany({
      data: batch.map((a) => ({
        nombre: a.nombre, precio: a.precio, costo: a.costo, porcentaje: a.porcentaje, tiempo: a.tiempo, material: a.material,
      })),
    }),
  );

  // ---- Pacientes ----
  const pacExist = new Set((await prisma.paciente.findMany({ select: { numDoc: true } })).map((p) => norm(p.numDoc ?? '')));
  const pacNew = data.pacientes.filter((p) => p.numDoc && (p.nombres || p.apellidos) && !pacExist.has(norm(p.numDoc)));
  console.log(`Pacientes nuevos: ${pacNew.length} (ya existían ${pacExist.size})`);
  await chunked(pacNew, 1000, (batch) =>
    prisma.paciente.createMany({
      data: batch.map((p) => ({
        nombres: p.nombres || '—', apellidos: p.apellidos || '—', tipoDoc: p.tipoDoc, numDoc: p.numDoc,
        fechaNacimiento: toDate(p.fechaNacimiento), sexo: p.sexo, telefono: p.telefono,
        email: p.email, ocupacion: p.ocupacion, estadoCivil: p.estadoCivil, direccion: p.direccion,
      })),
    }),
  );

  const [tp, ts, ta] = await Promise.all([prisma.paciente.count(), prisma.servicio.count(), prisma.analisis.count()]);
  console.log(`\n✓ Importación completa. Totales en BD -> pacientes:${tp} servicios:${ts} analisis:${ta}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

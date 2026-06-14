import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);
const METODOS = ['Efectivo', 'Tarjeta', 'Depósito', 'Yape'];

function porMetodo(rows: { metodo: string; monto: Prisma.Decimal }[]) {
  const m: Record<string, Prisma.Decimal> = Object.fromEntries(METODOS.map((x) => [x, D(0)]));
  for (const r of rows) m[r.metodo] = (m[r.metodo] ?? D(0)).plus(r.monto);
  return m;
}
const sum = (rows: { monto: Prisma.Decimal }[]) => rows.reduce((s, r) => s.plus(r.monto), D(0));

function dayRange(fecha?: string) {
  const base = fecha ? new Date(`${fecha}T00:00:00`) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

@Injectable()
class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async ingresos(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const where: Prisma.PagoWhereInput = { anulado: false };
    if (params.desde || params.hasta) {
      where.fecha = {};
      if (params.desde) where.fecha.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) where.fecha.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    if (params.sedeId) where.sedeId = params.sedeId;

    const pagos = await this.prisma.pago.findMany({
      where,
      include: {
        sede: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true } },
        atencion: { select: { id: true, paciente: { select: { nombres: true, apellidos: true } } } },
      },
      orderBy: { fecha: 'desc' },
    });
    return { pagos, porMetodo: porMetodo(pagos), total: sum(pagos), cantidad: pagos.length };
  }

  async cuentasPorCobrar(params: { sedeId?: number }) {
    const where: Prisma.AtencionWhereInput = { anulada: false, saldo: { gt: 0 } };
    if (params.sedeId) where.sedeId = params.sedeId;
    const atenciones = await this.prisma.atencion.findMany({
      where,
      include: {
        paciente: { select: { id: true, nombres: true, apellidos: true, numDoc: true, telefono: true } },
        sede: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'asc' },
    });
    const totalAdeudado = atenciones.reduce((s, a) => s.plus(a.saldo), D(0));
    return { atenciones, totalAdeudado, cantidad: atenciones.length };
  }

  async cierreCaja(params: { fecha?: string; sedeId?: number }) {
    const { start, end } = dayRange(params.fecha);
    const sedeFilter = params.sedeId ? { sedeId: params.sedeId } : {};
    const [pagos, gastos] = await Promise.all([
      this.prisma.pago.findMany({ where: { anulado: false, fecha: { gte: start, lte: end }, ...sedeFilter } }),
      this.prisma.gasto.findMany({ where: { anulada: false, fecha: { gte: start, lte: end }, ...sedeFilter } }),
    ]);
    const totalIngresos = sum(pagos);
    const totalGastos = sum(gastos);
    return {
      fecha: start.toISOString().slice(0, 10),
      ingresos: { porMetodo: porMetodo(pagos), total: totalIngresos, cantidad: pagos.length },
      gastos: { porMetodo: porMetodo(gastos), total: totalGastos, cantidad: gastos.length },
      neto: totalIngresos.minus(totalGastos),
    };
  }

  /** Detalle por tipo de servicio (cada ítem de atención como fila), filtrable por sede. */
  async detallado(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const where: Prisma.AtencionWhereInput = { anulada: false };
    if (params.desde || params.hasta) {
      where.fecha = {};
      if (params.desde) where.fecha.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) where.fecha.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    if (params.sedeId) where.sedeId = params.sedeId;

    const atenciones = await this.prisma.atencion.findMany({
      where,
      include: {
        items: true,
        pagos: { where: { anulado: false } },
        paciente: { select: { id: true, nombres: true, apellidos: true, numDoc: true } },
        sede: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const rows: Array<{
      atencionId: number; fecha: Date; paciente: string; numDoc: string | null;
      sedeId: number | null; sede: string | null; tipoServicio: string; concepto: string;
      monto: Prisma.Decimal; metodos: string[]; estado: string;
    }> = [];
    const porTipo: Record<string, Prisma.Decimal> = {};

    for (const a of atenciones) {
      const metodos = [...new Set(a.pagos.map((p) => p.metodo))];
      for (const it of a.items) {
        rows.push({
          atencionId: a.id,
          fecha: a.fecha,
          paciente: `${a.paciente?.nombres ?? ''} ${a.paciente?.apellidos ?? ''}`.trim(),
          numDoc: a.paciente?.numDoc ?? null,
          sedeId: a.sedeId,
          sede: a.sede?.nombre ?? null,
          tipoServicio: it.kind,
          concepto: it.nombre,
          monto: it.monto,
          metodos,
          estado: a.estado,
        });
        porTipo[it.kind] = (porTipo[it.kind] ?? D(0)).plus(it.monto);
      }
    }
    const total = rows.reduce((s, r) => s.plus(r.monto), D(0));
    return { rows, porTipo, total, cantidad: rows.length };
  }
}

@Controller('reportes')
class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Get('ingresos') ingresos(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.ingresos({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @Get('cuentas-por-cobrar') cxc(@Query('sedeId') sedeId?: string) {
    return this.service.cuentasPorCobrar({ sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @Get('cierre-caja') cierre(@Query('fecha') fecha?: string, @Query('sedeId') sedeId?: string) {
    return this.service.cierreCaja({ fecha, sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @Get('detallado') detallado(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.detallado({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }
}

@Module({ controllers: [ReportesController], providers: [ReportesService] })
export class ReportesModule {}

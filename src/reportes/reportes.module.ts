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

  /** Resumen diario por método de pago (estilo reporte del sistema anterior):
   *  por día → Venta total, Efectivo, Tarjeta, Depósito, Yape, Egresos y Total (=Efectivo − Egresos). */
  async resumenDiario(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const pagoWhere: Prisma.PagoWhereInput = { anulado: false };
    const gastoWhere: Prisma.GastoWhereInput = { anulada: false };
    if (params.desde || params.hasta) {
      const f: Prisma.DateTimeFilter = {};
      if (params.desde) f.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) f.lte = new Date(`${params.hasta}T23:59:59.999`);
      pagoWhere.fecha = f;
      gastoWhere.fecha = f;
    }
    if (params.sedeId) { pagoWhere.sedeId = params.sedeId; gastoWhere.sedeId = params.sedeId; }

    const [pagos, gastos] = await Promise.all([
      this.prisma.pago.findMany({ where: pagoWhere, select: { monto: true, metodo: true, fecha: true } }),
      this.prisma.gasto.findMany({ where: gastoWhere, select: { monto: true, fecha: true } }),
    ]);

    // Día en Perú (UTC-5, sin horario de verano) para no partir los días por la noche.
    const diaPeru = (f: Date) => new Date(new Date(f).getTime() - 5 * 3600 * 1000).toISOString().slice(0, 10);
    type Dia = { fecha: string; efectivo: Prisma.Decimal; tarjeta: Prisma.Decimal; deposito: Prisma.Decimal; yape: Prisma.Decimal; egresos: Prisma.Decimal };
    const map = new Map<string, Dia>();
    const get = (k: string): Dia => {
      let d = map.get(k);
      if (!d) { d = { fecha: k, efectivo: D(0), tarjeta: D(0), deposito: D(0), yape: D(0), egresos: D(0) }; map.set(k, d); }
      return d;
    };
    for (const p of pagos) {
      const d = get(diaPeru(p.fecha));
      if (p.metodo === 'Efectivo') d.efectivo = d.efectivo.plus(p.monto);
      else if (p.metodo === 'Tarjeta') d.tarjeta = d.tarjeta.plus(p.monto);
      else if (p.metodo === 'Depósito') d.deposito = d.deposito.plus(p.monto);
      else if (p.metodo === 'Yape') d.yape = d.yape.plus(p.monto);
    }
    for (const g of gastos) get(diaPeru(g.fecha)).egresos = get(diaPeru(g.fecha)).egresos.plus(g.monto);

    const rows = [...map.values()]
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((d) => ({
        fecha: d.fecha,
        ventaTotal: d.efectivo.plus(d.tarjeta).plus(d.deposito).plus(d.yape),
        efectivo: d.efectivo,
        tarjeta: d.tarjeta,
        deposito: d.deposito,
        yape: d.yape,
        egresos: d.egresos,
        total: d.efectivo.minus(d.egresos),
      }));
    const col = (k: keyof (typeof rows)[number]) => rows.reduce((s, r) => s.plus(r[k] as Prisma.Decimal), D(0));
    const totales = {
      ventaTotal: col('ventaTotal'), efectivo: col('efectivo'), tarjeta: col('tarjeta'),
      deposito: col('deposito'), yape: col('yape'), egresos: col('egresos'), total: col('total'),
    };
    return { rows, totales, cantidad: rows.length, total: totales.ventaTotal };
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

  /** Producción por servicio: cantidad + monto por servicio (nombre) y por tipo (kind). */
  async porServicio(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const atencion: Prisma.AtencionWhereInput = { anulada: false };
    if (params.desde || params.hasta) {
      atencion.fecha = {};
      if (params.desde) atencion.fecha.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) atencion.fecha.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    if (params.sedeId) atencion.sedeId = params.sedeId;

    const grupos = await this.prisma.atencionItem.groupBy({
      by: ['kind', 'nombre'],
      where: { atencion },
      _count: true,
      _sum: { monto: true },
      orderBy: { _sum: { monto: 'desc' } },
    });
    const porServicio = grupos.map((g) => ({
      kind: g.kind,
      nombre: g.nombre,
      cantidad: g._count,
      monto: Number(g._sum.monto ?? 0),
    }));
    const tipoMap: Record<string, { cantidad: number; monto: number }> = {};
    for (const s of porServicio) {
      const t = (tipoMap[s.kind] ??= { cantidad: 0, monto: 0 });
      t.cantidad += s.cantidad;
      t.monto += s.monto;
    }
    const porTipo = Object.entries(tipoMap)
      .map(([kind, v]) => ({ kind, ...v }))
      .sort((a, b) => b.monto - a.monto);
    const total = porServicio.reduce(
      (s, x) => ({ cantidad: s.cantidad + x.cantidad, monto: s.monto + x.monto }),
      { cantidad: 0, monto: 0 },
    );
    return { porServicio, porTipo, total };
  }

  /** Productividad por profesional: consultas atendidas (especialista) y ecografías (informes). */
  async porProfesional(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const rango: Prisma.DateTimeFilter = {};
    if (params.desde) rango.gte = new Date(`${params.desde}T00:00:00`);
    if (params.hasta) rango.lte = new Date(`${params.hasta}T23:59:59.999`);
    const hasRango = !!(params.desde || params.hasta);
    const sedeId = params.sedeId;

    const [consGrp, ecoGrp] = await Promise.all([
      this.prisma.consulta.groupBy({
        by: ['especialistaId'],
        where: {
          especialistaId: { not: null },
          ...(hasRango ? { fecha: rango } : {}),
          ...(sedeId ? { sedeId } : {}),
        },
        _count: true,
      }),
      this.prisma.resultado.groupBy({
        by: ['profesionalId'],
        where: {
          categoria: 'Servicio',
          profesionalId: { not: null },
          ...(hasRango ? { fechaResultado: rango } : {}),
          ...(sedeId ? { atencion: { sedeId } } : {}),
        },
        _count: true,
      }),
    ]);

    const ids = [
      ...new Set(
        [...consGrp.map((c) => c.especialistaId), ...ecoGrp.map((e) => e.profesionalId)].filter(
          (x): x is number => x != null,
        ),
      ),
    ];
    const profs = ids.length
      ? await this.prisma.profesional.findMany({
          where: { id: { in: ids } },
          select: { id: true, nombres: true, apellidos: true, especialidad: true },
        })
      : [];
    const nombre = (id: number | null) => {
      const p = profs.find((x) => x.id === id);
      return p ? `${p.nombres} ${p.apellidos}`.trim() : '—';
    };
    const consultasPorProfesional = consGrp
      .map((c) => ({ profesionalId: c.especialistaId, profesional: nombre(c.especialistaId), cantidad: c._count }))
      .sort((a, b) => b.cantidad - a.cantidad);
    const ecografiasPorProfesional = ecoGrp
      .map((e) => ({ profesionalId: e.profesionalId, profesional: nombre(e.profesionalId), cantidad: e._count }))
      .sort((a, b) => b.cantidad - a.cantidad);
    return { consultasPorProfesional, ecografiasPorProfesional };
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

  @Get('resumen-diario') resumenDiario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.resumenDiario({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
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

  @Get('por-servicio') porServicio(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.porServicio({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @Get('por-profesional') porProfesional(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.porProfesional({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }
}

@Module({ controllers: [ReportesController], providers: [ReportesService] })
export class ReportesModule {}

import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PAGO_COLORS: Record<string, string> = {
  Efectivo: '#16a34a',
  Yape: '#e6007e',
  Tarjeta: '#0091d5',
  Depósito: '#7c3aed',
};
const ESTADO_COLORS: Record<string, string> = {
  Pagado: '#16a34a',
  Parcial: '#f5a623',
  Pendiente: '#ef4444',
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

@Injectable()
class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(sedeId?: number) {
    const sedeF = sedeId ? { sedeId } : {};
    const [ats, pagos, gastos, pacientes, profesionales, servicios, analisis, paquetes] = await Promise.all([
      this.prisma.atencion.findMany({
        where: { anulada: false, ...sedeF },
        include: { items: true, paciente: { select: { nombres: true, apellidos: true } } },
      }),
      this.prisma.pago.findMany({ where: { anulado: false, ...sedeF }, select: { monto: true, metodo: true, fecha: true } }),
      this.prisma.gasto.findMany({ where: { anulada: false, ...sedeF }, select: { monto: true, fecha: true } }),
      this.prisma.paciente.count(),
      this.prisma.profesional.count(),
      this.prisma.servicio.count(),
      this.prisma.analisis.count(),
      this.prisma.paquete.count(),
    ]);

    const now = new Date();
    const hoyPagos = pagos.filter((p) => sameDay(new Date(p.fecha), now));
    const hoyAts = ats.filter((a) => sameDay(new Date(a.fecha), now));
    const hoyGastos = gastos.filter((g) => sameDay(new Date(g.fecha), now));
    const byMetodo = (list: typeof pagos, metodo: string) =>
      list.filter((p) => p.metodo === metodo).reduce((s, p) => s + Number(p.monto), 0);
    const sumMonto = (list: { monto: unknown }[]) => list.reduce((s, x) => s + Number(x.monto), 0);

    const ingresosHoy = sumMonto(hoyPagos);
    const gastosHoy = sumMonto(hoyGastos);
    const kpisHoy = {
      efectivo: byMetodo(hoyPagos, 'Efectivo'),
      tarjeta: byMetodo(hoyPagos, 'Tarjeta'),
      deposito: byMetodo(hoyPagos, 'Depósito'),
      yape: byMetodo(hoyPagos, 'Yape'),
      total: ingresosHoy,
      gastos: gastosHoy,
      neto: ingresosHoy - gastosHoy,
      atenciones: hoyAts.length,
    };

    const ingresosPorDia: { dia: string; ingresos: number }[] = [];
    const atencionesPorDia: { dia: string; atenciones: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dia = String(d.getDate()).padStart(2, '0');
      ingresosPorDia.push({ dia, ingresos: sumMonto(pagos.filter((p) => sameDay(new Date(p.fecha), d))) });
      atencionesPorDia.push({ dia, atenciones: ats.filter((a) => sameDay(new Date(a.fecha), d)).length });
    }

    // Distribuciones del día
    const pagoTotals: Record<string, number> = {};
    for (const p of hoyPagos) pagoTotals[p.metodo] = (pagoTotals[p.metodo] ?? 0) + Number(p.monto);
    const metodosPago = Object.entries(pagoTotals)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: PAGO_COLORS[name] ?? '#64748b' }));

    const servCount: Record<string, number> = {};
    const estadoCount: Record<string, number> = {};
    for (const a of hoyAts) {
      estadoCount[a.estado] = (estadoCount[a.estado] ?? 0) + 1;
      for (const it of a.items) servCount[it.nombre] = (servCount[it.nombre] ?? 0) + 1;
    }
    const topServicios = Object.entries(servCount)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    const atencionesPorEstado = Object.entries(estadoCount).map(([name, value]) => ({
      name,
      value,
      color: ESTADO_COLORS[name] ?? '#64748b',
    }));

    const actividadReciente = [...ats]
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
      .slice(0, 5)
      .map((a) => ({
        titulo: `Atención · ${a.estado}`,
        detalle:
          `${a.paciente?.nombres ?? ''} ${a.paciente?.apellidos ?? ''}`.trim() +
          (a.items[0] ? ` · ${a.items[0].nombre}` : ''),
        hora: new Date(a.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        color: ESTADO_COLORS[a.estado] ?? '#64748b',
      }));

    return {
      kpisHoy,
      ingresosPorDia,
      atencionesPorDia,
      metodosPago,
      topServicios,
      atencionesPorEstado,
      actividadReciente,
      counts: { pacientes, profesionales, servicios, analisis, paquetes, atenciones: ats.length },
    };
  }
}

@Controller('dashboard')
class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get()
  get(@Query('sedeId') sedeId?: string) {
    return this.service.summary(sedeId ? Number(sedeId) : undefined);
  }
}

@Module({ controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}

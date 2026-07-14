import {
  Body, Controller, ForbiddenException, Get, Injectable, Module, NotFoundException,
  Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';
import { getCajaAbierta } from './caja.util';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);
const METODOS = ['Efectivo', 'Tarjeta', 'Depósito', 'Yape'];
const num = (d: Prisma.Decimal) => Number(d);

function agruparMetodo(rows: { metodo: string; monto: Prisma.Decimal }[]) {
  const m: Record<string, number> = Object.fromEntries(METODOS.map((x) => [x, 0]));
  for (const r of rows) m[r.metodo] = (m[r.metodo] ?? 0) + num(r.monto);
  return m;
}

class AbrirCajaDto {
  @IsOptional() @Type(() => Number) @IsNumber() montoInicial?: number;
  @IsOptional() @Type(() => Number) @IsNumber() sedeId?: number;
  @IsOptional() @IsString() observacion?: string;
}
class CerrarCajaDto {
  @IsOptional() @IsObject() arqueo?: Record<string, number>;
  @IsOptional() @IsString() observacion?: string;
}

type ReqUser = { sub?: number; roleId?: number; sedeId?: number };

@Injectable()
class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  private esAdmin(user: ReqUser) {
    return user.roleId === 1 || user.roleId === 12; // Administrador o Gerente
  }

  private async movimientos(cajaSesionId: number) {
    const [pagos, gastos] = await Promise.all([
      this.prisma.pago.findMany({ where: { cajaSesionId, anulado: false } }),
      this.prisma.gasto.findMany({ where: { cajaSesionId, anulada: false } }),
    ]);
    return { pagos, gastos };
  }

  /** Resumen vivo por método (ingresos, gastos, esperado en caja). */
  private resumen(caja: { montoInicial: Prisma.Decimal }, pagos: { metodo: string; monto: Prisma.Decimal }[], gastos: { metodo: string; monto: Prisma.Decimal }[]) {
    const ingresos = agruparMetodo(pagos);
    const gastosM = agruparMetodo(gastos);
    const inicial = num(caja.montoInicial);
    const esperado: Record<string, number> = {};
    for (const m of METODOS) esperado[m] = (ingresos[m] ?? 0) - (gastosM[m] ?? 0) + (m === 'Efectivo' ? inicial : 0);
    const totalIngresos = METODOS.reduce((s, m) => s + ingresos[m], 0);
    const totalGastos = METODOS.reduce((s, m) => s + gastosM[m], 0);
    return { montoInicial: inicial, ingresos, gastos: gastosM, esperado, totalIngresos, totalGastos, neto: totalIngresos - totalGastos };
  }

  async abrir(dto: AbrirCajaDto, user: ReqUser) {
    if (!user.sub) throw new ForbiddenException('Sesión inválida');
    const abierta = await getCajaAbierta(this.prisma, user.sub);
    if (abierta) throw new ForbiddenException('Ya tienes una caja abierta. Ciérrala antes de abrir otra.');
    return this.prisma.cajaSesion.create({
      data: {
        usuarioId: user.sub,
        sedeId: dto.sedeId ?? user.sedeId ?? null,
        montoInicial: D(dto.montoInicial ?? 0),
        observacionApertura: dto.observacion ?? null,
      },
    });
  }

  async actual(user: ReqUser) {
    const caja = await getCajaAbierta(this.prisma, user.sub);
    if (!caja) return { caja: null };
    const { pagos, gastos } = await this.movimientos(caja.id);
    return { caja, resumen: this.resumen(caja, pagos, gastos), cantidadPagos: pagos.length, cantidadGastos: gastos.length };
  }

  async cerrar(id: number, dto: CerrarCajaDto, user: ReqUser) {
    const caja = await this.prisma.cajaSesion.findUnique({ where: { id } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === 'Cerrada') throw new ForbiddenException('La caja ya está cerrada');
    if (caja.usuarioId !== user.sub && user.roleId !== 1) {
      throw new ForbiddenException('Solo el dueño de la caja o un administrador puede cerrarla');
    }
    const { pagos, gastos } = await this.movimientos(id);
    const r = this.resumen(caja, pagos, gastos);
    const contado: Record<string, number> = {};
    const diferencia: Record<string, number> = {};
    let totalDif = 0;
    for (const m of METODOS) {
      contado[m] = Number(dto.arqueo?.[m] ?? 0);
      diferencia[m] = contado[m] - r.esperado[m];
      totalDif += diferencia[m];
    }
    const arqueo = { montoInicial: r.montoInicial, ingresos: r.ingresos, gastos: r.gastos, esperado: r.esperado, contado, diferencia };
    return this.prisma.cajaSesion.update({
      where: { id },
      data: {
        estado: 'Cerrada',
        fechaCierre: new Date(),
        cerradaPorId: user.sub ?? null,
        observacionCierre: dto.observacion ?? null,
        arqueo,
        totalIngresos: D(r.totalIngresos),
        totalGastos: D(r.totalGastos),
        totalDiferencia: D(totalDif),
      },
    });
  }

  async listar(params: { sedeId?: number; usuarioId?: number; estado?: string; desde?: string; hasta?: string }, user: ReqUser) {
    const where: Prisma.CajaSesionWhereInput = {};
    if (!this.esAdmin(user)) where.usuarioId = user.sub;
    else if (params.usuarioId) where.usuarioId = params.usuarioId;
    if (params.sedeId) where.sedeId = params.sedeId;
    if (params.estado) where.estado = params.estado;
    if (params.desde || params.hasta) {
      where.fechaApertura = {};
      if (params.desde) where.fechaApertura.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) where.fechaApertura.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    return this.prisma.cajaSesion.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true } },
        sede: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaApertura: 'desc' },
    });
  }

  async detalle(id: number, user: ReqUser) {
    const caja = await this.prisma.cajaSesion.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombre: true } },
        sede: { select: { id: true, nombre: true } },
        cerradaPor: { select: { id: true, nombre: true } },
      },
    });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (!this.esAdmin(user) && caja.usuarioId !== user.sub) throw new ForbiddenException('No autorizado');
    const [pagos, gastos] = await Promise.all([
      this.prisma.pago.findMany({
        where: { cajaSesionId: id },
        include: { atencion: { select: { id: true, paciente: { select: { nombres: true, apellidos: true } } } } },
        orderBy: { fecha: 'asc' },
      }),
      this.prisma.gasto.findMany({ where: { cajaSesionId: id }, orderBy: { fecha: 'asc' } }),
    ]);
    const resumen = this.resumen(caja, pagos.filter((p) => !p.anulado), gastos.filter((g) => !g.anulada));
    // Resumen por tipo de servicio: ítems de las atenciones cobradas en el turno.
    const atencionIds = [...new Set(pagos.filter((p) => !p.anulado).map((p) => p.atencionId).filter((x): x is number => x != null))];
    const porTipoServicio: Record<string, number> = {};
    if (atencionIds.length) {
      const items = await this.prisma.atencionItem.findMany({ where: { atencionId: { in: atencionIds } } });
      for (const it of items) porTipoServicio[it.kind] = (porTipoServicio[it.kind] ?? 0) + Number(it.monto);
    }
    return { caja, resumen, pagos, gastos, porTipoServicio };
  }
}

@Controller('caja')
class CajaController {
  constructor(private readonly service: CajaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('abrir') abrir(@Body() dto: AbrirCajaDto, @Req() req: { user: ReqUser }) {
    return this.service.abrir(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('actual') actual(@Req() req: { user: ReqUser }) {
    return this.service.actual(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get() listar(
    @Req() req: { user: ReqUser },
    @Query('sedeId') sedeId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.listar(
      { sedeId: sedeId ? Number(sedeId) : undefined, usuarioId: usuarioId ? Number(usuarioId) : undefined, estado, desde, hasta },
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cerrar') cerrar(@Param('id', ParseIntPipe) id: number, @Body() dto: CerrarCajaDto, @Req() req: { user: ReqUser }) {
    return this.service.cerrar(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id') detalle(@Param('id', ParseIntPipe) id: number, @Req() req: { user: ReqUser }) {
    return this.service.detalle(id, req.user);
  }
}

@Module({ imports: [AuthModule], controllers: [CajaController], providers: [CajaService] })
export class CajaModule {}

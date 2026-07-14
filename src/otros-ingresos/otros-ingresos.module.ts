import {
  BadRequestException, Body, Controller, Get, Injectable, Module,
  Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';
import { requireCajaAbierta } from '../caja/caja.util';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

// "Otros ingresos" = dinero que NO viene de una atención. Se guardan en el mismo
// ledger (Pago) con tipo OTRO_INGRESO y sin atención, para que cuenten solos en
// caja, dashboard y reportes (que suman todos los pagos no anulados).
class CreateOtroIngresoDto {
  @IsString() concepto: string;
  @Type(() => Number) @IsNumber() monto: number;
  @IsOptional() @IsString() metodo?: string;
  @IsOptional() @IsString() fecha?: string;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
}

const INCLUDE = {
  usuario: { select: { id: true, nombre: true } },
  sede: { select: { id: true, nombre: true } },
} satisfies Prisma.PagoInclude;

@Injectable()
class OtrosIngresosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { desde?: string; hasta?: string; sedeId?: number }) {
    const where: Prisma.PagoWhereInput = { tipo: 'OTRO_INGRESO' };
    if (params.desde || params.hasta) {
      where.fecha = {};
      if (params.desde) where.fecha.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) where.fecha.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    if (params.sedeId) where.sedeId = params.sedeId;
    return this.prisma.pago.findMany({ where, include: INCLUDE, orderBy: { fecha: 'desc' }, take: 300 });
  }

  async create(dto: CreateOtroIngresoDto, user: { sub?: number; sedeId?: number }) {
    if (!dto.concepto?.trim()) throw new BadRequestException('Indica el concepto del ingreso');
    if (!dto.monto || dto.monto <= 0) throw new BadRequestException('El monto debe ser mayor a 0');
    const caja = await requireCajaAbierta(this.prisma, user.sub);
    return this.prisma.pago.create({
      data: {
        atencionId: null,
        concepto: dto.concepto.trim(),
        monto: D(dto.monto),
        metodo: dto.metodo ?? 'Efectivo',
        tipo: 'OTRO_INGRESO',
        fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
        sedeId: dto.sedeId ?? user.sedeId ?? null,
        usuarioId: user.sub ?? null,
        cajaSesionId: caja.id,
      },
      include: INCLUDE,
    });
  }

  async anular(id: number) {
    const p = await this.prisma.pago.findUnique({ where: { id } });
    if (!p || p.tipo !== 'OTRO_INGRESO') throw new BadRequestException('Ingreso no encontrado');
    if (p.anulado) throw new BadRequestException('Este ingreso ya está anulado');
    return this.prisma.pago.update({ where: { id }, data: { anulado: true }, include: INCLUDE });
  }
}

@Controller('otros-ingresos')
class OtrosIngresosController {
  constructor(private readonly service: OtrosIngresosService) {}

  @Get() findAll(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.findAll({ desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @UseGuards(JwtAuthGuard)
  @Post() create(@Body() dto: CreateOtroIngresoDto, @Req() req: { user: { sub?: number; sedeId?: number } }) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/anular') anular(@Param('id', ParseIntPipe) id: number) {
    return this.service.anular(id);
  }
}

@Module({ imports: [AuthModule], controllers: [OtrosIngresosController], providers: [OtrosIngresosService] })
export class OtrosIngresosModule {}

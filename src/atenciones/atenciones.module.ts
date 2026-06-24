import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Injectable,
  Module, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

class ItemDto {
  @IsString() kind: string;
  @IsString() nombre: string;
  @Type(() => Number) @IsNumber() monto: number;
}
class PagoInputDto {
  @Type(() => Number) @IsNumber() monto: number;
  @IsString() metodo: string;
}
class ConsultaInputDto {
  @IsOptional() @Type(() => Number) @IsInt() tipoConsultaId?: number;
  @IsString() tipoNombre: string;
  @IsOptional() @IsString() especialidad?: string;
  @IsOptional() @IsBoolean() prenatal?: boolean;
  @IsOptional() @IsBoolean() pediatrico?: boolean;
  @IsOptional() @IsBoolean() gineco?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() especialistaId?: number;
}
class CreateAtencionDto {
  @Type(() => Number) @IsInt() pacienteId: number;
  @IsOptional() @IsString() origenTipo?: string;
  @IsOptional() @IsString() origenValor?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto) items: ItemDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PagoInputDto) pagos?: PagoInputDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ConsultaInputDto) consultas?: ConsultaInputDto[];
}
class UpdateAtencionDto extends PartialType(CreateAtencionDto) {}
class AnularDto {
  @IsString() motivo: string;
}
class CobroDto {
  @Type(() => Number) @IsNumber() monto: number;
  @IsString() metodo: string;
}

const INCLUDE = {
  items: true,
  pagos: { where: { anulado: false }, orderBy: { fecha: 'asc' as const } },
  paciente: true,
  usuario: { select: { id: true, nombre: true } },
  anuladaPor: { select: { id: true, nombre: true } },
  sede: { select: { id: true, nombre: true } },
  consultas: {
    include: {
      especialista: { select: { id: true, nombres: true, apellidos: true } },
      historia: { select: { id: true } },
      control: { select: { id: true } },
    },
  },
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

@Injectable()
class AtencionesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Recalcula total/pagado/saldo/estado dentro de una transacción. */
  private async recompute(tx: Prisma.TransactionClient, atencionId: number) {
    const [items, pagos] = await Promise.all([
      tx.atencionItem.findMany({ where: { atencionId } }),
      tx.pago.findMany({ where: { atencionId, anulado: false } }),
    ]);
    const total = items.reduce((s, i) => s.plus(i.monto), D(0));
    const pagado = pagos.reduce((s, p) => s.plus(p.monto), D(0));
    const saldo = total.minus(pagado);
    const estado = saldo.lte(0) ? 'Pagado' : pagado.lte(0) ? 'Pendiente' : 'Parcial';
    await tx.atencion.update({ where: { id: atencionId }, data: { total, pagado, saldo, estado } });
  }

  findAll(params: { search?: string; desde?: string; hasta?: string; sedeId?: number }) {
    const { search, desde, hasta, sedeId } = params;
    const where: Prisma.AtencionWhereInput = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(`${hasta}T23:59:59.999`);
    }
    if (sedeId) where.sedeId = sedeId;
    if (search) {
      where.paciente = {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { numDoc: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    return this.prisma.atencion.findMany({ where, include: INCLUDE, orderBy: { fecha: 'desc' } });
  }

  async findOne(id: number) {
    const a = await this.prisma.atencion.findUnique({ where: { id }, include: INCLUDE });
    if (!a) throw new NotFoundException(`Atención #${id} no encontrada`);
    return a;
  }

  create(dto: CreateAtencionDto, user: { sub?: number; sedeId?: number }) {
    return this.prisma.$transaction(async (tx) => {
      const at = await tx.atencion.create({
        data: {
          pacienteId: dto.pacienteId,
          origenTipo: dto.origenTipo ?? 'Personal',
          origenValor: dto.origenValor,
          observaciones: dto.observaciones,
          sedeId: dto.sedeId ?? null,
          usuarioId: user.sub ?? null,
          items: { create: dto.items.map((i) => ({ kind: i.kind, nombre: i.nombre, monto: D(i.monto) })) },
        },
      });
      const pagos = (dto.pagos ?? []).filter((p) => p.monto > 0);
      if (pagos.length) {
        await tx.pago.createMany({
          data: pagos.map((p) => ({
            atencionId: at.id,
            monto: D(p.monto),
            metodo: p.metodo,
            tipo: 'ABONO_INICIAL',
            sedeId: at.sedeId,
            usuarioId: at.usuarioId,
          })),
        });
      }
      const consultas = dto.consultas ?? [];
      if (consultas.length) {
        await tx.consulta.createMany({
          data: consultas.map((co) => ({
            pacienteId: dto.pacienteId,
            atencionId: at.id,
            tipoConsultaId: co.tipoConsultaId ?? null,
            tipoNombre: co.tipoNombre,
            especialidad: co.especialidad ?? null,
            prenatal: co.prenatal ?? false,
            pediatrico: co.pediatrico ?? false,
            gineco: co.gineco ?? false,
            especialistaId: co.especialistaId ?? null,
            estado: 'Pendiente',
            sedeId: at.sedeId,
            usuarioId: at.usuarioId,
          })),
        });
      }
      await this.recompute(tx, at.id);
      return tx.atencion.findUnique({ where: { id: at.id }, include: INCLUDE });
    });
  }

  async update(id: number, dto: UpdateAtencionDto, user: { sub?: number; roleId?: number }) {
    const existing = await this.findOne(id);
    if (existing.anulada) throw new BadRequestException('No se puede editar una atención anulada');
    const hoy = sameDay(new Date(existing.fecha), new Date());
    if (!hoy && user.roleId !== 1) {
      throw new ForbiddenException('Solo el Administrador puede editar atenciones de días anteriores');
    }
    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.atencionItem.deleteMany({ where: { atencionId: id } });
      }
      await tx.atencion.update({
        where: { id },
        data: {
          origenTipo: dto.origenTipo,
          origenValor: dto.origenValor,
          observaciones: dto.observaciones,
          ...(dto.items
            ? { items: { create: dto.items.map((i) => ({ kind: i.kind, nombre: i.nombre, monto: D(i.monto) })) } }
            : {}),
        },
      });
      await this.recompute(tx, id);
      return tx.atencion.findUnique({ where: { id }, include: INCLUDE });
    });
  }

  async addPago(id: number, dto: CobroDto, user: { sub?: number }) {
    const existing = await this.findOne(id);
    if (existing.anulada) throw new BadRequestException('La atención está anulada');
    if (dto.monto <= 0) throw new BadRequestException('El monto debe ser mayor a 0');
    if (D(dto.monto).gt(existing.saldo)) throw new BadRequestException('El monto supera el saldo pendiente');
    return this.prisma.$transaction(async (tx) => {
      await tx.pago.create({
        data: { atencionId: id, monto: D(dto.monto), metodo: dto.metodo, tipo: 'COBRO', sedeId: existing.sedeId, usuarioId: user.sub ?? null },
      });
      await this.recompute(tx, id);
      return tx.atencion.findUnique({ where: { id }, include: INCLUDE });
    });
  }

  async anular(id: number, dto: AnularDto, user: { sub?: number }) {
    const existing = await this.findOne(id);
    if (existing.anulada) throw new BadRequestException('La atención ya está anulada');
    if (!dto.motivo?.trim()) throw new BadRequestException('Debes indicar el motivo de la anulación');
    return this.prisma.$transaction(async (tx) => {
      await tx.pago.updateMany({ where: { atencionId: id }, data: { anulado: true } });
      await tx.atencion.update({
        where: { id },
        data: {
          anulada: true,
          anuladaAt: new Date(),
          anuladaPorId: user.sub ?? null,
          motivoAnulacion: dto.motivo.trim(),
          pagado: D(0),
          saldo: existing.total,
          estado: 'Pendiente',
        },
      });
      return tx.atencion.findUnique({ where: { id }, include: INCLUDE });
    });
  }
}

@Controller('atenciones')
class AtencionesController {
  constructor(private readonly service: AtencionesService) {}

  @Get() findAll(
    @Query('search') search?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.findAll({ search, desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined });
  }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post() create(@Body() dto: CreateAtencionDto, @Req() req: { user: { sub?: number } }) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAtencionDto, @Req() req: { user: { sub?: number; roleId?: number } }) {
    return this.service.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pagos') addPago(@Param('id', ParseIntPipe) id: number, @Body() dto: CobroDto, @Req() req: { user: { sub?: number } }) {
    return this.service.addPago(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/anular') anular(@Param('id', ParseIntPipe) id: number, @Body() dto: AnularDto, @Req() req: { user: { sub?: number } }) {
    return this.service.anular(id, dto, req.user);
  }
}

@Module({ imports: [AuthModule], controllers: [AtencionesController], providers: [AtencionesService] })
export class AtencionesModule {}

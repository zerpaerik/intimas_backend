import {
  BadRequestException, Body, Controller, Get, Injectable, Module, NotFoundException,
  Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

class CreateGastoDto {
  @IsString() descripcion: string;
  @Type(() => Number) @IsNumber() monto: number;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() nota?: string;
  @IsOptional() @IsString() metodo?: string;
  @IsOptional() @IsString() proveedor?: string;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsOptional() @Transform(({ value }) => (value ? new Date(value) : undefined)) fecha?: Date;
}
class UpdateGastoDto extends PartialType(CreateGastoDto) {}
class AnularDto {
  @IsString() motivo: string;
}

const INCLUDE = {
  sede: { select: { id: true, nombre: true } },
  usuario: { select: { id: true, nombre: true } },
};

@Injectable()
class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { search?: string; desde?: string; hasta?: string; sedeId?: number }) {
    const { search, desde, hasta, sedeId } = params;
    const where: Prisma.GastoWhereInput = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(`${hasta}T23:59:59.999`);
    }
    if (sedeId) where.sedeId = sedeId;
    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: 'insensitive' } },
        { categoria: { contains: search, mode: 'insensitive' } },
        { proveedor: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.gasto.findMany({ where, include: INCLUDE, orderBy: { fecha: 'desc' } });
  }

  async findOne(id: number) {
    const g = await this.prisma.gasto.findUnique({ where: { id }, include: INCLUDE });
    if (!g) throw new NotFoundException(`Gasto #${id} no encontrado`);
    return g;
  }

  create(dto: CreateGastoDto, user: { sub?: number }) {
    return this.prisma.gasto.create({
      data: {
        descripcion: dto.descripcion,
        monto: D(dto.monto),
        categoria: dto.categoria,
        nota: dto.nota,
        metodo: dto.metodo ?? 'Efectivo',
        proveedor: dto.proveedor,
        sedeId: dto.sedeId ?? null,
        usuarioId: user.sub ?? null,
        ...(dto.fecha ? { fecha: dto.fecha } : {}),
      },
      include: INCLUDE,
    });
  }

  async update(id: number, dto: UpdateGastoDto) {
    const existing = await this.findOne(id);
    if (existing.anulada) throw new BadRequestException('No se puede editar un gasto anulado');
    return this.prisma.gasto.update({
      where: { id },
      data: {
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        nota: dto.nota,
        metodo: dto.metodo,
        proveedor: dto.proveedor,
        sedeId: dto.sedeId,
        ...(dto.monto != null ? { monto: D(dto.monto) } : {}),
        ...(dto.fecha ? { fecha: dto.fecha } : {}),
      },
      include: INCLUDE,
    });
  }

  async anular(id: number, dto: AnularDto, user: { sub?: number }) {
    const existing = await this.findOne(id);
    if (existing.anulada) throw new BadRequestException('El gasto ya está anulado');
    if (!dto.motivo?.trim()) throw new BadRequestException('Debes indicar el motivo de la anulación');
    return this.prisma.gasto.update({
      where: { id },
      data: { anulada: true, anuladaAt: new Date(), anuladaPorId: user.sub ?? null, motivoAnulacion: dto.motivo.trim() },
      include: INCLUDE,
    });
  }
}

@Controller('gastos')
class GastosController {
  constructor(private readonly service: GastosService) {}

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
  @Post() create(@Body() dto: CreateGastoDto, @Req() req: { user: { sub?: number } }) {
    return this.service.create(dto, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGastoDto) {
    return this.service.update(id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/anular') anular(@Param('id', ParseIntPipe) id: number, @Body() dto: AnularDto, @Req() req: { user: { sub?: number } }) {
    return this.service.anular(id, dto, req.user);
  }
}

@Module({ imports: [AuthModule], controllers: [GastosController], providers: [GastosService] })
export class GastosModule {}

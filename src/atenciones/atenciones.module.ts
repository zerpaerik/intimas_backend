import {
  Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

class AtencionItemDto {
  @IsString() kind: string;
  @IsString() nombre: string;
  @Type(() => Number) @IsNumber() monto: number;
  @Type(() => Number) @IsNumber() abono: number;
  @IsString() pago: string;
}

class CreateAtencionDto {
  @Type(() => Number) @IsInt() pacienteId: number;
  @IsOptional() @IsString() origenTipo?: string;
  @IsOptional() @IsString() origenValor?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @Type(() => Number) @IsInt() usuarioId?: number;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AtencionItemDto)
  items: AtencionItemDto[];
}
class UpdateAtencionDto extends PartialType(CreateAtencionDto) {}

function totals(items: AtencionItemDto[]) {
  const total = items.reduce((a, b) => a + (b.monto || 0), 0);
  const abono = items.reduce((a, b) => a + (b.abono || 0), 0);
  const saldo = total - abono;
  const estado = saldo <= 0 ? 'Pagado' : abono <= 0 ? 'Pendiente' : 'Parcial';
  return { total, abono, saldo, estado };
}

const INCLUDE = { items: true, paciente: true, usuario: { select: { id: true, nombre: true } } };

@Injectable()
class AtencionesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { scope?: string; search?: string; desde?: string; hasta?: string }) {
    const { scope, search, desde, hasta } = params;
    const where: any = {};

    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(`${hasta}T23:59:59.999`);
    } else if (scope === 'hoy' || scope === 'anteriores') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.fecha = scope === 'hoy' ? { gte: start, lte: end } : { lt: start };
    }

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

  create(dto: CreateAtencionDto) {
    const { items, ...rest } = dto;
    return this.prisma.atencion.create({
      data: { ...rest, ...totals(items), items: { create: items } },
      include: INCLUDE,
    });
  }

  async update(id: number, dto: UpdateAtencionDto) {
    await this.findOne(id);
    const { items, ...rest } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.atencionItem.deleteMany({ where: { atencionId: id } });
      }
      return tx.atencion.update({
        where: { id },
        data: {
          ...rest,
          ...(items ? { ...totals(items), items: { create: items } } : {}),
        },
        include: INCLUDE,
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.atencion.delete({ where: { id } });
    return { id, deleted: true };
  }
}

@Controller('atenciones')
class AtencionesController {
  constructor(private readonly service: AtencionesService) {}

  @Get() findAll(
    @Query('scope') scope?: string,
    @Query('search') search?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ scope, search, desde, hasta });
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateAtencionDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAtencionDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [AtencionesController], providers: [AtencionesService] })
export class AtencionesModule {}

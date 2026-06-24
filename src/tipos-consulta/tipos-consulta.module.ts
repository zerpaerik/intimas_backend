import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

class CreateTipoConsultaDto {
  @IsString() nombre: string;
  @IsOptional() @Type(() => Number) @IsNumber() precio?: number;
  @IsOptional() @IsString() especialidad?: string;
  @IsOptional() @IsIn(['general', 'prenatal', 'pediatrico']) formato?: string;
}
class UpdateTipoConsultaDto extends PartialType(CreateTipoConsultaDto) {}

@Injectable()
class TiposConsultaService extends BaseCrudService {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.tipoConsulta, ['nombre', 'especialidad']);
  }
  /** Mantiene los flags prenatal/pediatrico en sincronía con el formato elegido. */
  private flags(dto: { formato?: string }) {
    if (dto.formato === undefined) return {};
    return { prenatal: dto.formato === 'prenatal', pediatrico: dto.formato === 'pediatrico' };
  }
  create(dto: CreateTipoConsultaDto) {
    return super.create({ ...dto, precio: dto.precio != null ? D(dto.precio) : undefined, ...this.flags(dto) });
  }
  update(id: number, dto: UpdateTipoConsultaDto) {
    return super.update(id, { ...dto, ...(dto.precio != null ? { precio: D(dto.precio) } : {}), ...this.flags(dto) });
  }
}

@Controller('tipos-consulta')
class TiposConsultaController {
  constructor(private readonly service: TiposConsultaService) {}
  @Get() findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post() create(@Body() dto: CreateTipoConsultaDto) {
    return this.service.create(dto);
  }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoConsultaDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

@Module({ controllers: [TiposConsultaController], providers: [TiposConsultaService] })
export class TiposConsultaModule {}

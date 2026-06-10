import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreatePaqueteDto {
  @IsString() nombre: string;
  @IsOptional() @Type(() => Number) @IsNumber() precio?: number;
  @IsOptional() @Type(() => Number) @IsNumber() porcentaje?: number;
  @IsOptional() @Type(() => Number) @IsInt() consultas?: number;
  @IsOptional() @Type(() => Number) @IsInt() controles?: number;
  /** IDs de servicios incluidos */
  @IsOptional() @IsArray() @IsInt({ each: true }) servicios?: number[];
  /** IDs de análisis incluidos */
  @IsOptional() @IsArray() @IsInt({ each: true }) analisis?: number[];
}
class UpdatePaqueteDto extends PartialType(CreatePaqueteDto) {}

const INCLUDE = { servicios: true, analisis: true };

@Injectable()
class PaquetesService extends BaseCrudService {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.paquete, ['nombre'], INCLUDE);
  }

  override create(dto: CreatePaqueteDto) {
    const { servicios, analisis, ...rest } = dto;
    return this.prisma.paquete.create({
      data: {
        ...rest,
        servicios: servicios?.length ? { connect: servicios.map((id) => ({ id })) } : undefined,
        analisis: analisis?.length ? { connect: analisis.map((id) => ({ id })) } : undefined,
      },
      include: INCLUDE,
    });
  }

  override async update(id: number, dto: UpdatePaqueteDto) {
    await this.findOne(id);
    const { servicios, analisis, ...rest } = dto;
    return this.prisma.paquete.update({
      where: { id },
      data: {
        ...rest,
        servicios: servicios ? { set: servicios.map((sid) => ({ id: sid })) } : undefined,
        analisis: analisis ? { set: analisis.map((aid) => ({ id: aid })) } : undefined,
      },
      include: INCLUDE,
    });
  }
}

@Controller('paquetes')
class PaquetesController {
  constructor(private readonly service: PaquetesService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreatePaqueteDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaqueteDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [PaquetesController], providers: [PaquetesService] })
export class PaquetesModule {}

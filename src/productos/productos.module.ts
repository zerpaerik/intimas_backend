import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreateProductoDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() unidad?: string;
  @IsOptional() @Type(() => Number) @IsInt() minimoCentral?: number;
  @IsOptional() @Type(() => Number) @IsInt() minimoLocal?: number;
}
class UpdateProductoDto extends PartialType(CreateProductoDto) {}

@Injectable()
class ProductosService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.producto, ['nombre', 'categoria', 'unidad']);
  }
}

@Controller('productos')
class ProductosController {
  constructor(private readonly service: ProductosService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateProductoDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [ProductosController], providers: [ProductosService] })
export class ProductosModule {}

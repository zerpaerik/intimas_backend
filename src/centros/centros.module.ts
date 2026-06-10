import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreateCentroDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() referencia?: string;
}
class UpdateCentroDto extends PartialType(CreateCentroDto) {}

@Injectable()
class CentrosService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.centro, ['nombre', 'direccion', 'referencia']);
  }
}

@Controller('centros')
class CentrosController {
  constructor(private readonly service: CentrosService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateCentroDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCentroDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [CentrosController], providers: [CentrosService] })
export class CentrosModule {}

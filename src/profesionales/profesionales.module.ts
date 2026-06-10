import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreateProfesionalDto {
  @IsString() nombres: string;
  @IsString() apellidos: string;
  @IsOptional() @IsString() cmp?: string;
  @IsOptional() @Transform(({ value }) => (value ? new Date(value) : null)) nacimiento?: Date;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() especialidad?: string;
  @IsOptional() @Type(() => Number) @IsInt() centroId?: number;
}
class UpdateProfesionalDto extends PartialType(CreateProfesionalDto) {}

@Injectable()
class ProfesionalesService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.profesional, ['nombres', 'apellidos', 'cmp', 'especialidad'], { centro: true });
  }
}

@Controller('profesionales')
class ProfesionalesController {
  constructor(private readonly service: ProfesionalesService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateProfesionalDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfesionalDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [ProfesionalesController], providers: [ProfesionalesService] })
export class ProfesionalesModule {}

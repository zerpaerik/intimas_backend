import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreateAnalisisDto {
  @IsString() nombre: string;
  @IsOptional() @Type(() => Number) @IsNumber() precio?: number;
  @IsOptional() @Type(() => Number) @IsNumber() costo?: number;
  @IsOptional() @Type(() => Number) @IsNumber() porcentaje?: number;
  @IsOptional() @IsString() tiempo?: string;
  @IsOptional() @IsString() material?: string;
}
class UpdateAnalisisDto extends PartialType(CreateAnalisisDto) {}

@Injectable()
class AnalisisService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.analisis, ['nombre', 'material']);
  }
}

@Controller('analisis')
class AnalisisController {
  constructor(private readonly service: AnalisisService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateAnalisisDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAnalisisDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [AnalisisController], providers: [AnalisisService] })
export class AnalisisModule {}

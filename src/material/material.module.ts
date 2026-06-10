import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreateMaterialDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() estatus?: string;
}
class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

@Injectable()
class MaterialService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.material, ['nombre', 'estatus']);
  }
}

@Controller('material')
class MaterialController {
  constructor(private readonly service: MaterialService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateMaterialDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaterialDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [MaterialController], providers: [MaterialService] })
export class MaterialModule {}

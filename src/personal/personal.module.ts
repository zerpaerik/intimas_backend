import {
  Body, Controller, Delete, Get, Injectable, Module, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'Sí' || value === 'Si' || value === 'true' || value === 1;

class CreatePersonalDto {
  @IsString() nombres: string;
  @IsString() apellidos: string;
  @IsOptional() @IsString() dni?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() cargo?: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @Transform(toBool) sesion?: boolean;
}
class UpdatePersonalDto extends PartialType(CreatePersonalDto) {}

@Injectable()
class PersonalService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.personal, ['nombres', 'apellidos', 'dni', 'cargo', 'email']);
  }
}

@Controller('personal')
class PersonalController {
  constructor(private readonly service: PersonalService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreatePersonalDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePersonalDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [PersonalController], providers: [PersonalService] })
export class PersonalModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { BaseCrudService } from '../common/base-crud.service';

class CreatePacienteDto {
  @IsString() nombres: string;
  @IsString() apellidos: string;
  @IsOptional() @IsString() tipoDoc?: string;
  @IsOptional() @IsString() numDoc?: string;
  @IsOptional() @Transform(({ value }) => (value ? new Date(value) : null)) fechaNacimiento?: Date;
  @IsOptional() @IsString() sexo?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() ocupacion?: string;
  @IsOptional() @IsString() estadoCivil?: string;
  @IsOptional() @IsString() direccion?: string;
}
class UpdatePacienteDto extends PartialType(CreatePacienteDto) {}

@Injectable()
class PacientesService extends BaseCrudService {
  constructor(prisma: PrismaService) {
    super(prisma.paciente, ['nombres', 'apellidos', 'numDoc', 'email', 'telefono']);
  }
}

@Controller('pacientes')
class PacientesController {
  constructor(private readonly service: PacientesService) {}

  @Get() findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post() create(@Body() dto: CreatePacienteDto) {
    return this.service.create(dto);
  }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePacienteDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

@Module({ controllers: [PacientesController], providers: [PacientesService] })
export class PacientesModule {}

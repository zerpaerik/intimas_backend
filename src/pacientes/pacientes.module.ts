import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
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
  @IsOptional() @IsString() alergias?: string;
  @IsOptional() @IsString() antPatologicos?: string;
  @IsOptional() @IsString() antFamiliares?: string;
  @IsOptional() @IsString() grupoSanguineo?: string;
}
class UpdatePacienteDto extends PartialType(CreatePacienteDto) {}

@Injectable()
class PacientesService extends BaseCrudService {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.paciente, ['nombres', 'apellidos', 'numDoc', 'email', 'telefono']);
  }

  async historial(id: number) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException(`Paciente #${id} no encontrado`);

    const atenciones = await this.prisma.atencion.findMany({
      where: { pacienteId: id, anulada: false },
      include: { items: true, pagos: { where: { anulado: false }, orderBy: { fecha: 'asc' } } },
      orderBy: { fecha: 'desc' },
    });

    const resultados = atenciones
      .flatMap((a) =>
        a.items
          .filter((i) => ['Laboratorio', 'Ecografía', 'Rayos X'].includes(i.kind))
          .map((i) => ({
            nombre: i.nombre,
            tipo: i.kind === 'Laboratorio' ? 'Laboratorio' : 'Servicio',
            fecha: a.fecha,
            estado: a.estado === 'Pagado' ? 'Entregado' : 'En proceso',
          })),
      )
      .slice(0, 10);

    return {
      antecedentes: {
        alergias: paciente.alergias,
        antPatologicos: paciente.antPatologicos,
        antFamiliares: paciente.antFamiliares,
        grupoSanguineo: paciente.grupoSanguineo,
      },
      atenciones,
      resultados,
      stats: { atenciones: atenciones.length, resultados: resultados.length },
    };
  }
}

@Controller('pacientes')
class PacientesController {
  constructor(private readonly service: PacientesService) {}

  @Get() findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }
  @Get(':id/historial') historial(@Param('id', ParseIntPipe) id: number) {
    return this.service.historial(id);
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

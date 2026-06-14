import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

const PACIENTE_SEL = { id: true, nombres: true, apellidos: true, numDoc: true, sexo: true, fechaNacimiento: true };
const ESP_SEL = { id: true, nombres: true, apellidos: true, especialidad: true };

const CONSULTA_INCLUDE = {
  paciente: { select: PACIENTE_SEL },
  especialista: { select: ESP_SEL },
  tipoConsulta: { select: { id: true, nombre: true } },
  historia: true,
  control: true,
};

class HistoriaDto {
  @IsOptional() @IsString() motivo?: string;
  @IsOptional() @IsString() presionArterial?: string;
  @IsOptional() @IsString() pulso?: string;
  @IsOptional() @IsString() temperatura?: string;
  @IsOptional() @IsString() peso?: string;
  @IsOptional() @IsString() talla?: string;
  @IsOptional() @IsString() examenFisico?: string;
  @IsOptional() @IsString() diagnosticoPresuntivo?: string;
  @IsOptional() @IsString() diagnosticoDefinitivo?: string;
  @IsOptional() @IsString() cie?: string;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsString() proximaCita?: string;
  @IsOptional() @Type(() => Number) @IsInt() especialistaId?: number;
}

class ControlDto {
  @IsOptional() @Type(() => Number) @IsInt() semanaGestacional?: number;
  @IsOptional() @IsString() peso?: string;
  @IsOptional() @IsString() presionArterial?: string;
  @IsOptional() @IsString() fcf?: string;
  @IsOptional() @IsString() alturaUterina?: string;
  @IsOptional() @IsString() movimientosFetales?: string;
  @IsOptional() @IsString() edema?: string;
  @IsOptional() @IsString() examenFisico?: string;
  @IsOptional() @IsString() diagnostico?: string;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsString() proximaCita?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @Type(() => Number) @IsInt() especialistaId?: number;
}

class AntecedentesDto {
  @IsOptional() @Type(() => Number) @IsInt() gestas?: number;
  @IsOptional() @Type(() => Number) @IsInt() partos?: number;
  @IsOptional() @Type(() => Number) @IsInt() abortos?: number;
  @IsOptional() @Type(() => Number) @IsInt() cesareas?: number;
  @IsOptional() @Type(() => Number) @IsInt() hijosVivos?: number;
  @IsOptional() @IsString() fum?: string;
  @IsOptional() @IsString() fpp?: string;
  @IsOptional() @IsString() tipoSangre?: string;
  @IsOptional() @IsString() observaciones?: string;
}

@Injectable()
class ConsultasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { estado?: string; desde?: string; hasta?: string; pacienteId?: number }) {
    const where: Prisma.ConsultaWhereInput = {};
    if (params.estado) where.estado = params.estado;
    if (params.pacienteId) where.pacienteId = params.pacienteId;
    if (params.desde || params.hasta) {
      where.fecha = {};
      if (params.desde) where.fecha.gte = new Date(`${params.desde}T00:00:00`);
      if (params.hasta) where.fecha.lte = new Date(`${params.hasta}T23:59:59.999`);
    }
    return this.prisma.consulta.findMany({ where, include: CONSULTA_INCLUDE, orderBy: { fecha: 'desc' } });
  }

  async findOne(id: number) {
    const c = await this.prisma.consulta.findUnique({ where: { id }, include: CONSULTA_INCLUDE });
    if (!c) throw new NotFoundException(`Consulta #${id} no encontrada`);
    return c;
  }

  async historias(pacienteId?: number) {
    return this.prisma.historiaClinica.findMany({
      where: pacienteId ? { pacienteId } : undefined,
      include: { consulta: { include: { paciente: { select: PACIENTE_SEL }, especialista: { select: ESP_SEL } } } },
      orderBy: { fecha: 'desc' },
    });
  }

  async controles(pacienteId?: number) {
    return this.prisma.controlPrenatal.findMany({
      where: pacienteId ? { pacienteId } : undefined,
      include: { consulta: { include: { paciente: { select: PACIENTE_SEL }, especialista: { select: ESP_SEL } } } },
      orderBy: { fecha: 'desc' },
    });
  }

  async guardarHistoria(id: number, dto: HistoriaDto, user: { sub?: number }) {
    const c = await this.findOne(id);
    const especialistaId = dto.especialistaId ?? c.especialistaId ?? null;
    const { especialistaId: _e, ...campos } = dto;
    await this.prisma.historiaClinica.upsert({
      where: { consultaId: id },
      create: { consultaId: id, pacienteId: c.pacienteId, especialistaId, usuarioId: user.sub ?? null, ...campos },
      update: { especialistaId, ...campos },
    });
    await this.prisma.consulta.update({
      where: { id },
      data: { estado: 'Atendida', ...(especialistaId ? { especialistaId } : {}) },
    });
    return this.findOne(id);
  }

  async guardarControl(id: number, dto: ControlDto, user: { sub?: number }) {
    const c = await this.findOne(id);
    const especialistaId = dto.especialistaId ?? c.especialistaId ?? null;
    const { especialistaId: _e, ...campos } = dto;
    await this.prisma.controlPrenatal.upsert({
      where: { consultaId: id },
      create: { consultaId: id, pacienteId: c.pacienteId, especialistaId, usuarioId: user.sub ?? null, ...campos },
      update: { especialistaId, ...campos },
    });
    await this.prisma.consulta.update({
      where: { id },
      data: { estado: 'Atendida', prenatal: true, ...(especialistaId ? { especialistaId } : {}) },
    });
    return this.findOne(id);
  }

  getAntecedentes(pacienteId: number) {
    return this.prisma.antecedenteObstetrico.findUnique({ where: { pacienteId } });
  }

  upsertAntecedentes(pacienteId: number, dto: AntecedentesDto) {
    const data = {
      ...dto,
      fum: dto.fum ? new Date(dto.fum) : null,
      fpp: dto.fpp ? new Date(dto.fpp) : null,
    };
    return this.prisma.antecedenteObstetrico.upsert({
      where: { pacienteId },
      create: { pacienteId, ...data },
      update: data,
    });
  }
}

@Controller('consultas')
class ConsultasController {
  constructor(private readonly service: ConsultasService) {}

  @Get() findAll(
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('pacienteId') pacienteId?: string,
  ) {
    return this.service.findAll({ estado, desde, hasta, pacienteId: pacienteId ? Number(pacienteId) : undefined });
  }

  @Get('historias') historias(@Query('pacienteId') pacienteId?: string) {
    return this.service.historias(pacienteId ? Number(pacienteId) : undefined);
  }

  @Get('controles') controles(@Query('pacienteId') pacienteId?: string) {
    return this.service.controles(pacienteId ? Number(pacienteId) : undefined);
  }

  @Get('antecedentes/:pacienteId') getAntecedentes(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.getAntecedentes(pacienteId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('antecedentes/:pacienteId') upsertAntecedentes(@Param('pacienteId', ParseIntPipe) pacienteId: number, @Body() dto: AntecedentesDto) {
    return this.service.upsertAntecedentes(pacienteId, dto);
  }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/historia') guardarHistoria(@Param('id', ParseIntPipe) id: number, @Body() dto: HistoriaDto, @Req() req: { user: { sub?: number } }) {
    return this.service.guardarHistoria(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/control') guardarControl(@Param('id', ParseIntPipe) id: number, @Body() dto: ControlDto, @Req() req: { user: { sub?: number } }) {
    return this.service.guardarControl(id, dto, req.user);
  }
}

@Module({ imports: [AuthModule], controllers: [ConsultasController], providers: [ConsultasService] })
export class ConsultasModule {}

import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

const toDate = (val?: string): Date | null =>
  !val ? null : new Date(/^\d{4}-\d{2}-\d{2}$/.test(val) ? `${val}T12:00:00` : val);

const PACIENTE_SEL = {
  id: true, nombres: true, apellidos: true, numDoc: true, tipoDoc: true, sexo: true, fechaNacimiento: true,
  telefono: true, facebook: true,
  antPersonales: true, antFamiliares: true, antEpidemiologicos: true, antQuirurgicos: true, antOtros: true,
  familiarNombre: true, familiarParentesco: true, familiarDni: true,
};
const ESP_SEL = { id: true, nombres: true, apellidos: true, especialidad: true, cmp: true, consultorio: true, turno: true, codigoSalud: true };

const CONSULTA_INCLUDE = {
  paciente: { select: PACIENTE_SEL },
  especialista: { select: ESP_SEL },
  tipoConsulta: { select: { id: true, nombre: true } },
  historia: { include: { diagnosticos: true, tratamientos: true } },
  control: { include: { gestacion: { include: { controles: { orderBy: { fecha: 'asc' as const } } } } } },
};

class DiagnosticoDto {
  @IsString() cie10: string;
  @IsOptional() @IsString() descripcion?: string;
}
class TratamientoDto {
  @IsString() medicamento: string;
  @IsOptional() @IsString() presentacion?: string;
  @IsOptional() @IsString() cantidad?: string;
  @IsOptional() @IsString() dosis?: string;
  @IsOptional() @IsString() dias?: string;
}

class HistoriaDto {
  @IsOptional() @IsString() enfInicio?: string;
  @IsOptional() @IsString() enfCurso?: string;
  @IsOptional() @IsString() enfRelato?: string;
  @IsOptional() @IsString() peso?: string;
  @IsOptional() @IsString() fc?: string;
  @IsOptional() @IsString() fr?: string;
  @IsOptional() @IsString() presionArterial?: string;
  @IsOptional() @IsString() talla?: string;
  @IsOptional() @IsString() temperatura?: string;
  @IsOptional() @IsString() examenGeneral?: string;
  @IsOptional() @IsString() procedimientos?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsString() antPersonales?: string;
  @IsOptional() @IsString() antFamiliares?: string;
  @IsOptional() @IsString() antEpidemiologicos?: string;
  @IsOptional() @IsString() antQuirurgicos?: string;
  @IsOptional() @IsString() antOtros?: string;
  @IsOptional() @IsString() familiarNombre?: string;
  @IsOptional() @IsString() familiarParentesco?: string;
  @IsOptional() @IsString() familiarDni?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DiagnosticoDto) diagnosticos?: DiagnosticoDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TratamientoDto) tratamientos?: TratamientoDto[];
  @IsOptional() @Type(() => Number) @IsInt() especialistaId?: number;
}

class GestacionDto {
  @IsOptional() @Type(() => Number) @IsInt() gestas?: number;
  @IsOptional() @Type(() => Number) @IsInt() partos?: number;
  @IsOptional() @Type(() => Number) @IsInt() abortos?: number;
  @IsOptional() @Type(() => Number) @IsInt() cesareas?: number;
  @IsOptional() @Type(() => Number) @IsInt() vaginales?: number;
  @IsOptional() @Type(() => Number) @IsInt() nacidosVivos?: number;
  @IsOptional() @Type(() => Number) @IsInt() viven?: number;
  @IsOptional() @Type(() => Number) @IsInt() nacidosMuertos?: number;
  @IsOptional() @IsString() fum?: string;
  @IsOptional() @IsString() fpp?: string;
  @IsOptional() @IsString() ecoeg?: string;
  @IsOptional() @IsString() tipoSangre?: string;
  @IsOptional() @IsString() factorRh?: string;
  @IsOptional() @IsString() orina?: string;
  @IsOptional() @IsString() urea?: string;
  @IsOptional() @IsString() creatinina?: string;
  @IsOptional() @IsString() bk?: string;
  @IsOptional() @IsString() torch?: string;
  @IsOptional() @IsString() observaciones?: string;
}

class ControlDto {
  @IsOptional() @ValidateNested() @Type(() => GestacionDto) gestacion?: GestacionDto;
  @IsOptional() @Type(() => Number) @IsInt() semanaGestacional?: number;
  @IsOptional() @IsString() peso?: string;
  @IsOptional() @IsString() temperatura?: string;
  @IsOptional() @IsString() presionArterial?: string;
  @IsOptional() @IsString() pulso?: string;
  @IsOptional() @IsString() alturaUterina?: string;
  @IsOptional() @IsString() presentacion?: string;
  @IsOptional() @IsString() fcf?: string;
  @IsOptional() @IsString() movimientosFetales?: string;
  @IsOptional() @IsString() edema?: string;
  @IsOptional() @IsString() consejeria?: string;
  @IsOptional() @IsString() sulfatoFerroso?: string;
  @IsOptional() @IsString() perfilBiofisico?: string;
  @IsOptional() @IsString() serologia?: string;
  @IsOptional() @IsString() glucosa?: string;
  @IsOptional() @IsString() vih?: string;
  @IsOptional() @IsString() hemoglobina?: string;
  @IsOptional() @IsString() examenFisico?: string;
  @IsOptional() @IsString() diagnostico?: string;
  @IsOptional() @IsString() diagDefinitivo?: string;
  @IsOptional() @IsString() exAux?: string;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsString() proximaCita?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @Type(() => Number) @IsInt() especialistaId?: number;
}

class CerrarDto {
  @IsOptional() @IsString() motivo?: string;
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
      include: {
        diagnosticos: true,
        consulta: { include: { paciente: { select: PACIENTE_SEL }, especialista: { select: ESP_SEL } } },
      },
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

  cie10(search?: string) {
    const where: Prisma.Cie10WhereInput = search
      ? { OR: [{ codigo: { contains: search, mode: 'insensitive' } }, { descripcion: { contains: search, mode: 'insensitive' } }] }
      : {};
    return this.prisma.cie10.findMany({ where, take: 25, orderBy: { codigo: 'asc' } });
  }

  async guardarHistoria(id: number, dto: HistoriaDto, user: { sub?: number }) {
    const c = await this.findOne(id);
    const especialistaId = dto.especialistaId ?? c.especialistaId ?? null;
    const {
      diagnosticos = [], tratamientos = [], especialistaId: _e,
      antPersonales, antFamiliares, antEpidemiologicos, antQuirurgicos, antOtros,
      familiarNombre, familiarParentesco, familiarDni, facebook,
      ...campos
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.paciente.update({
        where: { id: c.pacienteId },
        data: { antPersonales, antFamiliares, antEpidemiologicos, antQuirurgicos, antOtros, familiarNombre, familiarParentesco, familiarDni, facebook },
      });
      const h = await tx.historiaClinica.upsert({
        where: { consultaId: id },
        create: { consultaId: id, pacienteId: c.pacienteId, especialistaId, usuarioId: user.sub ?? null, ...campos },
        update: { especialistaId, ...campos },
      });
      await tx.diagnostico.deleteMany({ where: { historiaId: h.id } });
      if (diagnosticos.length) await tx.diagnostico.createMany({ data: diagnosticos.map((d) => ({ historiaId: h.id, cie10: d.cie10, descripcion: d.descripcion })) });
      await tx.tratamiento.deleteMany({ where: { historiaId: h.id } });
      if (tratamientos.length) await tx.tratamiento.createMany({ data: tratamientos.map((t) => ({ historiaId: h.id, medicamento: t.medicamento, presentacion: t.presentacion, cantidad: t.cantidad, dosis: t.dosis, dias: t.dias })) });
      await tx.consulta.update({ where: { id }, data: { estado: 'Atendida', ...(especialistaId ? { especialistaId } : {}) } });
      return tx.consulta.findUnique({ where: { id }, include: CONSULTA_INCLUDE });
    });
  }

  /** Carné de la gestación ABIERTA del paciente (antecedentes + controles). */
  async getCarne(pacienteId: number) {
    const gestacion = await this.prisma.gestacion.findFirst({
      where: { pacienteId, estado: 'Abierta' },
      orderBy: { id: 'desc' },
      include: { controles: { orderBy: { fecha: 'asc' } } },
    });
    return { gestacion, controles: gestacion?.controles ?? [] };
  }

  async guardarControl(id: number, dto: ControlDto, user: { sub?: number }) {
    const c = await this.findOne(id);
    const especialistaId = dto.especialistaId ?? c.especialistaId ?? null;
    const gd = dto.gestacion ?? {};
    const { gestacion: _g, especialistaId: _e, ...cf } = dto;

    return this.prisma.$transaction(async (tx) => {
      const gdata = {
        gestas: gd.gestas, partos: gd.partos, abortos: gd.abortos, cesareas: gd.cesareas, vaginales: gd.vaginales,
        nacidosVivos: gd.nacidosVivos, viven: gd.viven, nacidosMuertos: gd.nacidosMuertos,
        fum: toDate(gd.fum), fpp: toDate(gd.fpp), ecoeg: gd.ecoeg, tipoSangre: gd.tipoSangre, factorRh: gd.factorRh,
        orina: gd.orina, urea: gd.urea, creatinina: gd.creatinina, bk: gd.bk, torch: gd.torch, observaciones: gd.observaciones,
      };
      const abierta = await tx.gestacion.findFirst({ where: { pacienteId: c.pacienteId, estado: 'Abierta' }, orderBy: { id: 'desc' } });
      const gest = abierta
        ? await tx.gestacion.update({ where: { id: abierta.id }, data: gdata })
        : await tx.gestacion.create({ data: { pacienteId: c.pacienteId, ...gdata } });

      await tx.controlPrenatal.upsert({
        where: { consultaId: id },
        create: { consultaId: id, gestacionId: gest.id, pacienteId: c.pacienteId, especialistaId, usuarioId: user.sub ?? null, ...cf },
        update: { gestacionId: gest.id, especialistaId, ...cf },
      });
      await tx.consulta.update({ where: { id }, data: { estado: 'Atendida', prenatal: true, ...(especialistaId ? { especialistaId } : {}) } });
      return tx.consulta.findUnique({ where: { id }, include: CONSULTA_INCLUDE });
    });
  }

  async cerrarGestacion(gestacionId: number, motivo?: string) {
    const g = await this.prisma.gestacion.findUnique({ where: { id: gestacionId } });
    if (!g) throw new NotFoundException(`Gestación #${gestacionId} no encontrada`);
    return this.prisma.gestacion.update({
      where: { id: gestacionId },
      data: { estado: 'Cerrada', fechaCierre: new Date(), motivoCierre: motivo ?? null },
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

  @Get('carne/:pacienteId') carne(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.service.getCarne(pacienteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('gestacion/:gestacionId/cerrar') cerrar(@Param('gestacionId', ParseIntPipe) gestacionId: number, @Body() dto: CerrarDto) {
    return this.service.cerrarGestacion(gestacionId, dto.motivo);
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

@Controller('cie10')
class Cie10Controller {
  constructor(private readonly service: ConsultasService) {}
  @Get() buscar(@Query('search') search?: string) {
    return this.service.cie10(search);
  }
}

@Module({ imports: [AuthModule], controllers: [ConsultasController, Cie10Controller], providers: [ConsultasService] })
export class ConsultasModule {}

import {
  BadRequestException, Body, Controller, Get, Injectable, Module,
  Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);
const ESTADOS = ['Programada', 'Asistió', 'No asistió', 'Cancelada'];

class CreateCitaDto {
  @Type(() => Number) @IsInt() pacienteId: number;
  @Type(() => Number) @IsInt() medicoId: number;
  @IsString() fecha: string; // YYYY-MM-DD
  @IsString() hora: string; // HH:MM
  @IsOptional() @IsString() motivo?: string;
  @IsOptional() @Type(() => Number) @IsNumber() monto?: number;
  @IsOptional() @IsString() metodoPago?: string;
  @IsOptional() @IsString() estadoPago?: string;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsOptional() @IsString() observaciones?: string;
}

class UpdateCitaDto {
  @IsOptional() @Type(() => Number) @IsInt() pacienteId?: number;
  @IsOptional() @Type(() => Number) @IsInt() medicoId?: number;
  @IsOptional() @IsString() fecha?: string;
  @IsOptional() @IsString() hora?: string;
  @IsOptional() @IsString() motivo?: string;
  @IsOptional() @Type(() => Number) @IsNumber() monto?: number;
  @IsOptional() @IsString() metodoPago?: string;
  @IsOptional() @IsString() estadoPago?: string;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsOptional() @IsString() observaciones?: string;
}

class EstadoDto {
  @IsIn(ESTADOS) estado: string;
}

class PagoCitaDto {
  @IsOptional() @IsString() metodoPago?: string;
}

const INCLUDE = {
  paciente: { select: { id: true, nombres: true, apellidos: true, tipoDoc: true, numDoc: true, telefono: true } },
  medico: { select: { id: true, nombre: true, colegiatura: true } },
  sede: { select: { id: true, nombre: true } },
} satisfies Prisma.CitaInclude;

@Injectable()
class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(p: { desde?: string; hasta?: string; medicoId?: number; sedeId?: number; estado?: string; estadoPago?: string }) {
    const where: Prisma.CitaWhereInput = {};
    if (p.desde || p.hasta) {
      where.fecha = {};
      if (p.desde) where.fecha.gte = new Date(`${p.desde}T00:00:00`);
      if (p.hasta) where.fecha.lte = new Date(`${p.hasta}T23:59:59.999`);
    }
    if (p.medicoId) where.medicoId = p.medicoId;
    if (p.sedeId) where.sedeId = p.sedeId;
    if (p.estado) where.estado = p.estado;
    if (p.estadoPago) where.estadoPago = p.estadoPago;
    return this.prisma.cita.findMany({ where, include: INCLUDE, orderBy: [{ fecha: 'asc' }, { hora: 'asc' }], take: 500 });
  }

  async findOne(id: number) {
    const c = await this.prisma.cita.findUnique({ where: { id }, include: INCLUDE });
    if (!c) throw new BadRequestException('Cita no encontrada');
    return c;
  }

  async create(dto: CreateCitaDto, user: { sub?: number; sedeId?: number }) {
    if (!dto.fecha || !dto.hora) throw new BadRequestException('Indica fecha y hora de la cita');
    const fecha = new Date(`${dto.fecha}T00:00:00`);
    // El turno ocupado bloquea; agendar fuera de horario se permite (solo se advierte en el front).
    const dup = await this.prisma.cita.findFirst({
      where: { medicoId: dto.medicoId, fecha, hora: dto.hora, estado: { not: 'Cancelada' } },
    });
    if (dup) throw new BadRequestException('Ese turno ya está ocupado para el médico.');
    const monto = dto.monto ?? 0;
    // Sin monto = sin cobro pendiente; con monto y no marcado pagado = queda Pendiente.
    const estadoPago = dto.estadoPago === 'Pagado' ? 'Pagado' : monto > 0 ? 'Pendiente' : 'Pagado';
    return this.prisma.cita.create({
      data: {
        pacienteId: dto.pacienteId,
        medicoId: dto.medicoId,
        fecha,
        hora: dto.hora,
        motivo: dto.motivo,
        monto: D(monto),
        metodoPago: dto.metodoPago,
        estadoPago,
        estado: 'Programada',
        observaciones: dto.observaciones,
        sedeId: dto.sedeId ?? user.sedeId ?? null,
        usuarioId: user.sub ?? null,
      },
      include: INCLUDE,
    });
  }

  async update(id: number, dto: UpdateCitaDto) {
    await this.findOne(id);
    const data: Prisma.CitaUpdateInput = {};
    if (dto.pacienteId != null) data.paciente = { connect: { id: dto.pacienteId } };
    if (dto.medicoId != null) data.medico = { connect: { id: dto.medicoId } };
    if (dto.fecha) data.fecha = new Date(`${dto.fecha}T00:00:00`);
    if (dto.hora != null) data.hora = dto.hora;
    if (dto.motivo != null) data.motivo = dto.motivo;
    if (dto.monto != null) data.monto = D(dto.monto);
    if (dto.metodoPago != null) data.metodoPago = dto.metodoPago;
    if (dto.estadoPago != null) data.estadoPago = dto.estadoPago;
    if (dto.observaciones != null) data.observaciones = dto.observaciones;
    if (dto.sedeId !== undefined) data.sede = dto.sedeId ? { connect: { id: dto.sedeId } } : { disconnect: true };
    return this.prisma.cita.update({ where: { id }, data, include: INCLUDE });
  }

  async marcarEstado(id: number, estado: string) {
    await this.findOne(id);
    return this.prisma.cita.update({ where: { id }, data: { estado }, include: INCLUDE });
  }

  async registrarPago(id: number, metodoPago?: string) {
    await this.findOne(id);
    return this.prisma.cita.update({
      where: { id },
      data: { estadoPago: 'Pagado', ...(metodoPago ? { metodoPago } : {}) },
      include: INCLUDE,
    });
  }
}

@Controller('citas')
class CitasController {
  constructor(private readonly service: CitasService) {}

  @UseGuards(JwtAuthGuard)
  @Get() findAll(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('medicoId') medicoId?: string,
    @Query('sedeId') sedeId?: string,
    @Query('estado') estado?: string,
    @Query('estadoPago') estadoPago?: string,
  ) {
    return this.service.findAll({
      desde, hasta, estado, estadoPago,
      medicoId: medicoId ? Number(medicoId) : undefined,
      sedeId: sedeId ? Number(sedeId) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post() create(@Body() dto: CreateCitaDto, @Req() req: { user: { sub?: number; sedeId?: number } }) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCitaDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/estado') marcarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: EstadoDto) {
    return this.service.marcarEstado(id, dto.estado);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pago') registrarPago(@Param('id', ParseIntPipe) id: number, @Body() dto: PagoCitaDto) {
    return this.service.registrarPago(id, dto.metodoPago);
  }
}

@Module({ imports: [AuthModule], controllers: [CitasController], providers: [CitasService] })
export class CitasModule {}

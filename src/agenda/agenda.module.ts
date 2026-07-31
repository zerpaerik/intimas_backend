import {
  BadRequestException, Body, Controller, Delete, Get, Injectable, Module,
  Param, ParseIntPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

// Un bloque = un médico atiende una fecha de horaInicio a horaFin; se parte en
// turnos de slotMin minutos (20 por defecto, configurable por médico/bloque).
class CreateBloqueDto {
  @Type(() => Number) @IsInt() medicoId: number;
  @IsArray() @IsString({ each: true }) fechas: string[]; // ['2026-08-01', ...]
  @IsString() horaInicio: string; // HH:MM
  @IsString() horaFin: string;
  @IsOptional() @Type(() => Number) @IsInt() slotMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
}

const INCLUDE = { sede: { select: { id: true, nombre: true } } } satisfies Prisma.AgendaBloqueInclude;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

@Injectable()
class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  listar(p: { medicoId?: number; desde?: string; hasta?: string; sedeId?: number }) {
    const where: Prisma.AgendaBloqueWhereInput = {};
    if (p.medicoId) where.medicoId = p.medicoId;
    if (p.sedeId) where.sedeId = p.sedeId;
    if (p.desde || p.hasta) {
      where.fecha = {};
      if (p.desde) where.fecha.gte = new Date(`${p.desde}T00:00:00`);
      if (p.hasta) where.fecha.lte = new Date(`${p.hasta}T23:59:59.999`);
    }
    return this.prisma.agendaBloque.findMany({ where, include: INCLUDE, orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }] });
  }

  async crear(dto: CreateBloqueDto) {
    if (!dto.fechas?.length) throw new BadRequestException('Indica al menos una fecha');
    if (toMin(dto.horaFin) <= toMin(dto.horaInicio)) throw new BadRequestException('La hora fin debe ser mayor a la de inicio');
    const slotMin = dto.slotMin && dto.slotMin > 0 ? dto.slotMin : 20;
    const data = dto.fechas.map((f) => ({
      medicoId: dto.medicoId,
      fecha: new Date(`${f}T00:00:00`),
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      slotMin,
      sedeId: dto.sedeId ?? null,
    }));
    await this.prisma.agendaBloque.createMany({ data });
    return { creados: data.length };
  }

  async eliminar(id: number) {
    await this.prisma.agendaBloque.delete({ where: { id } });
    return { id, deleted: true };
  }

  // Turnos disponibles de un médico en una fecha, marcando los ocupados por citas.
  async slots(medicoId: number, fecha: string, sedeId?: number) {
    const dia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59.999`);
    const bloques = await this.prisma.agendaBloque.findMany({
      where: { medicoId, fecha: { gte: dia, lte: finDia }, ...(sedeId ? { sedeId } : {}) },
      orderBy: { horaInicio: 'asc' },
    });
    const citas = await this.prisma.cita.findMany({
      where: { medicoId, fecha: { gte: dia, lte: finDia }, estado: { not: 'Cancelada' } },
      select: { hora: true },
    });
    const ocupadas = new Set(citas.map((c) => c.hora));
    const seen = new Set<string>();
    const slots: { hora: string; ocupado: boolean }[] = [];
    for (const b of bloques) {
      const step = b.slotMin > 0 ? b.slotMin : 20;
      for (let t = toMin(b.horaInicio); t + step <= toMin(b.horaFin); t += step) {
        const hora = toHHMM(t);
        if (seen.has(hora)) continue;
        seen.add(hora);
        slots.push({ hora, ocupado: ocupadas.has(hora) });
      }
    }
    return slots;
  }
}

@Controller('agenda')
class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @UseGuards(JwtAuthGuard)
  @Get() listar(
    @Query('medicoId') medicoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
  ) {
    return this.service.listar({
      medicoId: medicoId ? Number(medicoId) : undefined,
      desde, hasta,
      sedeId: sedeId ? Number(sedeId) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('slots') slots(@Query('medicoId') medicoId: string, @Query('fecha') fecha: string, @Query('sedeId') sedeId?: string) {
    return this.service.slots(Number(medicoId), fecha, sedeId ? Number(sedeId) : undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Post() crear(@Body() dto: CreateBloqueDto) {
    return this.service.crear(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id') eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}

@Module({ imports: [AuthModule], controllers: [AgendaController], providers: [AgendaService] })
export class AgendaModule {}

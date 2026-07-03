import {
  BadRequestException, Body, Controller, Delete, Get, Injectable, Module,
  NotFoundException, OnModuleInit, Param, ParseIntPipe, Patch, Post, Query, Req,
  StreamableFile, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';
import { PLANTILLAS_SEED } from './plantillas.seed';

// Carril de laboratorio (análisis) vs. servicios/ecografías (informe redactado).
const LAB_KINDS = ['Laboratorio'];
const SERVICIO_KINDS = ['Ecografía', 'Rayos X', 'Salud Mental', 'Otros', 'Servicio'];

// Carpeta de almacenamiento (en Railway apunta al volumen vía UPLOADS_DIR).
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');

function kindsForTrack(track?: string) {
  return track === 'lab' ? LAB_KINDS : SERVICIO_KINDS;
}
function categoriaForTrack(track?: string) {
  return track === 'lab' ? 'Laboratorio' : 'Servicio';
}
function categoriaForKind(kind: string): string | null {
  if (LAB_KINDS.includes(kind)) return 'Laboratorio';
  if (SERVICIO_KINDS.includes(kind)) return 'Servicio';
  return null;
}

interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// ───────── DTOs ─────────
class CrearInformeDto {
  @Type(() => Number) @IsInt() atencionItemId: number;
  @IsOptional() @Type(() => Number) @IsInt() plantillaId?: number;
  @IsString() informeHtml: string;
  @IsOptional() @Type(() => Number) @IsInt() profesionalId?: number;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsString() fechaResultado?: string;
}
class SubirArchivoDto {
  @Type(() => Number) @IsInt() atencionItemId: number;
  @IsOptional() @Type(() => Number) @IsInt() laboratorioId?: number;
  @IsOptional() @Type(() => Number) @IsInt() profesionalId?: number;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsString() fechaResultado?: string;
}
class CreatePlantillaDto {
  @IsString() nombre: string;
  @IsString() tipo: string;
  @IsString() cuerpo: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}
class UpdatePlantillaDto extends PartialType(CreatePlantillaDto) {}

const RESULT_INCLUDE = {
  paciente: { select: { id: true, nombres: true, apellidos: true, numDoc: true, tipoDoc: true, fechaNacimiento: true, sexo: true } },
  plantilla: { select: { id: true, nombre: true, tipo: true } },
  laboratorio: { select: { id: true, nombre: true } },
  profesional: { select: { id: true, nombres: true, apellidos: true, cmp: true } },
  atencion: { select: { id: true, fecha: true, origenTipo: true, origenValor: true, sedeId: true } },
  atencionItem: { select: { id: true, kind: true, nombre: true } },
} satisfies Prisma.ResultadoInclude;

@Injectable()
class ResultadosService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /** Auto-siembra las plantillas migradas la primera vez (tabla vacía). */
  async onModuleInit() {
    try {
      const count = await this.prisma.plantillaInforme.count();
      if (count === 0) {
        await this.prisma.plantillaInforme.createMany({ data: PLANTILLAS_SEED });
        // eslint-disable-next-line no-console
        console.log(`[resultados] Sembradas ${PLANTILLAS_SEED.length} plantillas de informe.`);
      }
    } catch (e) {
      // No bloquear el arranque si la tabla aún no existe (antes de migrar).
      // eslint-disable-next-line no-console
      console.warn('[resultados] No se pudieron sembrar plantillas:', (e as Error).message);
    }
  }

  private rango(desde?: string, hasta?: string, defaultDias = 30): Prisma.DateTimeFilter {
    const fecha: Prisma.DateTimeFilter = {};
    if (desde) fecha.gte = new Date(desde);
    if (hasta) fecha.lte = new Date(`${hasta}T23:59:59.999`);
    if (!desde && !hasta) {
      const d = new Date();
      d.setDate(d.getDate() - defaultDias);
      d.setHours(0, 0, 0, 0);
      fecha.gte = d;
    }
    return fecha;
  }

  private pacienteSearch(search?: string) {
    if (!search) return undefined;
    return {
      OR: [
        { nombres: { contains: search, mode: 'insensitive' as const } },
        { apellidos: { contains: search, mode: 'insensitive' as const } },
        { numDoc: { contains: search, mode: 'insensitive' as const } },
      ],
    };
  }

  /** Cola de pendientes: ítems de atención (del carril) que aún NO tienen resultado. */
  async pendientes(track: string | undefined, p: { desde?: string; hasta?: string; sedeId?: number; search?: string }) {
    const items = await this.prisma.atencionItem.findMany({
      where: {
        kind: { in: kindsForTrack(track) },
        resultado: { is: null },
        atencion: {
          anulada: false,
          fecha: this.rango(p.desde, p.hasta),
          ...(p.sedeId ? { sedeId: p.sedeId } : {}),
          ...(p.search ? { paciente: this.pacienteSearch(p.search) } : {}),
        },
      },
      include: {
        atencion: {
          select: {
            id: true, fecha: true, origenTipo: true, origenValor: true, sedeId: true,
            paciente: { select: { id: true, nombres: true, apellidos: true, numDoc: true, tipoDoc: true, fechaNacimiento: true, sexo: true } },
          },
        },
      },
      orderBy: { atencion: { fecha: 'desc' } },
      take: 300,
    });
    return items.map((it) => ({
      itemId: it.id,
      kind: it.kind,
      nombre: it.nombre,
      monto: it.monto,
      atencionId: it.atencionId,
      fecha: it.atencion.fecha,
      origenTipo: it.atencion.origenTipo,
      origenValor: it.atencion.origenValor,
      paciente: it.atencion.paciente,
    }));
  }

  /** Cola de guardados: resultados ya registrados del carril. */
  guardados(track: string | undefined, p: { desde?: string; hasta?: string; sedeId?: number; search?: string }) {
    return this.prisma.resultado.findMany({
      where: {
        categoria: categoriaForTrack(track),
        fechaResultado: this.rango(p.desde, p.hasta),
        ...(p.sedeId ? { atencion: { sedeId: p.sedeId } } : {}),
        ...(p.search ? { paciente: this.pacienteSearch(p.search) } : {}),
      },
      include: RESULT_INCLUDE,
      orderBy: { fechaResultado: 'desc' },
      take: 300,
    });
  }

  async findOne(id: number) {
    const r = await this.prisma.resultado.findUnique({ where: { id }, include: RESULT_INCLUDE });
    if (!r) throw new NotFoundException(`Resultado #${id} no encontrado`);
    return r;
  }

  private async itemParaResultado(atencionItemId: number) {
    const item = await this.prisma.atencionItem.findUnique({
      where: { id: atencionItemId },
      include: {
        atencion: { select: { id: true, pacienteId: true, anulada: true } },
        resultado: { select: { id: true } },
      },
    });
    if (!item) throw new NotFoundException('Estudio (ítem de atención) no encontrado');
    if (item.resultado) throw new BadRequestException('Este estudio ya tiene un resultado registrado');
    if (item.atencion.anulada) throw new BadRequestException('La atención está anulada');
    const categoria = categoriaForKind(item.kind);
    if (!categoria) throw new BadRequestException(`El ítem "${item.nombre}" no genera resultado`);
    return { item, categoria };
  }

  async crearInforme(dto: CrearInformeDto, user?: { sub?: number }) {
    const { item, categoria } = await this.itemParaResultado(dto.atencionItemId);
    return this.prisma.resultado.create({
      data: {
        atencionItemId: item.id,
        atencionId: item.atencionId,
        pacienteId: item.atencion.pacienteId,
        categoria,
        tipo: item.kind,
        nombre: item.nombre,
        plantillaId: dto.plantillaId ?? null,
        informeHtml: dto.informeHtml,
        profesionalId: dto.profesionalId ?? null,
        observaciones: dto.observaciones ?? null,
        fechaResultado: dto.fechaResultado ? new Date(dto.fechaResultado) : new Date(),
        usuarioId: user?.sub ?? null,
      },
      include: RESULT_INCLUDE,
    });
  }

  async subirArchivo(dto: SubirArchivoDto, file: UploadedFileLike | undefined, user?: { sub?: number }) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const { item, categoria } = await this.itemParaResultado(dto.atencionItemId);
    const saved = this.saveBuffer(file);
    return this.prisma.resultado.create({
      data: {
        atencionItemId: item.id,
        atencionId: item.atencionId,
        pacienteId: item.atencion.pacienteId,
        categoria,
        tipo: item.kind,
        nombre: item.nombre,
        archivoNombre: saved.original,
        archivoMime: saved.mime,
        archivoTamano: saved.size,
        archivoPath: saved.path,
        laboratorioId: dto.laboratorioId ?? null,
        profesionalId: dto.profesionalId ?? null,
        observaciones: dto.observaciones ?? null,
        fechaResultado: dto.fechaResultado ? new Date(dto.fechaResultado) : new Date(),
        usuarioId: user?.sub ?? null,
      },
      include: RESULT_INCLUDE,
    });
  }

  private saveBuffer(file: UploadedFileLike) {
    const dir = path.join(UPLOADS_DIR, 'resultados');
    fs.mkdirSync(dir, { recursive: true });
    const base = (file.originalname || 'archivo').replace(/[^\w.\-]+/g, '_');
    const safe = base.length > 80 ? base.slice(base.length - 80) : base;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    fs.writeFileSync(path.join(dir, name), file.buffer);
    return { path: path.posix.join('resultados', name), mime: file.mimetype, size: file.size, original: file.originalname };
  }

  async getArchivo(id: number) {
    const r = await this.prisma.resultado.findUnique({ where: { id } });
    if (!r || !r.archivoPath) throw new NotFoundException('Este resultado no tiene archivo adjunto');
    const abs = path.join(UPLOADS_DIR, r.archivoPath);
    if (!fs.existsSync(abs)) throw new NotFoundException('El archivo no está disponible en el almacenamiento');
    return { abs, mime: r.archivoMime ?? 'application/octet-stream', filename: r.archivoNombre ?? `resultado-${id}` };
  }

  async remove(id: number) {
    const r = await this.prisma.resultado.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`Resultado #${id} no encontrado`);
    if (r.archivoPath) {
      const abs = path.join(UPLOADS_DIR, r.archivoPath);
      try {
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch {
        /* si el archivo ya no existe, seguimos */
      }
    }
    await this.prisma.resultado.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ───────── Plantillas ─────────
  plantillas(tipo?: string, all = false) {
    return this.prisma.plantillaInforme.findMany({
      where: { ...(all ? {} : { activo: true }), ...(tipo ? { tipo } : {}) },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });
  }

  private async getPlantilla(id: number) {
    const p = await this.prisma.plantillaInforme.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Plantilla #${id} no encontrada`);
    return p;
  }

  crearPlantilla(dto: CreatePlantillaDto) {
    return this.prisma.plantillaInforme.create({ data: dto });
  }

  async actualizarPlantilla(id: number, dto: UpdatePlantillaDto) {
    await this.getPlantilla(id);
    return this.prisma.plantillaInforme.update({ where: { id }, data: dto });
  }

  async eliminarPlantilla(id: number) {
    await this.getPlantilla(id);
    await this.prisma.plantillaInforme.delete({ where: { id } });
    return { id, deleted: true };
  }
}

@Controller('resultados')
class ResultadosController {
  constructor(private readonly service: ResultadosService) {}

  @Get('pendientes')
  pendientes(
    @Query('track') track?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.pendientes(track, { desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined, search });
  }

  @Get('guardados')
  guardados(
    @Query('track') track?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('sedeId') sedeId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.guardados(track, { desde, hasta, sedeId: sedeId ? Number(sedeId) : undefined, search });
  }

  @Get('plantillas')
  plantillas(@Query('tipo') tipo?: string, @Query('all') all?: string) {
    return this.service.plantillas(tipo, all === '1' || all === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Post('plantillas')
  crearPlantilla(@Body() dto: CreatePlantillaDto) {
    return this.service.crearPlantilla(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('plantillas/:id')
  actualizarPlantilla(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlantillaDto) {
    return this.service.actualizarPlantilla(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('plantillas/:id')
  eliminarPlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarPlantilla(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('informe')
  crearInforme(@Body() dto: CrearInformeDto, @Req() req: { user?: { sub?: number } }) {
    return this.service.crearInforme(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  @Post('archivo')
  subirArchivo(
    @UploadedFile() file: UploadedFileLike,
    @Body() dto: SubirArchivoDto,
    @Req() req: { user?: { sub?: number } },
  ) {
    return this.service.subirArchivo(dto, file, req.user);
  }

  @Get(':id/archivo')
  async archivo(@Param('id', ParseIntPipe) id: number) {
    const { abs, mime, filename } = await this.service.getArchivo(id);
    return new StreamableFile(fs.createReadStream(abs), {
      type: mime,
      disposition: `inline; filename="${encodeURIComponent(filename)}"`,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

@Module({ imports: [AuthModule], controllers: [ResultadosController], providers: [ResultadosService] })
export class ResultadosModule {}

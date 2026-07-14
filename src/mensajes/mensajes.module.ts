import {
  BadRequestException, Body, Controller, ForbiddenException, Get, Injectable, Module,
  NotFoundException, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule, JwtAuthGuard } from '../auth/auth.module';

class CreateMensajeDto {
  @Type(() => Number) @IsInt() paraId: number;
  @IsOptional() @Type(() => Number) @IsInt() pacienteId?: number;
  @IsOptional() @IsString() asunto?: string;
  @IsString() cuerpo: string;
}

const INCLUDE = {
  de: { select: { id: true, nombre: true } },
  para: { select: { id: true, nombre: true } },
  paciente: { select: { id: true, nombres: true, apellidos: true, numDoc: true } },
} satisfies Prisma.MensajeInclude;

type ReqUser = { sub?: number };

@Injectable()
class MensajesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CreateMensajeDto, user: ReqUser) {
    if (!user.sub) throw new ForbiddenException('Sesión inválida');
    if (!dto.cuerpo?.trim()) throw new BadRequestException('El mensaje no puede estar vacío');
    if (dto.paraId === user.sub) throw new BadRequestException('No puedes enviarte un mensaje a ti mismo');
    return this.prisma.mensaje.create({
      data: {
        deId: user.sub,
        paraId: dto.paraId,
        pacienteId: dto.pacienteId ?? null,
        asunto: dto.asunto?.trim() || null,
        cuerpo: dto.cuerpo.trim(),
      },
      include: INCLUDE,
    });
  }

  listar(box: string | undefined, user: ReqUser) {
    const where: Prisma.MensajeWhereInput = box === 'sent' ? { deId: user.sub } : { paraId: user.sub };
    return this.prisma.mensaje.findMany({ where, include: INCLUDE, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async noLeidos(user: ReqUser) {
    const count = await this.prisma.mensaje.count({ where: { paraId: user.sub, leido: false } });
    return { count };
  }

  async marcarLeido(id: number, user: ReqUser) {
    const m = await this.prisma.mensaje.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Mensaje no encontrado');
    if (m.paraId !== user.sub) throw new ForbiddenException('No autorizado');
    if (m.leido) return m;
    return this.prisma.mensaje.update({ where: { id }, data: { leido: true, leidoAt: new Date() }, include: INCLUDE });
  }

  destinatarios(user: ReqUser) {
    return this.prisma.user.findMany({
      where: { id: { not: user.sub } },
      select: { id: true, nombre: true, title: true, role: { select: { nombre: true } } },
      orderBy: { nombre: 'asc' },
    });
  }
}

@Controller('mensajes')
class MensajesController {
  constructor(private readonly service: MensajesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('no-leidos') noLeidos(@Req() req: { user: ReqUser }) {
    return this.service.noLeidos(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('destinatarios') destinatarios(@Req() req: { user: ReqUser }) {
    return this.service.destinatarios(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get() listar(@Query('box') box: string | undefined, @Req() req: { user: ReqUser }) {
    return this.service.listar(box, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post() crear(@Body() dto: CreateMensajeDto, @Req() req: { user: ReqUser }) {
    return this.service.crear(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leido') marcarLeido(@Param('id', ParseIntPipe) id: number, @Req() req: { user: ReqUser }) {
    return this.service.marcarLeido(id, req.user);
  }
}

@Module({ imports: [AuthModule], controllers: [MensajesController], providers: [MensajesService] })
export class MensajesModule {}

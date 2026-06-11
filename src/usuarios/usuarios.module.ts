import {
  Body, ConflictException, Controller, Delete, Get, Injectable, Module,
  NotFoundException, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

class CreateUserDto {
  @IsString() nombre: string;
  @IsEmail() email: string;
  @IsString() @MinLength(4) password: string;
  @Type(() => Number) @IsInt() roleId: number;
  @IsOptional() @Type(() => Number) @IsInt() sedeId?: number;
  @IsOptional() @IsString() title?: string;
}
class UpdateUserDto extends PartialType(CreateUserDto) {}

const userSelect = {
  id: true,
  nombre: true,
  email: true,
  title: true,
  roleId: true,
  sedeId: true,
  createdAt: true,
  role: { select: { id: true, nombre: true } },
  sede: { select: { id: true, nombre: true } },
};

@Injectable()
class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    return this.prisma.user.findMany({ where, select: userSelect, orderBy: { id: 'desc' } });
  }

  async findOne(id: number) {
    const u = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!u) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return u;
  }

  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          nombre: dto.nombre,
          email: dto.email.trim().toLowerCase(),
          password,
          roleId: dto.roleId,
          sedeId: dto.sedeId ?? null,
          title: dto.title,
        },
        select: userSelect,
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException('Ese correo ya está registrado');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {
      nombre: dto.nombre,
      title: dto.title,
      roleId: dto.roleId,
      sedeId: dto.sedeId,
    };
    if (dto.email) data.email = dto.email.trim().toLowerCase();
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.user.update({ where: { id }, data, select: userSelect });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException('Ese correo ya está registrado');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}

@Controller('usuarios')
class UsuariosController {
  constructor(private readonly service: UsuariosService) {}
  @Get() findAll(@Query('search') search?: string) { return this.service.findAll(search); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateUserDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

@Module({ controllers: [UsuariosController], providers: [UsuariosService] })
export class UsuariosModule {}

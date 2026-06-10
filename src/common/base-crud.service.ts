import { NotFoundException } from '@nestjs/common';

type Delegate = {
  findMany: (args?: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

/** Lógica CRUD genérica reutilizada por todos los maestros. */
export abstract class BaseCrudService {
  constructor(
    protected readonly model: Delegate,
    protected readonly searchFields: string[] = [],
    protected readonly include?: Record<string, unknown>,
  ) {}

  findAll(search?: string) {
    const where =
      search && this.searchFields.length
        ? {
            OR: this.searchFields.map((f) => ({
              [f]: { contains: search, mode: 'insensitive' },
            })),
          }
        : undefined;
    return this.model.findMany({
      where,
      include: this.include,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const row = await this.model.findUnique({
      where: { id },
      include: this.include,
    });
    if (!row) throw new NotFoundException(`Registro #${id} no encontrado`);
    return row;
  }

  create(data: any) {
    return this.model.create({ data, include: this.include });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.model.update({ where: { id }, data, include: this.include });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.model.delete({ where: { id } });
    return { id, deleted: true };
  }
}

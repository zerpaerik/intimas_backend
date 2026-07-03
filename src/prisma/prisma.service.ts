import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Sube el límite de transacciones interactivas (default 5s) para que un
    // guardado no falle con P2028 cuando la BD responde lenta.
    super({ transactionOptions: { maxWait: 10000, timeout: 20000 } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

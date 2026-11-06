import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { db } from '../../prisma/db.js';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly contract = db;
  readonly db = db.orm.public;

  async onModuleDestroy(): Promise<void> {
    await this.contract.close();
  }
}

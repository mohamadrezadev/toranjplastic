import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { PrismaAdminContentRepository } from './prisma-admin-content.repository.js';
import { resourceRepositories } from './shared/resource-repository-adapters.js';
import type { AdminContentTransaction, AdminContentUnitOfWork } from './unit-of-work.js';

@Injectable()
export class PrismaAdminContentUnitOfWork implements AdminContentUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(work: (transaction: AdminContentTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (client) => {
      const repositories = resourceRepositories(new PrismaAdminContentRepository(client));
      return work({ ...repositories, audit: client });
    });
  }
}

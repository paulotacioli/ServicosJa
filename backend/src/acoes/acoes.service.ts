import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcoesService {
  constructor(private prisma: PrismaService) {}

  async listByPrestador(prestadorId: string) {
    return this.prisma.acaoServico.findMany({
      where: { prestadorId },
      orderBy: { criadoEm: 'desc' },
    });
  }
}

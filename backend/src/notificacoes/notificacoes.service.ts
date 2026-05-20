import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  list(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  unreadCount(usuarioId: string) {
    return this.prisma.notificacao.count({ where: { usuarioId, lida: false } });
  }

  async marcarLida(id: string, usuarioId: string) {
    await this.prisma.notificacao.updateMany({
      where: { id, usuarioId },
      data: { lida: true },
    });
    return { ok: true };
  }

  async marcarTodasLidas(usuarioId: string) {
    await this.prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });
    return { ok: true };
  }
}

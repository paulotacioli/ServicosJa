import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private _serialize(user: any, includeWpp = false) {
    if (!user) return null;
    const { senhaHash, whatsapp, ...rest } = user;
    return {
      ...rest,
      whatsapp: includeWpp ? whatsapp : null,
      categorias: user.categorias ? user.categorias.split(',') : [],
      bairros: user.bairros ? user.bairros.split(',') : [],
    };
  }

  async getMe(userId: string) {
    const u = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return this._serialize(u, true);
  }

  /**
   * Retorna perfil público do prestador.
   * O WhatsApp só é revelado se existe um serviço APROVADO entre solicitante e prestador.
   */
  async updateStatusVerificacao(userId: string, status: string) {
    const valid = ['PENDENTE', 'EM_REVISAO', 'APROVADO', 'REPROVADO'];
    if (!valid.includes(status)) throw new BadRequestException('Status inválido');
    await this.prisma.usuario.update({ where: { id: userId }, data: { statusVerificacao: status } });
    return this.getMe(userId);
  }

  async getPrestadorProfile(prestadorId: string, viewerId: string) {
    const prestador = await this.prisma.usuario.findUnique({ where: { id: prestadorId } });
    if (!prestador || prestador.tipo !== 'prestador') {
      throw new NotFoundException('Prestador não encontrado');
    }

    const aprovados = await this.prisma.servico.count({
      where: {
        solicitanteId: viewerId,
        prestadorAceitoId: prestadorId,
        estado: 'APROVADO',
      },
    });

    return this._serialize(prestador, aprovados > 0);
  }
}

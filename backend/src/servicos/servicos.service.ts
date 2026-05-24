import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './servicos.dto';

const ESTADO = {
  ABERTO: 'ABERTO',
  AGUARDANDO: 'AGUARDANDO_APROVACAO',
  APROVADO: 'APROVADO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
};

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  // ---------------- helpers ----------------
  private _serializeServico(s: any) {
    if (!s) return null;
    return {
      ...s,
      fotos: typeof s.fotos === 'string' ? s.fotos.split('|||').filter(Boolean) : s.fotos,
    };
  }
  private _serializeUser(u: any, includeWpp = false) {
    if (!u) return null;
    const { senhaHash, whatsapp, ...rest } = u;
    return {
      ...rest,
      whatsapp: includeWpp ? whatsapp : null,
      categorias: u.categorias ? u.categorias.split(',') : [],
      bairros: u.bairros ? u.bairros.split(',') : [],
    };
  }
  private async _notify(usuarioId: string, payload: any) {
    return this.prisma.notificacao.create({
      data: { usuarioId, ...payload },
    });
  }

  // ---------------- solicitante: publicar ----------------
  async publicar(solicitanteId: string, dto: CreateServicoDto) {
    const abertos = await this.prisma.servico.count({
      where: { solicitanteId, estado: ESTADO.ABERTO },
    });
    if (abertos >= 3) {
      throw new BadRequestException('Limite de 3 serviços abertos atingido');
    }

    const s = await this.prisma.servico.create({
      data: {
        solicitanteId,
        titulo: dto.titulo,
        descricao: dto.descricao,
        categoria: dto.categoria,
        fotos: dto.fotos.join('|||'),
        cidade: dto.cidade,
        bairro: dto.bairro,
        estado: ESTADO.ABERTO,
      },
    });
    return this._serializeServico(s);
  }

  // ---------------- solicitante: listar próprios ----------------
  async getMeus(solicitanteId: string) {
    const rows = await this.prisma.servico.findMany({
      where: { solicitanteId },
      orderBy: { criadoEm: 'desc' },
    });
    return rows.map((r) => this._serializeServico(r));
  }

  // ---------------- detalhe ----------------
  async getOne(id: string, viewerId: string) {
    const s = await this.prisma.servico.findUnique({
      where: { id },
      include: { prestadorAceito: true },
    });
    if (!s) throw new NotFoundException('Serviço não encontrado');

    const canView = s.solicitanteId === viewerId || s.prestadorAceitoId === viewerId;
    if (!canView) throw new ForbiddenException('Sem permissão');

    const wppRevelado = s.estado === ESTADO.APROVADO || s.estado === ESTADO.CONCLUIDO;
    return {
      ...this._serializeServico(s),
      prestadorAceito: s.prestadorAceito ? this._serializeUser(s.prestadorAceito, wppRevelado) : null,
    };
  }

  // ---------------- solicitante: aprovar prestador ----------------
  async aprovar(servicoId: string, solicitanteId: string) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (s.estado !== ESTADO.AGUARDANDO) {
      throw new BadRequestException('Serviço não está aguardando aprovação');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.servico.update({
        where: { id: servicoId },
        data: { estado: ESTADO.APROVADO },
      }),
      this.prisma.acaoServico.create({
        data: {
          servicoId,
          prestadorId: s.prestadorAceitoId!,
          acao: 'APROVADO_PELO_CLIENTE',
        },
      }),
    ]);

    await this._notify(s.prestadorAceitoId!, {
      tipo: 'APROVADO',
      titulo: '🎉 Você foi aprovado!',
      mensagem: 'O cliente aprovou. Aguarde o contato pelo WhatsApp.',
      servicoId,
    });

    return this.getOne(servicoId, solicitanteId);
  }

  // ---------------- solicitante: recusar prestador (volta à fila) ----------------
  async recusar(servicoId: string, solicitanteId: string, motivo?: string) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (s.estado !== ESTADO.AGUARDANDO) {
      throw new BadRequestException('Serviço não está aguardando aprovação');
    }

    const prestadorRejeitadoId = s.prestadorAceitoId!;

    await this.prisma.$transaction([
      this.prisma.acaoServico.create({
        data: {
          servicoId,
          prestadorId: prestadorRejeitadoId,
          acao: 'RECUSADO_PELO_CLIENTE',
          motivo,
        },
      }),
      this.prisma.servico.update({
        where: { id: servicoId },
        data: { estado: ESTADO.ABERTO, prestadorAceitoId: null },
      }),
    ]);

    await this._notify(prestadorRejeitadoId, {
      tipo: 'RECUSADO',
      titulo: 'Cliente escolheu outro',
      mensagem: 'Continue swipando — há outros serviços!',
      servicoId,
    });

    return { ok: true };
  }

  async concluir(servicoId: string, solicitanteId: string) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (s.estado !== ESTADO.APROVADO) {
      throw new BadRequestException('Serviço não está aprovado');
    }

    await this.prisma.$transaction([
      this.prisma.servico.update({
        where: { id: servicoId },
        data: { estado: ESTADO.CONCLUIDO },
      }),
      this.prisma.usuario.update({
        where: { id: s.prestadorAceitoId! },
        data: { servicosConcluidos: { increment: 1 } },
      }),
    ]);

    return { ok: true };
  }

  async cancelar(servicoId: string, solicitanteId: string) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (![ESTADO.ABERTO, ESTADO.AGUARDANDO].includes(s.estado)) {
      throw new BadRequestException('Não é possível cancelar nesse estado');
    }
    await this.prisma.servico.update({
      where: { id: servicoId },
      data: { estado: ESTADO.CANCELADO },
    });
    return { ok: true };
  }

  // ---------------- prestador: feed ----------------
  async getFeed(prestadorId: string) {
    const prestador = await this.prisma.usuario.findUnique({ where: { id: prestadorId } });
    if (!prestador) throw new NotFoundException('Prestador não encontrado');

    const categorias = prestador.categorias ? prestador.categorias.split(',') : [];
    const bairros = prestador.bairros ? prestador.bairros.split(',') : [];

    // Serviços já vistos por esse prestador
    const acoes = await this.prisma.acaoServico.findMany({
      where: { prestadorId, acao: { in: ['ACEITOU', 'RECUSOU'] } },
      select: { servicoId: true },
    });
    const bloqueados = acoes.map((a) => a.servicoId);

    const servicos = await this.prisma.servico.findMany({
      where: {
        estado: ESTADO.ABERTO,
        id: { notIn: bloqueados },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return servicos.map((s) => this._serializeServico(s));
  }

  // ---------------- prestador: aceitar (concorrência) ----------------
  async aceitar(servicoId: string, prestadorId: string) {
    // Transação com checagem de estado (equivalente a SELECT FOR UPDATE)
    return this.prisma.$transaction(async (tx) => {
      const prestador = await tx.usuario.findUnique({ where: { id: prestadorId } });
      if (prestador?.statusVerificacao !== 'APROVADO') {
        throw new ForbiddenException('Sua conta ainda não foi verificada. Aguarde a aprovação.');
      }

      const s = await tx.servico.findUnique({ where: { id: servicoId } });
      if (!s) throw new NotFoundException('Serviço não encontrado');
      if (s.estado !== ESTADO.ABERTO) {
        throw new ConflictException('Esse serviço já foi aceito por outro profissional');
      }

      await tx.servico.update({
        where: { id: servicoId },
        data: {
          estado: ESTADO.AGUARDANDO,
          prestadorAceitoId: prestadorId,
        },
      });

      await tx.acaoServico.create({
        data: { servicoId, prestadorId, acao: 'ACEITOU' },
      });

      await tx.notificacao.create({
        data: {
          usuarioId: s.solicitanteId,
          tipo: 'PRESTADOR_ACEITOU',
          titulo: '✨ Um prestador aceitou seu serviço',
          mensagem: 'Veja o perfil dele e decida se libera o contato.',
          servicoId,
        },
      });

      return { ok: true };
    });
  }

  // ---------------- prestador: recusar (swipe negativo) ----------------
  async recusarSwipe(servicoId: string, prestadorId: string) {
    // Evita duplicação
    const ja = await this.prisma.acaoServico.findFirst({
      where: { servicoId, prestadorId, acao: { in: ['ACEITOU', 'RECUSOU'] } },
    });
    if (ja) return { ok: true };

    await this.prisma.acaoServico.create({
      data: { servicoId, prestadorId, acao: 'RECUSOU' },
    });
    return { ok: true };
  }

  // ---------------- prestador: meus aceites ----------------
  async getMeusAceites(prestadorId: string) {
    const acoes = await this.prisma.acaoServico.findMany({
      where: { prestadorId, acao: 'ACEITOU' },
      orderBy: { criadoEm: 'desc' },
      select: { servicoId: true },
    });
    const ids = acoes.map((a) => a.servicoId);

    const servicos = await this.prisma.servico.findMany({
      where: { id: { in: ids } },
      orderBy: { criadoEm: 'desc' },
    });
    return servicos.map((s) => this._serializeServico(s));
  }
}

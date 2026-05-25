import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AceitarServicoDto, AprovarPrestadorDto, CreateServicoDto, EditarServicoDto } from './servicos.dto';

const ESTADO = {
  ABERTO: 'ABERTO',
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

  // ---------------- solicitante: editar serviço ----------------
  async editar(servicoId: string, solicitanteId: string, dto: EditarServicoDto) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (s.estado !== ESTADO.ABERTO) {
      throw new BadRequestException('Não é possível editar serviço nesse estado');
    }

    const aceites = await this.prisma.acaoServico.count({
      where: { servicoId, acao: 'ACEITOU' },
    });
    if (aceites > 0) {
      throw new BadRequestException('Não é possível editar após um prestador ter aceitado');
    }

    const updated = await this.prisma.servico.update({
      where: { id: servicoId },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.categoria !== undefined && { categoria: dto.categoria }),
        ...(dto.fotos !== undefined && { fotos: dto.fotos.join('|||') }),
        ...(dto.cidade !== undefined && { cidade: dto.cidade }),
        ...(dto.bairro !== undefined && { bairro: dto.bairro }),
      },
    });
    return this._serializeServico(updated);
  }

  // ---------------- solicitante: listar próprios ----------------
  async getMeus(solicitanteId: string) {
    const rows = await this.prisma.servico.findMany({
      where: { solicitanteId },
      orderBy: { criadoEm: 'desc' },
    });

    // Para cada serviço ABERTO, verificar se tem aceites pendentes
    const ids = rows.filter(r => r.estado === ESTADO.ABERTO).map(r => r.id);
    let aceitesMap: Record<string, number> = {};
    if (ids.length > 0) {
      const acoes = await this.prisma.acaoServico.groupBy({
        by: ['servicoId'],
        where: { servicoId: { in: ids }, acao: 'ACEITOU' },
        _count: { id: true },
      });
      acoes.forEach(a => { aceitesMap[a.servicoId] = a._count.id; });
    }

    return rows.map(r => ({
      ...this._serializeServico(r),
      aceitesCount: aceitesMap[r.id] || 0,
    }));
  }

  // ---------------- detalhe ----------------
  async getOne(id: string, viewerId: string) {
    const s = await this.prisma.servico.findUnique({
      where: { id },
      include: { prestadorAceito: true },
    });
    if (!s) throw new NotFoundException('Serviço não encontrado');

    // Verificar se o viewer é o solicitante ou um prestador que aceitou
    const acaoViewer = await this.prisma.acaoServico.findFirst({
      where: { servicoId: id, prestadorId: viewerId, acao: 'ACEITOU' },
    });
    const canView = s.solicitanteId === viewerId || !!acaoViewer;
    if (!canView) throw new ForbiddenException('Sem permissão');

    const wppRevelado = s.estado === ESTADO.APROVADO || s.estado === ESTADO.CONCLUIDO;

    // Para o solicitante: buscar lista de aceites com dados do prestador
    let aceitesList: any[] = [];
    if (s.solicitanteId === viewerId && s.estado === ESTADO.ABERTO) {
      const acoes = await this.prisma.acaoServico.findMany({
        where: { servicoId: id, acao: 'ACEITOU' },
        include: { prestador: true },
        orderBy: { criadoEm: 'asc' },
      });
      aceitesList = acoes.map(a => ({
        prestador: this._serializeUser(a.prestador, false),
        valorProposto: a.valorProposto,
        acaoId: a.id,
        criadoEm: a.criadoEm,
      }));
    }

    return {
      ...this._serializeServico(s),
      prestadorAceito: s.prestadorAceito ? this._serializeUser(s.prestadorAceito, wppRevelado) : null,
      aceites: aceitesList,
      meuValorProposto: acaoViewer?.valorProposto ?? null,
    };
  }

  // ---------------- solicitante: aprovar prestador ----------------
  async aprovar(servicoId: string, solicitanteId: string, dto: AprovarPrestadorDto) {
    const s = await this.prisma.servico.findUnique({ where: { id: servicoId } });
    if (!s) throw new NotFoundException('Serviço não encontrado');
    if (s.solicitanteId !== solicitanteId) throw new ForbiddenException('Sem permissão');
    if (s.estado !== ESTADO.ABERTO) {
      throw new BadRequestException('Serviço não está aberto para aprovação');
    }

    // Verificar que o prestador realmente aceitou
    const aceite = await this.prisma.acaoServico.findFirst({
      where: { servicoId, prestadorId: dto.prestadorId, acao: 'ACEITOU' },
    });
    if (!aceite) {
      throw new BadRequestException('Esse prestador não aceitou este serviço');
    }

    // Buscar todos os outros prestadores que aceitaram para notificar
    const outrosAceites = await this.prisma.acaoServico.findMany({
      where: { servicoId, acao: 'ACEITOU', prestadorId: { not: dto.prestadorId } },
      select: { prestadorId: true },
    });

    await this.prisma.$transaction([
      this.prisma.servico.update({
        where: { id: servicoId },
        data: { estado: ESTADO.APROVADO, prestadorAceitoId: dto.prestadorId },
      }),
      this.prisma.acaoServico.create({
        data: { servicoId, prestadorId: dto.prestadorId, acao: 'APROVADO_PELO_CLIENTE' },
      }),
      ...outrosAceites.map(o =>
        this.prisma.acaoServico.create({
          data: { servicoId, prestadorId: o.prestadorId, acao: 'RECUSADO_PELO_CLIENTE' },
        })
      ),
    ]);

    await this._notify(dto.prestadorId, {
      tipo: 'APROVADO',
      titulo: '🎉 Você foi aprovado!',
      mensagem: 'O cliente aprovou. Aguarde o contato pelo WhatsApp.',
      servicoId,
    });

    for (const outro of outrosAceites) {
      await this._notify(outro.prestadorId, {
        tipo: 'RECUSADO',
        titulo: 'Cliente escolheu outro',
        mensagem: 'Continue swipando — há outros serviços!',
        servicoId,
      });
    }

    return this.getOne(servicoId, solicitanteId);
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
    if (![ESTADO.ABERTO].includes(s.estado)) {
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

  // ---------------- prestador: aceitar (múltiplos aceites permitidos) ----------------
  async aceitar(servicoId: string, prestadorId: string, dto: AceitarServicoDto) {
    return this.prisma.$transaction(async (tx) => {
      const prestador = await tx.usuario.findUnique({ where: { id: prestadorId } });
      if (prestador?.statusVerificacao !== 'APROVADO') {
        throw new ForbiddenException('Sua conta ainda não foi verificada. Aguarde a aprovação.');
      }

      const s = await tx.servico.findUnique({ where: { id: servicoId } });
      if (!s) throw new NotFoundException('Serviço não encontrado');
      if (s.estado !== ESTADO.ABERTO) {
        throw new ConflictException('Esse serviço não está mais disponível');
      }

      // Verificar se já aceitou
      const jaAceitou = await tx.acaoServico.findFirst({
        where: { servicoId, prestadorId, acao: 'ACEITOU' },
      });
      if (jaAceitou) throw new ConflictException('Você já aceitou este serviço');

      await tx.acaoServico.create({
        data: { servicoId, prestadorId, acao: 'ACEITOU', valorProposto: dto.valorProposto },
      });

      await tx.notificacao.create({
        data: {
          usuarioId: s.solicitanteId,
          tipo: 'PRESTADOR_ACEITOU',
          titulo: '✨ Um prestador aceitou seu serviço',
          mensagem: 'Veja o perfil e o valor proposto. Decida quem vai fazer.',
          servicoId,
        },
      });

      return { ok: true };
    });
  }

  // ---------------- prestador: recusar (swipe negativo) ----------------
  async recusarSwipe(servicoId: string, prestadorId: string) {
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
      select: { servicoId: true, valorProposto: true, criadoEm: true },
    });
    const ids = acoes.map((a) => a.servicoId);

    const servicos = await this.prisma.servico.findMany({
      where: { id: { in: ids } },
      orderBy: { criadoEm: 'desc' },
    });

    const servicoMap = Object.fromEntries(servicos.map(s => [s.id, s]));

    return acoes.map(acao => {
      const s = servicoMap[acao.servicoId];
      if (!s) return null;
      const serialized = this._serializeServico(s);
      let resultado: string;
      if (s.estado === ESTADO.ABERTO) {
        resultado = 'AGUARDANDO';
      } else if (s.estado === ESTADO.APROVADO && s.prestadorAceitoId === prestadorId) {
        resultado = 'APROVADO';
      } else if (s.estado === ESTADO.CONCLUIDO && s.prestadorAceitoId === prestadorId) {
        resultado = 'CONCLUIDO';
      } else {
        resultado = 'NAO_SELECIONADO';
      }
      return { ...serialized, valorProposto: acao.valorProposto, resultado };
    }).filter(Boolean);
  }
}

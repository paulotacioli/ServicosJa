import { useEffect, useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { Header, Badge, Avatar, Button, SectionTitle } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { formatWpp } from '../../lib/helpers';
import { useToast } from '../../context/ToastContext';

export function SolDetail({ serviceId, onBack, onPrestProfile }) {
  const [servico, setServico] = useState(null);
  const toast = useToast();

  const reload = async () => {
    try {
      const s = await apiSolicitante.getServico(serviceId);
      setServico(s);
    } catch (e) { toast(e.message, 'error'); }
  };

  useEffect(() => {
    reload();
    const id = setInterval(reload, 3000);
    return () => clearInterval(id);
  }, [serviceId]);

  if (!servico) {
    return (
      <>
        <Header onBack={onBack} title="" />
        <div className="px-5">Carregando…</div>
      </>
    );
  }

  const aprovar = async () => {
    try {
      await apiSolicitante.aprovarPrestador(servico.id);
      toast('✓ Prestador aprovado. WhatsApp liberado.', 'success');
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const recusar = async () => {
    try {
      await apiSolicitante.recusarPrestador(servico.id);
      toast('Serviço voltou para a fila pública', 'success');
      onBack();
    } catch (e) { toast(e.message, 'error'); }
  };

  const concluir = async () => {
    try {
      await apiSolicitante.concluirServico(servico.id);
      toast('✓ Serviço concluído', 'success');
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const cancelar = async () => {
    if (!confirm('Cancelar este serviço?')) return;
    try {
      await apiSolicitante.cancelarServico(servico.id);
      toast('Serviço cancelado', 'success');
      onBack();
    } catch (e) { toast(e.message, 'error'); }
  };

  const abrirWhatsApp = () => {
    const num = servico.prestadorAceito?.whatsapp?.replace(/\D/g, '') || '';
    const url = `https://wa.me/${num}?text=${encodeURIComponent('Olá! Vi seu perfil no ServiçoJá sobre: ' + servico.titulo)}`;
    window.open(url, '_blank');
  };

  const p = servico.prestadorAceito;

  return (
    <>
      <Header onBack={onBack} title="" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div
          className="w-[calc(100%+40px)] -mx-5 h-[200px] bg-cover bg-center relative"
          style={{ backgroundImage: `url('${servico.fotos[0] || ''}')` }}
        >
          <div className="absolute bottom-2.5 left-5 flex gap-1.5">
            {servico.fotos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>

        <div className="pt-5">
          <div className="flex gap-2 items-center flex-wrap mb-3.5">
            <Badge estado={servico.estado} />
            <span className="inline-flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-lg text-[11px] text-text-dim">
              {servico.categoria}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-lg text-[11px] text-text-dim">
              <Icon.Loc /> {servico.bairro}
            </span>
          </div>

          <div className="font-display text-[24px] font-bold tracking-tight leading-tight mb-2.5">{servico.titulo}</div>
          <div className="text-text-dim leading-relaxed text-[14px] mb-5">{servico.descricao}</div>

          {servico.estado === 'AGUARDANDO_APROVACAO' && p && (
            <>
              <SectionTitle>Um prestador aceitou</SectionTitle>
              <div className="bg-gradient-to-br from-accent/[0.06] to-blue-400/[0.04] border border-accent rounded-2xl p-4 mb-3.5">
                <div className="flex gap-3 items-center mb-3">
                  <Avatar name={p.nome} />
                  <div>
                    <div className="font-semibold text-[15px]">{p.nome}</div>
                    <div className="text-[11px] text-text-mute mt-0.5">{p.cidade}</div>
                  </div>
                </div>
                <div className="flex gap-3.5 mb-3.5">
                  <div>
                    <div className="font-display font-bold text-base">{p.servicosConcluidos || 0}</div>
                    <div className="text-[10px] text-text-mute uppercase tracking-wide">Concluídos</div>
                  </div>
                  <div>
                    <div className="font-display font-bold text-base">{(p.categorias || []).length}</div>
                    <div className="text-[10px] text-text-mute uppercase tracking-wide">Categorias</div>
                  </div>
                </div>
                <div className="flex gap-2.5 mb-2">
                  <div className="flex-1"><Button variant="ghost" onClick={() => onPrestProfile(p.id)}>Ver perfil</Button></div>
                  <div className="flex-1"><Button variant="success" onClick={aprovar}>Aprovar</Button></div>
                </div>
                <Button variant="danger" onClick={recusar}>Recusar — devolver à fila</Button>
              </div>
            </>
          )}

          {servico.estado === 'APROVADO' && p && (
            <>
              <SectionTitle>Prestador aprovado</SectionTitle>
              <div className="bg-surface border border-border rounded-2xl p-4 mb-3.5">
                <div className="flex gap-3 items-center">
                  <Avatar name={p.nome} />
                  <div>
                    <div className="font-semibold text-[15px]">{p.nome}</div>
                    <div className="text-[11px] text-text-mute mt-0.5">{p.cidade}</div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-4 mb-3.5 flex gap-3.5 items-center"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.18] flex items-center justify-center">
                  <Icon.Wpp />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider font-semibold opacity-90">WhatsApp liberado</div>
                  <div className="font-display font-bold text-[18px] mt-0.5">{formatWpp(p.whatsapp)}</div>
                </div>
              </div>

              <Button variant="wpp" onClick={abrirWhatsApp}>Abrir conversa no WhatsApp</Button>
              <div className="h-2.5" />
              <Button variant="ghost" onClick={concluir}>Marcar como concluído</Button>
            </>
          )}

          {servico.estado === 'ABERTO' && (
            <>
              <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center text-text-mute mb-3.5">
                <div className="text-2xl mb-2">⏳</div>
                <div className="font-semibold text-text-main mb-1">Aguardando prestadores</div>
                <div className="text-[12px]">Seu serviço está visível para profissionais da categoria selecionada.</div>
              </div>
              <Button variant="ghost" onClick={cancelar} className="text-red-400">Cancelar serviço</Button>
            </>
          )}

          {servico.estado === 'CONCLUIDO' && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-2xl p-6 text-center">
              <div className="text-2xl">✓</div>
              <div className="font-semibold mt-1.5 text-emerald-400">Serviço concluído</div>
            </div>
          )}

          {servico.estado === 'CANCELADO' && (
            <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 text-center text-red-400">
              Serviço cancelado
            </div>
          )}
        </div>
      </div>
    </>
  );
}

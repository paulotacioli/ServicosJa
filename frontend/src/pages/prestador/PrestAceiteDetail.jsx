import { useEffect, useState } from 'react';
import { apiPrestador } from '../../lib/api';
import { Header, Badge } from '../../components/UI';
import { Icon } from '../../components/Icons';

export function PrestAceiteDetail({ serviceId, onBack }) {
  const [servico, setServico] = useState(null);

  useEffect(() => {
    const load = async () => {
      try { setServico(await apiPrestador.getServico(serviceId)); } catch {}
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [serviceId]);

  if (!servico) return (<><Header onBack={onBack} title="" /><div className="px-5">Carregando…</div></>);

  let statusBlock = null;
  if (servico.estado === 'AGUARDANDO_APROVACAO') {
    statusBlock = (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center mt-3">
        <div className="text-2xl">⏳</div>
        <div className="font-bold mt-1.5">Aguardando cliente</div>
        <div className="text-[12px] text-text-mute mt-1">Você foi o primeiro a aceitar. Agora o cliente decide.</div>
      </div>
    );
  } else if (servico.estado === 'APROVADO') {
    statusBlock = (
      <div className="bg-emerald-500/5 border border-emerald-500 rounded-2xl p-5 text-center mt-3">
        <div className="text-2xl">🎉</div>
        <div className="font-bold mt-1.5">Você foi aprovado!</div>
        <div className="text-[12px] text-text-mute mt-1">O cliente vai entrar em contato pelo WhatsApp.</div>
      </div>
    );
  } else if (servico.estado === 'CONCLUIDO') {
    statusBlock = (
      <div className="bg-emerald-500/5 border border-emerald-500 rounded-2xl p-5 text-center mt-3">
        <div className="text-2xl">✓</div>
        <div className="font-bold mt-1.5">Concluído</div>
      </div>
    );
  } else if (servico.estado === 'ABERTO' || servico.estado === 'CANCELADO') {
    statusBlock = (
      <div className="bg-red-500/5 border border-red-500 rounded-2xl p-5 text-center mt-3">
        <div className="font-bold">Cliente recusou</div>
        <div className="text-[12px] text-text-mute mt-1">Continue swipando.</div>
      </div>
    );
  }

  return (
    <>
      <Header onBack={onBack} title="" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div
          className="w-[calc(100%+40px)] -mx-5 h-[200px] bg-cover bg-center"
          style={{ backgroundImage: `url('${servico.fotos[0] || ''}')` }}
        />
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
          <div className="text-text-dim leading-relaxed text-[14px]">{servico.descricao}</div>
          {statusBlock}
        </div>
      </div>
    </>
  );
}

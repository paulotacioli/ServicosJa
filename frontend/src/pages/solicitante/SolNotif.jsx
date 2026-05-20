import { useEffect, useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { Header, EmptyCard } from '../../components/UI';
import { timeAgo } from '../../lib/helpers';

export function SolNotif({ onOpenService, onUnreadChange }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await apiSolicitante.notificacoes();
        setNotifs(list);
        await apiSolicitante.notifMarcarTodasLidas();
        onUnreadChange?.(false);
      } catch {}
    })();
  }, []);

  const click = async (n) => {
    if (n.servicoId) onOpenService(n.servicoId);
  };

  return (
    <>
      <Header title="Avisos" sub="Atualizações dos seus serviços" />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {notifs.length === 0 && <EmptyCard>Você ainda não tem avisos</EmptyCard>}
        {notifs.map(n => (
          <button
            key={n.id}
            onClick={() => click(n)}
            className={`w-full text-left bg-surface border rounded-2xl p-3.5 mb-2 cursor-pointer flex gap-3 items-start ${n.lida ? 'border-border' : 'border-accent'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
              {n.tipo === 'PRESTADOR_ACEITOU' ? '✨' : '📋'}
            </div>
            <div className="flex-1 text-[13px] leading-snug">
              <div className="font-semibold">{n.titulo}</div>
              <div className="text-text-dim mt-0.5">{n.mensagem}</div>
              <div className="text-[11px] text-text-mute mt-1">{timeAgo(n.criadoEm)}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { Header, IconButton, SectionTitle, Badge, EmptyCard } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useSession } from '../../context/SessionContext';

export function SolHome({ onOpenService, onPublish, onNotif, hasUnread }) {
  const { solicitante } = useSession();
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await apiSolicitante.meusServicos();
        if (alive) setServicos(data);
      } catch {}
    };
    load();
    const id = setInterval(load, 3000); // polling para atualizar quando prestador aceita
    return () => { alive = false; clearInterval(id); };
  }, []);

  const grupos = {
    'Aguardando aprovação': servicos.filter(s => s.estado === 'AGUARDANDO_APROVACAO'),
    'Aprovados': servicos.filter(s => s.estado === 'APROVADO'),
    'Abertos': servicos.filter(s => s.estado === 'ABERTO'),
    'Histórico': servicos.filter(s => ['CONCLUIDO', 'CANCELADO'].includes(s.estado)),
  };

  const algumGrupo = Object.values(grupos).some(g => g.length > 0);

  return (
    <>
      <Header
        title={`Olá, ${solicitante.nome.split(' ')[0]}`}
        sub={solicitante.cidade}
        right={
          <IconButton onClick={onNotif} hasDot={hasUnread}>
            <Icon.Bell />
          </IconButton>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {!algumGrupo && (
          <div className="pt-16 text-center">
            <div className="text-5xl mb-3">🛠️</div>
            <div className="font-display font-bold text-xl mb-1">Sem serviços ainda</div>
            <div className="text-text-mute text-[13px] max-w-[260px] mx-auto leading-relaxed">
              Toque no botão verde no canto para publicar seu primeiro pedido.
            </div>
          </div>
        )}

        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map(s => (
                <button
                  key={s.id}
                  onClick={() => onOpenService(s.id)}
                  className="w-full text-left bg-surface border border-border rounded-2xl p-3.5 mb-2.5 cursor-pointer flex gap-3 items-center hover:border-text-mute transition"
                >
                  <div
                    className="w-[60px] h-[60px] rounded-xl bg-cover bg-center flex-shrink-0 border border-border"
                    style={{ backgroundImage: `url('${s.fotos[0] || ''}')` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] mb-1 truncate">{s.titulo}</div>
                    <div className="flex items-center gap-2 text-[11px] text-text-mute">
                      <Badge estado={s.estado} />
                      <span>·</span>
                      <span className="truncate">{s.categoria.split(' ')[0]}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={onPublish}
        className="absolute bottom-[90px] right-[18px] w-14 h-14 rounded-full bg-accent text-bg flex items-center justify-center z-10 shadow-[0_10px_30px_rgba(214,255,58,0.3)]"
      >
        <Icon.Plus />
      </button>
    </>
  );
}

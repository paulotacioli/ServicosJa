import { useEffect, useState } from 'react';
import { apiPrestador } from '../../lib/api';
import { Header, SectionTitle, Badge, EmptyCard } from '../../components/UI';

export function PrestAceites({ onOpen }) {
  const [aceites, setAceites] = useState([]);

  useEffect(() => {
    const load = async () => {
      try { setAceites(await apiPrestador.meusAceites()); } catch {}
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const grupos = {
    'Aguardando cliente decidir': aceites.filter(s => s.estado === 'AGUARDANDO_APROVACAO'),
    'Aprovados': aceites.filter(s => s.estado === 'APROVADO'),
    'Concluídos': aceites.filter(s => s.estado === 'CONCLUIDO'),
    'Outros': aceites.filter(s => !['AGUARDANDO_APROVACAO', 'APROVADO', 'CONCLUIDO'].includes(s.estado)),
  };

  const algum = Object.values(grupos).some(g => g.length > 0);

  return (
    <>
      <Header title="Meus aceites" sub="Serviços que você aceitou" />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {!algum && <EmptyCard>Você ainda não aceitou nenhum serviço. Vá para a aba "Buscar".</EmptyCard>}

        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map(s => (
                <button
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  className="w-full text-left bg-surface border border-border rounded-2xl p-3.5 mb-2.5 flex gap-3 items-center hover:border-text-mute transition"
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
                      <span className="truncate">{s.bairro}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

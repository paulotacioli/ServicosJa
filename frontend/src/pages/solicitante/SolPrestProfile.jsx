import { useEffect, useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { Header, Card, SectionTitle, StatCard, Chip } from '../../components/UI';

export function SolPrestProfile({ prestadorId, onBack }) {
  const [p, setP] = useState(null);

  useEffect(() => {
    apiSolicitante.getPrestador(prestadorId).then(setP).catch(() => {});
  }, [prestadorId]);

  if (!p) return (<><Header onBack={onBack} title="Perfil do prestador" /><div className="px-5">Carregando…</div></>);

  const initials = p.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Header onBack={onBack} title="Perfil do prestador" />
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <div className="h-[120px] -mx-5" style={{ background: 'linear-gradient(135deg, #D6FF3A, #60A5FA)' }} />
        <div className="flex items-end -mt-[46px] pl-1.5">
          <div className="w-[90px] h-[90px] rounded-full bg-surface-2 border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[34px]">
            {initials}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3.5">{p.nome}</div>
        <div className="text-text-mute text-[13px] mt-0.5">{p.cidade}</div>

        <Card className="mt-4">
          <div className="text-[13px] leading-relaxed text-text-dim">
            {p.descricao || 'Prestador autônomo cadastrado no ServiçoJá.'}
          </div>
        </Card>

        <SectionTitle>Estatísticas</SectionTitle>
        <div className="flex gap-2 mb-4">
          <StatCard n={p.servicosConcluidos || 0} l="Concluídos" />
          <StatCard n={(p.categorias || []).length} l="Categorias" />
          <StatCard n={(p.bairros || []).length} l="Bairros" />
        </div>

        <SectionTitle>Especialidades</SectionTitle>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {(p.categorias || []).map(c => <Chip key={c}>{c}</Chip>)}
        </div>

        <SectionTitle>Atua em</SectionTitle>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {(p.bairros || []).map(b => <Chip key={b}>{b}</Chip>)}
        </div>
      </div>
    </>
  );
}

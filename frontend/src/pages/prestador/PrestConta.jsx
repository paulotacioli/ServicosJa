import { useEffect, useState } from 'react';
import { apiPrestador } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { Header, SectionTitle, StatCard, Chip, Button } from '../../components/UI';

export function PrestConta() {
  const { prestador, logoutPrestador } = useSession();
  const [stats, setStats] = useState({ aceitos: 0, aprovados: 0, concluidos: 0 });

  useEffect(() => {
    (async () => {
      try {
        const aceites = await apiPrestador.meusAceites();
        setStats({
          aceitos: aceites.length,
          aprovados: aceites.filter(s => ['APROVADO', 'CONCLUIDO'].includes(s.estado)).length,
          concluidos: aceites.filter(s => s.estado === 'CONCLUIDO').length,
        });
      } catch {}
    })();
  }, []);

  const initials = prestador.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Header title="Meu perfil" sub={prestador.email} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="h-[120px] -mx-5" style={{ background: 'linear-gradient(135deg, #60A5FA, #2A2A33)' }} />
        <div className="flex items-end -mt-[46px] pl-1.5">
          <div
            className="w-[90px] h-[90px] rounded-full border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[34px]"
            style={{ background: '#60A5FA', color: '#0E0E10' }}
          >
            {initials}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3.5">{prestador.nome}</div>
        <div className="text-text-mute text-[13px] mt-0.5">{prestador.cidade}</div>

        <SectionTitle>Estatísticas</SectionTitle>
        <div className="flex gap-2">
          <StatCard n={stats.aceitos} l="Aceitos" />
          <StatCard n={stats.aprovados} l="Aprovados" />
          <StatCard n={stats.concluidos} l="Concluídos" />
        </div>

        <SectionTitle>Categorias que atendo</SectionTitle>
        <div className="flex gap-1.5 flex-wrap">
          {(prestador.categorias || []).map(c => <Chip key={c} active accentColor="#60A5FA">{c}</Chip>)}
        </div>

        <SectionTitle>Bairros de atuação</SectionTitle>
        <div className="flex gap-1.5 flex-wrap mb-5">
          {(prestador.bairros || []).map(b => <Chip key={b}>{b}</Chip>)}
        </div>

        <Button variant="ghost" onClick={logoutPrestador}>Sair</Button>
      </div>
    </>
  );
}

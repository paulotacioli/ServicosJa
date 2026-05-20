import { useEffect, useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { useSession } from '../../context/SessionContext';
import { Header, SectionTitle, StatCard, Button } from '../../components/UI';

export function SolConta() {
  const { solicitante, logoutSolicitante } = useSession();
  const [stats, setStats] = useState({ pub: 0, andamento: 0, conc: 0 });

  useEffect(() => {
    (async () => {
      try {
        const servicos = await apiSolicitante.meusServicos();
        setStats({
          pub: servicos.length,
          andamento: servicos.filter(s => ['APROVADO', 'AGUARDANDO_APROVACAO'].includes(s.estado)).length,
          conc: servicos.filter(s => s.estado === 'CONCLUIDO').length,
        });
      } catch {}
    })();
  }, []);

  const initials = solicitante.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Header title="Minha conta" sub={solicitante.email} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="h-[120px] -mx-5" style={{ background: 'linear-gradient(135deg, #D6FF3A, #60A5FA)' }} />
        <div className="flex items-end -mt-[46px] pl-1.5">
          <div className="w-[90px] h-[90px] rounded-full bg-surface-2 border-4 border-bg-soft flex items-center justify-center font-display font-bold text-[34px]">
            {initials}
          </div>
        </div>
        <div className="font-display text-2xl font-bold tracking-tight mt-3.5">{solicitante.nome}</div>
        <div className="text-text-mute text-[13px] mt-0.5">{solicitante.cidade}</div>

        <SectionTitle>Estatísticas</SectionTitle>
        <div className="flex gap-2 mb-5">
          <StatCard n={stats.pub} l="Publicados" />
          <StatCard n={stats.andamento} l="Em andamento" />
          <StatCard n={stats.conc} l="Concluídos" />
        </div>

        <Button variant="ghost" onClick={logoutSolicitante}>Sair</Button>
      </div>
    </>
  );
}

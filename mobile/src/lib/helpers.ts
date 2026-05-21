export function timeAgo(ts: string | number): string {
  const d = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m} min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h atrás`;
  return `${Math.floor(h / 24)} d atrás`;
}

export function formatWpp(n: string): string {
  if (!n) return '';
  const clean = n.replace(/\D/g, '');
  if (clean.length === 13) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  return n;
}

export function initials(name: string): string {
  if (!name) return '';
  return name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
}

export type EstadoServico = 'ABERTO' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'CONCLUIDO' | 'CANCELADO';

export function badgeInfo(estado: EstadoServico): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ABERTO:               { label: 'Aberto',     bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA' },
    AGUARDANDO_APROVACAO: { label: 'Aguardando', bg: 'rgba(251,146,60,0.15)', color: '#FB923C' },
    APROVADO:             { label: 'Aprovado',   bg: 'rgba(52,211,153,0.15)', color: '#34D399' },
    CONCLUIDO:            { label: 'Concluído',  bg: 'rgba(161,161,170,0.15)',color: '#A1A1AA' },
    CANCELADO:            { label: 'Cancelado',  bg: 'rgba(248,113,113,0.15)',color: '#F87171' },
  };
  return map[estado] || map.CONCLUIDO;
}

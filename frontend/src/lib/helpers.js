export function timeAgo(ts) {
  const d = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m} min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h atrás`;
  const days = Math.floor(h / 24);
  return `${days} d atrás`;
}

export function formatWpp(n) {
  if (!n) return '';
  const clean = n.replace(/\D/g, '');
  if (clean.length === 13) return `+${clean.slice(0,2)} (${clean.slice(2,4)}) ${clean.slice(4,9)}-${clean.slice(9)}`;
  return n;
}

export function initials(name) {
  if (!name) return '';
  return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
}

export function badgeClasses(estado) {
  const map = {
    ABERTO:               { cls: 'bg-blue-500/15 text-blue-400', label: 'Aberto' },
    AGUARDANDO_APROVACAO: { cls: 'bg-orange-500/15 text-orange-400', label: 'Aguardando' },
    APROVADO:             { cls: 'bg-emerald-500/15 text-emerald-400', label: 'Aprovado' },
    CONCLUIDO:            { cls: 'bg-zinc-500/15 text-zinc-400', label: 'Concluído' },
    CANCELADO:            { cls: 'bg-red-500/15 text-red-400', label: 'Cancelado' },
  };
  return map[estado] || map.CONCLUIDO;
}

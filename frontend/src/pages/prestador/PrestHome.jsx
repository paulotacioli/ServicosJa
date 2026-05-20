import { useEffect, useRef, useState } from 'react';
import { apiPrestador } from '../../lib/api';
import { Header, IconButton } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { useToast } from '../../context/ToastContext';
import { useSession } from '../../context/SessionContext';
import { timeAgo } from '../../lib/helpers';

export function PrestHome() {
  const { prestador } = useSession();
  const [feed, setFeed] = useState([]);
  const [idx, setIdx] = useState(0);
  const toast = useToast();

  const loadFeed = async () => {
    try {
      const data = await apiPrestador.feed();
      setFeed(data);
      setIdx(0);
    } catch (e) { toast(e.message, 'error'); }
  };

  useEffect(() => { loadFeed(); }, []);

  const onSwipe = (dir) => {
    const s = feed[idx];
    if (!s) return;
    setIdx((prev) => prev + 1);
    if (dir === 'yes') {
      apiPrestador.aceitarServico(s.id)
        .then(() => toast('✓ Aceito! O cliente foi avisado.', 'success'))
        .catch((e) => toast(e.message, 'error'));
    } else {
      apiPrestador.recusarServicoSwipe(s.id)
        .catch((e) => toast(e.message, 'error'));
    }
  };

  const empty = idx >= feed.length;

  return (
    <>
      <Header
        title={`Olá, ${prestador.nome.split(' ')[0]}`}
        sub="Veja, aceite ou recuse"
        right={
          <IconButton onClick={loadFeed} title="Atualizar">
            <Icon.Refresh />
          </IconButton>
        }
      />
      <div className="flex-1 px-5 pb-3.5 pt-3.5 flex flex-col">
        <div className="flex-1 relative">
          {empty ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3.5 text-text-mute p-8">
              <div className="text-5xl">🎯</div>
              <div className="font-display text-lg font-bold text-text-main">Você está em dia</div>
              <div className="text-[13px] max-w-[240px] leading-relaxed">
                Não há novos serviços nas suas categorias. Toque no botão de atualizar.
              </div>
            </div>
          ) : (
            <SwipeStack feed={feed} idx={idx} onSwipe={onSwipe} />
          )}
        </div>

        {!empty && (
          <div className="flex justify-center gap-5 pt-4 flex-shrink-0">
            <button
              onClick={() => onSwipe('no')}
              className="w-16 h-16 rounded-full bg-surface border-2 border-red-500 text-red-500 flex items-center justify-center active:scale-90 transition"
            >
              <Icon.X />
            </button>
            <button
              onClick={() => onSwipe('yes')}
              className="w-16 h-16 rounded-full bg-emerald-400 text-bg flex items-center justify-center active:scale-90 transition"
            >
              <Icon.Check />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SwipeStack({ feed, idx, onSwipe }) {
  // Mostra até 3 cards empilhados
  const visible = feed.slice(idx, idx + 3);
  return (
    <>
      {visible.slice().reverse().map((s, i) => {
        const isTop = i === visible.length - 1;
        const depth = visible.length - 1 - i;
        return (
          <SwipeCard
            key={s.id}
            servico={s}
            isTop={isTop}
            depth={depth}
            onSwipe={onSwipe}
          />
        );
      })}
    </>
  );
}

function SwipeCard({ servico, isTop, depth, onSwipe }) {
  const cardRef = useRef(null);
  const stampAcceptRef = useRef(null);
  const stampRejectRef = useRef(null);

  useEffect(() => {
    if (!isTop || !cardRef.current) return;

    const card = cardRef.current;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;

    const onStart = (cx, cy) => { startX = cx; startY = cy; dragging = true; card.classList.add('grabbing'); };
    const onMove = (cx, cy) => {
      if (!dragging) return;
      dx = cx - startX; dy = cy - startY;
      const rot = dx / 15;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      if (stampAcceptRef.current) stampAcceptRef.current.style.opacity = Math.max(0, Math.min(1, dx / 80));
      if (stampRejectRef.current) stampRejectRef.current.style.opacity = Math.max(0, Math.min(1, -dx / 80));
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('grabbing');
      if (dx > 100) doExit('yes');
      else if (dx < -100) doExit('no');
      else { card.style.transform = ''; if (stampAcceptRef.current) stampAcceptRef.current.style.opacity = 0; if (stampRejectRef.current) stampRejectRef.current.style.opacity = 0; }
    };
    const doExit = (dir) => {
      card.style.transform = dir === 'yes' ? 'translate(600px, -50px) rotate(30deg)' : 'translate(-600px, -50px) rotate(-30deg)';
      card.style.opacity = '0';
      setTimeout(() => onSwipe(dir), 280);
    };

    const md = (e) => onStart(e.clientX, e.clientY);
    const mm = (e) => onMove(e.clientX, e.clientY);
    const mu = () => onEnd();
    const ts = (e) => onStart(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const te = () => onEnd();

    card.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    card.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te);
    return () => {
      card.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      card.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', te);
    };
  }, [isTop, onSwipe]);

  const scale = 1 - depth * 0.04;
  const translateY = depth * -10;

  return (
    <div
      ref={cardRef}
      className="swipe-card absolute inset-0 bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col select-none"
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: 10 - depth,
        cursor: isTop ? 'grab' : 'default',
      }}
    >
      <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider z-[2]">
        {servico.categoria}
      </div>
      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 z-[2]">
        <Icon.Loc /> {servico.bairro}
      </div>

      <div
        ref={stampAcceptRef}
        className="absolute top-7 right-4 px-5 py-2.5 rounded-lg font-display font-extrabold text-[28px] tracking-wider border-4 border-emerald-400 text-emerald-400 opacity-0 z-[3]"
        style={{ transform: 'rotate(15deg)' }}
      >ACEITAR</div>
      <div
        ref={stampRejectRef}
        className="absolute top-7 left-4 px-5 py-2.5 rounded-lg font-display font-extrabold text-[28px] tracking-wider border-4 border-red-500 text-red-500 opacity-0 z-[3]"
        style={{ transform: 'rotate(-15deg)' }}
      >RECUSAR</div>

      <div
        className="w-full h-[55%] bg-cover bg-center relative"
        style={{ backgroundImage: `url('${servico.fotos[0] || ''}')` }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(30,30,36,0.95) 100%)' }} />
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="font-display text-[22px] font-bold tracking-tight leading-tight">{servico.titulo}</div>
        <div className="text-[13px] text-text-dim leading-relaxed flex-1">{servico.descricao}</div>
        <div className="flex items-center gap-2 text-[11px] text-text-mute border-t border-border pt-2.5 mt-auto">
          <Icon.Loc /> {servico.cidade} · publicado {timeAgo(servico.criadoEm)}
        </div>
      </div>
    </div>
  );
}

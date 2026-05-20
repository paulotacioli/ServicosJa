import { badgeClasses } from '../lib/helpers';

export function Badge({ estado }) {
  const { cls, label } = badgeClasses(estado);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-text-mute mt-5 mb-3">
      {children}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyCard({ children }) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center text-text-mute text-[13px]">
      {children}
    </div>
  );
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { md: 'w-12 h-12 text-lg', lg: 'w-[90px] h-[90px] text-[34px]' };
  const initials = name ? name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() : '';
  return (
    <div className={`rounded-full bg-surface-2 flex items-center justify-center font-display font-bold flex-shrink-0 ${sizes[size]}`}>
      {initials}
    </div>
  );
}

export function StatCard({ n, l }) {
  return (
    <div className="flex-1 bg-surface border border-border rounded-2xl p-3">
      <div className="font-display font-bold text-[22px]">{n}</div>
      <div className="text-[11px] text-text-mute uppercase tracking-wider mt-0.5">{l}</div>
    </div>
  );
}

export function Chip({ children, active = false, accentColor = '#D6FF3A' }) {
  if (active) {
    return (
      <div
        className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
        style={{ background: accentColor, color: accentColor === '#D6FF3A' ? '#0E0E10' : '#fff' }}
      >
        {children}
      </div>
    );
  }
  return (
    <div className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text-dim">
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', accentColor = '#D6FF3A', ...rest }) {
  const variants = {
    primary: { background: accentColor, color: accentColor === '#D6FF3A' ? '#0E0E10' : '#fff' },
    success: { background: '#34D399', color: '#0E0E10' },
    danger: { background: '#F87171', color: '#fff' },
    wpp: { background: '#25D366', color: '#fff' },
    ghost: { background: 'transparent', color: '#F4F4F6', border: '1px solid #2E2E38' },
  };
  return (
    <button
      className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={variants[variant]}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Header({ title, sub, right, onBack }) {
  return (
    <div className="px-5 pt-2 pb-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-text-mute hover:text-text-main text-[13px] font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        )}
        <div>
          <h1 className="font-display font-bold text-[22px] tracking-tight">{title}</h1>
          {sub && <div className="text-[12px] text-text-mute mt-0.5">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function IconButton({ children, onClick, hasDot = false, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-[38px] h-[38px] rounded-xl bg-surface border border-border flex items-center justify-center text-text-main hover:bg-surface-2 relative"
    >
      {children}
      {hasDot && <span className="absolute top-2 right-2 w-[9px] h-[9px] rounded-full bg-red-500 border-2 border-bg-soft" />}
    </button>
  );
}

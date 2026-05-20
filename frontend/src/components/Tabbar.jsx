export function Tabbar({ tabs, active, onChange, accentColor = '#D6FF3A' }) {
  return (
    <div
      className="flex-shrink-0 h-[74px] px-4 pb-[18px] pt-2 flex justify-around items-center border-t border-border backdrop-blur-xl"
      style={{ background: 'rgba(14,14,16,0.85)' }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10.5px] font-medium tracking-wide transition-colors"
            style={{ color: isActive ? '#F4F4F6' : '#6B6B78' }}
          >
            <span style={{ color: isActive ? accentColor : '#6B6B78' }}>{t.icon}</span>
            {t.label}
            {t.dot && <span className="absolute mt-[-22px] ml-4 w-2 h-2 rounded-full bg-red-500" />}
          </button>
        );
      })}
    </div>
  );
}

export function Phone({ children, label, accentColor = 'accent' }) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="font-display font-semibold text-[13px] tracking-[0.18em] uppercase text-text-mute">
        <span
          className="inline-block w-[7px] h-[7px] rounded-full mr-2 align-middle"
          style={{
            background: accentColor === 'accent' ? '#D6FF3A' : '#60A5FA',
            boxShadow: `0 0 12px ${accentColor === 'accent' ? '#D6FF3A' : '#60A5FA'}`,
          }}
        />
        {label}
      </div>
      <div className="phone-frame">
        <StatusBar />
        <div className="flex-1 overflow-hidden relative bg-bg-soft">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-[46px] px-8 flex items-end justify-between pb-1.5 text-[13px] font-semibold text-text-main flex-shrink-0">
      <span>9:41</span>
      <div className="flex gap-1.5 items-center">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4" y="4" width="3" height="7" rx="1"/><rect x="8" y="2" width="3" height="9" rx="1"/><rect x="12" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="18" height="10" rx="2"/><rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { SolicitanteApp } from './pages/SolicitanteApp';
import { PrestadorApp } from './pages/PrestadorApp';

export default function App() {
  return (
    <ToastProvider>
      <SessionProvider>
        <div className="stage flex gap-8 items-center justify-center w-full h-full p-6">
          <SolicitanteApp />
          <PrestadorApp />
        </div>

        <div className="fixed top-5 left-5 bg-bg-soft/85 backdrop-blur-md border border-border rounded-2xl px-4 py-3.5 text-[11px] text-text-dim max-w-[260px] leading-relaxed z-[9000]">
          <div className="font-display font-semibold text-[13px] text-text-main mb-1">ServiçoJá — Demo</div>
          Dois apps lado a lado: <code className="bg-surface-2 px-1 py-0.5 rounded text-[10px] text-accent">Solicitante</code> e <code className="bg-surface-2 px-1 py-0.5 rounded text-[10px] text-accent">Prestador</code>.
          <div className="mt-2 text-text-mute">
            Logins: <code className="bg-surface-2 px-1 py-0.5 rounded text-[10px]">maria@demo.com</code>, <code className="bg-surface-2 px-1 py-0.5 rounded text-[10px]">joao@demo.com</code> / senha <code className="bg-surface-2 px-1 py-0.5 rounded text-[10px]">demo</code>
          </div>
        </div>
      </SessionProvider>
    </ToastProvider>
  );
}

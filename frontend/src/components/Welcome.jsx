import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export function Welcome({ role, onLogin, onSignup, brandAccent = '#D6FF3A' }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState(role === 'solicitante' ? 'maria@demo.com' : 'joao@demo.com');
  const [senha, setSenha] = useState('demo');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('São Paulo');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, senha);
      } else {
        await onSignup({ nome, email, senha, whatsapp, cidade });
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isPrestador = role === 'prestador';

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-8 pt-14 overflow-y-auto no-scrollbar">
      <div>
        <div className="font-display text-[54px] font-extrabold leading-none tracking-tight">
          Serviço<span style={{ color: brandAccent }}>Já.</span>
        </div>
        <div className="mt-4 text-text-dim text-[15px] leading-relaxed max-w-[280px]">
          {isPrestador
            ? 'Receba demandas reais por categoria e bairro. Aceite ou recuse — sem prospecção, sem ligação fria.'
            : 'Publique o que você precisa em casa. Prestadores qualificados aceitam e você decide quem entra.'}
        </div>
      </div>

      <div className="h-[140px] relative -mx-8 my-2 overflow-hidden">
        <div className="blob b1" style={isPrestador ? { background: '#60A5FA' } : {}} />
        <div className="blob b2" style={isPrestador ? { background: '#D6FF3A' } : {}} />
        <div className="blob b3" />
      </div>

      <form onSubmit={submit} className="space-y-2.5">
        {mode === 'signup' && (
          <>
            <Input value={nome} onChange={setNome} placeholder="Seu nome completo" required />
            <Input value={whatsapp} onChange={setWhatsapp} placeholder="WhatsApp (+5511...)" required />
            <Input value={cidade} onChange={setCidade} placeholder="Cidade" required />
          </>
        )}
        <Input value={email} onChange={setEmail} placeholder="E-mail" type="email" required />
        <Input value={senha} onChange={setSenha} placeholder="Senha" type="password" required />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-semibold text-[15px] mt-3 disabled:opacity-50"
          style={{ background: brandAccent, color: isPrestador ? '#fff' : '#0E0E10' }}
        >
          {loading ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full py-2 text-[13px] text-text-mute hover:text-text-main"
        >
          {mode === 'login' ? 'Não tem conta? Criar agora →' : 'Já tem conta? Entrar →'}
        </button>
      </form>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', required }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] text-text-main outline-none focus:border-accent transition"
    />
  );
}

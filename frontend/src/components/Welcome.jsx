import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const ESPECIALIDADES = [
  'Eletricista',
  'Encanador',
  'Pintor',
  'Pedreiro',
  'Marceneiro / Carpinteiro',
  'Jardineiro',
  'Diarista / Faxineiro(a)',
  'Cozinheiro(a)',
  'Montador de Móveis',
  'Técnico em Ar-condicionado',
  'Dedetizador',
  'Chaveiro',
  'Vidraceiro',
  'Gesseiro',
  'Outro',
];

export function Welcome({ role, onLogin, onSignup, brandAccent = '#D6FF3A' }) {
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState(role === 'solicitante' ? 'maria@demo.com' : 'joao@demo.com');
  const [loginSenha, setLoginSenha] = useState('demo');

  // Signup step 1
  const [selectedRole, setSelectedRole] = useState(role === 'prestador' ? 'prestador' : 'solicitante');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  // Signup step 2 (prestador)
  const [signupStep, setSignupStep] = useState(1);
  const [especialidade, setEspecialidade] = useState('');
  const [especialidadeOutro, setEspecialidadeOutro] = useState('');

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isPrestador = role === 'prestador';

  const handleCepChange = async (val) => {
    const cleaned = val.replace(/\D/g, '');
    setCep(cleaned);
    if (cleaned.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEstado(data.uf || '');
          setCidade(data.localidade || '');
          setRua(data.logradouro || '');
        } else {
          toast('CEP não encontrado', 'error');
        }
      } catch {
        toast('Erro ao buscar CEP', 'error');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      toast('As senhas não coincidem', 'error');
      return;
    }
    if (selectedRole === 'prestador') {
      setSignupStep(2);
    } else {
      doSignup();
    }
  };

  const doSignup = async (extra = {}) => {
    setLoading(true);
    try {
      await onSignup({
        tipo: selectedRole,
        nome,
        email,
        senha,
        whatsapp,
        cidade,
        cep,
        estado,
        rua,
        numero,
        complemento: complemento || undefined,
        ...extra,
      });
    } catch (err) {
      toast(err.message, 'error');
      setSignupStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!especialidade) { toast('Selecione uma especialidade', 'error'); return; }
    if (especialidade === 'Outro' && !especialidadeOutro.trim()) {
      toast('Informe sua especialidade', 'error');
      return;
    }
    const esp = especialidade === 'Outro' ? especialidadeOutro.trim() : especialidade;
    doSignup({
      especialidade: esp,
      categorias: [esp],
      bairros: [],
      descricao: 'Profissional autônomo cadastrado no ServiçoJá.',
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(loginEmail, loginSenha);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => { setMode('signup'); setSignupStep(1); };
  const switchToLogin = () => { setMode('login'); setSignupStep(1); };

  return (
    <div className="absolute inset-0 flex flex-col p-8 pt-12 overflow-y-auto no-scrollbar gap-4">
      <div>
        <div className="font-display text-[48px] font-extrabold leading-none tracking-tight">
          Serviço<span style={{ color: brandAccent }}>Já.</span>
        </div>
        <div className="mt-3 text-text-dim text-[14px] leading-relaxed max-w-[280px]">
          {isPrestador
            ? 'Receba demandas reais por categoria e bairro. Aceite ou recuse — sem prospecção, sem ligação fria.'
            : 'Publique o que você precisa em casa. Prestadores qualificados aceitam e você decide quem entra.'}
        </div>
      </div>

      <div className="h-[80px] relative -mx-8 overflow-hidden">
        <div className="blob b1" style={isPrestador ? { background: '#60A5FA' } : {}} />
        <div className="blob b2" style={isPrestador ? { background: '#D6FF3A' } : {}} />
        <div className="blob b3" />
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-2.5">
          <Input value={loginEmail} onChange={setLoginEmail} placeholder="E-mail" type="email" required />
          <Input value={loginSenha} onChange={setLoginSenha} placeholder="Senha" type="password" required />
          <Btn loading={loading} accent={brandAccent} isPrestador={isPrestador}>Entrar</Btn>
          <LinkBtn onClick={switchToSignup}>Não tem conta? Criar agora →</LinkBtn>
        </form>
      ) : signupStep === 1 ? (
        <form onSubmit={handleStep1} className="space-y-2">
          {/* Seletor de perfil */}
          <div className="flex gap-2 pb-1">
            <RoleBtn
              label="Cliente"
              active={selectedRole === 'solicitante'}
              onClick={() => setSelectedRole('solicitante')}
              accent={brandAccent}
              isPrestador={isPrestador}
            />
            <RoleBtn
              label="Prestador"
              active={selectedRole === 'prestador'}
              onClick={() => setSelectedRole('prestador')}
              accent={brandAccent}
              isPrestador={isPrestador}
            />
          </div>

          <Input value={nome} onChange={setNome} placeholder="Nome completo" required />
          <Input value={whatsapp} onChange={setWhatsapp} placeholder="WhatsApp (ex: 11999999999)" required />
          <Input value={email} onChange={setEmail} placeholder="E-mail" type="email" required />

          {/* CEP */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="CEP (somente números)"
              maxLength={8}
              required
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] text-text-main outline-none focus:border-accent transition pr-24"
            />
            {cepLoading && (
              <span className="absolute right-3 top-3 text-[12px] text-text-mute">buscando...</span>
            )}
          </div>

          {/* Endereço auto-preenchido */}
          <div className="flex gap-2">
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="UF"
              maxLength={2}
              className="w-16 bg-surface border border-border rounded-xl px-3 py-3 text-[14px] text-text-main outline-none focus:border-accent transition text-center"
            />
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              required
              className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] text-text-main outline-none focus:border-accent transition"
            />
          </div>
          <Input value={rua} onChange={setRua} placeholder="Rua / Logradouro" required />

          <div className="flex gap-2">
            <div className="w-28">
              <Input value={numero} onChange={setNumero} placeholder="Número" required />
            </div>
            <div className="flex-1">
              <Input value={complemento} onChange={setComplemento} placeholder="Complemento (opcional)" />
            </div>
          </div>

          <Input value={senha} onChange={setSenha} placeholder="Senha" type="password" required />
          <Input value={confirmarSenha} onChange={setConfirmarSenha} placeholder="Confirmar senha" type="password" required />

          <Btn loading={loading} accent={brandAccent} isPrestador={isPrestador}>
            {selectedRole === 'prestador' ? 'Avançar →' : (loading ? '...' : 'Criar conta')}
          </Btn>
          <LinkBtn onClick={switchToLogin}>Já tem conta? Entrar →</LinkBtn>
        </form>
      ) : (
        /* Step 2 — Especialidade do prestador */
        <form onSubmit={handleStep2} className="space-y-3">
          <button
            type="button"
            onClick={() => setSignupStep(1)}
            className="text-[13px] text-text-mute hover:text-text-main flex items-center gap-1"
          >
            ← Voltar
          </button>

          <div>
            <p className="text-[15px] font-semibold text-text-main mb-1">Qual é a sua especialidade?</p>
            <p className="text-[12px] text-text-dim">Escolha a que melhor descreve seu trabalho principal.</p>
          </div>

          <select
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            required
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] text-text-main outline-none focus:border-accent transition appearance-none"
          >
            <option value="">Selecione uma especialidade...</option>
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>

          {especialidade === 'Outro' && (
            <Input
              value={especialidadeOutro}
              onChange={setEspecialidadeOutro}
              placeholder="Descreva sua especialidade"
              required
            />
          )}

          <Btn loading={loading} accent={brandAccent} isPrestador={isPrestador}>
            {loading ? '...' : 'Concluir cadastro'}
          </Btn>
        </form>
      )}
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

function Btn({ children, loading, accent, isPrestador }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-2xl font-semibold text-[15px] mt-1 disabled:opacity-50"
      style={{ background: accent, color: isPrestador ? '#fff' : '#0E0E10' }}
    >
      {children}
    </button>
  );
}

function LinkBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 text-[13px] text-text-mute hover:text-text-main"
    >
      {children}
    </button>
  );
}

function RoleBtn({ label, active, onClick, accent, isPrestador }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition"
      style={
        active
          ? { background: accent, color: isPrestador ? '#fff' : '#0E0E10', borderColor: accent }
          : { background: 'transparent', color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }
      }
    >
      {label}
    </button>
  );
}

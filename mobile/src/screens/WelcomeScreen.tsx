import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { C } from '../lib/colors';
import { CATEGORIAS } from '../lib/constants';

type Mode = 'login' | 'signup';
type Role = 'solicitante' | 'prestador';

export function WelcomeScreen() {
  const { login, signup } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginRole, setLoginRole] = useState<Role>('solicitante');

  // Signup step 1
  const [role, setRole] = useState<Role>('solicitante');
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

  // Signup step 2
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const accent = loginRole === 'prestador' || role === 'prestador' ? C.blue : C.accent;

  const buscarCep = async (val: string) => {
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
        } else toast('CEP não encontrado', 'error');
      } catch { toast('Erro ao buscar CEP', 'error'); }
      finally { setCepLoading(false); }
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(loginEmail, loginSenha, loginRole);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally { setLoading(false); }
  };

  const handleStep1 = () => {
    if (senha !== confirmarSenha) { toast('As senhas não coincidem', 'error'); return; }
    if (role === 'prestador') setStep(2);
    else doSignup();
  };

  const doSignup = async (extra: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      await signup({
        tipo: role, nome, email, senha, whatsapp,
        cidade: cidade || 'Não informado', cep, estado, rua, numero,
        complemento: complemento || undefined, ...extra,
      });
    } catch (e: any) {
      toast(e.message, 'error');
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleStep2 = () => {
    if (selectedCats.length === 0) { toast('Selecione ao menos uma especialidade', 'error'); return; }
    doSignup({ categorias: selectedCats, bairros: [], descricao: 'Profissional autônomo cadastrado no ServiçoJá.' });
  };

  const toggleCat = (cat: string) =>
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>
          Serviço<Text style={{ color: accent }}>Já.</Text>
        </Text>
        <Text style={s.subtitle}>
          {mode === 'login'
            ? 'Conecte-se à sua conta para continuar'
            : 'Crie sua conta e comece agora'}
        </Text>

        {mode === 'login' ? (
          <>
            {/* Role selector */}
            <View style={s.roleRow}>
              {(['solicitante', 'prestador'] as Role[]).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setLoginRole(r)}
                  style={[s.roleBtn, loginRole === r && { backgroundColor: accent, borderColor: accent }]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.roleBtnText, loginRole === r && { color: accent === C.blue ? '#fff' : C.bg }]}>
                    {r === 'solicitante' ? 'Cliente' : 'Prestador'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field label="E-mail">
              <Input value={loginEmail} onChangeText={setLoginEmail} placeholder="seu@email.com" keyboardType="email-address" />
            </Field>
            <Field label="Senha">
              <Input value={loginSenha} onChangeText={setLoginSenha} placeholder="••••••" secureTextEntry />
            </Field>

            <TouchableOpacity
              onPress={handleLogin} disabled={loading}
              style={[s.submitBtn, { backgroundColor: accent }, loading && s.disabled]}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color={C.bg} />
                : <Text style={[s.submitText, { color: accent === C.blue ? '#fff' : C.bg }]}>Entrar</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMode('signup'); setStep(1); }} style={s.link}>
              <Text style={s.linkText}>Não tem conta? Criar agora →</Text>
            </TouchableOpacity>
          </>
        ) : step === 1 ? (
          <>
            <View style={s.roleRow}>
              {(['solicitante', 'prestador'] as Role[]).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[s.roleBtn, role === r && { backgroundColor: accent, borderColor: accent }]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.roleBtnText, role === r && { color: accent === C.blue ? '#fff' : C.bg }]}>
                    {r === 'solicitante' ? 'Cliente' : 'Prestador'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field label="Nome completo">
              <Input value={nome} onChangeText={setNome} placeholder="Seu nome" />
            </Field>
            <Field label="WhatsApp">
              <Input value={whatsapp} onChangeText={setWhatsapp} placeholder="11999999999" keyboardType="phone-pad" />
            </Field>
            <Field label="E-mail">
              <Input value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
            </Field>
            <Field label={`CEP ${cepLoading ? '(buscando...)' : ''}`}>
              <Input value={cep} onChangeText={buscarCep} placeholder="Somente números" keyboardType="numeric" maxLength={8} />
            </Field>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 64 }}>
                <Field label="UF">
                  <Input value={estado} onChangeText={setEstado} placeholder="SP" maxLength={2} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Cidade">
                  <Input value={cidade} onChangeText={setCidade} placeholder="Sua cidade" />
                </Field>
              </View>
            </View>
            <Field label="Rua">
              <Input value={rua} onChangeText={setRua} placeholder="Logradouro" />
            </Field>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 100 }}>
                <Field label="Número">
                  <Input value={numero} onChangeText={setNumero} placeholder="42" keyboardType="numeric" />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Complemento">
                  <Input value={complemento} onChangeText={setComplemento} placeholder="Apto (opcional)" />
                </Field>
              </View>
            </View>
            <Field label="Senha">
              <Input value={senha} onChangeText={setSenha} placeholder="Mínimo 6 caracteres" secureTextEntry />
            </Field>
            <Field label="Confirmar senha">
              <Input value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Repita a senha" secureTextEntry />
            </Field>

            <TouchableOpacity
              onPress={handleStep1} disabled={loading}
              style={[s.submitBtn, { backgroundColor: accent }, loading && s.disabled]}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color={C.bg} />
                : <Text style={[s.submitText, { color: accent === C.blue ? '#fff' : C.bg }]}>
                    {role === 'prestador' ? 'Avançar →' : 'Criar conta'}
                  </Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('login')} style={s.link}>
              <Text style={s.linkText}>Já tem conta? Entrar →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setStep(1)} style={s.link}>
              <Text style={s.linkText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={s.stepTitle}>Quais são suas especialidades?</Text>
            <Text style={s.stepSub}>Selecione uma ou mais categorias.</Text>
            <View style={s.catsGrid}>
              {CATEGORIAS.map(cat => {
                const active = selectedCats.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat} onPress={() => toggleCat(cat)} activeOpacity={0.7}
                    style={[s.catChip, active && { backgroundColor: accent, borderColor: accent }]}
                  >
                    <Text style={[s.catChipText, active && { color: C.bg }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={handleStep2} disabled={loading}
              style={[s.submitBtn, { backgroundColor: accent }, loading && s.disabled]}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color={C.bg} />
                : <Text style={[s.submitText, { color: C.bg }]}>Concluir cadastro</Text>}
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={s.input}
      placeholderTextColor={C.textMute}
      autoCapitalize="none"
    />
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 48, fontWeight: '900', color: C.textMain, letterSpacing: -2 },
  subtitle: { fontSize: 14, color: C.textDim, marginTop: 8, marginBottom: 28 },

  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    borderColor: C.border, alignItems: 'center',
  },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: C.textDim },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 14, color: C.textMain,
  },

  submitBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.5 },

  link: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontSize: 13, color: C.textMute },

  stepTitle: { fontSize: 18, fontWeight: '700', color: C.textMain, marginBottom: 4, marginTop: 8 },
  stepSub: { fontSize: 12, color: C.textDim, marginBottom: 16 },
  catsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, backgroundColor: 'transparent',
  },
  catChipText: { fontSize: 12, fontWeight: '600', color: C.textDim },
});

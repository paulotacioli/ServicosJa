import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Header, SectionTitle, StatCard, Chip, Button } from '../components/UI';
import { C } from '../lib/colors';
import { initials } from '../lib/helpers';

type StatusVerificacao = 'PENDENTE' | 'EM_REVISAO' | 'APROVADO' | 'REPROVADO';

const STATUS_LABEL: Record<StatusVerificacao, string> = {
  PENDENTE: 'Pendente',
  EM_REVISAO: 'Em revisão',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};
const STATUS_COLOR: Record<StatusVerificacao, string> = {
  PENDENTE: '#B45309',
  EM_REVISAO: '#1D4ED8',
  APROVADO: '#15803D',
  REPROVADO: '#B91C1C',
};

export function PrestContaScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [stats, setStats] = useState({ aceitos: 0, aprovados: 0, concluidos: 0 });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const changeStatus = async (status: StatusVerificacao) => {
    setUpdatingStatus(true);
    try {
      await api.updateVerificacao(status);
      await refreshUser();
    } catch {}
    setUpdatingStatus(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const aceites = await api.meusAceites();
        setStats({
          aceitos: aceites.length,
          aprovados: aceites.filter((s: any) => ['APROVADO', 'CONCLUIDO'].includes(s.estado)).length,
          concluidos: aceites.filter((s: any) => s.estado === 'CONCLUIDO').length,
        });
      } catch {}
    })();
  }, []);

  const abbr = initials(user?.nome || '');

  return (
    <View style={s.root}>
      <Header title="Meu perfil" sub={user?.email} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.banner} />
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{abbr}</Text>
          </View>
        </View>

        <View style={s.content}>
          <Text style={s.name}>{user?.nome}</Text>
          <Text style={s.city}>{user?.cidade}</Text>

          {/* Badge de verificação */}
          {(() => {
            const sv = (user?.statusVerificacao ?? 'PENDENTE') as StatusVerificacao;
            return (
              <View style={[s.badge, { backgroundColor: STATUS_COLOR[sv] + '22', borderColor: STATUS_COLOR[sv] }]}>
                <View style={[s.badgeDot, { backgroundColor: STATUS_COLOR[sv] }]} />
                <Text style={[s.badgeText, { color: STATUS_COLOR[sv] }]}>
                  Verificação: {STATUS_LABEL[sv]}
                </Text>
              </View>
            );
          })()}

          {/* Controles de teste */}
          <SectionTitle>Simulação de verificação</SectionTitle>
          <View style={s.statusBtns}>
            {(['PENDENTE', 'EM_REVISAO', 'APROVADO', 'REPROVADO'] as StatusVerificacao[]).map(st => {
              const active = user?.statusVerificacao === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => changeStatus(st)}
                  disabled={updatingStatus || active}
                  style={[s.statusBtn, { borderColor: STATUS_COLOR[st] }, active && { backgroundColor: STATUS_COLOR[st] }]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.statusBtnText, { color: active ? '#fff' : STATUS_COLOR[st] }]}>
                    {STATUS_LABEL[st]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionTitle>Estatísticas</SectionTitle>
          <View style={s.statsRow}>
            <StatCard n={stats.aceitos} l="Aceitos" />
            <StatCard n={stats.aprovados} l="Aprovados" />
            <StatCard n={stats.concluidos} l="Concluídos" />
          </View>

          <SectionTitle>Categorias que atendo</SectionTitle>
          <View style={s.chips}>
            {(user?.categorias || []).map(c => <Chip key={c} active accentColor={C.blue}>{c}</Chip>)}
          </View>

          <SectionTitle>Bairros de atuação</SectionTitle>
          <View style={s.chips}>
            {(user?.bairros || []).map(b => <Chip key={b}>{b}</Chip>)}
          </View>

          <View style={{ marginTop: 24 }}>
            <Button variant="ghost" onPress={logout}>Sair</Button>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  banner: { height: 120, backgroundColor: C.blue },
  avatarWrap: { paddingLeft: 20, marginTop: -46 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.blue, borderWidth: 4, borderColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: C.bg },
  content: { paddingHorizontal: 20 },
  name: { fontSize: 24, fontWeight: '800', color: C.textMain, marginTop: 14 },
  city: { fontSize: 13, color: C.textMute, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginTop: 10,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statusBtn: {
    borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  statusBtnText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
});

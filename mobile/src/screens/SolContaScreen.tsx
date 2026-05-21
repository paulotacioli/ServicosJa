import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Header, SectionTitle, StatCard, Button } from '../components/UI';
import { C } from '../lib/colors';
import { initials } from '../lib/helpers';

export function SolContaScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ pub: 0, andamento: 0, conc: 0 });

  useEffect(() => {
    (async () => {
      try {
        const servicos = await api.meusServicos();
        setStats({
          pub: servicos.length,
          andamento: servicos.filter((s: any) => ['APROVADO', 'AGUARDANDO_APROVACAO'].includes(s.estado)).length,
          conc: servicos.filter((s: any) => s.estado === 'CONCLUIDO').length,
        });
      } catch {}
    })();
  }, []);

  const abbr = initials(user?.nome || '');

  return (
    <View style={s.root}>
      <Header title="Minha conta" sub={user?.email} />
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

          <SectionTitle>Estatísticas</SectionTitle>
          <View style={s.statsRow}>
            <StatCard n={stats.pub} l="Publicados" />
            <StatCard n={stats.andamento} l="Em andamento" />
            <StatCard n={stats.conc} l="Concluídos" />
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
  banner: { height: 120, backgroundColor: C.accent },
  avatarWrap: { paddingLeft: 20, marginTop: -46 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.surface2, borderWidth: 4, borderColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: C.textMain },
  content: { paddingHorizontal: 20 },
  name: { fontSize: 24, fontWeight: '800', color: C.textMain, marginTop: 14 },
  city: { fontSize: 13, color: C.textMute, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8 },
});

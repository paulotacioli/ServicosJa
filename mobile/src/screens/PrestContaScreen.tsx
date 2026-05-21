import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Header, SectionTitle, StatCard, Chip, Button } from '../components/UI';
import { C } from '../lib/colors';
import { initials } from '../lib/helpers';

export function PrestContaScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ aceitos: 0, aprovados: 0, concluidos: 0 });

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
  statsRow: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
});

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';
import { Header, SectionTitle, StatCard, Chip, Card, Loader } from '../components/UI';
import { C } from '../lib/colors';
import { initials } from '../lib/helpers';

export function SolPrestProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    api.getPrestador(id).then(setP).catch(() => {});
  }, [id]);

  if (!p) return (
    <View style={s.root}>
      <Header title="Perfil do prestador" onBack={() => router.back()} />
      <Loader />
    </View>
  );

  return (
    <View style={s.root}>
      <Header title="Perfil do prestador" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.banner} />
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials(p.nome)}</Text>
          </View>
        </View>
        <View style={s.content}>
          <Text style={s.name}>{p.nome}</Text>
          <Text style={s.city}>{p.cidade}</Text>

          <Card style={{ marginTop: 16 }}>
            <Text style={s.desc}>{p.descricao || 'Prestador autônomo cadastrado no ServiçoJá.'}</Text>
          </Card>

          <SectionTitle>Estatísticas</SectionTitle>
          <View style={s.statsRow}>
            <StatCard n={p.servicosConcluidos || 0} l="Concluídos" />
            <StatCard n={(p.categorias || []).length} l="Categorias" />
            <StatCard n={(p.bairros || []).length} l="Bairros" />
          </View>

          <SectionTitle>Especialidades</SectionTitle>
          <View style={s.chips}>
            {(p.categorias || []).map((c: string) => <Chip key={c}>{c}</Chip>)}
          </View>

          <SectionTitle>Atua em</SectionTitle>
          <View style={s.chips}>
            {(p.bairros || []).map((b: string) => <Chip key={b}>{b}</Chip>)}
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
  desc: { fontSize: 13, color: C.textDim, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
});

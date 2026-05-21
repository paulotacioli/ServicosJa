import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Image,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Header, IconButton, SectionTitle, Badge, EmptyCard, Loader } from '../components/UI';
import { Icons } from '../components/Icons';
import { C } from '../lib/colors';

export function SolHomeScreen() {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api.meusServicos();
        if (alive) { setServicos(data); setLoading(false); }
        const unread = await api.notifUnread();
        if (alive) setHasUnread((unread?.count ?? 0) > 0);
      } catch { if (alive) setLoading(false); }
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const grupos: Record<string, any[]> = {
    'Aguardando aprovação': servicos.filter(s => s.estado === 'AGUARDANDO_APROVACAO'),
    'Aprovados': servicos.filter(s => s.estado === 'APROVADO'),
    'Abertos': servicos.filter(s => s.estado === 'ABERTO'),
    'Histórico': servicos.filter(s => ['CONCLUIDO', 'CANCELADO'].includes(s.estado)),
  };

  if (loading) return <Loader />;

  const algum = Object.values(grupos).some(g => g.length > 0);

  return (
    <View style={s.root}>
      <Header
        title={`Olá, ${user?.nome.split(' ')[0]}`}
        sub={user?.cidade}
        right={
          <IconButton onPress={() => router.navigate('/(tabs)/second')} hasDot={hasUnread}>
            <Icons.Bell color={C.textMain} />
          </IconButton>
        }
      />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {!algum && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🛠️</Text>
            <Text style={s.emptyTitle}>Sem serviços ainda</Text>
            <Text style={s.emptySub}>Toque no botão verde para publicar seu primeiro pedido.</Text>
          </View>
        )}
        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <View key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => router.push(`/servico/${s.id}`)}
                  style={st.card}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: s.fotos[0] }} style={st.cardImg} />
                  <View style={st.cardInfo}>
                    <Text style={st.cardTitle} numberOfLines={1}>{s.titulo}</Text>
                    <View style={st.cardMeta}>
                      <Badge estado={s.estado} />
                      <Text style={st.cardCat}> · {s.categoria.split(' ')[0]}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push('/publish')}
        style={s.fab}
        activeOpacity={0.85}
      >
        <Icons.Plus color={C.bg} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textMain, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.textMute, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});

const st = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  cardImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: C.surface2 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.textMain, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  cardCat: { fontSize: 11, color: C.textMute },
});

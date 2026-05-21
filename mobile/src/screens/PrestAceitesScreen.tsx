import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { Header, SectionTitle, Badge, EmptyCard, Loader } from '../components/UI';
import { C } from '../lib/colors';

export function PrestAceitesScreen() {
  const [aceites, setAceites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api.meusAceites();
        if (alive) { setAceites(data); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    };
    load();
    const id = setInterval(load, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const grupos: Record<string, any[]> = {
    'Aguardando cliente decidir': aceites.filter(s => s.estado === 'AGUARDANDO_APROVACAO'),
    'Aprovados': aceites.filter(s => s.estado === 'APROVADO'),
    'Concluídos': aceites.filter(s => s.estado === 'CONCLUIDO'),
    'Outros': aceites.filter(s => !['AGUARDANDO_APROVACAO', 'APROVADO', 'CONCLUIDO'].includes(s.estado)),
  };

  if (loading) return <View style={s.root}><Header title="Meus aceites" /><Loader /></View>;

  const algum = Object.values(grupos).some(g => g.length > 0);

  return (
    <View style={s.root}>
      <Header title="Meus aceites" sub="Serviços que você aceitou" />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {!algum && <EmptyCard>Você ainda não aceitou nenhum serviço. Vá para a aba "Buscar".</EmptyCard>}
        {Object.entries(grupos).map(([titulo, items]) => {
          if (items.length === 0) return null;
          return (
            <View key={titulo}>
              <SectionTitle>{titulo}</SectionTitle>
              {items.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/aceite/${item.id}`)}
                  style={s.card}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.fotos[0] }} style={s.img} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.title} numberOfLines={1}>{item.titulo}</Text>
                    <View style={s.meta}>
                      <Badge estado={item.estado} />
                      <Text style={s.bairro}> · {item.bairro}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  img: { width: 60, height: 60, borderRadius: 12, backgroundColor: C.surface2 },
  title: { fontSize: 14, fontWeight: '700', color: C.textMain, marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  bairro: { fontSize: 11, color: C.textMute },
});

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../lib/api';
import { Header, SectionTitle, EmptyCard, Loader } from '../components/UI';
import { C } from '../lib/colors';

const RESULTADO_LABEL: Record<string, { label: string; color: string }> = {
  AGUARDANDO:    { label: 'Aguardando cliente', color: '#FB923C' },
  APROVADO:      { label: 'Aprovado! 🎉',        color: '#34D399' },
  CONCLUIDO:     { label: 'Concluído ✓',          color: '#A1A1AA' },
  NAO_SELECIONADO: { label: 'Não selecionado',   color: '#F87171' },
};

export function PrestAceitesScreen() {
  const [aceites, setAceites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.meusAceites();
      setAceites(data);
    } catch {}
    setLoading(false);
  }, []);

  // Recarrega ao focar na tela
  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  useEffect(() => {
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  const grupos: Record<string, any[]> = {
    'Aguardando cliente decidir': aceites.filter(s => s.resultado === 'AGUARDANDO'),
    'Aprovados': aceites.filter(s => s.resultado === 'APROVADO'),
    'Concluídos': aceites.filter(s => s.resultado === 'CONCLUIDO'),
    'Não selecionados': aceites.filter(s => s.resultado === 'NAO_SELECIONADO'),
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
              {items.map((item: any) => {
                const resultado = RESULTADO_LABEL[item.resultado] || RESULTADO_LABEL.AGUARDANDO;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/aceite/${item.id}`)}
                    style={s.card}
                    activeOpacity={0.7}
                  >
                    {item.fotos?.[0] ? (
                      <Image source={{ uri: item.fotos[0] }} style={s.img} />
                    ) : (
                      <View style={[s.img, { backgroundColor: C.surface2 }]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.title} numberOfLines={1}>{item.titulo}</Text>
                      <View style={s.meta}>
                        <Text style={[s.resultado, { color: resultado.color }]}>{resultado.label}</Text>
                        <Text style={s.bairro}> · {item.bairro}</Text>
                      </View>
                      {item.valorProposto != null && (
                        <Text style={s.valor}>
                          Seu valor: R$ {Number(item.valorProposto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
  title: { fontSize: 14, fontWeight: '700', color: C.textMain, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  resultado: { fontSize: 11, fontWeight: '700' },
  bairro: { fontSize: 11, color: C.textMute },
  valor: { fontSize: 11, color: C.textMute, marginTop: 3 },
});

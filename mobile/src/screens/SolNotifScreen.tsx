import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { Header, EmptyCard, Loader } from '../components/UI';
import { C } from '../lib/colors';
import { timeAgo } from '../lib/helpers';

export function SolNotifScreen() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.notificacoes();
        setNotifs(list);
        await api.notifMarcarTodasLidas();
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <View style={s.root}>
      <Header title="Avisos" />
      <Loader />
    </View>
  );

  return (
    <View style={s.root}>
      <Header title="Avisos" sub="Atualizações dos seus serviços" />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {notifs.length === 0 && <EmptyCard>Você ainda não tem avisos</EmptyCard>}
        {notifs.map(n => (
          <TouchableOpacity
            key={n.id}
            onPress={() => { if (n.servicoId) router.push(`/servico/${n.servicoId}`); }}
            activeOpacity={0.7}
            style={[s.notif, !n.lida && { borderColor: C.accent }]}
          >
            <View style={s.notifIcon}>
              <Text style={{ fontSize: 18 }}>{n.tipo === 'PRESTADOR_ACEITOU' ? '✨' : '📋'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.notifTitle}>{n.titulo}</Text>
              <Text style={s.notifMsg}>{n.mensagem}</Text>
              <Text style={s.notifTime}>{timeAgo(n.criadoEm)}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20 },
  notif: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  notifIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { fontSize: 13, fontWeight: '700', color: C.textMain, marginBottom: 2 },
  notifMsg: { fontSize: 13, color: C.textDim, lineHeight: 18 },
  notifTime: { fontSize: 11, color: C.textMute, marginTop: 4 },
});

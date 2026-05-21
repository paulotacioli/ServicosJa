import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';
import { Header, Badge, Loader } from '../components/UI';
import { Icons } from '../components/Icons';
import { C } from '../lib/colors';

export function PrestAceiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [servico, setServico] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try { setServico(await api.getServico(id)); } catch {}
    };
    load();
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [id]);

  if (!servico) return (
    <View style={s.root}>
      <Header onBack={() => router.back()} title="" />
      <Loader />
    </View>
  );

  let statusBlock = null;
  if (servico.estado === 'AGUARDANDO_APROVACAO') {
    statusBlock = (
      <View style={s.statusBox}>
        <Text style={s.statusEmoji}>⏳</Text>
        <Text style={s.statusTitle}>Aguardando cliente</Text>
        <Text style={s.statusSub}>Você foi o primeiro a aceitar. Agora o cliente decide.</Text>
      </View>
    );
  } else if (servico.estado === 'APROVADO') {
    statusBlock = (
      <View style={[s.statusBox, { borderColor: C.green }]}>
        <Text style={s.statusEmoji}>🎉</Text>
        <Text style={[s.statusTitle, { color: C.green }]}>Você foi aprovado!</Text>
        <Text style={s.statusSub}>O cliente vai entrar em contato pelo WhatsApp.</Text>
      </View>
    );
  } else if (servico.estado === 'CONCLUIDO') {
    statusBlock = (
      <View style={[s.statusBox, { borderColor: C.green }]}>
        <Text style={s.statusEmoji}>✓</Text>
        <Text style={[s.statusTitle, { color: C.green }]}>Concluído</Text>
      </View>
    );
  } else {
    statusBlock = (
      <View style={[s.statusBox, { borderColor: C.red }]}>
        <Text style={[s.statusTitle, { color: C.red }]}>Cliente recusou</Text>
        <Text style={s.statusSub}>Continue swipando para encontrar novos serviços.</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Header onBack={() => router.back()} title="" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {servico.fotos[0] ? (
          <Image source={{ uri: servico.fotos[0] }} style={s.hero} />
        ) : (
          <View style={[s.hero, { backgroundColor: C.surface2 }]} />
        )}

        <View style={s.content}>
          <View style={s.tagRow}>
            <Badge estado={servico.estado} />
            <View style={s.tag}><Text style={s.tagText}>{servico.categoria}</Text></View>
            <View style={s.tag}>
              <Icons.Loc color={C.textMute} />
              <Text style={s.tagText}> {servico.bairro}</Text>
            </View>
          </View>

          <Text style={s.title}>{servico.titulo}</Text>
          <Text style={s.desc}>{servico.descricao}</Text>

          {statusBlock}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  hero: { width: '100%', height: 200 },
  content: { padding: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  tagText: { fontSize: 11, color: C.textDim },
  title: { fontSize: 24, fontWeight: '800', color: C.textMain, marginBottom: 10, lineHeight: 30 },
  desc: { fontSize: 14, color: C.textDim, lineHeight: 22, marginBottom: 16 },
  statusBox: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 8,
  },
  statusEmoji: { fontSize: 28, marginBottom: 8 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: C.textMain, marginBottom: 4 },
  statusSub: { fontSize: 12, color: C.textMute, textAlign: 'center', lineHeight: 18 },
});

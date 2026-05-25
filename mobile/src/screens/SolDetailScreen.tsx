import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Header, Badge, Avatar, Button, SectionTitle, Loader } from '../components/UI';
import { Icons } from '../components/Icons';
import { C } from '../lib/colors';
import { formatWpp } from '../lib/helpers';

export function SolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const [servico, setServico] = useState<any>(null);

  const reload = async () => {
    try { setServico(await api.getServico(id)); } catch {}
  };

  useEffect(() => {
    reload();
    const timer = setInterval(reload, 4000);
    return () => clearInterval(timer);
  }, [id]);

  const aprovar = async (prestadorId: string) => {
    try {
      await api.aprovarPrestador(servico.id, prestadorId);
      toast('✓ Prestador aprovado.', 'success');
      reload();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const concluir = async () => {
    try { await api.concluirServico(servico.id); toast('✓ Serviço concluído', 'success'); reload(); }
    catch (e: any) { toast(e.message, 'error'); }
  };

  const cancelar = () => {
    Alert.alert('Cancelar serviço', 'Tem certeza?', [
      { text: 'Não' },
      { text: 'Sim, cancelar', style: 'destructive', onPress: async () => {
        try { await api.cancelarServico(servico.id); toast('Serviço cancelado', 'success'); router.back(); }
        catch (e: any) { toast(e.message, 'error'); }
      }},
    ]);
  };

  const editar = () => {
    router.push({
      pathname: '/publish',
      params: {
        editId: servico.id,
        editData: JSON.stringify({
          titulo: servico.titulo,
          descricao: servico.descricao,
          categoria: servico.categoria,
          fotos: servico.fotos,
          cidade: servico.cidade,
          bairro: servico.bairro,
        }),
      },
    });
  };

  const abrirWhatsApp = () => {
    const num = servico.prestadorAceito?.whatsapp?.replace(/\D/g, '') || '';
    Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent('Olá! Vi seu perfil no ServiçoJá sobre: ' + servico.titulo)}`);
  };

  if (!servico) return (
    <View style={s.root}>
      <Header onBack={() => router.back()} title="" />
      <Loader />
    </View>
  );

  const p = servico.prestadorAceito;
  const aceites: any[] = servico.aceites || [];
  const temAceites = aceites.length > 0;
  const podeEditar = servico.estado === 'ABERTO' && aceites.length === 0;

  return (
    <View style={s.root}>
      <Header
        onBack={() => router.back()}
        title=""
        right={
          podeEditar ? (
            <TouchableOpacity onPress={editar} style={s.editBtn} activeOpacity={0.7}>
              <Text style={s.editBtnText}>Editar</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {servico.fotos[0] ? (
          <Image source={{ uri: servico.fotos[0] }} style={s.hero} />
        ) : (
          <View style={[s.hero, { backgroundColor: C.surface }]} />
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

          {/* ABERTO com aceites: mostrar candidatos */}
          {servico.estado === 'ABERTO' && temAceites && (
            <>
              <SectionTitle>
                {aceites.length === 1
                  ? '1 prestador interessado'
                  : `${aceites.length} prestadores interessados`}
              </SectionTitle>
              {aceites.map((aceite: any) => {
                const pr = aceite.prestador;
                return (
                  <View key={pr.id} style={s.prestCard}>
                    <View style={s.prestRow}>
                      <Avatar name={pr.nome} size={48} foto={pr.foto} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.prestName}>{pr.nome}</Text>
                        <Text style={s.prestCity}>{pr.cidade}</Text>
                      </View>
                      {aceite.valorProposto != null && (
                        <View style={s.valorBadge}>
                          <Text style={s.valorLabel}>Valor</Text>
                          <Text style={s.valorText}>
                            R$ {Number(aceite.valorProposto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={s.statsRow}>
                      <View><Text style={s.statN}>{pr.servicosConcluidos || 0}</Text><Text style={s.statL}>Concluídos</Text></View>
                      <View><Text style={s.statN}>{(pr.categorias || []).length}</Text><Text style={s.statL}>Categorias</Text></View>
                    </View>
                    <View style={s.btnRow}>
                      <View style={{ flex: 1 }}>
                        <Button variant="ghost" onPress={() => router.push(`/prest-profile/${pr.id}`)}>Ver perfil</Button>
                      </View>
                      <View style={{ width: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Button variant="success" onPress={() => aprovar(pr.id)}>Aprovar</Button>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* ABERTO sem aceites */}
          {servico.estado === 'ABERTO' && !temAceites && (
            <>
              <View style={s.waitBox}>
                <Text style={s.waitEmoji}>⏳</Text>
                <Text style={s.waitTitle}>Aguardando prestadores</Text>
                <Text style={s.waitSub}>Seu serviço está visível para profissionais da categoria.</Text>
              </View>
              <Button variant="ghost" onPress={cancelar}>Cancelar serviço</Button>
            </>
          )}

          {/* ABERTO com aceites: opção de cancelar */}
          {servico.estado === 'ABERTO' && temAceites && (
            <View style={{ marginTop: 8 }}>
              <Button variant="ghost" onPress={cancelar}>Cancelar serviço</Button>
            </View>
          )}

          {servico.estado === 'APROVADO' && p && (
            <>
              <SectionTitle>Prestador aprovado</SectionTitle>
              <View style={s.card}>
                <View style={s.prestRow}>
                  <Avatar name={p.nome} size={48} foto={p.foto} />
                  <View><Text style={s.prestName}>{p.nome}</Text><Text style={s.prestCity}>{p.cidade}</Text></View>
                </View>
              </View>
              <TouchableOpacity onPress={abrirWhatsApp} style={s.wppBlock} activeOpacity={0.85}>
                <View style={s.wppIcon}><Icons.Wpp color="#fff" /></View>
                <View>
                  <Text style={s.wppLabel}>WhatsApp liberado</Text>
                  <Text style={s.wppNumber}>{formatWpp(p.whatsapp)}</Text>
                </View>
              </TouchableOpacity>
              <Button variant="wpp" onPress={abrirWhatsApp}>Abrir conversa no WhatsApp</Button>
              <View style={{ height: 10 }} />
              <Button variant="ghost" onPress={concluir}>Marcar como concluído</Button>
            </>
          )}

          {servico.estado === 'CONCLUIDO' && (
            <View style={[s.statusBox, { borderColor: C.green }]}>
              <Text style={{ color: C.green, fontSize: 20 }}>✓</Text>
              <Text style={[s.statusText, { color: C.green }]}>Serviço concluído</Text>
            </View>
          )}

          {servico.estado === 'CANCELADO' && (
            <View style={[s.statusBox, { borderColor: C.red }]}>
              <Text style={[s.statusText, { color: C.red }]}>Serviço cancelado</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  hero: { width: '100%', height: 200, backgroundColor: C.surface2 },
  content: { padding: 20 },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  tagText: { fontSize: 11, color: C.textDim },
  title: { fontSize: 24, fontWeight: '800', color: C.textMain, marginBottom: 10, lineHeight: 30 },
  desc: { fontSize: 14, color: C.textDim, lineHeight: 22, marginBottom: 6 },

  editBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: C.textMain },

  prestCard: {
    backgroundColor: 'rgba(214,255,58,0.04)', borderWidth: 1,
    borderColor: C.accent, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 12 },
  prestRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  prestName: { fontSize: 15, fontWeight: '700', color: C.textMain },
  prestCity: { fontSize: 11, color: C.textMute, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 14 },
  statN: { fontSize: 16, fontWeight: '800', color: C.textMain },
  statL: { fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.5 },
  btnRow: { flexDirection: 'row' },

  valorBadge: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
  },
  valorLabel: { fontSize: 9, fontWeight: '700', color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.5 },
  valorText: { fontSize: 14, fontWeight: '800', color: C.accent, marginTop: 2 },

  wppBlock: {
    borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.wpp,
  },
  wppIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  wppLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff', opacity: 0.9 },
  wppNumber: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 2 },

  waitBox: {
    backgroundColor: C.surface, borderWidth: 1, borderStyle: 'dashed',
    borderColor: C.border, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12,
  },
  waitEmoji: { fontSize: 28, marginBottom: 8 },
  waitTitle: { fontSize: 16, fontWeight: '700', color: C.textMain, marginBottom: 4 },
  waitSub: { fontSize: 12, color: C.textMute, textAlign: 'center', lineHeight: 18 },

  statusBox: {
    borderWidth: 1, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(52,211,153,0.04)',
  },
  statusText: { fontSize: 16, fontWeight: '700', marginTop: 6 },
});

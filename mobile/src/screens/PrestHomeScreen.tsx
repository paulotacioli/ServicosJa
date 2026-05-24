import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Animated, PanResponder, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Header, IconButton } from '../components/UI';
import { Icons } from '../components/Icons';
import { C } from '../lib/colors';
import { timeAgo } from '../lib/helpers';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 100;

const VERIFICACAO_LABEL: Record<string, string> = {
  PENDENTE: 'Conta em análise — você pode ver o feed, mas não pode aceitar serviços ainda.',
  EM_REVISAO: 'Sua conta está em revisão. Aguarde a aprovação.',
  REPROVADO: 'Sua conta não foi aprovada. Entre em contato com o suporte.',
};
const VERIFICACAO_COLOR: Record<string, string> = {
  PENDENTE: '#B45309',
  EM_REVISAO: '#1D4ED8',
  REPROVADO: '#B91C1C',
};

export function PrestHomeScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [feed, setFeed] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);

  const loadFeed = async () => {
    try {
      const data = await api.feed();
      setFeed(data);
      setIdx(0);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  useEffect(() => { loadFeed(); }, []);

  const aprovado = user?.statusVerificacao === 'APROVADO';

  const handleSwipe = (dir: 'yes' | 'no') => {
    const s = feed[idx];
    if (!s) return;
    if (dir === 'yes' && !aprovado) {
      toast('Aguarde a verificação da sua conta para aceitar serviços.', 'error');
      return;
    }
    setIdx(prev => prev + 1);
    if (dir === 'yes') {
      api.aceitarServico(s.id)
        .then(() => toast('✓ Aceito! O cliente foi avisado.', 'success'))
        .catch((e: any) => toast(e.message, 'error'));
    } else {
      api.recusarServicoSwipe(s.id).catch(() => {});
    }
  };

  const empty = idx >= feed.length;
  const current = feed[idx];
  const next = feed[idx + 1];

  return (
    <View style={s.root}>
      <Header
        title={`Olá, ${user?.nome.split(' ')[0]}`}
        sub="Veja, aceite ou recuse"
        right={
          <IconButton onPress={loadFeed}>
            <Icons.Refresh color={C.textMain} />
          </IconButton>
        }
      />

      {!aprovado && (
        <View style={[s.banner, { backgroundColor: VERIFICACAO_COLOR[user?.statusVerificacao ?? 'PENDENTE'] }]}>
          <Text style={s.bannerText}>
            {VERIFICACAO_LABEL[user?.statusVerificacao ?? 'PENDENTE']}
          </Text>
        </View>
      )}

      <View style={s.cardArea}>
        {empty ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🎯</Text>
            <Text style={s.emptyTitle}>Você está em dia</Text>
            <Text style={s.emptySub}>Sem novos serviços nas suas categorias. Toque em atualizar.</Text>
          </View>
        ) : (
          <>
            {next && <BackCard servico={next} />}
            <SwipeCard key={current.id} servico={current} onSwipe={handleSwipe} />
          </>
        )}
      </View>

      {!empty && (
        <View style={s.btns}>
          <TouchableOpacity onPress={() => handleSwipe('no')} style={[s.btn, s.btnNo]} activeOpacity={0.8}>
            <Icons.X color={C.red} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSwipe('yes')}
            style={[s.btn, s.btnYes, !aprovado && s.btnDisabled]}
            activeOpacity={0.8}
          >
            <Icons.Check color={aprovado ? C.bg : C.textMute} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function BackCard({ servico }: { servico: any }) {
  return (
    <View style={[sc.card, sc.back]}>
      {servico.fotos[0] && <Image source={{ uri: servico.fotos[0] }} style={sc.img} />}
    </View>
  );
}

function SwipeCard({ servico, onSwipe }: { servico: any; onSwipe: (dir: 'yes' | 'no') => void }) {
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const acceptOpacity = position.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const rejectOpacity = position.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) flyOut('yes');
        else if (g.dx < -SWIPE_THRESHOLD) flyOut('no');
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const flyOut = (dir: 'yes' | 'no') => {
    const toX = dir === 'yes' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 }, duration: 250, useNativeDriver: false,
    }).start(() => onSwipe(dir));
  };

  return (
    <Animated.View
      style={[sc.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
      {...panResponder.panHandlers}
    >
      {/* Stamps */}
      <Animated.View style={[sc.stamp, sc.stampYes, { opacity: acceptOpacity }]}>
        <Text style={[sc.stampText, { color: C.green, borderColor: C.green }]}>ACEITAR</Text>
      </Animated.View>
      <Animated.View style={[sc.stamp, sc.stampNo, { opacity: rejectOpacity }]}>
        <Text style={[sc.stampText, { color: C.red, borderColor: C.red }]}>RECUSAR</Text>
      </Animated.View>

      {/* Labels */}
      <View style={sc.labelCat}>
        <Text style={sc.labelText}>{servico.categoria}</Text>
      </View>
      <View style={sc.labelLoc}>
        <Icons.Loc color="#fff" />
        <Text style={sc.labelText}> {servico.bairro}</Text>
      </View>

      {servico.fotos[0] ? (
        <Image source={{ uri: servico.fotos[0] }} style={sc.img} />
      ) : (
        <View style={[sc.img, { backgroundColor: C.surface2 }]} />
      )}

      <View style={sc.info}>
        <Text style={sc.cardTitle} numberOfLines={2}>{servico.titulo}</Text>
        <Text style={sc.cardDesc} numberOfLines={3}>{servico.descricao}</Text>
        <View style={sc.cardFooter}>
          <Icons.Loc color={C.textMute} />
          <Text style={sc.cardFooterText}> {servico.cidade} · {timeAgo(servico.criadoEm)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  cardArea: { flex: 1, marginHorizontal: 20, marginTop: 8, position: 'relative' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textMain, marginBottom: 8 },
  emptySub: { fontSize: 13, color: C.textMute, textAlign: 'center', maxWidth: 240, lineHeight: 20 },
  btns: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 16, paddingBottom: 24 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  btnNo: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.red },
  btnYes: { backgroundColor: C.green },
  btnDisabled: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.border },
  banner: { marginHorizontal: 16, marginBottom: 4, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  bannerText: { fontSize: 12, color: '#fff', fontWeight: '600', lineHeight: 18 },
});

const sc = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.surface, borderRadius: 24,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  back: { transform: [{ scale: 0.95 }, { translateY: 12 }] },
  img: { width: '100%', height: '55%' },
  labelCat: {
    position: 'absolute', top: 14, left: 14, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  labelLoc: {
    position: 'absolute', top: 14, right: 14, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
  },
  labelText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  stamp: { position: 'absolute', top: 28, zIndex: 20 },
  stampYes: { right: 16 },
  stampNo: { left: 16 },
  stampText: {
    fontSize: 28, fontWeight: '900', letterSpacing: 2, borderWidth: 4,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
    transform: [{ rotate: '15deg' }],
  },
  info: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.textMain, marginBottom: 8, lineHeight: 28 },
  cardDesc: { fontSize: 13, color: C.textDim, lineHeight: 20, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 8 },
  cardFooterText: { fontSize: 11, color: C.textMute },
});

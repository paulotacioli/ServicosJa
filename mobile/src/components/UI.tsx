import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, Image,
} from 'react-native';
import { C } from '../lib/colors';
import { badgeInfo, EstadoServico, initials } from '../lib/helpers';
import { Icons } from './Icons';

// ── Badge ──────────────────────────────────────────────────────────────
export function Badge({ estado }: { estado: string }) {
  const { label, bg, color } = badgeInfo(estado as EstadoServico);
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── SectionTitle ────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

// ── EmptyCard ───────────────────────────────────────────────────────────
export function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.emptyCard}>
      <Text style={s.emptyText}>{String(children)}</Text>
    </View>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────
export function Avatar({ name, size = 48, foto }: { name: string; size?: number; foto?: string | null }) {
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {foto ? (
        <Image source={{ uri: foto }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[s.avatarText, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

// ── StatCard ────────────────────────────────────────────────────────────
export function StatCard({ n, l }: { n: number; l: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statN}>{n}</Text>
      <Text style={s.statL}>{l}</Text>
    </View>
  );
}

// ── Chip ────────────────────────────────────────────────────────────────
export function Chip({ children, active = false, accentColor = C.accent }: {
  children: React.ReactNode; active?: boolean; accentColor?: string;
}) {
  const bg = active ? accentColor : C.surface;
  const color = active ? (accentColor === C.accent ? C.bg : '#fff') : C.textDim;
  return (
    <View style={[s.chip, { backgroundColor: bg, borderColor: active ? accentColor : C.border }]}>
      <Text style={[s.chipText, { color }]}>{String(children)}</Text>
    </View>
  );
}

// ── Button ──────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'success' | 'danger' | 'wpp' | 'ghost';

const btnStyles: Record<BtnVariant, { bg: string; color: string }> = {
  primary: { bg: C.accent,   color: C.bg },
  success: { bg: C.green,    color: C.bg },
  danger:  { bg: C.red,      color: '#fff' },
  wpp:     { bg: C.wpp,      color: '#fff' },
  ghost:   { bg: 'transparent', color: C.textMain },
};

export function Button({
  children, variant = 'primary', onPress, disabled, accentColor,
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  onPress?: () => void;
  disabled?: boolean;
  accentColor?: string;
}) {
  const { bg, color } = btnStyles[variant];
  const finalBg = variant === 'primary' && accentColor ? accentColor : bg;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        s.btn,
        { backgroundColor: finalBg },
        variant === 'ghost' && s.btnGhost,
        disabled && s.btnDisabled,
      ]}
    >
      {typeof children === 'string'
        ? <Text style={[s.btnText, { color }]}>{children}</Text>
        : children}
    </TouchableOpacity>
  );
}

// ── Header ──────────────────────────────────────────────────────────────
export function Header({
  title, sub, right, onBack,
}: {
  title?: string; sub?: string; right?: React.ReactNode; onBack?: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
            <Icons.Back />
          </TouchableOpacity>
        )}
        <View>
          {title ? <Text style={s.headerTitle}>{title}</Text> : null}
          {sub ? <Text style={s.headerSub}>{sub}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

// ── IconButton ───────────────────────────────────────────────────────────
export function IconButton({
  children, onPress, hasDot = false,
}: {
  children: React.ReactNode; onPress?: () => void; hasDot?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.iconBtn}>
      {children}
      {hasDot && <View style={s.dot} />}
    </TouchableOpacity>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ── Loader ────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <View style={s.loader}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.textMute,
    textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: C.surface, borderWidth: 1, borderStyle: 'dashed',
    borderColor: C.border, borderRadius: 16, padding: 32, alignItems: 'center',
  },
  emptyText: { color: C.textMute, fontSize: 13, textAlign: 'center' },

  avatar: { backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: C.textMain },

  statCard: {
    flex: 1, backgroundColor: C.surface, borderWidth: 1,
    borderColor: C.border, borderRadius: 16, padding: 12,
  },
  statN: { fontSize: 22, fontWeight: '800', color: C.textMain },
  statL: { fontSize: 10, color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },

  chip: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10,
    paddingVertical: 6, marginRight: 6, marginBottom: 6,
  },
  chipText: { fontSize: 12, fontWeight: '600' },

  btn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  btnGhost: { borderWidth: 1, borderColor: C.border },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 15, fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textMain },
  headerSub: { fontSize: 12, color: C.textMute, marginTop: 2 },
  backBtn: { padding: 4 },

  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    position: 'absolute', top: 6, right: 6,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: C.red, borderWidth: 2, borderColor: C.bg,
  },

  card: {
    backgroundColor: C.surface, borderWidth: 1,
    borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 12,
  },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

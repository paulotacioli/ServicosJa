import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Header, Button } from '../components/UI';
import { Icons } from '../components/Icons';
import { C } from '../lib/colors';
import { CATEGORIAS } from '../lib/constants';

export function SolPublishScreen() {
  const toast = useToast();
  const params = useLocalSearchParams<{ editId?: string; editData?: string }>();
  const isEdit = !!params.editId;

  const [fotos, setFotos] = useState<string[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [catOpen, setCatOpen] = useState(false);
  const [cep, setCep] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);

  // Preencher campos se for edição
  useEffect(() => {
    if (params.editData) {
      try {
        const data = JSON.parse(params.editData);
        setTitulo(data.titulo || '');
        setDescricao(data.descricao || '');
        setCategoria(data.categoria || CATEGORIAS[0]);
        setFotos(data.fotos || []);
        setCidade(data.cidade || '');
        setBairro(data.bairro || '');
      } catch {}
    }
  }, []);

  const pickPhoto = (index: number) => {
    Alert.alert(
      'Adicionar foto',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') { toast('Permissão de câmera negada', 'error'); return; }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.6,
              base64: true,
            });
            if (!result.canceled && result.assets[0]) {
              const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
              setFotos(prev => {
                const next = [...prev];
                if (index < next.length) next[index] = base64;
                else next.push(base64);
                return next;
              });
            }
          },
        },
        {
          text: 'Biblioteca',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') { toast('Permissão de galeria negada', 'error'); return; }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.6,
              base64: true,
            });
            if (!result.canceled && result.assets[0]) {
              const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
              setFotos(prev => {
                const next = [...prev];
                if (index < next.length) next[index] = base64;
                else next.push(base64);
                return next;
              });
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const removePhoto = (i: number) => setFotos(fotos.filter((_, idx) => idx !== i));

  const buscarCep = async (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    setCep(cleaned);
    if (cleaned.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCidade(data.localidade || '');
          setBairro(data.bairro || '');
          setRua(data.logradouro || '');
        } else toast('CEP não encontrado', 'error');
      } catch { toast('Erro ao buscar CEP', 'error'); }
      finally { setCepLoading(false); }
    }
  };

  const canSubmit = titulo && descricao && fotos.length > 0 && cidade && bairro;

  const submit = async () => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.editarServico(params.editId!, { titulo, descricao, categoria, fotos, cidade, bairro });
        toast('✓ Serviço atualizado.', 'success');
      } else {
        await api.publicarServico({ titulo, descricao, categoria, fotos, cidade, bairro });
        toast('✓ Serviço publicado. Aguarde um prestador.', 'success');
      }
      router.back();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.pageTitle}>{isEdit ? 'Editar serviço' : 'Publicar serviço'}</Text>
        <Text style={s.pageSub}>Mostre o problema com clareza — prestadores decidem em segundos.</Text>

        <Field label="Fotos (1 a 5)">
          <View style={s.photosRow}>
            {Array.from({ length: 5 }).map((_, i) => {
              if (fotos[i]) {
                const isBase64 = fotos[i].startsWith('data:');
                return (
                  <View key={i} style={s.photoWrap}>
                    <TouchableOpacity onPress={() => removePhoto(i)} style={s.photoRemove} activeOpacity={0.8}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>×</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => pickPhoto(i)} style={s.photoSlotFilled} activeOpacity={0.8}>
                      <Image source={{ uri: fotos[i] }} style={s.photoImage} />
                    </TouchableOpacity>
                  </View>
                );
              }
              if (i === fotos.length) {
                return (
                  <TouchableOpacity key={i} onPress={() => pickPhoto(i)} style={s.photoSlot} activeOpacity={0.7}>
                    <Icons.Camera color={C.textMute} />
                  </TouchableOpacity>
                );
              }
              return <View key={i} style={[s.photoSlot, { opacity: 0.3 }]} />;
            })}
          </View>
        </Field>

        <Field label="Título">
          <TextInput
            value={titulo} onChangeText={setTitulo} maxLength={60}
            placeholder="Ex: Vazamento na pia da cozinha"
            style={s.input} placeholderTextColor={C.textMute}
          />
        </Field>

        <Field label="Descrição">
          <TextInput
            value={descricao} onChangeText={setDescricao} maxLength={500} multiline
            numberOfLines={4} placeholder="Descreva o problema e o que espera do prestador."
            style={[s.input, s.textarea]} placeholderTextColor={C.textMute}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Categoria">
          <TouchableOpacity onPress={() => setCatOpen(!catOpen)} style={s.select} activeOpacity={0.7}>
            <Text style={{ color: C.textMain, fontSize: 14 }}>{categoria}</Text>
            <Text style={{ color: C.textMute }}>▾</Text>
          </TouchableOpacity>
          {catOpen && (
            <View style={s.dropdown}>
              {CATEGORIAS.map(c => (
                <TouchableOpacity
                  key={c} activeOpacity={0.7}
                  onPress={() => { setCategoria(c); setCatOpen(false); }}
                  style={[s.dropItem, c === categoria && s.dropItemActive]}
                >
                  <Text style={{ color: c === categoria ? C.accent : C.textMain, fontSize: 14 }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Field>

        <Field label={`CEP${cepLoading ? ' (buscando...)' : ''}`}>
          <TextInput
            value={cep} onChangeText={buscarCep} keyboardType="numeric" maxLength={8}
            placeholder="Somente números"
            style={s.input} placeholderTextColor={C.textMute}
          />
        </Field>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Field label="Cidade">
              <TextInput value={cidade} onChangeText={setCidade} placeholder="Cidade" style={s.input} placeholderTextColor={C.textMute} />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Bairro">
              <TextInput value={bairro} onChangeText={setBairro} placeholder="Bairro" style={s.input} placeholderTextColor={C.textMute} />
            </Field>
          </View>
        </View>

        <Field label="Rua">
          <TextInput value={rua} onChangeText={setRua} placeholder="Logradouro" style={s.input} placeholderTextColor={C.textMute} />
        </Field>

        {!isEdit && (
          <Field label="Número *">
            <TextInput value={numero} onChangeText={setNumero} placeholder="Ex: 42" keyboardType="numeric" style={s.input} placeholderTextColor={C.textMute} />
          </Field>
        )}

        <View style={{ marginTop: 8 }}>
          <Button onPress={submit} disabled={loading || !canSubmit}>
            {loading ? '...' : isEdit ? 'Salvar alterações' : 'Publicar agora'}
          </Button>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: C.textMain, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: C.textMute, marginTop: 4, marginBottom: 20, lineHeight: 18 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.textMute, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 14, color: C.textMain,
  },
  textarea: { minHeight: 90 },
  photosRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  photoSlot: {
    width: 72, height: 72, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  photoSlotFilled: {
    width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.accent,
  },
  photoImage: { width: '100%', height: '100%' },
  photoWrap: { position: 'relative' },
  photoRemove: {
    position: 'absolute', top: -6, right: -6, zIndex: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.red, alignItems: 'center', justifyContent: 'center',
  },
  select: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dropdown: {
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, marginTop: 4, overflow: 'hidden',
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropItemActive: { backgroundColor: 'rgba(214,255,58,0.08)' },
});

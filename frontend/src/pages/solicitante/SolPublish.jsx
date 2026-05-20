import { useState } from 'react';
import { apiSolicitante } from '../../lib/api';
import { Header, Button } from '../../components/UI';
import { Icon } from '../../components/Icons';
import { CATEGORIAS, DEFAULT_PHOTOS } from '../../lib/constants';
import { useToast } from '../../context/ToastContext';

export function SolPublish({ onBack }) {
  const toast = useToast();
  const [fotos, setFotos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [bairro, setBairro] = useState('Pinheiros');
  const [cidade, setCidade] = useState('São Paulo');
  const [loading, setLoading] = useState(false);

  const addPhoto = () => {
    const url = DEFAULT_PHOTOS[categoria] || DEFAULT_PHOTOS['Encanamento e hidráulica'];
    setFotos([...fotos, url]);
  };
  const removePhoto = (i) => setFotos(fotos.filter((_, idx) => idx !== i));

  const submit = async () => {
    setLoading(true);
    try {
      await apiSolicitante.publicarServico({
        titulo, descricao, categoria, fotos, cidade, bairro,
      });
      toast('✓ Serviço publicado. Aguarde um prestador.', 'success');
      onBack();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Header onBack={onBack} title="" />
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <h1 className="font-display text-[26px] font-bold tracking-tight mb-1.5">Publicar serviço</h1>
        <div className="text-text-mute text-[13px] mb-5">
          Mostre o problema com clareza — prestadores decidem em segundos.
        </div>

        <Field label="Fotos (1 a 5)">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => {
              if (fotos[i]) {
                return (
                  <div
                    key={i}
                    className="w-[72px] h-[72px] rounded-xl border-2 border-accent bg-cover bg-center relative"
                    style={{ backgroundImage: `url('${fotos[i]}')` }}
                  >
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold"
                    >×</button>
                  </div>
                );
              }
              if (i === fotos.length) {
                return (
                  <button
                    key={i}
                    onClick={addPhoto}
                    className="w-[72px] h-[72px] rounded-xl bg-surface border-[1.5px] border-dashed border-border flex items-center justify-center text-text-mute"
                  >
                    <Icon.Camera />
                  </button>
                );
              }
              return <div key={i} className="w-[72px] h-[72px] rounded-xl bg-surface border-[1.5px] border-dashed border-border opacity-30" />;
            })}
          </div>
        </Field>

        <Field label="Título">
          <input
            value={titulo} onChange={e => setTitulo(e.target.value)}
            maxLength={60}
            placeholder="Ex: Vazamento na pia da cozinha"
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-accent"
          />
        </Field>

        <Field label="Descrição">
          <textarea
            value={descricao} onChange={e => setDescricao(e.target.value)}
            maxLength={500}
            placeholder="Descreva o que está acontecendo, há quanto tempo, e o que você espera do prestador."
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-accent resize-none min-h-[90px]"
          />
        </Field>

        <Field label="Categoria">
          <select
            value={categoria} onChange={e => setCategoria(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-accent"
          >
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Bairro">
          <input
            value={bairro} onChange={e => setBairro(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-accent"
          />
        </Field>

        <Field label="Cidade">
          <input
            value={cidade} onChange={e => setCidade(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-[14px] outline-none focus:border-accent"
          />
        </Field>

        <div className="mt-6">
          <Button onClick={submit} disabled={loading || !titulo || !descricao || fotos.length === 0}>
            {loading ? '...' : 'Publicar agora'}
          </Button>
        </div>
        <div className="h-6" />
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] text-text-mute mb-1.5 uppercase tracking-wider font-semibold">{label}</label>
      {children}
    </div>
  );
}

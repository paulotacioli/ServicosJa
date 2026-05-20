import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { Phone } from '../components/Phone';
import { Tabbar } from '../components/Tabbar';
import { Welcome } from '../components/Welcome';
import { Icon } from '../components/Icons';
import { PrestHome } from './prestador/PrestHome';
import { PrestAceites } from './prestador/PrestAceites';
import { PrestAceiteDetail } from './prestador/PrestAceiteDetail';
import { PrestConta } from './prestador/PrestConta';

export function PrestadorApp() {
  const { prestador, loginPrestador, signupPrestador, signupSolicitante } = useSession();
  const toast = useToast();
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);

  if (!prestador) {
    return (
      <Phone label="App do Prestador" accentColor="blue">
        <Welcome
          role="prestador"
          onLogin={loginPrestador}
          onSignup={async (data) => {
            if (data.tipo === 'solicitante') {
              await signupSolicitante(data);
            } else {
              await signupPrestador(data);
            }
          }}
          brandAccent="#60A5FA"
        />
      </Phone>
    );
  }

  const goAceiteDetail = (id) => { setSelectedId(id); setScreen('aceite-detail'); };

  return (
    <Phone label="App do Prestador" accentColor="blue">
      <div className="flex-1 overflow-hidden flex flex-col">
        {screen === 'home' && <PrestHome />}
        {screen === 'aceites' && <PrestAceites onOpen={goAceiteDetail} />}
        {screen === 'aceite-detail' && <PrestAceiteDetail serviceId={selectedId} onBack={() => setScreen('aceites')} />}
        {screen === 'conta' && <PrestConta />}

        {['home', 'aceites', 'conta'].includes(screen) && (
          <Tabbar
            active={screen}
            onChange={setScreen}
            accentColor="#60A5FA"
            tabs={[
              { id: 'home',    label: 'Buscar',  icon: <Icon.Search /> },
              { id: 'aceites', label: 'Aceites', icon: <Icon.Checklist /> },
              { id: 'conta',   label: 'Perfil',  icon: <Icon.User /> },
            ]}
          />
        )}
      </div>
    </Phone>
  );
}

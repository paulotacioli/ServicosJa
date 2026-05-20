import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Phone } from '../components/Phone';
import { Tabbar } from '../components/Tabbar';
import { Welcome } from '../components/Welcome';
import { Icon } from '../components/Icons';
import { SolHome } from './solicitante/SolHome';
import { SolPublish } from './solicitante/SolPublish';
import { SolDetail } from './solicitante/SolDetail';
import { SolPrestProfile } from './solicitante/SolPrestProfile';
import { SolNotif } from './solicitante/SolNotif';
import { SolConta } from './solicitante/SolConta';

export function SolicitanteApp() {
  const { solicitante, loginSolicitante, signupSolicitante, signupPrestador } = useSession();
  const [screen, setScreen] = useState('home');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedPrestadorId, setSelectedPrestadorId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  if (!solicitante) {
    return (
      <Phone label="App do Solicitante" accentColor="accent">
        <Welcome
          role="solicitante"
          onLogin={loginSolicitante}
          onSignup={async (data) => {
            if (data.tipo === 'prestador') {
              await signupPrestador(data);
            } else {
              await signupSolicitante(data);
            }
          }}
          brandAccent="#D6FF3A"
        />
      </Phone>
    );
  }

  const goToDetail = (id) => { setSelectedServiceId(id); setScreen('detail'); };
  const goToPrestProfile = (id) => { setSelectedPrestadorId(id); setScreen('prest-profile'); };

  const showTabbar = ['home', 'notif', 'conta'].includes(screen);

  return (
    <Phone label="App do Solicitante" accentColor="accent">
      <div className="h-full overflow-hidden flex flex-col">
        {screen === 'home' && <SolHome onOpenService={goToDetail} onPublish={() => setScreen('publish')} onNotif={() => setScreen('notif')} hasUnread={hasUnread} />}
        {screen === 'publish' && <SolPublish onBack={() => setScreen('home')} />}
        {screen === 'detail' && <SolDetail serviceId={selectedServiceId} onBack={() => setScreen('home')} onPrestProfile={goToPrestProfile} />}
        {screen === 'prest-profile' && <SolPrestProfile prestadorId={selectedPrestadorId} onBack={() => setScreen('detail')} />}
        {screen === 'notif' && <SolNotif onOpenService={goToDetail} onUnreadChange={setHasUnread} />}
        {screen === 'conta' && <SolConta />}

        {showTabbar && (
          <Tabbar
            active={screen}
            onChange={setScreen}
            accentColor="#D6FF3A"
            tabs={[
              { id: 'home',  label: 'Início', icon: <Icon.Home /> },
              { id: 'notif', label: 'Avisos', icon: <Icon.Bell />, dot: hasUnread },
              { id: 'conta', label: 'Conta',  icon: <Icon.User /> },
            ]}
          />
        )}
      </div>
    </Phone>
  );
}

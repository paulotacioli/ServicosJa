import { useAuth } from '../../src/context/AuthContext';
import { SolNotifScreen } from '../../src/screens/SolNotifScreen';
import { PrestAceitesScreen } from '../../src/screens/PrestAceitesScreen';

export default function SecondTab() {
  const { user } = useAuth();
  if (user?.role === 'solicitante') return <SolNotifScreen />;
  return <PrestAceitesScreen />;
}

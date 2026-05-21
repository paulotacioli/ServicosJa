import { useAuth } from '../../src/context/AuthContext';
import { SolHomeScreen } from '../../src/screens/SolHomeScreen';
import { PrestHomeScreen } from '../../src/screens/PrestHomeScreen';

export default function HomeTab() {
  const { user } = useAuth();
  if (user?.role === 'solicitante') return <SolHomeScreen />;
  return <PrestHomeScreen />;
}

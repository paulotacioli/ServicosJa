import { useAuth } from '../../src/context/AuthContext';
import { SolContaScreen } from '../../src/screens/SolContaScreen';
import { PrestContaScreen } from '../../src/screens/PrestContaScreen';

export default function ContaTab() {
  const { user } = useAuth();
  if (user?.role === 'solicitante') return <SolContaScreen />;
  return <PrestContaScreen />;
}

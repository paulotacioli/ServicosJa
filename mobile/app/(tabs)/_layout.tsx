import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Icons } from '../../src/components/Icons';
import { C } from '../../src/lib/colors';

export default function TabsLayout() {
  const { user } = useAuth();
  const isSol = user?.role === 'solicitante';
  const accent = isSol ? C.accent : C.blue;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bgSoft,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: C.textMute,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isSol ? 'Início' : 'Buscar',
          tabBarIcon: ({ color }) =>
            isSol ? <Icons.Home color={color} /> : <Icons.Search color={color} />,
        }}
      />
      <Tabs.Screen
        name="second"
        options={{
          title: isSol ? 'Avisos' : 'Aceites',
          tabBarIcon: ({ color }) =>
            isSol ? <Icons.Bell color={color} /> : <Icons.Checklist color={color} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: isSol ? 'Conta' : 'Perfil',
          tabBarIcon: ({ color }) => <Icons.User color={color} />,
        }}
      />
    </Tabs>
  );
}

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../lib/colors';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  toast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const toast = useCallback((message: string, kind: ToastType = 'info') => {
    setMsg(message);
    setType(kind);
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [opacity]);

  const bg = type === 'error' ? C.red : type === 'success' ? C.green : C.surface2;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          { bottom: insets.bottom + 90, opacity, backgroundColor: bg },
        ]}
      >
        <Text style={styles.toastText}>{msg}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

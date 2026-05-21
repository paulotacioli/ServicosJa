import React from 'react';
import { Feather } from '@expo/vector-icons';
import { C } from '../lib/colors';

type IconProps = { color?: string; size?: number };

function make(name: React.ComponentProps<typeof Feather>['name']) {
  return ({ color = C.textMute, size = 20 }: IconProps) => (
    <Feather name={name} size={size} color={color} />
  );
}

export const Icons = {
  Home: make('home'),
  Bell: make('bell'),
  User: make('user'),
  Search: make('search'),
  Checklist: make('check-square'),
  Plus: make('plus'),
  Back: make('arrow-left'),
  Check: make('check'),
  X: make('x'),
  Refresh: make('refresh-cw'),
  Loc: make('map-pin'),
  Camera: make('camera'),
  Wpp: make('message-circle'),
};

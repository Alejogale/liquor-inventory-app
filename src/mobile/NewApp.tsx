/**
 * NewApp.tsx - Test entry point for the new navigation UI
 *
 * This file can be used to test the new navigation and UI components
 * without affecting the existing App.tsx.
 *
 * To test:
 * 1. Update index.ts to import from './NewApp' instead of './App'
 * 2. Run `npx expo start --clear`
 *
 * Or keep both and add a feature flag to switch between them.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';

export default function NewApp() {
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

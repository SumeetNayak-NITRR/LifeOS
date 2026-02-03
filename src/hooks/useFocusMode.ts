"use client";

import { useSyncExternalStore, useCallback } from 'react';
import { workStore, settingsStore, subscribeToStore } from '@/lib/store';

export function useFocusMode() {
  const getSnapshot = useCallback(() => {
    const workData = workStore.get();
    const settings = settingsStore.get();
    const isFocusActive = workData.timerState?.isActive && !workData.timerState?.isPaused;
    
    // Check if motion should be disabled based on settings and focus state
    const shouldFreezeMotion = settings.visualsEnabled && settings.visualsOnlyOutsideFocus && isFocusActive;
    const isVisualsDisabled = !settings.visualsEnabled;

    return JSON.stringify({
      isFocusActive,
      shouldFreezeMotion,
      isVisualsDisabled
    });
  }, []);

  const getServerSnapshot = () => JSON.stringify({
    isFocusActive: false,
    shouldFreezeMotion: false,
    isVisualsDisabled: false
  });

  const data = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  return JSON.parse(data) as {
    isFocusActive: boolean;
    shouldFreezeMotion: boolean;
    isVisualsDisabled: boolean;
  };
}

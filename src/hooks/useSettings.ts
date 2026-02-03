import { useCallback, useSyncExternalStore } from 'react';
import { settingsStore, subscribeToStore, SettingsData } from '@/lib/store';

export function useSettings() {
  const getSnapshot = useCallback(() => JSON.stringify(settingsStore.get()), []);
  const getServerSnapshot = useCallback(() => JSON.stringify({}), []);
  const data = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  return JSON.parse(data) as SettingsData;
}

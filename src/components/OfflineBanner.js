import { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { syncOfflineQueue, getOfflineQueue } from '../utils/offlineQueue';

/** Banner when offline; syncs queued entries as soon as the connection returns. */
export default function OfflineBanner({ enabled }) {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);
  const [syncedMsg, setSyncedMsg] = useState('');

  useEffect(() => {
    let wasOffline = false;
    const unsub = NetInfo.addEventListener(async (state) => {
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
      if (isOffline) {
        wasOffline = true;
        getOfflineQueue().then((q) => setPending(q.length)).catch(() => {});
        return;
      }
      if (wasOffline && enabled) {
        wasOffline = false;
        try {
          const { synced } = await syncOfflineQueue();
          setPending(0);
          if (synced) {
            setSyncedMsg(`Back online — synced ${synced} saved ${synced === 1 ? 'entry' : 'entries'}`);
            setTimeout(() => setSyncedMsg(''), 4000);
          }
        } catch {
          // will retry on next reconnect
        }
      }
    });
    return unsub;
  }, [enabled]);

  if (!offline && !syncedMsg) return null;
  return (
    <View style={[styles.banner, { paddingTop: insets.top + 6 }, offline ? styles.offline : styles.online]} pointerEvents="none">
      <Text style={styles.text}>
        {offline
          ? `You are offline${pending ? ` · ${pending} saved to sync` : ''}`
          : syncedMsg}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 6, zIndex: 998, alignItems: 'center' },
  offline: { backgroundColor: '#C62828' },
  online: { backgroundColor: '#2E7D32' },
  text: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

import { useEffect, useState, useSyncExternalStore } from 'react';
import { View, StyleSheet } from 'react-native';
import GrazingCow from './GrazingCow';
import { loadingTracker } from '../utils/loadingTracker';

const SHOW_DELAY = 350; // don't flash for fast requests
const MIN_VISIBLE = 500; // avoid flicker once visible

/** Full-screen grazing-cow overlay shown whenever an API call is slow. Blocks taps to prevent double-submits. */
export default function GlobalLoader() {
  const pending = useSyncExternalStore(loadingTracker.subscribe, loadingTracker.getSnapshot);
  const [visible, setVisible] = useState(false);
  const [shownAt, setShownAt] = useState(0);

  useEffect(() => {
    if (pending > 0 && !visible) {
      const t = setTimeout(() => {
        setShownAt(Date.now());
        setVisible(true);
      }, SHOW_DELAY);
      return () => clearTimeout(t);
    }
    if (pending === 0 && visible) {
      const wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt));
      const t = setTimeout(() => setVisible(false), wait);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [pending, visible, shownAt]);

  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <GrazingCow message="Please wait…" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
});

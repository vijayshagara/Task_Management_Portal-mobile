import { View, StyleSheet } from 'react-native';
import { SafeScreen } from './Screen';
import GrazingCow from './GrazingCow';
import { spacing } from '../theme';

export default function LoadingView({ message = 'Loading…' }) {
  return (
    <SafeScreen style={styles.wrap}>
      <GrazingCow message={message} />
    </SafeScreen>
  );
}

/** Compact loader for list footers and inline loading */
export function LoadingFooter({ message }) {
  return (
    <View style={styles.footer}>
      <GrazingCow size={80} message={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  footer: { padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
});

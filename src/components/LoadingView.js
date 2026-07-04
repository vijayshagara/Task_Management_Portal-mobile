import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeScreen } from './Screen';
import { colors, spacing } from '../theme';

export default function LoadingView({ message = 'Loading…' }) {
  return (
    <SafeScreen style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { marginTop: spacing.md, color: colors.textMuted },
});

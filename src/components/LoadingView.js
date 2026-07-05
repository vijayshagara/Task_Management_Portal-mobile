import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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

/** Compact spinner for list footers and inline loading */
export function LoadingFooter({ message }) {
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message ? <Text style={styles.footerText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { marginTop: spacing.md, color: colors.textMuted },
  footer: { padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  footerText: { marginTop: spacing.sm, color: colors.textMuted, fontSize: 13 },
});

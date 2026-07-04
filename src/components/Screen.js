import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

/**
 * Standard page wrapper — respects status bar / notch on all devices.
 * Bottom inset is handled by the tab bar; stack screens can pass edges including 'bottom'.
 */
export default function Screen({ title, subtitle, children, action, edges = ['top', 'left', 'right'] }) {
  return (
    <SafeAreaView style={styles.container} edges={edges}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

/** Full-screen safe wrapper for auth, loading, chat, etc. */
export function SafeScreen({ children, edges = ['top', 'bottom', 'left', 'right'], style }) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

/** Hook for custom layouts (keyboard, chat input, tab bar). */
export { useSafeAreaInsets };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1, marginRight: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});

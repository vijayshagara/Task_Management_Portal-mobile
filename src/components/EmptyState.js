import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function EmptyState({ title, message }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>🐄</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.xl },
  emoji: { fontSize: 40, marginBottom: spacing.sm },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' },
  message: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
});

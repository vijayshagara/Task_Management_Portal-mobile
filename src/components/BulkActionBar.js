import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export default function BulkActionBar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleAll,
  onClear,
  onDelete,
  deleteLabel = 'Delete',
  extraActions = null,
}) {
  if (!selectedCount) return null;

  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.selectAll} onPress={onToggleAll}>
        <Ionicons
          name={allSelected ? 'checkbox' : 'square-outline'}
          size={22}
          color={colors.white}
        />
        <Text style={styles.count}>
          {selectedCount}/{totalCount} selected
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        {extraActions}
        {onDelete ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={colors.white} />
            <Text style={styles.deleteText}>{deleteLabel}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SelectCheckbox({ checked, onPress, label }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label || 'Select'}
      style={styles.checkboxHit}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? colors.primary : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  count: { color: colors.white, fontWeight: '600', fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  checkboxHit: { paddingRight: spacing.sm },
});

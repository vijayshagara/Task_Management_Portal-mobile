import { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCows, bulkDeleteCows } from './cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import CowImage from '../../components/CowImage';
import useRefresh from '../../hooks/useRefresh';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { formatDate } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

export default function CowListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.cows);
  const user = useSelector((s) => s.auth.user);
  const canDelete = user?.role === 'admin' || user?.role === 'farmer';
  const selection = useMultiSelect(canDelete ? items : []);

  useEffect(() => {
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(() => dispatch(fetchCows()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleBulkDelete = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteCows(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'cow');
  };

  if (loading && !items.length) return <LoadingView message="Loading cows…" />;

  return (
    <Screen
      title="Cows"
      subtitle={`${items.length} in herd`}
      action={canDelete ? <Button title="+ Add" onPress={() => navigation.navigate('CowForm')} style={{ paddingHorizontal: 12 }} /> : null}
    >
      {canDelete && (
        <BulkActionBar
          selectedCount={selection.selectedCount}
          totalCount={items.length}
          allSelected={selection.allSelected}
          onToggleAll={selection.toggleAll}
          onClear={selection.clear}
          onDelete={handleBulkDelete}
        />
      )}
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<EmptyState title="No cows yet" message="Add your first cow to get started" />}
        renderItem={({ item }) => (
          <View style={[styles.card, selection.isSelected(item.id) && styles.selected]}>
            {canDelete && (
              <SelectCheckbox
                checked={selection.isSelected(item.id)}
                onPress={() => selection.toggle(item.id)}
                label={`Select ${item.name}`}
              />
            )}
            <TouchableOpacity
              style={styles.cardBody}
              onPress={() => navigation.navigate('CowDetail', { id: item.id })}
            >
              <CowImage cow={item} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.breed} · {item.gender}{item.birthDate ? ` · ${formatDate(item.birthDate)}` : ''}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  selected: { backgroundColor: colors.primaryLight },
  name: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});

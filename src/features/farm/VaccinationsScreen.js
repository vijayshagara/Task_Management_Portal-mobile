import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import useRefresh from '../../hooks/useRefresh';
import {
  fetchVaccinations, createVaccination, updateVaccination, deleteVaccination,
  bulkDeleteVaccinations, bulkCompleteVaccinations,
} from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';

export default function VaccinationsScreen() {
  const dispatch = useDispatch();
  const { vaccinations, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const selection = useMultiSelect(vaccinations);
  const [form, setForm] = useState({ cowId: '', vaccineName: '', scheduledDate: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    dispatch(fetchVaccinations());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchVaccinations()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    await dispatch(createVaccination(form));
    setForm({ cowId: '', vaccineName: '', scheduledDate: '' });
  };

  const markComplete = (id) => {
    dispatch(updateVaccination({
      id,
      status: 'completed',
      administeredDate: new Date().toISOString().split('T')[0],
    }));
  };

  const handleBulkComplete = async () => {
    const scheduledIds = selection.selectedIds.filter((id) => {
      const v = vaccinations.find((item) => item.id === id);
      return v?.status === 'scheduled';
    });
    if (!scheduledIds.length) {
      Alert.alert('Nothing to complete', 'No scheduled vaccinations selected');
      return;
    }
    const date = new Date().toISOString().split('T')[0];
    try {
      await dispatch(bulkCompleteVaccinations({ ids: scheduledIds, administeredDate: date })).unwrap();
      selection.clear();
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkDelete = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteVaccinations(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'vaccination');
  };

  if (loading && !vaccinations.length) return <LoadingView message="Loading vaccinations…" />;

  return (
    <Screen title="Vaccinations" subtitle="Preventive care schedule">
      <BulkActionBar
        selectedCount={selection.selectedCount}
        totalCount={vaccinations.length}
        allSelected={selection.allSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
        extraActions={(
          <TouchableOpacity style={styles.extraBtn} onPress={handleBulkComplete}>
            <Text style={styles.extraText}>Mark completed</Text>
          </TouchableOpacity>
        )}
      />
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID *" />
        <Input value={form.vaccineName} onChangeText={(v) => set('vaccineName', v)} placeholder="Vaccine name *" />
        <Input value={form.scheduledDate} onChangeText={(v) => set('scheduledDate', v)} placeholder="Date (YYYY-MM-DD)" />
        <Button title="Schedule" onPress={submit} />
        {vaccinations.map((v) => (
          <View key={v.id} style={[styles.card, selection.isSelected(v.id) && styles.selected]}>
            <View style={styles.row}>
              <SelectCheckbox
                checked={selection.isSelected(v.id)}
                onPress={() => selection.toggle(v.id)}
                label={`Select ${v.vaccineName}`}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{v.vaccineName}</Text>
                <Text>{v.cow?.name} — {v.scheduledDate} — {v.status}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              {v.status === 'scheduled' && (
                <Button title="Complete" onPress={() => markComplete(v.id)} style={{ paddingHorizontal: 12 }} />
              )}
              <Button
                title="Delete"
                variant="outline"
                onPress={() => confirmBulkDelete(1, () => dispatch(deleteVaccination(v.id)), 'vaccination')}
                style={{ paddingHorizontal: 12 }}
              />
            </View>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontWeight: '600', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  extraBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  extraText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});

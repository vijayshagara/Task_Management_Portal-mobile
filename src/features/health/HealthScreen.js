import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealth, addHealth, deleteHealth, bulkDeleteHealth } from './healthSlice';
import { fetchCows } from '../cows/cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { formatDateTime } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

export default function HealthScreen({ route }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.health);
  const cows = useSelector((s) => s.cows.items);
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const emptyForm = { cowId: '', temperature: '', activityLevel: '', eatingStatus: '', rumination: '', issue: '' };
  const [form, setForm] = useState(emptyForm);
  const [filterCow, setFilterCow] = useState(route?.params?.cow || '');
  useEffect(() => {
    const cowId = route?.params?.cow;
    if (cowId) {
      setFilterCow(cowId);
      setForm((f) => ({ ...f, cowId }));
    }
  }, [route?.params?.cow]);
  const filtered = filterCow ? items.filter((r) => r.cowId === filterCow) : items;
  const cowOptions = cows.map((c) => ({ value: c.id, label: c.name }));
  const selection = useMultiSelect(isAdmin ? filtered : []);

  useEffect(() => {
    dispatch(fetchHealth());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchHealth()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.cowId) {
      Alert.alert('Missing cow', 'Please select a cow');
      return;
    }
    try {
      await dispatch(addHealth({ ...form, temperature: form.temperature ? Number(form.temperature) : null })).unwrap();
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkDelete = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteHealth(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'health record');
  };

  if (loading && !items.length) return <LoadingView message="Loading health records…" />;

  return (
    <Screen title="Health Records" subtitle="Monitor cattle health" action={<Button title={showForm ? 'Cancel' : '+ Log'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Select value={form.cowId} onChange={(v) => setForm({ ...form, cowId: v })} options={cowOptions} placeholder="Select cow *" />
          <Input value={form.temperature} onChangeText={(v) => setForm({ ...form, temperature: v })} placeholder="Temperature °C" keyboardType="decimal-pad" />
          <Input value={form.activityLevel} onChangeText={(v) => setForm({ ...form, activityLevel: v })} placeholder="Activity level (Normal, Low, High)" />
          <Input value={form.eatingStatus} onChangeText={(v) => setForm({ ...form, eatingStatus: v })} placeholder="Eating status" />
          <Input value={form.rumination} onChangeText={(v) => setForm({ ...form, rumination: v })} placeholder="Rumination" />
          <Input value={form.issue} onChangeText={(v) => setForm({ ...form, issue: v })} placeholder="Issue / notes (optional)" />
          <Button title="Save Record" onPress={submit} />
        </View>
      )}
      <View style={styles.filter}>
        <Select value={filterCow} onChange={setFilterCow} options={[{ value: '', label: 'All cows' }, ...cowOptions]} placeholder="All cows" />
      </View>
      {isAdmin && (
        <BulkActionBar
          selectedCount={selection.selectedCount}
          totalCount={filtered.length}
          allSelected={selection.allSelected}
          onToggleAll={selection.toggleAll}
          onClear={selection.clear}
          onDelete={handleBulkDelete}
        />
      )}
      <RefreshableFlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={[styles.card, selection.isSelected(item.id) && styles.selected]}>
            <View style={styles.row}>
              {isAdmin && (
                <SelectCheckbox
                  checked={selection.isSelected(item.id)}
                  onPress={() => selection.toggle(item.id)}
                  label={`Select health record`}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.cow?.name || item.cowId}</Text>
                <Text style={styles.sub}>
                  {item.temperature != null ? `${item.temperature}°C` : '—'} · Activity: {item.activityLevel || '—'} · Eating: {item.eatingStatus || '—'}
                </Text>
                <Text style={styles.sub}>Rumination: {item.rumination || '—'} · {item.issue || 'No issue'}</Text>
                <Text style={styles.sub}>{formatDateTime(item.recordedAt)}</Text>
              </View>
            </View>
            {isAdmin && (
              <Button
                title="Delete"
                variant="outline"
                onPress={() => confirmBulkDelete(1, () => dispatch(deleteHealth(item.id)), 'health record')}
                style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
              />
            )}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  form: { padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  card: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeatCycles, addHeatCycle, confirmHeatCycle, deleteHeatCycle, bulkDeleteHeatCycles, bulkConfirmHeatCycles } from './heatCycleSlice';
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
import DateInput from '../../components/DateInput';
import TimeInput from '../../components/TimeInput';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HeatCycleScreen({ route }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.heatCycles);
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const cows = useSelector((s) => s.cows.items);
  const emptyForm = { cowId: '', heatStartDate: todayStr(), heatStartTime: nowTimeStr(), detectionMethod: 'manual', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [filterCow, setFilterCow] = useState(route?.params?.cow || '');
  useEffect(() => {
    const cowId = route?.params?.cow;
    if (cowId) {
      setFilterCow(cowId);
      setForm((f) => ({ ...f, cowId }));
    }
  }, [route?.params?.cow]);
  const [filterStatus, setFilterStatus] = useState('');
  const cowOptions = cows.map((c) => ({ value: c.id, label: c.name }));
  const filtered = items.filter((c) => (!filterCow || c.cowId === filterCow) && (!filterStatus || c.status === filterStatus));
  const selection = useMultiSelect(isAdmin ? filtered : []);

  useEffect(() => {
    dispatch(fetchHeatCycles());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchHeatCycles()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.cowId) {
      Alert.alert('Missing cow', 'Please select a cow');
      return;
    }
    if (!form.heatStartDate) {
      Alert.alert('Missing date', 'Please pick the heat start date');
      return;
    }
    const [y, m, d] = form.heatStartDate.split('-').map(Number);
    const [hh, mm] = (form.heatStartTime || nowTimeStr()).split(':').map(Number);
    const start = new Date(y, m - 1, d, hh, mm);
    if (start.getTime() > Date.now()) {
      Alert.alert('Invalid time', 'Heat start cannot be in the future');
      return;
    }
    try {
      const { heatStartTime, ...rest } = form;
      await dispatch(addHeatCycle({ ...rest, heatStartDate: start.toISOString() })).unwrap();
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkConfirm = async () => {
    const pendingIds = selection.selectedIds.filter((id) => {
      const cycle = filtered.find((c) => c.id === id);
      return cycle?.status === 'pending';
    });
    if (!pendingIds.length) {
      Alert.alert('No pending cycles', 'No pending cycles selected');
      return;
    }
    try {
      await dispatch(bulkConfirmHeatCycles(pendingIds)).unwrap();
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
        await dispatch(bulkDeleteHeatCycles(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'heat cycle');
  };

  if (loading && !items.length) return <LoadingView message="Loading heat cycles…" />;

  return (
    <Screen title="Heat Cycles" subtitle="Track breeding cycles" action={<Button title={showForm ? 'Cancel' : '+ Log'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Select value={form.cowId} onChange={(v) => setForm({ ...form, cowId: v })} options={cowOptions} placeholder="Select cow *" />
          <DateInput value={form.heatStartDate} onChange={(v) => setForm({ ...form, heatStartDate: v })} placeholder="Heat start date *" maximumDate={new Date()} />
          <TimeInput value={form.heatStartTime} onChange={(v) => setForm({ ...form, heatStartTime: v })} placeholder="Heat start time *" />
          <Select
            value={form.detectionMethod}
            onChange={(v) => setForm({ ...form, detectionMethod: v })}
            options={[{ value: 'manual', label: 'Manual' }, { value: 'sensor', label: 'Sensor' }]}
          />
          <Input value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Notes" multiline />
          <Button title="Log Heat Cycle" onPress={submit} />
        </View>
      )}
      <View style={styles.filter}>
        <Select value={filterCow} onChange={setFilterCow} options={[{ value: '', label: 'All cows' }, ...cowOptions]} placeholder="All cows" />
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={[{ value: '', label: 'All statuses' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'missed', label: 'Missed' }]}
          placeholder="All statuses"
        />
      </View>
      {isAdmin && (
        <BulkActionBar
          selectedCount={selection.selectedCount}
          totalCount={filtered.length}
          allSelected={selection.allSelected}
          onToggleAll={selection.toggleAll}
          onClear={selection.clear}
          onDelete={handleBulkDelete}
          extraActions={(
            <TouchableOpacity style={styles.extraBtn} onPress={handleBulkConfirm}>
              <Text style={styles.extraText}>Confirm pending</Text>
            </TouchableOpacity>
          )}
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
                  label={`Select heat cycle`}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.cow?.name || item.cowId}</Text>
                <Text style={styles.sub}>{item.status} · {item.detectionMethod}</Text>
                <Text style={styles.sub}>Start: {formatDateTime(item.heatStartDate)}</Text>
                <Text style={styles.sub}>Next expected: {formatDate(item.nextExpectedHeat)}</Text>
              </View>
            </View>
            {isAdmin && (
              <View style={styles.actions}>
                {item.status === 'pending' && (
                  <Button title="Confirm" onPress={async () => { await dispatch(confirmHeatCycle(item.id)); dispatch(fetchHeatCycles()); }} style={{ paddingHorizontal: 12 }} />
                )}
                <Button
                  title="Delete"
                  variant="outline"
                  onPress={() => confirmBulkDelete(1, () => dispatch(deleteHeatCycle(item.id)), 'heat cycle')}
                  style={{ paddingHorizontal: 12 }}
                />
              </View>
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
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  extraBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  extraText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});

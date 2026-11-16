import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import DateInput from '../../components/DateInput';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import useRefresh from '../../hooks/useRefresh';
import {
  fetchMilk, createMilk, fetchMilkTrends, deleteMilk, bulkDeleteMilk,
  fetchCollections, createCollection, deleteCollection, bulkDeleteCollections,
} from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';
import { enqueueOfflineAction } from '../../utils/offlineQueue';
import { isOfflineError } from '../../utils/helpers';

export default function MilkScreen() {
  const dispatch = useDispatch();
  const { milk, milkTrends, collections, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const [tab, setTab] = useState('production');
  const [form, setForm] = useState({
    recordDate: new Date().toISOString().split('T')[0], session: 'morning', liters: '', fatPercent: '', cowId: '',
  });
  const [collForm, setCollForm] = useState({
    collectionDate: new Date().toISOString().split('T')[0], totalLiters: '', fatPercent: '', ratePerLiter: '', cooperativeName: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setColl = (k, v) => setCollForm((f) => ({ ...f, [k]: v }));
  const milkSelection = useMultiSelect(tab === 'production' ? milk : []);
  const collSelection = useMultiSelect(tab === 'collections' ? collections : []);

  useEffect(() => {
    dispatch(fetchMilk());
    dispatch(fetchMilkTrends(14));
    dispatch(fetchCollections());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([
      dispatch(fetchMilk()).unwrap(),
      dispatch(fetchMilkTrends(14)).unwrap(),
      dispatch(fetchCollections()).unwrap(),
      dispatch(fetchCows()).unwrap(),
    ]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    const liters = parseFloat(form.liters);
    if (!Number.isFinite(liters) || liters <= 0) {
      Alert.alert('Invalid liters', 'Enter how many liters were milked');
      return;
    }
    const payload = {
      ...form,
      liters,
      fatPercent: form.fatPercent ? parseFloat(form.fatPercent) : null,
      cowId: form.cowId || null,
    };
    try {
      await dispatch(createMilk(payload)).unwrap();
      setForm({ recordDate: new Date().toISOString().split('T')[0], session: 'morning', liters: '', fatPercent: '', cowId: '' });
      dispatch(fetchMilkTrends(14));
    } catch (err) {
      if (isOfflineError(err)) {
        await enqueueOfflineAction({ type: 'milk', payload });
        Alert.alert('Offline', 'Saved on this phone — it will sync when you are back online');
      } else {
        Alert.alert('Error', String(err));
      }
    }
  };

  const submitCollection = async () => {
    try {
      await dispatch(createCollection({
        ...collForm,
        totalLiters: parseFloat(collForm.totalLiters),
        fatPercent: collForm.fatPercent ? parseFloat(collForm.fatPercent) : null,
        ratePerLiter: collForm.ratePerLiter ? parseFloat(collForm.ratePerLiter) : null,
      })).unwrap();
      setCollForm({
        collectionDate: new Date().toISOString().split('T')[0], totalLiters: '', fatPercent: '', ratePerLiter: '', cooperativeName: '',
      });
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkDeleteMilk = () => {
    const ids = milkSelection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteMilk(ids)).unwrap();
        milkSelection.clear();
        dispatch(fetchMilkTrends(14));
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'milk record');
  };

  const handleBulkDeleteCollection = () => {
    const ids = collSelection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteCollections(ids)).unwrap();
        collSelection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'collection');
  };

  if (loading && !milk.length && !collections.length) return <LoadingView message="Loading milk records…" />;

  return (
    <Screen title="Milk Production" subtitle="Track daily yield">
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'production' && styles.tabActive]}
          onPress={() => setTab('production')}
        >
          <Text style={[styles.tabText, tab === 'production' && styles.tabTextActive]}>Production</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'collections' && styles.tabActive]}
          onPress={() => setTab('collections')}
        >
          <Text style={[styles.tabText, tab === 'collections' && styles.tabTextActive]}>Collections</Text>
        </TouchableOpacity>
      </View>

      {tab === 'production' && (
        <BulkActionBar
          selectedCount={milkSelection.selectedCount}
          totalCount={milk.length}
          allSelected={milkSelection.allSelected}
          onToggleAll={milkSelection.toggleAll}
          onClear={milkSelection.clear}
          onDelete={handleBulkDeleteMilk}
        />
      )}
      {tab === 'collections' && (
        <BulkActionBar
          selectedCount={collSelection.selectedCount}
          totalCount={collections.length}
          allSelected={collSelection.allSelected}
          onToggleAll={collSelection.toggleAll}
          onClear={collSelection.clear}
          onDelete={handleBulkDeleteCollection}
        />
      )}

      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {tab === 'production' && (
          <>
            <DateInput value={form.recordDate} onChange={(v) => set('recordDate', v)} placeholder="Date" maximumDate={new Date()} />
            <Select value={form.session} onChange={(v) => set('session', v)} options={[{ value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' }]} placeholder="Session" />
            <Input value={form.liters} onChangeText={(v) => set('liters', v)} placeholder="Liters *" keyboardType="decimal-pad" />
            <Input value={form.fatPercent} onChangeText={(v) => set('fatPercent', v)} placeholder="Fat % (optional)" keyboardType="decimal-pad" />
            <Select value={form.cowId} onChange={(v) => set('cowId', v)} options={[{ value: '', label: 'Herd total' }, ...cows.map((c) => ({ value: c.id, label: c.name }))]} placeholder="Herd total" />
            <Button title="Log Milk" onPress={submit} />

            {milkTrends.length > 0 && (
              <Text style={styles.section}>14-day trend: {milkTrends.slice(-3).map((t) => `${t.liters}L`).join(', ')}...</Text>
            )}

            {milk.map((r) => (
              <View key={r.id} style={[styles.card, milkSelection.isSelected(r.id) && styles.selected]}>
                <View style={styles.row}>
                  <SelectCheckbox
                    checked={milkSelection.isSelected(r.id)}
                    onPress={() => milkSelection.toggle(r.id)}
                    label={`Select milk record ${r.recordDate}`}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{r.recordDate} — {r.session}</Text>
                    <Text>{r.liters}L {r.cow?.name ? `(${r.cow.name})` : ''}</Text>
                  </View>
                </View>
                <Button
                  title="Delete"
                  variant="outline"
                  onPress={() => confirmBulkDelete(1, async () => {
                    await dispatch(deleteMilk(r.id)).unwrap();
                    milkSelection.clear();
                    dispatch(fetchMilkTrends(14));
                  }, 'milk record')}
                  style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
                />
              </View>
            ))}
          </>
        )}

        {tab === 'collections' && (
          <>
            <DateInput value={collForm.collectionDate} onChange={(v) => setColl('collectionDate', v)} placeholder="Collection date" maximumDate={new Date()} />
            <Input value={collForm.totalLiters} onChangeText={(v) => setColl('totalLiters', v)} placeholder="Total liters" keyboardType="decimal-pad" />
            <Input value={collForm.fatPercent} onChangeText={(v) => setColl('fatPercent', v)} placeholder="Fat %" keyboardType="decimal-pad" />
            <Input value={collForm.ratePerLiter} onChangeText={(v) => setColl('ratePerLiter', v)} placeholder="Rate per liter" keyboardType="decimal-pad" />
            <Input value={collForm.cooperativeName} onChangeText={(v) => setColl('cooperativeName', v)} placeholder="Cooperative name" />
            <Button title="Record Collection" onPress={submitCollection} />

            {collections.map((c) => (
              <View key={c.id} style={[styles.card, collSelection.isSelected(c.id) && styles.selected]}>
                <View style={styles.row}>
                  <SelectCheckbox
                    checked={collSelection.isSelected(c.id)}
                    onPress={() => collSelection.toggle(c.id)}
                    label={`Select collection ${c.collectionDate}`}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{c.collectionDate} — {c.totalLiters}L</Text>
                    <Text>{c.cooperativeName || 'Co-op'} · {c.status || '—'}</Text>
                  </View>
                </View>
                <Button
                  title="Delete"
                  variant="outline"
                  onPress={() => confirmBulkDelete(1, async () => {
                    await dispatch(deleteCollection(c.id)).unwrap();
                    collSelection.clear();
                  }, 'collection')}
                  style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
                />
              </View>
            ))}
          </>
        )}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  section: { marginTop: spacing.md, color: colors.textMuted },
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontWeight: '600' },
});

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
import { fetchDiary, createDiary, deleteDiary, bulkDeleteDiary } from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';
import { enqueueOfflineAction } from '../../utils/offlineQueue';

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const { diary, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const selection = useMultiSelect(diary);
  const [form, setForm] = useState({
    entryDate: new Date().toISOString().split('T')[0], content: '', weather: '', feedNotes: '', cowId: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    dispatch(fetchDiary());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchDiary()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    const payload = { ...form, cowId: form.cowId || null };
    try {
      await dispatch(createDiary(payload)).unwrap();
      setForm({ entryDate: new Date().toISOString().split('T')[0], content: '', weather: '', feedNotes: '', cowId: '' });
    } catch {
      await enqueueOfflineAction({ type: 'diary', payload });
      Alert.alert('Offline', 'Saved locally — will sync when online');
    }
  };

  const handleDeleteOne = (id) => {
    confirmBulkDelete(1, async () => {
      try {
        await dispatch(deleteDiary(id)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'diary entry');
  };

  const handleBulkDelete = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteDiary(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'diary entry');
  };

  if (loading && !diary.length) return <LoadingView message="Loading diary…" />;

  return (
    <Screen title="Farm Diary" subtitle="Daily farm logs">
      <BulkActionBar
        selectedCount={selection.selectedCount}
        totalCount={diary.length}
        allSelected={selection.allSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
      />
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.entryDate} onChangeText={(v) => set('entryDate', v)} placeholder="Date (YYYY-MM-DD)" />
        <Input value={form.weather} onChangeText={(v) => set('weather', v)} placeholder="Weather" />
        <Input value={form.feedNotes} onChangeText={(v) => set('feedNotes', v)} placeholder="Feed notes" />
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID (optional)" />
        <Input value={form.content} onChangeText={(v) => set('content', v)} placeholder="Diary entry *" multiline />
        <Button title="Save Entry" onPress={submit} />

        {diary.map((entry) => (
          <View key={entry.id} style={[styles.card, selection.isSelected(entry.id) && styles.selected]}>
            <View style={styles.row}>
              <SelectCheckbox
                checked={selection.isSelected(entry.id)}
                onPress={() => selection.toggle(entry.id)}
                label={`Select diary entry ${entry.entryDate}`}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{entry.entryDate}</Text>
                {entry.weather ? <Text style={styles.meta}>Weather: {entry.weather}</Text> : null}
                <Text>{entry.content}</Text>
              </View>
            </View>
            <Button
              title="Delete"
              variant="outline"
              onPress={() => handleDeleteOne(entry.id)}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
            />
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  date: { fontWeight: '700', color: colors.primary },
  meta: { color: colors.textMuted, fontSize: 13 },
});

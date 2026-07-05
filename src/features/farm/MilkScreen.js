import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchMilk, createMilk, fetchMilkTrends } from './farmSlice';
import { colors, spacing } from '../../theme';
import { enqueueOfflineAction } from '../../utils/offlineQueue';

export default function MilkScreen() {
  const dispatch = useDispatch();
  const { milk, milkTrends, loading } = useSelector((s) => s.farm);
  const [form, setForm] = useState({
    recordDate: new Date().toISOString().split('T')[0], session: 'morning', liters: '', cowId: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    dispatch(fetchMilk());
    dispatch(fetchMilkTrends(14));
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchMilk()).unwrap(), dispatch(fetchMilkTrends(14)).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    const payload = { ...form, liters: parseFloat(form.liters), cowId: form.cowId || null };
    try {
      await dispatch(createMilk(payload)).unwrap();
      setForm({ recordDate: new Date().toISOString().split('T')[0], session: 'morning', liters: '', cowId: '' });
    } catch {
      await enqueueOfflineAction({ type: 'milk', payload });
      Alert.alert('Offline', 'Saved locally — will sync when online');
    }
  };

  if (loading && !milk.length) return <LoadingView message="Loading milk records…" />;

  return (
    <Screen title="Milk Production" subtitle="Track daily yield">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.recordDate} onChangeText={(v) => set('recordDate', v)} placeholder="Date" />
        <Input value={form.session} onChangeText={(v) => set('session', v)} placeholder="Session (morning/evening)" />
        <Input value={form.liters} onChangeText={(v) => set('liters', v)} placeholder="Liters" keyboardType="decimal-pad" />
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID (optional)" />
        <Button title="Log Milk" onPress={submit} />

        {milkTrends.length > 0 && (
          <Text style={styles.section}>14-day trend: {milkTrends.slice(-3).map((t) => `${t.liters}L`).join(', ')}...</Text>
        )}

        {milk.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.title}>{r.recordDate} — {r.session}</Text>
            <Text>{r.liters}L {r.cow?.name ? `(${r.cow.name})` : ''}</Text>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.md, color: colors.textMuted },
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600' },
});

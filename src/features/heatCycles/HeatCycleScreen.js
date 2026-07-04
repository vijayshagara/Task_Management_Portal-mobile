import { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeatCycles, addHeatCycle, confirmHeatCycle, deleteHeatCycle } from './heatCycleSlice';
import { fetchCows } from '../cows/cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function HeatCycleScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.heatCycles);
  const user = useSelector((s) => s.auth.user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cowId: '', detectionMethod: 'manual', notes: '' });

  useEffect(() => {
    dispatch(fetchHeatCycles());
    dispatch(fetchCows());
  }, [dispatch]);

  const submit = async () => {
    try {
      await dispatch(addHeatCycle(form)).unwrap();
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !items.length) return <LoadingView message="Loading heat cycles…" />;

  return (
    <Screen title="Heat Cycles" subtitle="Track breeding cycles" action={<Button title={showForm ? 'Cancel' : '+ Log'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Input value={form.cowId} onChangeText={(v) => setForm({ ...form, cowId: v })} placeholder="Cow ID" />
          <Input value={form.detectionMethod} onChangeText={(v) => setForm({ ...form, detectionMethod: v })} placeholder="Detection method" />
          <Input value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Notes" />
          <Button title="Log Heat Cycle" onPress={submit} />
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.cow?.name || item.cowId}</Text>
            <Text style={styles.sub}>{item.status} · {item.detectionMethod}</Text>
            {user?.role === 'admin' && item.status === 'pending' && (
              <Button title="Confirm" onPress={() => dispatch(confirmHeatCycle(item.id))} style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }} />
            )}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  card: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, textTransform: 'capitalize' },
});

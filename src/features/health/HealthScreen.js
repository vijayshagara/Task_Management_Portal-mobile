import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHealth, addHealth, deleteHealth } from './healthSlice';
import { fetchCows } from '../cows/cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function HealthScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.health);
  const cows = useSelector((s) => s.cows.items);
  const user = useSelector((s) => s.auth.user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cowId: '', temperature: '', activity: '', eating: '', rumination: '', issue: '' });

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
    try {
      await dispatch(addHealth({ ...form, temperature: Number(form.temperature) })).unwrap();
      setShowForm(false);
      setForm({ cowId: '', temperature: '', activity: '', eating: '', rumination: '', issue: '' });
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !items.length) return <LoadingView message="Loading health records…" />;

  return (
    <Screen title="Health Records" subtitle="Monitor cattle health" action={<Button title={showForm ? 'Cancel' : '+ Log'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Input value={form.cowId} onChangeText={(v) => setForm({ ...form, cowId: v })} placeholder="Cow ID (from cows list)" />
          <Input value={form.temperature} onChangeText={(v) => setForm({ ...form, temperature: v })} placeholder="Temperature °C" keyboardType="decimal-pad" />
          <Input value={form.activity} onChangeText={(v) => setForm({ ...form, activity: v })} placeholder="Activity level" />
          <Input value={form.eating} onChangeText={(v) => setForm({ ...form, eating: v })} placeholder="Eating" />
          <Input value={form.issue} onChangeText={(v) => setForm({ ...form, issue: v })} placeholder="Issue (optional)" />
          <Button title="Save Record" onPress={submit} />
        </View>
      )}
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.cow?.name || item.cowId}</Text>
            <Text style={styles.sub}>{item.temperature}°C · {item.status} · {item.issue || 'No issue'}</Text>
            {user?.role === 'admin' && (
              <Button title="Delete" variant="outline" onPress={() => dispatch(deleteHealth(item.id))} style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }} />
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
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});

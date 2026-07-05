import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchVaccinations, createVaccination } from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';

export default function VaccinationsScreen() {
  const dispatch = useDispatch();
  const { vaccinations, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
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

  if (loading && !vaccinations.length) return <LoadingView message="Loading vaccinations…" />;

  return (
    <Screen title="Vaccinations" subtitle="Preventive care schedule">
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
          <View key={v.id} style={styles.card}>
            <Text style={styles.title}>{v.vaccineName}</Text>
            <Text>{v.cow?.name} — {v.scheduledDate} — {v.status}</Text>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600', color: colors.primary },
});

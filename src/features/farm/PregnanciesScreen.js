import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import DateInput from '../../components/DateInput';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchPregnancies, createPregnancy, recordCalving } from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { formatDate, titleCase } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

const emptyForm = { cowId: '', conceptionDate: '', sireName: '' };

export default function PregnanciesScreen() {
  const dispatch = useDispatch();
  const { pregnancies, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const [form, setForm] = useState(emptyForm);
  const [calvingId, setCalvingId] = useState(null);
  const [calfName, setCalfName] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    dispatch(fetchPregnancies());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchPregnancies()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.cowId || !form.conceptionDate) {
      Alert.alert('Missing fields', 'Select a cow and a conception date');
      return;
    }
    try {
      await dispatch(createPregnancy(form)).unwrap();
      setForm(emptyForm);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const submitCalving = async () => {
    try {
      await dispatch(recordCalving({
        id: calvingId,
        ...(calfName.trim() ? { name: calfName.trim(), breed: 'Unknown', gender: 'female' } : {}),
      })).unwrap();
      setCalvingId(null);
      setCalfName('');
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  if (loading && !pregnancies.length) return <LoadingView message="Loading breeding records…" />;

  const femaleCows = cows.filter((c) => c.gender === 'female').map((c) => ({ value: c.id, label: c.name }));

  return (
    <Screen title="Breeding & Pregnancy" subtitle="Track conception to calving">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Select value={form.cowId} onChange={(v) => set('cowId', v)} options={femaleCows} placeholder="Select cow *" />
        <DateInput value={form.conceptionDate} onChange={(v) => set('conceptionDate', v)} placeholder="Conception date *" maximumDate={new Date()} />
        <Input value={form.sireName} onChangeText={(v) => set('sireName', v)} placeholder="Sire/Bull name" />
        <Button title="Record Pregnancy" onPress={submit} />
        {pregnancies.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.title}>{p.cow?.name}</Text>
            <Text style={styles.sub}>Conception: {formatDate(p.conceptionDate)}</Text>
            <Text style={styles.sub}>Expected calving: {formatDate(p.expectedCalvingDate)}</Text>
            <Text style={styles.sub}>Sire: {p.sireName || '—'} · {titleCase(p.status)}</Text>
            {p.status !== 'calved' && calvingId !== p.id && (
              <Button title="Record Calving" onPress={() => { setCalvingId(p.id); setCalfName(''); }} style={styles.btn} />
            )}
            {calvingId === p.id && (
              <View style={{ marginTop: spacing.sm }}>
                <Input value={calfName} onChangeText={setCalfName} placeholder="Calf name (leave empty to skip calf record)" />
                <View style={styles.actions}>
                  <Button title="Confirm" onPress={submitCalving} style={styles.btn} />
                  <Button title="Cancel" variant="outline" onPress={() => setCalvingId(null)} style={styles.btn} />
                </View>
              </View>
            )}
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 12, marginTop: spacing.sm },
});

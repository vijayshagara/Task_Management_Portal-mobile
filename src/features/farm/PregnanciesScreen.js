import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchPregnancies, createPregnancy } from './farmSlice';
import { colors, spacing } from '../../theme';

export default function PregnanciesScreen() {
  const dispatch = useDispatch();
  const { pregnancies, loading } = useSelector((s) => s.farm);
  const [form, setForm] = useState({ cowId: '', conceptionDate: '', sireName: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { dispatch(fetchPregnancies()); }, [dispatch]);

  const load = useCallback(() => dispatch(fetchPregnancies()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    await dispatch(createPregnancy(form));
    setForm({ cowId: '', conceptionDate: '', sireName: '' });
  };

  if (loading && !pregnancies.length) return <LoadingView message="Loading breeding records…" />;

  return (
    <Screen title="Breeding" subtitle="Pregnancy tracking">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID *" />
        <Input value={form.conceptionDate} onChangeText={(v) => set('conceptionDate', v)} placeholder="Conception date" />
        <Input value={form.sireName} onChangeText={(v) => set('sireName', v)} placeholder="Sire/Bull name" />
        <Button title="Record Pregnancy" onPress={submit} />
        {pregnancies.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.title}>{p.cow?.name}</Text>
            <Text>Due: {p.expectedCalvingDate || '—'} — {p.status}</Text>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600' },
});

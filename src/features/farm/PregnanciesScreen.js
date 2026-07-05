import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { fetchPregnancies, createPregnancy } from './farmSlice';
import { colors, spacing } from '../../theme';

export default function PregnanciesScreen() {
  const dispatch = useDispatch();
  const { pregnancies } = useSelector((s) => s.farm);
  const [form, setForm] = useState({ cowId: '', conceptionDate: '', sireName: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { dispatch(fetchPregnancies()); }, [dispatch]);

  const submit = async () => {
    await dispatch(createPregnancy(form));
    setForm({ cowId: '', conceptionDate: '', sireName: '' });
  };

  return (
    <Screen title="Breeding" subtitle="Pregnancy tracking">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600' },
});

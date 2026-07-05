import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { fetchDiary, createDiary } from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';
import { enqueueOfflineAction } from '../../utils/offlineQueue';

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const { diary } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const [form, setForm] = useState({
    entryDate: new Date().toISOString().split('T')[0], content: '', weather: '', feedNotes: '', cowId: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    dispatch(fetchDiary());
    dispatch(fetchCows());
  }, [dispatch]);

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

  return (
    <Screen title="Farm Diary" subtitle="Daily farm logs">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input value={form.entryDate} onChangeText={(v) => set('entryDate', v)} placeholder="Date (YYYY-MM-DD)" />
        <Input value={form.weather} onChangeText={(v) => set('weather', v)} placeholder="Weather" />
        <Input value={form.feedNotes} onChangeText={(v) => set('feedNotes', v)} placeholder="Feed notes" />
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID (optional)" />
        <Input value={form.content} onChangeText={(v) => set('content', v)} placeholder="Diary entry *" multiline />
        <Button title="Save Entry" onPress={submit} />

        {diary.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.date}>{entry.entryDate}</Text>
            {entry.weather ? <Text style={styles.meta}>Weather: {entry.weather}</Text> : null}
            <Text>{entry.content}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  date: { fontWeight: '700', color: colors.primary },
  meta: { color: colors.textMuted, fontSize: 13 },
});

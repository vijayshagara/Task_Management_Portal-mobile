import { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, fetchDeveloperTasks, addTask, updateTask, deleteTask } from './taskSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

const STATUSES = ['pending', 'in_progress', 'completed'];

export default function TasksScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, loading } = useSelector((s) => s.tasks);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '' });

  useEffect(() => {
    user?.role === 'admin' ? dispatch(fetchTasks()) : dispatch(fetchDeveloperTasks());
  }, [dispatch, user?.role]);

  const submit = async () => {
    try {
      await dispatch(addTask(form)).unwrap();
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !items.length) return <LoadingView message="Loading tasks…" />;

  return (
    <Screen
      title="Tasks"
      subtitle={user?.role === 'admin' ? 'Manage farm tasks' : 'Your assigned tasks'}
      action={user?.role === 'admin' ? <Button title={showForm ? 'Cancel' : '+ New'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} /> : null}
    >
      {showForm && (
        <View style={styles.form}>
          <Input value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Title" />
          <Input value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Description" multiline />
          <Input value={form.assignedTo} onChangeText={(v) => setForm({ ...form, assignedTo: v })} placeholder="Assign to user ID" />
          <Button title="Create Task" onPress={submit} />
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.description}</Text>
            <Text style={styles.status}>{item.status?.replace('_', ' ')}</Text>
            {user?.role !== 'admin' && item.status !== 'completed' && (
              <View style={styles.statusRow}>
                {STATUSES.filter((s) => s !== item.status).map((s) => (
                  <Button key={s} title={s.replace('_', ' ')} variant="outline" onPress={() => dispatch(updateTask({ id: item.id, status: s }))} style={{ flex: 1, paddingHorizontal: 4 }} />
                ))}
              </View>
            )}
            {user?.role === 'admin' && (
              <Button title="Delete" variant="outline" onPress={() => dispatch(deleteTask(item.id))} style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }} />
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
  title: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  status: { marginTop: 4, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  statusRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
});

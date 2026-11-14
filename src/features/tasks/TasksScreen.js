import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, fetchDeveloperTasks, addTask, updateTask, deleteTask, bulkDeleteTasks, bulkUpdateTaskStatus } from './taskSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { fetchDevelopers } from '../users/userSlice';
import { colors, spacing } from '../../theme';

const STATUSES = ['pending', 'in_progress', 'completed'];

export default function TasksScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, loading } = useSelector((s) => s.tasks);
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const developers = useSelector((s) => s.users.developers) || [];
  const [form, setForm] = useState({ title: '', description: '', developerId: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const filtered = filterStatus ? items.filter((t) => t.status === filterStatus) : items;
  const selection = useMultiSelect(isAdmin ? filtered : []);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchTasks());
      dispatch(fetchDevelopers());
    } else {
      dispatch(fetchDeveloperTasks());
    }
  }, [dispatch, isAdmin]);

  const load = useCallback(
    () => (isAdmin ? dispatch(fetchTasks()) : dispatch(fetchDeveloperTasks())).unwrap(),
    [dispatch, isAdmin],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.developerId) {
      Alert.alert('Missing fields', 'Title, description and assignee are required');
      return;
    }
    try {
      await dispatch(addTask(form)).unwrap();
      setForm({ title: '', description: '', developerId: '' });
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkStatus = async (status) => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    try {
      await dispatch(bulkUpdateTaskStatus({ ids, status })).unwrap();
      selection.clear();
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleBulkDelete = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteTasks(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'task');
  };

  if (loading && !items.length) return <LoadingView message="Loading tasks…" />;

  return (
    <Screen
      title="Tasks"
      subtitle={isAdmin ? 'Manage farm tasks' : 'Your assigned tasks'}
      action={isAdmin ? <Button title={showForm ? 'Cancel' : '+ New'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} /> : null}
    >
      {showForm && (
        <View style={styles.form}>
          <Input value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Title *" />
          <Input value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Description *" multiline />
          <Select value={form.developerId} onChange={(v) => setForm({ ...form, developerId: v })} options={developers.map((d) => ({ value: d.id, label: d.name }))} placeholder="Assign to developer *" />
          <Button title="Create Task" onPress={submit} />
        </View>
      )}
      <View style={styles.filter}>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((st) => ({ value: st, label: st.replace('_', ' ') }))]}
          placeholder="All statuses"
        />
      </View>
      {isAdmin && (
        <BulkActionBar
          selectedCount={selection.selectedCount}
          totalCount={filtered.length}
          allSelected={selection.allSelected}
          onToggleAll={selection.toggleAll}
          onClear={selection.clear}
          onDelete={handleBulkDelete}
          extraActions={(
            <>
              <TouchableOpacity style={styles.extraBtn} onPress={() => handleBulkStatus('in_progress')}>
                <Text style={styles.extraText}>In progress</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.extraBtn} onPress={() => handleBulkStatus('completed')}>
                <Text style={styles.extraText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        />
      )}
      <RefreshableFlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={[styles.card, selection.isSelected(item.id) && styles.selected]}>
            <View style={styles.row}>
              {isAdmin && (
                <SelectCheckbox
                  checked={selection.isSelected(item.id)}
                  onPress={() => selection.toggle(item.id)}
                  label={`Select ${item.title}`}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sub}>{item.description}</Text>
                <Text style={styles.status}>{item.status?.replace('_', ' ')}</Text>
                {isAdmin && item.developer && <Text style={styles.sub}>Assigned to: {item.developer.name}</Text>}
              </View>
            </View>
            {item.status !== 'completed' && (
              <View style={styles.statusRow}>
                {STATUSES.filter((s) => s !== item.status).map((s) => (
                  <Button key={s} title={s.replace('_', ' ')} variant="outline" onPress={() => dispatch(updateTask({ id: item.id, status: s }))} style={{ flex: 1, paddingHorizontal: 4 }} />
                ))}
              </View>
            )}
            {isAdmin && (
              <Button
                title="Delete"
                variant="outline"
                onPress={() => confirmBulkDelete(1, () => dispatch(deleteTask(item.id)), 'task')}
                style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
              />
            )}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  form: { padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  card: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  status: { marginTop: 4, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  statusRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  extraBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  extraText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});

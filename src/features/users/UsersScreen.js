import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, deleteUser, bulkDeleteUsers } from './userSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import { confirmBulkDelete } from '../../utils/bulkActions';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { colors, spacing } from '../../theme';

export default function UsersScreen() {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const { items, loading } = useSelector((s) => s.users);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const selectable = items.filter((u) => u.id !== currentUser?.id);
  const selection = useMultiSelect(selectable);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const load = useCallback(() => dispatch(fetchUsers()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      Alert.alert('Missing fields', 'Name, email and a password of at least 6 characters are required');
      return;
    }
    try {
      await dispatch(addUser(form)).unwrap();
      setForm({ name: '', email: '', password: '', role: 'developer' });
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleDeleteOne = (id) => {
    if (id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }
    Alert.alert('Delete user?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteUser(id)).unwrap();
          } catch (err) {
            Alert.alert('Error', String(err));
          }
        },
      },
    ]);
  };

  const handleBulkDelete = () => {
    const ids = selection.selectedIds.filter((id) => id !== currentUser?.id);
    if (!ids.length) return;
    confirmBulkDelete(ids.length, async () => {
      try {
        await dispatch(bulkDeleteUsers(ids)).unwrap();
        selection.clear();
      } catch (err) {
        Alert.alert('Error', String(err));
      }
    }, 'user');
  };

  if (loading && !items.length) return <LoadingView message="Loading users…" />;

  return (
    <Screen title="Users" subtitle="Manage team" action={<Button title={showForm ? 'Cancel' : '+ Add'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Name" />
          <Input value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <PasswordInput value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} placeholder="Password" />
          <Select value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={[{ value: 'admin', label: 'Admin' }, { value: 'developer', label: 'Developer' }, { value: 'farmer', label: 'Farmer' }]} placeholder="Role" />
          <Button title="Create User" onPress={submit} />
        </View>
      )}
      <BulkActionBar
        selectedCount={selection.selectedCount}
        totalCount={selectable.length}
        allSelected={selection.allSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
      />
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={[styles.card, selection.isSelected(item.id) && styles.selected]}>
            <View style={styles.row}>
              {item.id !== currentUser?.id ? (
                <SelectCheckbox
                  checked={selection.isSelected(item.id)}
                  onPress={() => selection.toggle(item.id)}
                  label={`Select ${item.name}`}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}{item.id === currentUser?.id ? ' (you)' : ''}</Text>
                <Text style={styles.sub}>{item.email} · {item.role}</Text>
              </View>
            </View>
            {item.id !== currentUser?.id && (
              <Button title="Delete" variant="outline" onPress={() => handleDeleteOne(item.id)} style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }} />
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
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
});

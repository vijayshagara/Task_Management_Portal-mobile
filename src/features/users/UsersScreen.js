import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, deleteUser } from './userSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function UsersScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.users);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const load = useCallback(() => dispatch(fetchUsers()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    try {
      await dispatch(addUser(form)).unwrap();
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !items.length) return <LoadingView message="Loading users…" />;

  return (
    <Screen title="Users" subtitle="Manage team" action={<Button title={showForm ? 'Cancel' : '+ Add'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}>
      {showForm && (
        <View style={styles.form}>
          <Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Name" />
          <Input value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <Input value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} placeholder="Password" secureTextEntry />
          <Input value={form.role} onChangeText={(v) => setForm({ ...form, role: v })} placeholder="Role (admin/developer/farmer)" />
          <Button title="Create User" onPress={submit} />
        </View>
      )}
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.sub}>{item.email} · {item.role}</Text>
            <Button title="Delete" variant="outline" onPress={() => dispatch(deleteUser(item.id))} style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }} />
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
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
});

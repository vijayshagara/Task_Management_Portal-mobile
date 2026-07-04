import { useEffect } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCows } from './cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function CowListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.cows);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCows());
  }, [dispatch]);

  if (loading && !items.length) return <LoadingView message="Loading cows…" />;

  return (
    <Screen
      title="Cows"
      subtitle={`${items.length} in herd`}
      action={user?.role === 'admin' ? <Button title="+ Add" onPress={() => navigation.navigate('CowForm')} style={{ paddingHorizontal: 12 }} /> : null}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState title="No cows yet" message="Add your first cow to get started" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CowDetail', { id: item.id })}>
            <View style={styles.avatar}><Text style={styles.avatarText}>🐄</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.breed} · {item.gender} · {item.age} yrs</Text>
            </View>
            <Text style={styles.status}>{item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20 },
  name: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  status: { fontSize: 12, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
});

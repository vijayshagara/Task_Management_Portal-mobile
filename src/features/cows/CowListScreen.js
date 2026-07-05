import { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCows } from './cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import CowImage from '../../components/CowImage';
import useRefresh from '../../hooks/useRefresh';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { formatDate } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

export default function CowListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.cows);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(() => dispatch(fetchCows()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading && !items.length) return <LoadingView message="Loading cows…" />;

  return (
    <Screen
      title="Cows"
      subtitle={`${items.length} in herd`}
      action={(user?.role === 'admin' || user?.role === 'farmer') ? <Button title="+ Add" onPress={() => navigation.navigate('CowForm')} style={{ paddingHorizontal: 12 }} /> : null}
    >
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<EmptyState title="No cows yet" message="Add your first cow to get started" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CowDetail', { id: item.id })}>
            <CowImage cow={item} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.breed} · {item.gender}{item.birthDate ? ` · ${formatDate(item.birthDate)}` : ''}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontWeight: '600', fontSize: 16, color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});

import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from './notificationsSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableFlatList from '../../components/RefreshableFlatList';
import useRefresh from '../../hooks/useRefresh';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const load = useCallback(
    () => dispatch(fetchNotifications()).unwrap(),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading && !items.length) return <LoadingView message="Loading notifications…" />;

  return (
    <Screen title="Notifications" subtitle="Likes, comments, follows & more">
      {items.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
          <Button title="Mark all read" onPress={() => dispatch(markAllRead())} />
        </View>
      )}
      <RefreshableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<EmptyState title="No notifications" message="Activity from farmers will show here" />}
        renderItem={({ item }) => {
          const unread = !(item.readAt || item.isRead);
          return (
            <View style={[styles.item, unread && styles.unread]}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  unread: { backgroundColor: colors.primaryLight },
  message: { fontSize: 15, color: colors.text },
  time: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});

import { useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from './notificationsSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import { colors, spacing } from '../../theme';

export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(markAllRead());
  }, [dispatch]);

  if (loading && !items.length) return <LoadingView message="Loading notifications…" />;

  return (
    <Screen title="Notifications" subtitle="Likes, comments, follows & more">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState title="No notifications" message="Activity from farmers will show here" />}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.readAt && styles.unread]}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  unread: { backgroundColor: colors.primaryLight },
  message: { fontSize: 14, color: colors.text },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});

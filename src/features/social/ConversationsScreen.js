import { useEffect } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from './messagesSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function ConversationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector((s) => s.messages);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => dispatch(fetchConversations()));
    dispatch(fetchConversations());
    return unsub;
  }, [dispatch, navigation]);

  if (loading && !conversations.length) return <LoadingView message="Loading messages…" />;

  return (
    <Screen title="Messages" subtitle="Chat with farmers and buyers">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <EmptyState
              title="No conversations yet"
              message="Visit a farmer's profile and tap Message, or chat with a seller from Marketplace"
            />
            <Button title="Find Farmers" onPress={() => navigation.getParent()?.navigate('ExploreTab')} style={{ marginTop: spacing.md }} />
            <Button title="Browse Marketplace" variant="outline" onPress={() => navigation.getParent()?.navigate('MarketTab')} style={{ marginTop: spacing.sm }} />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
          >
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.otherUser?.name?.charAt(0)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.otherUser?.name}</Text>
              <Text style={styles.preview} numberOfLines={1}>{item.lastMessage?.content || 'Say hello!'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  name: { fontWeight: '600', color: colors.text },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});

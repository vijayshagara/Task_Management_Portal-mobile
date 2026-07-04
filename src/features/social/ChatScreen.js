import { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMessages, sendMessage } from './messagesSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { SafeScreen } from '../../components/Screen';
import { colors, spacing } from '../../theme';

export default function ChatScreen({ route }) {
  const { conversationId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { activeMessages, conversations } = useSelector((s) => s.messages);
  const currentUserId = useSelector((s) => s.auth.user?.id);
  const [text, setText] = useState('');
  const activeConv = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    dispatch(fetchMessages(conversationId));
  }, [dispatch, conversationId]);

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch(sendMessage({ conversationId, content: text.trim() }));
    setText('');
  };

  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{activeConv?.otherUser?.name || 'Chat'}</Text>
          {activeConv?.otherUser?.profile?.username && (
            <Text style={styles.headerSub}>@{activeConv.otherUser.profile.username}</Text>
          )}
        </View>

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.messages}
          data={activeMessages}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet. Send the first one!</Text>}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.senderId === currentUserId && styles.mine]}>
              <Text style={[styles.bubbleText, item.senderId === currentUserId && styles.mineText]}>{item.content}</Text>
              <Text style={[styles.time, item.senderId === currentUserId && styles.mineTime]}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          )}
        />

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <Input value={text} onChangeText={setText} placeholder="Type a message…" style={{ flex: 1, marginBottom: 0 }} />
          <Button title="Send" onPress={handleSend} style={{ minWidth: 70 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textMuted },
  messages: { padding: spacing.md, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  bubble: { alignSelf: 'flex-start', backgroundColor: colors.card, padding: spacing.sm, borderRadius: 14, marginBottom: spacing.sm, maxWidth: '80%' },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleText: { color: colors.text, fontSize: 15 },
  mineText: { color: colors.white },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  mineTime: { color: 'rgba(255,255,255,0.8)' },
  inputRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingTop: spacing.sm, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
});

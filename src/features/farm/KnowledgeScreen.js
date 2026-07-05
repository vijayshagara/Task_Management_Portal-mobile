import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchKnowledge } from './farmSlice';
import { colors, spacing } from '../../theme';

export default function KnowledgeScreen() {
  const dispatch = useDispatch();
  const { knowledge, loading } = useSelector((s) => s.farm);

  useEffect(() => { dispatch(fetchKnowledge({})); }, [dispatch]);

  const load = useCallback(() => dispatch(fetchKnowledge({})).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading && !knowledge.length) return <LoadingView message="Loading articles…" />;

  return (
    <Screen title="Knowledge Base" subtitle="Farmer guides and tips">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {knowledge.map((a) => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.title}>{a.title} {a.isVerified ? '✓' : ''}</Text>
            <Text style={styles.cat}>{a.category}</Text>
            <Text>{a.content}</Text>
            <Text style={styles.votes}>👍 {a.upvotes}</Text>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '700', fontSize: 16 },
  cat: { color: colors.primary, fontSize: 12, marginVertical: 4 },
  votes: { marginTop: 8, color: colors.textMuted },
});

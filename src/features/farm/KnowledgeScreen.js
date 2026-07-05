import { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import { fetchKnowledge } from './farmSlice';
import { colors, spacing } from '../../theme';

export default function KnowledgeScreen() {
  const dispatch = useDispatch();
  const { knowledge } = useSelector((s) => s.farm);

  useEffect(() => { dispatch(fetchKnowledge({})); }, [dispatch]);

  return (
    <Screen title="Knowledge Base" subtitle="Farmer guides and tips">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {knowledge.map((a) => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.title}>{a.title} {a.isVerified ? '✓' : ''}</Text>
            <Text style={styles.cat}>{a.category}</Text>
            <Text>{a.content}</Text>
            <Text style={styles.votes}>👍 {a.upvotes}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '700', fontSize: 16 },
  cat: { color: colors.primary, fontSize: 12, marginVertical: 4 },
  votes: { marginTop: 8, color: colors.textMuted },
});

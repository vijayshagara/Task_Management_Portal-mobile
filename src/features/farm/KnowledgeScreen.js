import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchKnowledge, createKnowledge, upvoteKnowledge } from './farmSlice';
import { titleCase } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

const CATEGORIES = ['general', 'health', 'breeding', 'feeding', 'disease'];
const emptyForm = { title: '', content: '', category: 'general', tags: '' };

export default function KnowledgeScreen() {
  const dispatch = useDispatch();
  const { knowledge, loading } = useSelector((s) => s.farm);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const params = { category: category || undefined, search: search || undefined };

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchKnowledge(params)), search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, category, search]);

  const load = useCallback(() => dispatch(fetchKnowledge(params)).unwrap(), [dispatch, category, search]); // eslint-disable-line react-hooks/exhaustive-deps
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Missing fields', 'Title and content are required');
      return;
    }
    try {
      await dispatch(createKnowledge({
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      })).unwrap();
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  if (loading && !knowledge.length && !search && !category) return <LoadingView message="Loading articles…" />;

  return (
    <Screen
      title="Knowledge Base"
      subtitle="Farmer guides and tips"
      action={<Button title={showForm ? 'Cancel' : 'Write'} onPress={() => setShowForm(!showForm)} style={{ paddingHorizontal: 12 }} />}
    >
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
      >
        {showForm && (
          <View style={styles.form}>
            <Input value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Title *" />
            <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c, label: titleCase(c) }))} />
            <Input value={form.content} onChangeText={(v) => setForm({ ...form, content: v })} placeholder="Content *" multiline style={{ minHeight: 100, textAlignVertical: 'top' }} />
            <Input value={form.tags} onChangeText={(v) => setForm({ ...form, tags: v })} placeholder="Tags (comma separated)" />
            <Button title="Publish" onPress={submit} />
          </View>
        )}
        <Input value={search} onChangeText={setSearch} placeholder="Search…" />
        <Select
          value={category}
          onChange={setCategory}
          options={[{ value: '', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: titleCase(c) }))]}
          placeholder="All categories"
        />
        {knowledge.length === 0 && <Text style={styles.empty}>No articles found.</Text>}
        {knowledge.map((a) => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.title}>{a.title} {a.isVerified ? '✓' : ''}</Text>
            <Text style={styles.cat}>{a.category}</Text>
            <Text style={styles.body}>{a.content}</Text>
            <TouchableOpacity style={styles.vote} onPress={() => dispatch(upvoteKnowledge(a.id))}>
              <Text style={styles.voteText}>👍 {a.upvotes}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '700', fontSize: 16, color: colors.text },
  cat: { color: colors.primary, fontSize: 12, marginVertical: 4, textTransform: 'capitalize' },
  body: { color: colors.text },
  vote: { alignSelf: 'flex-start', marginTop: spacing.sm, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  voteText: { color: colors.primary, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textMuted, marginVertical: spacing.lg },
});

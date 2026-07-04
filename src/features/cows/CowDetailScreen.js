import { useEffect } from 'react';
import { ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCowById, deleteCow } from './cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function CowDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const dispatch = useDispatch();
  const cow = useSelector((s) => s.cows.selected);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCowById(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    Alert.alert('Delete cow', `Remove ${cow?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await dispatch(deleteCow(id));
        navigation.goBack();
      }},
    ]);
  };

  if (!cow) return <LoadingView message="Loading cow…" />;

  return (
    <Screen title={cow.name} subtitle={cow.breed}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {[['Breed', cow.breed], ['Gender', cow.gender], ['Age', `${cow.age} years`], ['Weight', `${cow.weight} kg`], ['Status', cow.status], ['Tag ID', cow.tagId]].map(([k, v]) => (
          <View key={k} style={styles.row}><Text style={styles.label}>{k}</Text><Text style={styles.value}>{v || '—'}</Text></View>
        ))}
        {user?.role === 'admin' && (
          <>
            <Button title="Edit Cow" onPress={() => navigation.navigate('CowForm', { id: cow.id })} style={{ marginTop: spacing.lg }} />
            <Button title="Delete Cow" variant="outline" onPress={handleDelete} style={{ marginTop: spacing.sm, borderColor: colors.danger }} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontWeight: '600' },
  value: { color: colors.text, fontWeight: '500' },
});

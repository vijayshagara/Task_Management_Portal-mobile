import { useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCowById, deleteCow } from './cowSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import Button from '../../components/Button';
import CowImage from '../../components/CowImage';
import { colors, spacing } from '../../theme';

export default function CowDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const dispatch = useDispatch();
  const cow = useSelector((s) => s.cows.selected);
  const detailLoading = useSelector((s) => s.cows.detailLoading);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCowById(id));
  }, [dispatch, id]);

  const load = useCallback(() => dispatch(fetchCowById(id)).unwrap(), [dispatch, id]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleDelete = () => {
    Alert.alert('Delete cow', `Remove ${cow?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await dispatch(deleteCow(id));
        navigation.goBack();
      }},
    ]);
  };

  if (detailLoading || !cow || cow.id !== id) return <LoadingView message="Loading cow…" />;

  return (
    <Screen title={cow.name} subtitle={cow.breed}>
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <CowImage cow={cow} large style={{ marginBottom: spacing.md }} />
        {[['Breed', cow.breed], ['Gender', cow.gender], ['Birth date', cow.birthDate], ['Father', cow.fatherName], ['Mother', cow.motherName]].map(([k, v]) => (
          <View key={k} style={styles.row}><Text style={styles.label}>{k}</Text><Text style={styles.value}>{v || '—'}</Text></View>
        ))}
        {(user?.role === 'admin' || user?.role === 'farmer') && (
          <>
            <Button title="Edit Cow" onPress={() => navigation.navigate('CowForm', { id: cow.id })} style={{ marginTop: spacing.lg }} />
            <Button title="Delete Cow" variant="outline" onPress={handleDelete} style={{ marginTop: spacing.sm, borderColor: colors.danger }} />
          </>
        )}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontWeight: '600' },
  value: { color: colors.text, fontWeight: '500' },
});

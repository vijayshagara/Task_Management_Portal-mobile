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
import { formatDate, titleCase } from '../../utils/helpers';
import { colors, spacing } from '../../theme';

export default function CowDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const dispatch = useDispatch();
  const cow = useSelector((s) => s.cows.selected);
  const detailLoading = useSelector((s) => s.cows.detailLoading);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (!id) {
      navigation.goBack();
      return;
    }
    dispatch(fetchCowById(id));
  }, [dispatch, id, navigation]);

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    return dispatch(fetchCowById(id)).unwrap();
  }, [dispatch, id]);
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
        {[['Breed', cow.breed], ['Gender', titleCase(cow.gender)], ['Birth date', cow.birthDate ? formatDate(cow.birthDate) : null], ['Father', cow.fatherName], ['Mother', cow.motherName]].map(([k, v]) => (
          <View key={k} style={styles.row}><Text style={styles.label}>{k}</Text><Text style={styles.value}>{v || '—'}</Text></View>
        ))}
        <View style={styles.links}>
          <Button title="Health records" variant="outline" onPress={() => navigation.navigate('Health', { cow: cow.id })} style={{ flex: 1 }} />
          <Button title="Heat cycles" variant="outline" onPress={() => navigation.navigate('HeatCycles', { cow: cow.id })} style={{ flex: 1 }} />
        </View>
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
  links: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontWeight: '600' },
  value: { color: colors.text, fontWeight: '500' },
});

import { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCows } from '../cows/cowSlice';
import { fetchHealth } from '../health/healthSlice';
import { fetchHeatCycles } from '../heatCycles/heatCycleSlice';
import { fetchTasks, fetchDeveloperTasks } from '../tasks/taskSlice';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import { colors, spacing } from '../../theme';

function StatCard({ label, value, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const cows = useSelector((s) => s.cows.items);
  const health = useSelector((s) => s.health.items);
  const heatCycles = useSelector((s) => s.heatCycles.items);
  const tasks = useSelector((s) => s.tasks.items);
  const loading = useSelector((s) => s.cows.loading);

  useEffect(() => {
    dispatch(fetchCows());
    dispatch(fetchHealth());
    dispatch(fetchHeatCycles());
    user?.role === 'admin' ? dispatch(fetchTasks()) : dispatch(fetchDeveloperTasks());
  }, [dispatch, user?.role]);

  if (loading && !cows.length) return <LoadingView message="Loading dashboard…" />;

  const pendingHeat = heatCycles.filter((c) => c.status === 'pending').length;
  const activeTasks = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <Screen title={`Hello, ${user?.name?.split(' ')[0] || 'Farmer'}`} subtitle="Farm overview">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.grid}>
          <StatCard label="Total Cows" value={cows.length} color={colors.primary} onPress={() => navigation.navigate('Cows')} />
          <StatCard label="Health Records" value={health.length} color="#1565C0" onPress={() => navigation.navigate('Health')} />
          <StatCard label="Heat Alerts" value={pendingHeat} color="#E65100" onPress={() => navigation.navigate('HeatCycles')} />
          <StatCard label="Active Tasks" value={activeTasks} color="#6D4C41" onPress={() => navigation.navigate('Tasks')} />
        </View>
        <Text style={styles.section}>Recent Health</Text>
        {health.slice(0, 5).map((h) => (
          <View key={h.id} style={styles.row}>
            <Text style={styles.rowTitle}>{h.cow?.name || 'Cow'}</Text>
            <Text style={styles.rowSub}>{h.temperature}°C · {h.status}</Text>
          </View>
        ))}
        {!health.length && <Text style={styles.empty}>No health records yet</Text>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', backgroundColor: colors.card, padding: spacing.md, borderRadius: 12, borderLeftWidth: 4 },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  row: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  rowTitle: { fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
});

import { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchHealthInsights } from '../farm/farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { fetchHealth } from '../health/healthSlice';
import { fetchHeatCycles } from '../heatCycles/heatCycleSlice';
import { formatDateTime, titleCase } from '../../utils/helpers';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
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
  const { analytics, healthInsights, loading } = useSelector((s) => s.farm);
  const health = useSelector((s) => s.health.items);
  const heatCycles = useSelector((s) => s.heatCycles.items);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchHealthInsights());
    dispatch(fetchCows());
    dispatch(fetchHealth());
    dispatch(fetchHeatCycles());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([
      dispatch(fetchAnalytics()).unwrap(),
      dispatch(fetchHealthInsights()).unwrap(),
      dispatch(fetchCows()).unwrap(),
      dispatch(fetchHealth()).unwrap(),
      dispatch(fetchHeatCycles()).unwrap(),
    ]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading && !analytics) return <LoadingView message="Loading dashboard…" />;

  const atRisk = healthInsights.filter((h) => h.score < 70);
  const trend = (analytics?.milkTrend || []).slice(-14);
  const maxLiters = Math.max(...trend.map((t) => t.liters), 1);
  const recentHealth = health.slice(0, 5);
  const recentHeat = heatCycles.slice(0, 5);

  return (
    <Screen title={`Hello, ${user?.name?.split(' ')[0] || 'Farmer'}`} subtitle="Smart farm overview">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View style={styles.grid}>
          <StatCard label="Cows" value={analytics?.cowCount ?? 0} color={colors.primary} onPress={() => navigation.navigate('Cows')} />
          <StatCard label="Milk (L)" value={(analytics?.milkTotal ?? 0).toFixed(0)} color="#0277BD" onPress={() => navigation.navigate('Milk')} />
          <StatCard label="Vaccines Due" value={analytics?.upcomingVaccinations ?? 0} color="#6A1B9A" onPress={() => navigation.navigate('Vaccinations')} />
          <StatCard label="Pregnancies" value={analytics?.activePregnancies ?? 0} color="#AD1457" onPress={() => navigation.navigate('Pregnancies')} />
          <StatCard label="Heat Alerts" value={analytics?.heatPending ?? 0} color="#E65100" onPress={() => navigation.navigate('HeatCycles')} />
          <StatCard label="Health Records" value={analytics?.healthCount ?? 0} color="#1565C0" onPress={() => navigation.navigate('Health')} />
        </View>

        {atRisk.length > 0 && (
          <View style={styles.alert}>
            <Text style={styles.alertTitle}>⚠ Health Alerts</Text>
            {atRisk.map((h) => (
              <Text key={h.cowId} style={styles.alertItem}>{h.cowName}: score {h.score}/100</Text>
            ))}
          </View>
        )}

        {trend.length > 0 && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Milk trend (14 days)</Text>
            <View style={styles.bars}>
              {trend.map((t) => (
                <View key={t.date} style={styles.barWrap}>
                  <View style={[styles.bar, { height: Math.max((t.liters / maxLiters) * 50, 2) }]} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Recent Health</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Health')}><Text style={styles.link}>View all</Text></TouchableOpacity>
          </View>
          {recentHealth.length === 0 ? <Text style={styles.empty}>No health records yet.</Text> : recentHealth.map((r) => (
            <View key={r.id} style={styles.item}>
              <Text style={styles.itemTitle}>{r.cow?.name || '—'} · {r.temperature != null ? `${r.temperature}°C` : '—'}</Text>
              <Text style={styles.itemSub}>{r.issue || 'No issue'} · {formatDateTime(r.recordedAt)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Heat Cycles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HeatCycles')}><Text style={styles.link}>View all</Text></TouchableOpacity>
          </View>
          {recentHeat.length === 0 ? <Text style={styles.empty}>No heat cycles yet.</Text> : recentHeat.map((c) => (
            <View key={c.id} style={styles.item}>
              <Text style={styles.itemTitle}>{c.cow?.name || 'Unknown'} · {titleCase(c.status)}</Text>
              <Text style={styles.itemSub}>{formatDateTime(c.heatStartDate)}</Text>
            </View>
          ))}
        </View>
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', backgroundColor: colors.card, padding: spacing.md, borderRadius: 12, borderLeftWidth: 4 },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  alert: { backgroundColor: '#FFF3E0', padding: spacing.md, borderRadius: 10, marginTop: spacing.lg },
  alertTitle: { fontWeight: '700', marginBottom: spacing.sm },
  panel: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginTop: spacing.md },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: '600' },
  empty: { color: colors.textMuted },
  item: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  itemTitle: { color: colors.text, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 60 },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  bar: { backgroundColor: colors.primary, borderRadius: 3 },
  alertItem: { fontSize: 13, color: colors.text },
});

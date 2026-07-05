import { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, fetchHealthInsights } from '../farm/farmSlice';
import { fetchCows } from '../cows/cowSlice';
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
  const { analytics, healthInsights, loading } = useSelector((s) => s.farm);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchHealthInsights());
    dispatch(fetchCows());
  }, [dispatch]);

  if (loading && !analytics) return <LoadingView message="Loading dashboard…" />;

  const atRisk = healthInsights.filter((h) => h.score < 70);

  return (
    <Screen title={`Hello, ${user?.name?.split(' ')[0] || 'Farmer'}`} subtitle="Smart farm overview">
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.grid}>
          <StatCard label="Cows" value={analytics?.cowCount ?? 0} color={colors.primary} onPress={() => navigation.navigate('Cows')} />
          <StatCard label="Milk (L)" value={(analytics?.milkTotal ?? 0).toFixed(0)} color="#0277BD" onPress={() => navigation.navigate('Milk')} />
          <StatCard label="Vaccines Due" value={analytics?.upcomingVaccinations ?? 0} color="#6A1B9A" onPress={() => navigation.navigate('Vaccinations')} />
          <StatCard label="Pregnancies" value={analytics?.activePregnancies ?? 0} color="#AD1457" onPress={() => navigation.navigate('Pregnancies')} />
        </View>

        {atRisk.length > 0 && (
          <View style={styles.alert}>
            <Text style={styles.alertTitle}>⚠ Health Alerts</Text>
            {atRisk.map((h) => (
              <Text key={h.cowId} style={styles.alertItem}>{h.cowName}: score {h.score}/100</Text>
            ))}
          </View>
        )}
      </ScrollView>
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
  alertItem: { fontSize: 13, color: colors.text },
});

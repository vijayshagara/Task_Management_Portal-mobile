import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import { colors, spacing } from '../../theme';

function MenuItem({ icon, label, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function FarmMenuScreen({ navigation }) {
  const user = useSelector((s) => s.auth.user);
  const unread = useSelector((s) => s.notifications.unreadCount);
  const canManage = user?.role === 'admin' || user?.role === 'farmer';

  return (
    <Screen title="Farm & More" subtitle={`Logged in as ${user?.name}`}>
      <ScrollView>
        <Text style={styles.section}>Community</Text>
        <MenuItem icon="notifications-outline" label="Notifications" badge={unread || null} onPress={() => navigation.navigate('Notifications')} />
        <MenuItem icon="person-outline" label="My Profile" onPress={() => navigation.navigate('Profile')} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />

        <Text style={styles.section}>Farm Management</Text>
        <MenuItem icon="grid-outline" label="Dashboard" onPress={() => navigation.navigate('Dashboard')} />
        <MenuItem icon="book-outline" label="Farm Diary" onPress={() => navigation.navigate('Diary')} />
        <MenuItem icon="water-outline" label="Milk Production" onPress={() => navigation.navigate('Milk')} />
        <MenuItem icon="paw-outline" label="Cows" onPress={() => navigation.navigate('Cows')} />
        <MenuItem icon="heart-outline" label="Health Records" onPress={() => navigation.navigate('Health')} />
        <MenuItem icon="flame-outline" label="Heat Cycles" onPress={() => navigation.navigate('HeatCycles')} />
        <MenuItem icon="medkit-outline" label="Vaccinations" onPress={() => navigation.navigate('Vaccinations')} />
        <MenuItem icon="happy-outline" label="Breeding" onPress={() => navigation.navigate('Pregnancies')} />
        <MenuItem icon="bulb-outline" label="Knowledge Base" onPress={() => navigation.navigate('Knowledge')} />
        <MenuItem icon="hardware-chip-outline" label="IoT Devices" onPress={() => navigation.navigate('Devices')} />
        <MenuItem icon="clipboard-outline" label="Tasks" onPress={() => navigation.navigate('Tasks')} />
        {user?.role === 'admin' && (
          <MenuItem icon="people-outline" label="Users" onPress={() => navigation.navigate('Users')} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 13, fontWeight: '700', color: colors.textMuted, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, textTransform: 'uppercase' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontSize: 16, color: colors.text },
  badge: { backgroundColor: colors.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});

import { useEffect, useState } from 'react';
import { ScrollView, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../api/client';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { logout } from '../auth/authSlice';
import { colors, spacing } from '../../theme';

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [settings, setSettings] = useState({
    notifyLikes: true,
    notifyComments: true,
    notifyFollows: true,
    notifyMessages: true,
    notifyMarketplace: true,
  });

  useEffect(() => {
    api.get('/social/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.put('/social/settings', settings);
      Alert.alert('Saved', 'Settings updated');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save');
    }
  };

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Screen title="Settings" subtitle={user?.email}>
      <ScrollView style={{ padding: spacing.md }}>
        <Text style={styles.section}>Notifications</Text>
        {Object.keys(settings).map((key) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key.replace(/notify/, '').replace(/([A-Z])/g, ' $1')}</Text>
            <Switch value={settings[key]} onValueChange={() => toggle(key)} trackColor={{ true: colors.primary }} />
          </View>
        ))}
        <Button title="Save Settings" onPress={save} style={{ marginTop: spacing.lg }} />
        <Button title="My Profile" variant="outline" onPress={() => navigation.navigate('Profile')} style={{ marginTop: spacing.sm }} />
        <Button title="Log out" variant="outline" onPress={() => dispatch(logout())} style={{ marginTop: spacing.sm, borderColor: colors.danger }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  label: { fontSize: 14, color: colors.text, textTransform: 'capitalize' },
});

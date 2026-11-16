import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../api/client';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import { logoutAndClear } from '../auth/authSlice';
import { colors, spacing } from '../../theme';

const PRIVACY_KEYS = ['showEmail', 'showPhone'];
const NOTIFY_KEYS = ['notifyLikes', 'notifyComments', 'notifyFollows', 'notifyMessages', 'notifyMarketplace'];

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [settings, setSettings] = useState({
    showEmail: false,
    showPhone: false,
    notifyLikes: true,
    notifyComments: true,
    notifyFollows: true,
    notifyMessages: true,
    notifyMarketplace: true,
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

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

  const changePassword = async () => {
    if (!passwordForm.currentPassword || passwordForm.newPassword.length < 6) {
      Alert.alert('Invalid', 'Enter your current password and a new password (min 6 chars)');
      return;
    }
    try {
      await api.post('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      Alert.alert('Done', 'Password changed');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password');
    }
  };

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Screen title="Settings" subtitle={user?.email}>
      <ScrollView style={{ padding: spacing.md }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={styles.section}>Privacy</Text>
        {PRIVACY_KEYS.map((key) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>Show {key.replace('show', '')}</Text>
            <Switch value={!!settings[key]} onValueChange={() => toggle(key)} trackColor={{ true: colors.primary }} />
          </View>
        ))}
        <Text style={[styles.section, { marginTop: spacing.md }]}>Notifications</Text>
        {NOTIFY_KEYS.map((key) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key.replace(/notify/, '').replace(/([A-Z])/g, ' $1')}</Text>
            <Switch value={!!settings[key]} onValueChange={() => toggle(key)} trackColor={{ true: colors.primary }} />
          </View>
        ))}
        <Button title="Save Settings" onPress={save} style={{ marginTop: spacing.lg }} />
        <Text style={[styles.section, { marginTop: spacing.lg }]}>Change Password</Text>
        <PasswordInput value={passwordForm.currentPassword} onChangeText={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })} placeholder="Current password" />
        <PasswordInput value={passwordForm.newPassword} onChangeText={(v) => setPasswordForm({ ...passwordForm, newPassword: v })} placeholder="New password (min 6 chars)" />
        <Button title="Update Password" variant="outline" onPress={changePassword} />
        <Button title="My Profile" variant="outline" onPress={() => navigation.navigate('Profile')} style={{ marginTop: spacing.sm }} />
        <Button title="Log out" variant="outline" onPress={() => dispatch(logoutAndClear())} style={{ marginTop: spacing.sm, borderColor: colors.danger }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: 10, marginBottom: spacing.sm },
  label: { fontSize: 14, color: colors.text, textTransform: 'capitalize' },
});

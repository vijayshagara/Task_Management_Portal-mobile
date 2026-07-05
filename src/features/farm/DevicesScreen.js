import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import { fetchDevices, createDevice } from './farmSlice';
import { colors, spacing } from '../../theme';

export default function DevicesScreen() {
  const dispatch = useDispatch();
  const { devices, loading } = useSelector((s) => s.farm);
  const [form, setForm] = useState({ deviceName: '', cowId: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { dispatch(fetchDevices()); }, [dispatch]);

  const load = useCallback(() => dispatch(fetchDevices()).unwrap(), [dispatch]);
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    try {
      const device = await dispatch(createDevice(form)).unwrap();
      Alert.alert('API Key Created', device.apiKey);
      setForm({ deviceName: '', cowId: '' });
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  if (loading && !devices.length) return <LoadingView message="Loading devices…" />;

  return (
    <Screen title="IoT Devices" subtitle="ESP32 sensor keys">
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.deviceName} onChangeText={(v) => set('deviceName', v)} placeholder="Device name" />
        <Input value={form.cowId} onChangeText={(v) => set('cowId', v)} placeholder="Cow ID (optional)" />
        <Button title="Generate Key" onPress={submit} />
        {devices.map((d) => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.title}>{d.deviceName}</Text>
            <Text>{d.isActive ? 'Active' : 'Revoked'} — {d.cow?.name || 'No cow linked'}</Text>
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '600' },
});

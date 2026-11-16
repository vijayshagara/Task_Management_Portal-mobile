import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import BulkActionBar, { SelectCheckbox } from '../../components/BulkActionBar';
import useMultiSelect from '../../hooks/useMultiSelect';
import useRefresh from '../../hooks/useRefresh';
import { fetchDevices, createDevice, revokeDevice, bulkRevokeDevices } from './farmSlice';
import { fetchCows } from '../cows/cowSlice';
import { colors, spacing } from '../../theme';

export default function DevicesScreen() {
  const dispatch = useDispatch();
  const { devices, loading } = useSelector((s) => s.farm);
  const cows = useSelector((s) => s.cows.items);
  const [form, setForm] = useState({ deviceName: '', cowId: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const activeDevices = useMemo(() => devices.filter((d) => d.isActive), [devices]);
  const selection = useMultiSelect(activeDevices);

  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchCows());
  }, [dispatch]);

  const load = useCallback(
    () => Promise.all([dispatch(fetchDevices()).unwrap(), dispatch(fetchCows()).unwrap()]),
    [dispatch],
  );
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!form.deviceName.trim()) {
      Alert.alert('Missing name', 'Enter a device name');
      return;
    }
    try {
      const device = await dispatch(createDevice({ ...form, cowId: form.cowId || null })).unwrap();
      Alert.alert('API Key Created', device.apiKey);
      setForm({ deviceName: '', cowId: '' });
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleRevokeOne = (id) => {
    Alert.alert(
      'Revoke device?',
      'This device API key will stop working immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(revokeDevice(id)).unwrap();
              selection.clear();
            } catch (err) {
              Alert.alert('Error', String(err));
            }
          },
        },
      ],
    );
  };

  const handleBulkRevoke = () => {
    const ids = selection.selectedIds;
    if (!ids.length) return;
    Alert.alert(
      `Revoke ${ids.length} device${ids.length === 1 ? '' : 's'}?`,
      'Selected device API keys will stop working immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(bulkRevokeDevices(ids)).unwrap();
              selection.clear();
            } catch (err) {
              Alert.alert('Error', String(err));
            }
          },
        },
      ],
    );
  };

  if (loading && !devices.length) return <LoadingView message="Loading devices…" />;

  return (
    <Screen title="IoT Devices" subtitle="ESP32 sensor keys">
      <BulkActionBar
        selectedCount={selection.selectedCount}
        totalCount={activeDevices.length}
        allSelected={selection.allSelected}
        onToggleAll={selection.toggleAll}
        onClear={selection.clear}
        onDelete={handleBulkRevoke}
        deleteLabel="Revoke"
      />
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <Input value={form.deviceName} onChangeText={(v) => set('deviceName', v)} placeholder="Device name" />
        <Select value={form.cowId} onChange={(v) => set('cowId', v)} options={[{ value: '', label: 'None' }, ...cows.map((c) => ({ value: c.id, label: c.name }))]} placeholder="Link to a cow (optional)" />
        <Button title="Generate Key" onPress={submit} />
        {devices.map((d) => (
          <View key={d.id} style={[styles.card, selection.isSelected(d.id) && styles.selected]}>
            <View style={styles.row}>
              {d.isActive ? (
                <SelectCheckbox
                  checked={selection.isSelected(d.id)}
                  onPress={() => selection.toggle(d.id)}
                  label={`Select ${d.deviceName}`}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{d.deviceName}</Text>
                <Text>{d.isActive ? 'Active' : 'Revoked'} — {d.cow?.name || 'No cow linked'}</Text>
              </View>
            </View>
            {d.isActive && (
              <Button
                title="Revoke"
                variant="outline"
                onPress={() => handleRevokeOne(d.id)}
                style={{ marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: 12 }}
              />
            )}
          </View>
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontWeight: '600' },
});

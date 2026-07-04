import { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearAuthError } from './authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { SafeScreen } from '../../components/Screen';
import { colors, spacing } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    dispatch(clearAuthError());
    const result = await dispatch(register(form));
    if (register.rejected.match(result)) Alert.alert('Registration failed', result.payload);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Join the community</Text>
          <Text style={styles.subtitle}>Register as a dairy farmer</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input value={form.name} onChangeText={(v) => set('name', v)} placeholder="Full name" />
          <Input value={form.email} onChangeText={(v) => set('email', v)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <Input value={form.password} onChangeText={(v) => set('password', v)} placeholder="Password" secureTextEntry />
          <Button title={loading ? 'Creating…' : 'Register'} onPress={submit} loading={loading} />
          <Button title="Back to login" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
});

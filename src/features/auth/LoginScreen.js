import { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from './authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { SafeScreen } from '../../components/Screen';
import { colors, spacing } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const submit = async () => {
    dispatch(clearAuthError());
    const result = await dispatch(login({ email, password }));
    if (login.rejected.match(result)) Alert.alert('Login failed', result.payload);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🐄</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your dairy farmer community</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Input value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        <Button title={loading ? 'Signing in…' : 'Sign in'} onPress={submit} loading={loading} />
        <Button title="Create account" variant="outline" onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: colors.text },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
});

import { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { SafeScreen } from '../../components/Screen';
import { colors, spacing } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      if (res.data?.token) Alert.alert('Dev token', res.data.token);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Forgot password</Text>
          {sent ? (
            <>
              <Text style={styles.subtitle}>If an account exists, reset instructions were sent. Enter the token from your email to choose a new password.</Text>
              <Button title="I have a reset token" onPress={() => navigation.navigate('ResetPassword')} />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Enter your email and we'll send reset instructions.</Text>
              <Input value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
              <Button title="Send reset link" onPress={submit} loading={loading} />
            </>
          )}
          <Button title="Back to login" variant="outline" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.sm }} />
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
});

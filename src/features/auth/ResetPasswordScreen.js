import { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/helpers';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import { SafeScreen } from '../../components/Screen';
import { colors, spacing } from '../../theme';

export default function ResetPasswordScreen({ navigation, route }) {
  const [token, setToken] = useState(route?.params?.token || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token.trim() || password.length < 6) {
      Alert.alert('Invalid', 'Enter the reset token and a new password (min 6 chars)');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: token.trim(), password });
      Alert.alert('Password reset', 'Please log in with your new password.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Reset failed', getErrorMessage(err, 'Reset failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Paste the token from your reset email.</Text>
          <Input value={token} onChangeText={setToken} placeholder="Reset token" autoCapitalize="none" autoCorrect={false} />
          <PasswordInput value={password} onChangeText={setPassword} placeholder="New password (min 6 chars)" />
          <Button title="Reset password" onPress={submit} loading={loading} />
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

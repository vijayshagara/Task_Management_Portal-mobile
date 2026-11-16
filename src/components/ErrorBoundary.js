import { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, spacing } from '../theme';

/** Catches render errors so one bug never leaves a blank white screen. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hook for an error tracker (e.g. Sentry.captureException) when one is configured.
    console.error('UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.emoji}>🐄💨</Text>
        <Text style={styles.title}>Oops, something went wrong</Text>
        <Text style={styles.text}>The app ran into a problem. Tap below to try again.</Text>
        <Button title="Try again" onPress={() => this.setState({ hasError: false })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  emoji: { fontSize: 56, marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  text: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
});

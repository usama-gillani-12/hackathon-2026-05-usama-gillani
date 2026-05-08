import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[TrendPro ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.message} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View style={styles.container}>
    <LinearGradient colors={['#0B1220', '#1a1f35']} style={styles.hero}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="alert-circle-outline" size={ms(48)} color={colors.danger} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.sub}>TrendPro hit an unexpected error. Your data is safe.</Text>
    </LinearGradient>

    <View style={styles.card}>
      <Text style={styles.errorLabel}>ERROR DETAILS</Text>
      <Text style={styles.errorText} numberOfLines={4}>{message || 'Unknown error'}</Text>
    </View>

    <Button
      mode="contained"
      onPress={onRetry}
      style={styles.btn}
      contentStyle={styles.btnContent}
      buttonColor={colors.accent}
    >
      Try Again
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center',
    padding: spacing.xxxl,
    paddingTop: vs(80),
    gap: spacing.sm,
  },
  iconWrap: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    backgroundColor: 'rgba(220,38,38,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: ms(22), fontWeight: '800', color: colors.white, textAlign: 'center' },
  sub: { fontSize: ms(14), color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: ms(20) },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  errorLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(6) },
  errorText: { fontSize: ms(13), color: colors.danger, fontFamily: 'monospace', lineHeight: ms(20) },
  btn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
  },
  btnContent: { paddingVertical: vs(4) },
});

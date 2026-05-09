import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { styles } from './ErrorBoundary.styles';

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


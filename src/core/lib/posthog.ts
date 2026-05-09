import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '',
  {
    host: 'https://us.i.posthog.com',
    // Manual screen tracking via onStateChange in AppNavigator — disable auto-capture
    // to prevent hook errors when NavigationContainer isn't mounted yet.
    captureAppLifecycleEvents: false,
  },
);

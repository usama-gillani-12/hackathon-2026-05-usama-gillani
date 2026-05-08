import HapticFeedback from 'react-native-haptic-feedback';
import { Platform } from 'react-native';

const OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Light tap feedback — use on every press of a primary touchable (cards, buttons, chips). */
export function hapticLight(): void {
  if (Platform.OS === 'web') return;
  try {
    HapticFeedback.trigger('impactLight', OPTIONS);
  } catch {
    // module not linked in dev / catalyst — silently no-op.
  }
}

/** Medium tap — for confirming a state change (toggle, select). */
export function hapticMedium(): void {
  if (Platform.OS === 'web') return;
  try {
    HapticFeedback.trigger('impactMedium', OPTIONS);
  } catch {
    /* no-op */
  }
}

/** Success notification — credits unlocked, payment confirmed. */
export function hapticSuccess(): void {
  if (Platform.OS === 'web') return;
  try {
    HapticFeedback.trigger('notificationSuccess', OPTIONS);
  } catch {
    /* no-op */
  }
}

/** Warning / soft error — used for destructive confirms or paywall prompts. */
export function hapticWarning(): void {
  if (Platform.OS === 'web') return;
  try {
    HapticFeedback.trigger('notificationWarning', OPTIONS);
  } catch {
    /* no-op */
  }
}

import * as Haptics from 'expo-haptics';

/**
 * Safe haptic helpers — every call is fire-and-forget and swallows errors
 * (simulators / devices without a vibrator reject the promise).
 */

/** Light tick for taps: tabs, hearts, chips. */
export const tapHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

/** Success notification: saved, submitted, done. */
export const successHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

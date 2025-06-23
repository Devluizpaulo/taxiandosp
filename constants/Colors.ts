/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#687076',
    textSecondary: '#687076',
    background: '#f8f9fa',
    backgroundMuted: '#f0f2f5',
    card: '#fff',
    tint: tintColorLight,
    primary: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e9ecef',
    success: '#28a745',
    error: '#dc3545',
    chart: ['#0a7ea4', '#28a745', '#dc3545', '#ffc107', '#6f42c1'],
  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    textSecondary: '#9BA1A6',
    background: '#151718',
    backgroundMuted: '#212529',
    card: '#1c1e1f',
    tint: tintColorDark,
    primary: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#343a40',
    success: '#28a745',
    error: '#dc3545',
    chart: ['#fff', '#28a745', '#dc3545', '#ffc107', '#6f42c1'],
  },
};

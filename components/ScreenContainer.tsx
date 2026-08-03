import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, spacing } from '@/constants/theme';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function ScreenContainer({ children, scroll = true, style }: ScreenContainerProps) {
  if (!scroll) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});

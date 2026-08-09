import { PropsWithChildren, useMemo } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

import { spacing, type ColorTokens } from '@/constants/theme';
import { useTheme } from '@/lib/theme';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function ScreenContainer({ children, scroll = true, style }: ScreenContainerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
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

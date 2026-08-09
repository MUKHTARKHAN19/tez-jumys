import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { lightCardShadow, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useTheme } from '@/lib/theme';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card({ children, style }: CardProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ColorTokens, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      ...(isDark ? null : lightCardShadow),
    },
  });

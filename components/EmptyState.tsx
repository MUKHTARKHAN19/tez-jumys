import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useTheme } from '@/lib/theme';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
};

export function EmptyState({ icon = 'briefcase-outline', title, description }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 1.5,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: radii.lg,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '700',
      textAlign: 'center',
    },
    description: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

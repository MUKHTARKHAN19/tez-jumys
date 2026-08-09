import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useTheme } from '@/lib/theme';

type PillButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
}: PillButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isOutline ? colors.accent : colors.white}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, isOutline ? styles.labelOutline : styles.labelPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
    },
    primary: {
      backgroundColor: colors.accent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
    icon: {
      marginRight: spacing.sm,
    },
    label: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    labelPrimary: {
      color: colors.white,
    },
    labelOutline: {
      color: colors.accent,
    },
  });

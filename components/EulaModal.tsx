import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/PillButton';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

type EulaModalProps = {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export function EulaModal({ visible, onAccept, onClose }: EulaModalProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('eula.title')}</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.body}>{t('eula.body')}</Text>
          </ScrollView>
          <PillButton label={t('eula.acceptButton')} onPress={onAccept} />
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.declineText}>{t('eula.declineButton')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxHeight: '80%',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '700',
      textAlign: 'center',
    },
    scroll: {
      maxHeight: 260,
    },
    body: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    declineText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
  });

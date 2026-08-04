import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Chip } from '@/components/Chip';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { ReportTargetType } from '@/types/database';

type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
};

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const handlePress = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setSent(false);
    setLimitReached(false);
    setOpen(true);
  };

  const submitReport = async (reason: string) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('reports')
      .insert({ target_type: targetType, target_id: targetId, reason, reporter_id: user.id });
    setSubmitting(false);

    if (error) {
      setLimitReached(true);
      return;
    }

    setSent(true);
    setTimeout(() => setOpen(false), 1200);
  };

  const reasons = [
    { value: 'spam', label: t('report.reasonSpam') },
    { value: 'profanity', label: t('report.reasonProfanity') },
    { value: 'fraud', label: t('report.reasonFraud') },
    { value: 'other', label: t('report.reasonOther') },
  ];

  return (
    <>
      <Pressable style={styles.trigger} onPress={handlePress} hitSlop={8}>
        <Ionicons name="flag-outline" size={14} color={colors.textMuted} />
        <Text style={styles.triggerText}>{t('report.button')}</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            {sent ? (
              <>
                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={styles.title}>{t('report.sentMessage')}</Text>
              </>
            ) : limitReached ? (
              <>
                <Ionicons name="alert-circle" size={40} color={colors.danger} />
                <Text style={styles.title}>{t('report.limitReachedMessage')}</Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>{t('report.title')}</Text>
                <View style={styles.reasonsWrap}>
                  {reasons.map((reason) => (
                    <Chip
                      key={reason.value}
                      label={reason.label}
                      onPress={() => !submitting && submitReport(reason.value)}
                    />
                  ))}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  triggerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.lg,
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    minWidth: 260,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  reasonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

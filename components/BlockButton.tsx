import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

type BlockButtonProps = {
  userId: string;
  displayName: string;
  onBlocked?: () => void;
};

export function BlockButton({ userId, displayName, onBlocked }: BlockButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user || user.id === userId) return null;

  const handlePress = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setBusy(true);
    await supabase
      .from('user_blocks')
      .insert({ blocker_id: user.id, blocked_user_id: userId, blocked_name: displayName });
    setBusy(false);
    setConfirming(false);
    onBlocked?.();
  };

  if (confirming) {
    return (
      <View style={styles.confirmRow}>
        <Text style={styles.confirmText}>{t('block.confirmMessage')}</Text>
        <View style={styles.confirmActions}>
          <Pressable onPress={() => setConfirming(false)} disabled={busy} hitSlop={8}>
            <Text style={styles.cancelText}>{t('myAds.cancel')}</Text>
          </Pressable>
          <Pressable onPress={handleConfirm} disabled={busy} hitSlop={8}>
            {busy ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Text style={styles.confirmActionText}>{t('block.confirmAction')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable style={styles.trigger} onPress={handlePress} hitSlop={8}>
      <Ionicons name="hand-left-outline" size={14} color={colors.textMuted} />
      <Text style={styles.triggerText}>{t('block.button')}</Text>
    </Pressable>
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
  confirmRow: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  confirmText: {
    color: colors.text,
    fontSize: fontSize.xs,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  confirmActionText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

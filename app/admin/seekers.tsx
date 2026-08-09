import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { Seeker } from '@/types/database';

export default function AdminSeekersScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmBlockUserId, setConfirmBlockUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      supabase
        .from('seekers')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!cancelled) {
            setSeekers((data as Seeker[] | null) ?? []);
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const toggleHidden = async (seeker: Seeker) => {
    setBusyId(seeker.id);
    const { error } = await supabase
      .from('seekers')
      .update({ is_hidden: !seeker.is_hidden })
      .eq('id', seeker.id);
    if (!error) {
      setSeekers((current) =>
        current.map((s) => (s.id === seeker.id ? { ...s, is_hidden: !s.is_hidden } : s))
      );
    }
    setBusyId(null);
  };

  const blockUser = async (userId: string) => {
    setBusyId(userId);
    await supabase.from('blocked_users').insert({ user_id: userId, reason: 'admin panel' });
    setBusyId(null);
    setConfirmBlockUserId(null);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={seekers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="person-circle-outline" size={22} color={colors.accent} />
            <Text style={styles.name} numberOfLines={1}>
              {item.full_name}
            </Text>
            {item.is_hidden && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('admin.hiddenBadge')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.phone}>{item.contact_phone}</Text>
          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}

          {confirmBlockUserId === item.user_id ? (
            <View style={styles.confirmRow}>
              <Text style={styles.confirmText}>{t('admin.blockUserConfirmMessage')}</Text>
              <View style={styles.actionsRow}>
                <Pressable style={styles.actionButton} onPress={() => setConfirmBlockUserId(null)}>
                  <Text style={styles.actionText}>{t('myAds.cancel')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={() => blockUser(item.user_id)}
                  disabled={busyId === item.user_id}>
                  {busyId === item.user_id ? (
                    <ActivityIndicator size="small" color={colors.danger} />
                  ) : (
                    <Text style={[styles.actionText, styles.dangerText]}>
                      {t('admin.blockUserAction')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.actionButton}
                onPress={() => toggleHidden(item)}
                disabled={busyId === item.id}>
                {busyId === item.id ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <>
                    <Ionicons
                      name={item.is_hidden ? 'eye-outline' : 'eye-off-outline'}
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.actionText}>
                      {item.is_hidden ? t('admin.unhideSeekerAction') : t('admin.hideSeekerAction')}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable style={styles.actionButton} onPress={() => setConfirmBlockUserId(item.user_id)}>
                <Ionicons name="ban-outline" size={16} color={colors.danger} />
                <Text style={[styles.actionText, styles.dangerText]}>{t('admin.blockUserAction')}</Text>
              </Pressable>
            </View>
          )}
        </Card>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListEmptyComponent={<EmptyState icon="people-outline" title={t('admin.seekersEmptyTitle')} />}
    />
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    name: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    phone: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    bio: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    badge: {
      backgroundColor: `${colors.danger}26`,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    badgeText: {
      color: colors.danger,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionText: {
      color: colors.accent,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    dangerButton: {
      borderColor: colors.danger,
      minWidth: 70,
    },
    dangerText: {
      color: colors.danger,
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
  });

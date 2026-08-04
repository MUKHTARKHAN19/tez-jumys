import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { VacancyCard } from '@/components/VacancyCard';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { ModerationStatus, VacancyWithRelations } from '@/types/database';

type FilterValue = 'all' | ModerationStatus;

export default function AdminVacanciesScreen() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterValue>('pending');
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<VacancyWithRelations[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      let query = supabase
        .from('vacancies')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers(*)'
        )
        .order('created_at', { ascending: false });

      if (filter !== 'all') query = query.eq('moderation_status', filter);

      query.then(({ data }) => {
        if (!cancelled) {
          setVacancies((data as VacancyWithRelations[] | null) ?? []);
          setLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [filter])
  );

  const updateVacancy = async (id: string, updates: Record<string, unknown>) => {
    setBusyId(id);
    const { error } = await supabase.from('vacancies').update(updates).eq('id', id);
    if (!error) {
      setVacancies((current) =>
        current
          .map((v) => (v.id === id ? { ...v, ...updates } : v))
          .filter((v) => filter === 'all' || v.moderation_status === filter)
      );
    }
    setBusyId(null);
  };

  const handlePromote = async (id: string, days: number) => {
    const promotedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await updateVacancy(id, { is_promoted: true, promoted_until: promotedUntil });
    setPromotingId(null);
  };

  const handleUnpromote = async (id: string) => {
    await updateVacancy(id, { is_promoted: false, promoted_until: null });
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from('vacancies').delete().eq('id', id);
    if (!error) {
      setVacancies((current) => current.filter((v) => v.id !== id));
    }
    setBusyId(null);
    setConfirmDeleteId(null);
  };

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'pending', label: t('admin.filterPending') },
    { value: 'approved', label: t('admin.filterApproved') },
    { value: 'rejected', label: t('admin.filterRejected') },
    { value: 'all', label: t('admin.filterAll') },
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        style={{ flexGrow: 0 }}
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <Chip label={item.label} selected={filter === item.value} onPress={() => setFilter(item.value)} />
        )}
      />

      <FlatList
        data={vacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <VacancyCard
              vacancy={item}
              onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.id } })}
            />

            <View style={styles.metaRow}>
              <StatusBadge status={item.moderation_status} />
              {!item.is_active && (
                <View style={[styles.badge, styles.hiddenBadge]}>
                  <Text style={styles.badgeText}>{t('admin.inactiveBadge')}</Text>
                </View>
              )}
            </View>

            {promotingId === item.id && (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmText}>{t('admin.promoteDurationPrompt')}</Text>
                <View style={styles.actionsRow}>
                  {[3, 7, 14].map((days) => (
                    <Pressable
                      key={days}
                      style={styles.actionButton}
                      onPress={() => handlePromote(item.id, days)}
                      disabled={busyId === item.id}>
                      <Text style={styles.actionText}>
                        {t('admin.promoteDurationOption').replace('{days}', String(days))}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.actionButton} onPress={() => setPromotingId(null)}>
                    <Text style={styles.actionText}>{t('myAds.cancel')}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {confirmDeleteId === item.id ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmText}>{t('myAds.deleteConfirmMessage')}</Text>
                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setConfirmDeleteId(null)}
                    disabled={busyId === item.id}>
                    <Text style={styles.actionText}>{t('myAds.cancel')}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.deleteConfirmButton]}
                    onPress={() => handleDelete(item.id)}
                    disabled={busyId === item.id}>
                    {busyId === item.id ? (
                      <ActivityIndicator size="small" color={colors.danger} />
                    ) : (
                      <Text style={[styles.actionText, styles.deleteText]}>
                        {t('myAds.deleteConfirmButton')}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.actionsRow}>
                {item.moderation_status === 'pending' && (
                  <>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => updateVacancy(item.id, { moderation_status: 'approved', moderation_note: 'admin-approved' })}
                      disabled={busyId === item.id}>
                      <Ionicons name="checkmark-outline" size={16} color={colors.success} />
                      <Text style={[styles.actionText, { color: colors.success }]}>{t('admin.approveAction')}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => updateVacancy(item.id, { moderation_status: 'rejected', moderation_note: 'admin-rejected' })}
                      disabled={busyId === item.id}>
                      <Ionicons name="close-outline" size={16} color={colors.danger} />
                      <Text style={[styles.actionText, styles.deleteText]}>{t('admin.rejectAction')}</Text>
                    </Pressable>
                  </>
                )}

                {item.moderation_status === 'approved' && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => updateVacancy(item.id, { is_active: !item.is_active })}
                    disabled={busyId === item.id}>
                    <Ionicons
                      name={item.is_active ? 'eye-off-outline' : 'refresh-outline'}
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={styles.actionText}>
                      {item.is_active ? t('myAds.hideAction') : t('myAds.restoreAction')}
                    </Text>
                  </Pressable>
                )}

                {item.moderation_status === 'approved' &&
                  (item.is_promoted ? (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleUnpromote(item.id)}
                      disabled={busyId === item.id}>
                      <Ionicons name="star" size={16} color={colors.accent} />
                      <Text style={styles.actionText}>{t('admin.unpromoteAction')}</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => setPromotingId(item.id)}
                      disabled={busyId === item.id}>
                      <Ionicons name="star-outline" size={16} color={colors.accent} />
                      <Text style={styles.actionText}>{t('admin.promoteAction')}</Text>
                    </Pressable>
                  ))}

                <Pressable
                  style={styles.actionButton}
                  onPress={() => setConfirmDeleteId(item.id)}
                  disabled={busyId === item.id}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.actionText, styles.deleteText]}>{t('myAds.deleteAction')}</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState icon="briefcase-outline" title={t('admin.vacanciesEmptyTitle')} />
        }
      />
    </View>
  );
}

function StatusBadge({ status }: { status: ModerationStatus }) {
  const { t } = useLanguage();
  const map = {
    pending: { color: colors.warning, label: t('myAds.statusPending') },
    approved: { color: colors.success, label: t('admin.filterApproved') },
    rejected: { color: colors.danger, label: t('myAds.statusRejected') },
  } as const;
  const item = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${item.color}26`, borderColor: item.color }]}>
      <Text style={[styles.badgeText, { color: item.color }]}>{item.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  chipsRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  itemWrap: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  hiddenBadge: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
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
  deleteText: {
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
  deleteConfirmButton: {
    borderColor: colors.danger,
    minWidth: 70,
  },
});

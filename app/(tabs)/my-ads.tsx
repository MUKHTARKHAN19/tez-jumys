import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, type Href } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { VacancyCard } from '@/components/VacancyCard';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { VacancyWithRelations } from '@/types/database';

export default function MyAdsScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('myAds.authMessage')}>
      <MyAdsList />
    </AuthGate>
  );
}

function MyAdsList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<VacancyWithRelations[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setLoading(true);

      supabase
        .from('vacancies')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers!inner(*)'
        )
        .eq('employer.user_id', user.id)
        .order('created_at', { ascending: false })
        .then(async ({ data }) => {
          if (cancelled) return;
          const list = (data as VacancyWithRelations[] | null) ?? [];
          setVacancies(list);
          setLoading(false);

          const vacancyIds = list.map((v) => v.id);
          if (vacancyIds.length === 0) {
            setApplicationCounts({});
            return;
          }
          const { data: applications } = await supabase
            .from('applications')
            .select('vacancy_id')
            .in('vacancy_id', vacancyIds);
          if (cancelled) return;
          const counts: Record<string, number> = {};
          for (const row of applications ?? []) {
            counts[row.vacancy_id] = (counts[row.vacancy_id] ?? 0) + 1;
          }
          setApplicationCounts(counts);
        });

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const handleToggleActive = async (item: VacancyWithRelations) => {
    setBusyId(item.id);
    const { error } = await supabase
      .from('vacancies')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    if (!error) {
      setVacancies((current) =>
        current.map((v) => (v.id === item.id ? { ...v, is_active: !v.is_active } : v))
      );
    }
    setBusyId(null);
  };

  const handleConfirmDelete = async (item: VacancyWithRelations) => {
    setBusyId(item.id);
    const { error } = await supabase.from('vacancies').delete().eq('id', item.id);
    if (!error) {
      setVacancies((current) => current.filter((v) => v.id !== item.id));
    }
    setBusyId(null);
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={vacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.md,
          gap: spacing.md,
        }}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <View style={!(item.is_active && item.moderation_status === 'approved') && styles.inactiveCard}>
              <VacancyCard
                vacancy={item}
                onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.id } })}
              />
            </View>

            {item.moderation_status === 'pending' && (
              <View style={styles.hiddenBadge}>
                <Ionicons name="time-outline" size={14} color={colors.accent} />
                <Text style={[styles.hiddenBadgeText, { color: colors.accent }]}>
                  {t('myAds.statusPending')}
                </Text>
              </View>
            )}

            {item.moderation_status === 'rejected' && (
              <View style={styles.hiddenBadge}>
                <Ionicons name="close-circle-outline" size={14} color={colors.danger} />
                <Text style={[styles.hiddenBadgeText, { color: colors.danger }]}>
                  {t('myAds.statusRejected')}
                </Text>
              </View>
            )}

            {item.moderation_status === 'approved' && !item.is_active && (
              <View style={styles.hiddenBadge}>
                <Ionicons name="eye-off-outline" size={14} color={colors.textMuted} />
                <Text style={styles.hiddenBadgeText}>{t('myAds.hiddenBadge')}</Text>
              </View>
            )}

            <Text style={styles.statsText}>
              {t('myAds.statsLine')
                .replace('{views}', String(item.views_count))
                .replace('{calls}', String(item.calls_count))}
            </Text>

            <Pressable
              style={styles.applicationsRow}
              onPress={() =>
                router.push({
                  pathname: '/vacancy-applications/[id]',
                  params: { id: item.id },
                } as unknown as Href)
              }>
              <Ionicons name="people-outline" size={14} color={colors.accent} />
              <Text style={styles.applicationsText}>
                {t('myAds.applicationsCount').replace('{count}', String(applicationCounts[item.id] ?? 0))}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </Pressable>

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
                    onPress={() => handleConfirmDelete(item)}
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
                <Pressable
                  style={styles.actionButton}
                  onPress={() =>
                    router.push({ pathname: '/vacancy-edit/[id]', params: { id: item.id } })
                  }
                  disabled={busyId === item.id}>
                  <Ionicons name="create-outline" size={16} color={colors.accent} />
                  <Text style={styles.actionText}>{t('myAds.editAction')}</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleToggleActive(item)}
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
          <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
            <EmptyState
              icon="document-text-outline"
              title={t('myAds.emptyTitle')}
              description={t('myAds.emptyDescription')}
            />
            <PillButton label={t('myAds.postButton')} onPress={() => router.push('/(tabs)/post')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrap: {
    gap: spacing.sm,
  },
  inactiveCard: {
    opacity: 0.5,
  },
  hiddenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hiddenBadgeText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  statsText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  applicationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  applicationsText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
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

import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { Report } from '@/types/database';

type EnrichedReport = Report & { targetLabel: string; targetMissing: boolean };

export default function AdminReportsScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<EnrichedReport[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: reportRows } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const list = (reportRows as Report[] | null) ?? [];
      const vacancyIds = list.filter((r) => r.target_type === 'vacancy').map((r) => r.target_id);
      const seekerIds = list.filter((r) => r.target_type === 'seeker').map((r) => r.target_id);

      const [vacanciesRes, seekersRes] = await Promise.all([
        vacancyIds.length
          ? supabase
              .from('vacancies')
              .select('id, description, position:positions(name_kk, name_ru), employer:employers(business_name)')
              .in('id', vacancyIds)
          : Promise.resolve({ data: [] as any[] }),
        seekerIds.length
          ? supabase.from('seekers').select('id, full_name').in('id', seekerIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const vacancyMap = new Map((vacanciesRes.data ?? []).map((v: any) => [v.id, v]));
      const seekerMap = new Map((seekersRes.data ?? []).map((s: any) => [s.id, s]));

      const enriched: EnrichedReport[] = list.map((report) => {
        if (report.target_type === 'vacancy') {
          const v = vacancyMap.get(report.target_id);
          const positionName = v?.position?.name_kk ?? v?.position?.name_ru;
          return {
            ...report,
            targetLabel: v ? `${positionName ?? ''} — ${v.employer?.business_name ?? ''}` : '',
            targetMissing: !v,
          };
        }
        const s = seekerMap.get(report.target_id);
        return {
          ...report,
          targetLabel: s?.full_name ?? '',
          targetMissing: !s,
        };
      });

      if (!cancelled) {
        setReports(enriched);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(useCallback(() => load(), [load]));

  const dismissReport = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from('reports').update({ status: 'reviewed' }).eq('id', id);
    if (!error) setReports((current) => current.filter((r) => r.id !== id));
    setBusyId(null);
  };

  const removeTarget = async (report: EnrichedReport) => {
    setBusyId(report.id);
    if (report.target_type === 'vacancy') {
      await supabase.from('vacancies').delete().eq('id', report.target_id);
    } else {
      await supabase.from('seekers').update({ is_hidden: true }).eq('id', report.target_id);
    }
    await supabase.from('reports').update({ status: 'reviewed' }).eq('id', report.id);
    setReports((current) => current.filter((r) => r.id !== report.id));
    setBusyId(null);
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
      data={reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons
              name={item.target_type === 'vacancy' ? 'briefcase-outline' : 'person-outline'}
              size={18}
              color={colors.accent}
            />
            <Text style={styles.targetType}>
              {item.target_type === 'vacancy' ? t('admin.reportTypeVacancy') : t('admin.reportTypeSeeker')}
            </Text>
          </View>

          <Text style={styles.targetLabel} numberOfLines={1}>
            {item.targetMissing ? t('admin.reportTargetMissing') : item.targetLabel}
          </Text>

          {item.reason && <Text style={styles.reason}>{item.reason}</Text>}

          <View style={styles.actionsRow}>
            {item.target_type === 'vacancy' && !item.targetMissing && (
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.target_id } })}>
                <Ionicons name="eye-outline" size={16} color={colors.accent} />
                <Text style={styles.actionText}>{t('admin.reportViewAction')}</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.actionButton}
              onPress={() => dismissReport(item.id)}
              disabled={busyId === item.id}>
              <Ionicons name="checkmark-outline" size={16} color={colors.accent} />
              <Text style={styles.actionText}>{t('admin.reportDismissAction')}</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => removeTarget(item)}
              disabled={busyId === item.id}>
              {busyId === item.id ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.actionText, styles.dangerText]}>{t('admin.reportRemoveAction')}</Text>
                </>
              )}
            </Pressable>
          </View>
        </Card>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListEmptyComponent={<EmptyState icon="flag-outline" title={t('admin.reportsEmptyTitle')} />}
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
      gap: spacing.xs,
    },
    targetType: {
      color: colors.accent,
      fontSize: fontSize.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    targetLabel: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    reason: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
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
  });

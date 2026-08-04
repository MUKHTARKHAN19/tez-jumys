import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { Card } from '@/components/Card';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

type Stats = {
  vacanciesTotal: number;
  vacanciesPending: number;
  employersTotal: number;
  seekersTotal: number;
  reportsPending: number;
};

export default function AdminDashboardScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const [vacanciesTotal, vacanciesPending, employersTotal, seekersTotal, reportsPending] =
          await Promise.all([
            supabase.from('vacancies').select('*', { count: 'exact', head: true }),
            supabase
              .from('vacancies')
              .select('*', { count: 'exact', head: true })
              .eq('moderation_status', 'pending'),
            supabase.from('employers').select('*', { count: 'exact', head: true }),
            supabase.from('seekers').select('*', { count: 'exact', head: true }),
            supabase
              .from('reports')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending'),
          ]);

        if (cancelled) return;

        setStats({
          vacanciesTotal: vacanciesTotal.count ?? 0,
          vacanciesPending: vacanciesPending.count ?? 0,
          employersTotal: employersTotal.count ?? 0,
          seekersTotal: seekersTotal.count ?? 0,
          reportsPending: reportsPending.count ?? 0,
        });
      })();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    badge?: number;
    onPress: () => void;
  }[] = [
    {
      icon: 'briefcase-outline',
      label: t('admin.menuVacancies'),
      badge: stats?.vacanciesPending,
      onPress: () => router.push('/admin/vacancies'),
    },
    {
      icon: 'flag-outline',
      label: t('admin.menuReports'),
      badge: stats?.reportsPending,
      onPress: () => router.push('/admin/reports'),
    },
    {
      icon: 'business-outline',
      label: t('admin.menuEmployers'),
      onPress: () => router.push('/admin/employers'),
    },
    {
      icon: 'people-outline',
      label: t('admin.menuSeekers'),
      onPress: () => router.push('/admin/seekers'),
    },
    {
      icon: 'ban-outline',
      label: t('admin.menuBannedWords'),
      onPress: () => router.push('/admin/banned-words'),
    },
  ];

  return (
    <ScreenContainer>
      <View style={styles.statsRow}>
        <StatCard label={t('admin.statVacancies')} value={stats?.vacanciesTotal} />
        <StatCard label={t('admin.statPending')} value={stats?.vacanciesPending} highlight />
        <StatCard label={t('admin.statEmployers')} value={stats?.employersTotal} />
        <StatCard label={t('admin.statSeekers')} value={stats?.seekersTotal} />
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            style={[styles.menuRow, index !== menuItems.length - 1 && styles.menuRowBorder]}
            onPress={item.onPress}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {!!item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
    </ScreenContainer>
  );
}

function StatCard({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statValueHighlight: {
    color: colors.warning,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.background,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});

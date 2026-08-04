import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { colors, fontSize, spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { ApplicationWithRelations } from '@/types/database';

export default function VacancyApplicationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, t, localize } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    supabase
      .from('applications')
      .select(
        '*, seeker:seekers(*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*))'
      )
      .eq('vacancy_id', id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (cancelled) return;
        const list = (data as ApplicationWithRelations[] | null) ?? [];
        setApplications(list);
        setLoading(false);

        const newIds = list.filter((a) => a.status === 'new').map((a) => a.id);
        if (newIds.length > 0) {
          await supabase.from('applications').update({ status: 'viewed' }).in('id', newIds);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
      data={applications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const seeker = item.seeker;
        if (!seeker) return null;
        return (
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name="person-circle-outline" size={28} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {seeker.full_name}
                </Text>
                <Text style={styles.position} numberOfLines={1}>
                  {seeker.position ? localize(seeker.position) : t('vacancyCard.positionFallback')}
                </Text>
              </View>
              {item.status === 'new' && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{t('vacancyApplications.newBadge')}</Text>
                </View>
              )}
            </View>

            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color={colors.danger} />
              <Text style={styles.rowText} numberOfLines={1}>
                {seeker.settlement
                  ? localize(seeker.settlement)
                  : seeker.district
                    ? localize(seeker.district)
                    : seeker.region
                      ? localize(seeker.region)
                      : t('vacancyCard.locationFallback')}
              </Text>
              <Text style={styles.appliedAt}>{formatRelativeTime(item.created_at, language)}</Text>
            </View>

            {seeker.bio && (
              <Text style={styles.bio} numberOfLines={3}>
                {seeker.bio}
              </Text>
            )}

            <PillButton
              label={`${t('vacancyDetail.contactButtonPrefix')}${seeker.contact_phone}`}
              icon="call-outline"
              onPress={() => Linking.openURL(`tel:${seeker.contact_phone}`)}
            />
          </Card>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListEmptyComponent={
        <EmptyState
          icon="people-outline"
          title={t('vacancyApplications.emptyTitle')}
          description={t('vacancyApplications.emptyDescription')}
        />
      }
    />
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
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  position: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  appliedAt: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});

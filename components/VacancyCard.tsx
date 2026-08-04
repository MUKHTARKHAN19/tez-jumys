import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { getScheduleLabel } from '@/constants/schedule';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { formatSalary } from '@/lib/formatSalary';
import { useLanguage } from '@/lib/i18n';
import type { VacancyWithRelations } from '@/types/database';

type VacancyCardProps = {
  vacancy: VacancyWithRelations;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function VacancyCard({ vacancy, onPress, isFavorite, onToggleFavorite }: VacancyCardProps) {
  const { language, t, localize } = useLanguage();
  const salaryLabel = formatSalary(
    vacancy.salary_from,
    vacancy.salary_to,
    language,
    t,
    vacancy.salary_period
  );

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.position} numberOfLines={1}>
            {vacancy.position ? localize(vacancy.position) : t('vacancyCard.positionFallback')}{' '}
            {t('vacancyCard.neededSuffix')}
          </Text>
          {vacancy.schedule && (
            <View style={styles.scheduleTag}>
              <Text style={styles.scheduleText}>{getScheduleLabel(vacancy.schedule, language)}</Text>
            </View>
          )}
          {onToggleFavorite && (
            <Pressable hitSlop={8} onPress={onToggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? colors.danger : colors.textMuted}
              />
            </Pressable>
          )}
        </View>

        {vacancy.employer?.business_name && (
          <Text style={styles.businessName} numberOfLines={1}>
            {vacancy.employer.business_name}
          </Text>
        )}

        <Text style={styles.salary}>{salaryLabel}</Text>

        <View style={styles.footerRow}>
          <Ionicons name="location-outline" size={16} color={colors.danger} />
          <Text style={styles.location} numberOfLines={1}>
            {vacancy.settlement
              ? localize(vacancy.settlement)
              : vacancy.district
                ? localize(vacancy.district)
                : vacancy.region
                  ? localize(vacancy.region)
                  : t('vacancyCard.locationFallback')}
          </Text>
          <Text style={styles.postedAt}>· {formatRelativeTime(vacancy.created_at, language)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  position: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  scheduleTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  scheduleText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  businessName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  salary: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  postedAt: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});

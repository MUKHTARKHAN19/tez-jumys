import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/Card';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import type { VacancySchedule, VacancyWithRelations } from '@/types/database';

const scheduleLabels: Record<VacancySchedule, string> = {
  full_time: 'Толық жұмыс күні',
  part_time: 'Жарты ставка',
  shift: 'Кезекпен',
  flexible: 'Икемді кесте',
};

type VacancyCardProps = {
  vacancy: VacancyWithRelations;
  onPress?: () => void;
};

export function VacancyCard({ vacancy, onPress }: VacancyCardProps) {
  const salaryLabel = formatSalary(vacancy.salary_from, vacancy.salary_to);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.position} numberOfLines={1}>
            {vacancy.position?.name_kk ?? 'Лауазым'}
          </Text>
          {vacancy.schedule && (
            <View style={styles.scheduleTag}>
              <Text style={styles.scheduleText}>{scheduleLabels[vacancy.schedule]}</Text>
            </View>
          )}
        </View>

        <Text style={styles.salary}>{salaryLabel}</Text>

        <View style={styles.footerRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {vacancy.settlement?.name_kk ?? 'Орналасқан жері'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

function formatSalary(from: number | null, to: number | null) {
  if (!from && !to) return 'Жалақы келісім бойынша';
  if (from && to) return `${from.toLocaleString('ru-RU')} – ${to.toLocaleString('ru-RU')} ₸`;
  const value = from ?? to ?? 0;
  return `${value.toLocaleString('ru-RU')} ₸-ден`;
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
  salary: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
});

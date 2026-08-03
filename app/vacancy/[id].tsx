import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/Card';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import type { VacancyWithRelations } from '@/types/database';

export default function VacancyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Supabase-тен id бойынша "vacancies" жазбасы (position, settlement, employer JOIN-мен) осында алынады.
  const [vacancy] = useState<VacancyWithRelations | null>(null);

  return (
    <ScreenContainer>
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.position}>{vacancy?.position?.name_kk ?? 'Лауазым атауы'}</Text>
          <View style={styles.scheduleTag}>
            <Text style={styles.scheduleText}>
              {vacancy?.schedule ?? 'Жұмыс кестесі көрсетілмеген'}
            </Text>
          </View>
        </View>
        <Text style={styles.salary}>
          {vacancy?.salary_from || vacancy?.salary_to ? '—' : 'Жалақы келісім бойынша'}
        </Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.rowText}>
            {vacancy?.settlement?.name_kk ?? 'Орналасқан жері көрсетілмеген'}
          </Text>
        </View>
      </Card>

      <View style={styles.field}>
        <Text style={styles.label}>Сипаттама</Text>
        <Card>
          <Text style={styles.description}>
            {vacancy?.description ?? 'Бұл вакансияға сипаттама әлі қосылмаған.'}
          </Text>
        </Card>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Жұмыс беруші</Text>
        <Card style={styles.row}>
          <Ionicons name="business-outline" size={20} color={colors.accent} />
          <Text style={styles.rowText}>{vacancy?.employer?.business_name ?? 'Компания аты'}</Text>
        </Card>
      </View>

      <PillButton
        label={vacancy?.contact_phone ? `Хабарласу: ${vacancy.contact_phone}` : 'Хабарласу'}
        icon="call-outline"
        onPress={() => {}}
        disabled={!vacancy?.contact_phone}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  position: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xl,
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
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});

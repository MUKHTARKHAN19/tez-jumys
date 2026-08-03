import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { PLACEHOLDER_POSITIONS } from '@/lib/mockData';
import type { VacancySchedule } from '@/types/database';

const scheduleOptions: { value: VacancySchedule; label: string }[] = [
  { value: 'full_time', label: 'Толық жұмыс күні' },
  { value: 'part_time', label: 'Жарты ставка' },
  { value: 'shift', label: 'Кезекпен' },
  { value: 'flexible', label: 'Икемді кесте' },
];

export default function PostVacancyScreen() {
  const [positionId, setPositionId] = useState<string | null>(null);
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');
  const [schedule, setSchedule] = useState<VacancySchedule | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState('');

  return (
    <ScreenContainer>
      <Card style={styles.noticeCard}>
        <Ionicons name="briefcase-outline" size={20} color={colors.accent} />
        <Text style={styles.noticeText}>
          Жариялау алдында бизнес профиліңізді толтыруыңыз қажет болады.
        </Text>
        <PillButton
          label="Бизнес профилін толтыру"
          variant="outline"
          onPress={() => router.push('/business-profile')}
        />
      </Card>

      <View style={styles.field}>
        <Text style={styles.label}>Лауазым</Text>
        <View style={styles.chipsWrap}>
          {PLACEHOLDER_POSITIONS.map((position) => (
            <Chip
              key={position.id}
              label={position.name_kk}
              selected={positionId === position.id}
              onPress={() =>
                setPositionId((current) => (current === position.id ? null : position.id))
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Жалақы, ₸</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="бастап"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={salaryFrom}
            onChangeText={setSalaryFrom}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="дейін"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={salaryTo}
            onChangeText={setSalaryTo}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Жұмыс кестесі</Text>
        <View style={styles.chipsWrap}>
          {scheduleOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={schedule === option.value}
              onPress={() =>
                setSchedule((current) => (current === option.value ? null : option.value))
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Орналасқан жері</Text>
        <PillButton
          label={locationLabel ?? 'Ауданды / елді мекенді таңдау'}
          variant="outline"
          icon="location-outline"
          onPress={() => {
            setLocationLabel(null);
            router.push('/location-filter');
          }}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Байланыс телефоны</Text>
        <TextInput
          style={styles.input}
          placeholder="+7 (___) ___ __ __"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />
      </View>

      <PillButton label="Жариялау" onPress={() => {}} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowInput: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: fontSize.md,
  },
});

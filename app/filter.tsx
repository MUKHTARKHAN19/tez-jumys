import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';

import { Card } from '@/components/Card';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, spacing } from '@/constants/theme';

const SALARY_MIN = 0;
const SALARY_MAX = 1_000_000;
const SALARY_STEP = 10_000;

export default function FilterScreen() {
  const [salaryFrom, setSalaryFrom] = useState(SALARY_MIN);
  const [salaryTo, setSalaryTo] = useState(SALARY_MAX);

  return (
    <ScreenContainer>
      <View style={styles.field}>
        <Text style={styles.label}>Жалақы аралығы</Text>
        <Card style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderCaption}>Бастап</Text>
            <Text style={styles.sliderValue}>{salaryFrom.toLocaleString('ru-RU')} ₸</Text>
          </View>
          <Slider
            minimumValue={SALARY_MIN}
            maximumValue={SALARY_MAX}
            step={SALARY_STEP}
            value={salaryFrom}
            onValueChange={setSalaryFrom}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
          />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderCaption}>Дейін</Text>
            <Text style={styles.sliderValue}>{salaryTo.toLocaleString('ru-RU')} ₸</Text>
          </View>
          <Slider
            minimumValue={SALARY_MIN}
            maximumValue={SALARY_MAX}
            step={SALARY_STEP}
            value={salaryTo}
            onValueChange={setSalaryTo}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.accent}
          />
        </Card>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <PillButton
            label="Тазарту"
            variant="outline"
            onPress={() => {
              setSalaryFrom(SALARY_MIN);
              setSalaryTo(SALARY_MAX);
            }}
          />
        </View>
        <View style={styles.actionButton}>
          <PillButton label="Қолдану" onPress={() => router.back()} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sliderCard: {
    gap: spacing.xs,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sliderCaption: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  sliderValue: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

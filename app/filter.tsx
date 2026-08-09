import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useBrowseFilters } from '@/lib/browseFilters';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { Position } from '@/types/database';

const SALARY_MIN = 0;
const SALARY_MAX = 1_000_000;
const SALARY_STEP = 10_000;

export default function FilterScreen() {
  const { t, localize } = useLanguage();
  const { salaryFilter, setSalaryFilter, selectedPositionIds, setSelectedPositionIds } =
    useBrowseFilters();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [salaryFrom, setSalaryFrom] = useState(salaryFilter.salaryFrom ?? SALARY_MIN);
  const [salaryTo, setSalaryTo] = useState(salaryFilter.salaryTo ?? SALARY_MAX);

  const [positions, setPositions] = useState<Position[]>([]);
  const [draftPositionIds, setDraftPositionIds] = useState<string[]>(selectedPositionIds);
  const [positionSearch, setPositionSearch] = useState('');

  useEffect(() => {
    supabase
      .from('positions')
      .select('*')
      .order('name_kk')
      .then(({ data }) => setPositions(data ?? []));
  }, []);

  const filteredPositions = useMemo(() => {
    const query = positionSearch.trim().toLowerCase();
    if (!query) return positions;
    return positions.filter(
      (position) =>
        position.name_kk.toLowerCase().includes(query) ||
        position.name_ru.toLowerCase().includes(query)
    );
  }, [positions, positionSearch]);

  const togglePosition = (id: string) => {
    setDraftPositionIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.field}>
        <Text style={styles.label}>{t('filter.positionLabel')}</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('filter.positionSearchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={positionSearch}
            onChangeText={setPositionSearch}
          />
          {positionSearch.length > 0 && (
            <Pressable onPress={() => setPositionSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={styles.positionsWrap}>
          {filteredPositions.map((position) => (
            <Chip
              key={position.id}
              label={localize(position)}
              icon={(position.icon as keyof typeof Ionicons.glyphMap) ?? undefined}
              selected={draftPositionIds.includes(position.id)}
              onPress={() => togglePosition(position.id)}
            />
          ))}
          {filteredPositions.length === 0 && (
            <Text style={styles.noResults}>{t('filter.positionNoResults')}</Text>
          )}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('filter.salaryRangeLabel')}</Text>
        <Card style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderCaption}>{t('filter.from')}</Text>
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
            <Text style={styles.sliderCaption}>{t('filter.to')}</Text>
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
            label={t('filter.clear')}
            variant="outline"
            onPress={() => {
              setSalaryFrom(SALARY_MIN);
              setSalaryTo(SALARY_MAX);
              setSalaryFilter({ salaryFrom: null, salaryTo: null });
              setDraftPositionIds([]);
            }}
          />
        </View>
        <View style={styles.actionButton}>
          <PillButton
            label={t('filter.apply')}
            onPress={() => {
              setSalaryFilter({
                salaryFrom: salaryFrom > SALARY_MIN ? salaryFrom : null,
                salaryTo: salaryTo < SALARY_MAX ? salaryTo : null,
              });
              setSelectedPositionIds(draftPositionIds);
              router.back();
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    padding: 0,
  },
  positionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noResults: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
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

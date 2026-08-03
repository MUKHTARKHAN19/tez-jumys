import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { VacancyCard } from '@/components/VacancyCard';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { PLACEHOLDER_POSITIONS } from '@/lib/mockData';
import type { VacancyWithRelations } from '@/types/database';

// Supabase-тен "vacancies" кестесінен деректер алынғанда осы бос массив толтырылады.
const vacancies: VacancyWithRelations[] = [];

export default function VacanciesScreen() {
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const selectedLocationLabel = 'Барлық қалалар';

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <Pressable style={styles.locationButton} onPress={() => router.push('/location-filter')}>
          <Ionicons name="location-outline" size={18} color={colors.accent} />
          <Text style={styles.locationText} numberOfLines={1}>
            {selectedLocationLabel}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.filterButton} onPress={() => router.push('/filter')}>
          <Ionicons name="options-outline" size={20} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={PLACEHOLDER_POSITIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <Chip
            label={item.name_kk}
            selected={selectedPositionId === item.id}
            onPress={() =>
              setSelectedPositionId((current) => (current === item.id ? null : item.id))
            }
          />
        )}
      />

      <FlatList
        data={vacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VacancyCard
            vacancy={item}
            onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="Әзірге вакансиялар жоқ"
            description="Таңдалған қала мен санат бойынша хабарландырулар пайда болғанда осы жерде көрінеді."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  locationText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});

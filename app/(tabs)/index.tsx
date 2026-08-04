import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { VacancyCard } from '@/components/VacancyCard';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useBrowseFilters } from '@/lib/browseFilters';
import { useFavorites } from '@/lib/favorites';
import { useLanguage } from '@/lib/i18n';
import { useLocationSelection } from '@/lib/locationSelection';
import { supabase } from '@/lib/supabase';
import type { Position, VacancyWithRelations } from '@/types/database';

const LISTING_MAX_AGE_DAYS = 7;
type SortOption = 'newest' | 'salary_desc';

export default function VacanciesScreen() {
  const { t, localize } = useLanguage();
  const { user } = useAuth();
  const { getSelection } = useLocationSelection();
  const locationSelection = getSelection('browse');
  const { salaryFilter } = useBrowseFilters();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<VacancyWithRelations[]>([]);
  const [searchSaved, setSearchSaved] = useState(false);

  const hasActiveSearch = !!(
    selectedPositionId ||
    locationSelection.regionId ||
    locationSelection.districtId ||
    locationSelection.settlementId
  );

  useEffect(() => {
    setSearchSaved(false);
  }, [selectedPositionId, locationSelection.regionId, locationSelection.districtId, locationSelection.settlementId]);

  const handleSaveSearch = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    const { error } = await supabase.from('saved_searches').insert({
      user_id: user.id,
      position_id: selectedPositionId,
      region_id: locationSelection.regionId,
      district_id: locationSelection.districtId,
      settlement_id: locationSelection.settlementId,
    });
    if (!error) setSearchSaved(true);
  };

  useEffect(() => {
    supabase
      .from('positions')
      .select('*')
      .order('name_kk')
      .then(({ data }) => setPositions(data ?? []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      const minCreatedAt = new Date(
        Date.now() - LISTING_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      let query = supabase
        .from('vacancies')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers(*)'
        )
        .eq('is_active', true)
        .eq('moderation_status', 'approved')
        .gte('created_at', minCreatedAt)
        .order('is_promoted', { ascending: false });

      if (sortBy === 'salary_desc') {
        query = query.order('salary_to', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (selectedPositionId) query = query.eq('position_id', selectedPositionId);
      if (locationSelection.settlementId) {
        query = query.eq('settlement_id', locationSelection.settlementId);
      } else if (locationSelection.districtId) {
        query = query.eq('district_id', locationSelection.districtId);
      } else if (locationSelection.regionId) {
        query = query.eq('region_id', locationSelection.regionId);
      }

      if (salaryFilter.salaryFrom) {
        query = query.or(`salary_to.gte.${salaryFilter.salaryFrom},salary_to.is.null`);
      }
      if (salaryFilter.salaryTo) {
        query = query.or(`salary_from.lte.${salaryFilter.salaryTo},salary_from.is.null`);
      }

      query.then(({ data }) => {
        if (!cancelled) {
          setVacancies((data as VacancyWithRelations[] | null) ?? []);
          setLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [
      selectedPositionId,
      sortBy,
      locationSelection.regionId,
      locationSelection.districtId,
      locationSelection.settlementId,
      salaryFilter.salaryFrom,
      salaryFilter.salaryTo,
    ])
  );

  const visibleVacancies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return vacancies;
    return vacancies.filter((item) => {
      const haystack = [
        item.position?.name_kk,
        item.position?.name_ru,
        item.employer?.business_name,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [vacancies, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <Pressable
          style={styles.locationButton}
          onPress={() => router.push('/location-filter?target=browse')}>
          <Ionicons name="location-outline" size={18} color={colors.accent} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationSelection.label ?? t('vacancies.allCities')}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.filterButton} onPress={() => router.push('/filter')}>
          <Ionicons name="options-outline" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('vacancies.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        style={styles.chipsList}
        showsHorizontalScrollIndicator={false}
        data={positions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <Chip
            label={localize(item)}
            selected={selectedPositionId === item.id}
            onPress={() =>
              setSelectedPositionId((current) => (current === item.id ? null : item.id))
            }
          />
        )}
      />

      <View style={styles.sortRow}>
        <Chip
          label={t('vacancies.sortNewest')}
          selected={sortBy === 'newest'}
          onPress={() => setSortBy('newest')}
        />
        <Chip
          label={t('vacancies.sortSalary')}
          selected={sortBy === 'salary_desc'}
          onPress={() => setSortBy('salary_desc')}
        />
      </View>

      {hasActiveSearch && (
        <Pressable
          style={styles.saveSearchRow}
          onPress={handleSaveSearch}
          disabled={searchSaved}>
          <Ionicons
            name={searchSaved ? 'checkmark-circle' : 'notifications-outline'}
            size={16}
            color={colors.accent}
          />
          <Text style={styles.saveSearchText}>
            {searchSaved ? t('vacancies.searchSaved') : t('vacancies.saveSearch')}
          </Text>
        </Pressable>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={visibleVacancies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VacancyCard
              vacancy={item}
              onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.id } })}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title={t('vacancies.emptyTitle')}
              description={t('vacancies.emptyDescription')}
            />
          }
        />
      )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
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
  chipsList: {
    flexGrow: 0,
  },
  chipsRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  saveSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  saveSearchText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});

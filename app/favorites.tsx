import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { VacancyCard } from '@/components/VacancyCard';
import { spacing } from '@/constants/theme';
import { useFavorites } from '@/lib/favorites';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { VacancyWithRelations } from '@/types/database';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<VacancyWithRelations[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      if (favoriteIds.length === 0) {
        setVacancies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      supabase
        .from('vacancies')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers(*)'
        )
        .in('id', favoriteIds)
        .then(({ data }) => {
          if (!cancelled) {
            setVacancies((data as VacancyWithRelations[] | null) ?? []);
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favoriteIds.join(',')])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={vacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: spacing.md, gap: spacing.md }}
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
            icon="heart-outline"
            title={t('favorites.emptyTitle')}
            description={t('favorites.emptyDescription')}
          />
        }
      />
    </View>
  );
}

import { FlatList, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { VacancyCard } from '@/components/VacancyCard';
import { colors, spacing } from '@/constants/theme';
import type { VacancyWithRelations } from '@/types/database';

// Supabase-тен ағымдағы жұмыс берушінің "vacancies" жазбалары алынғанда толтырылады.
const myVacancies: VacancyWithRelations[] = [];

export default function MyAdsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={myVacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.md,
          gap: spacing.md,
        }}
        renderItem={({ item }) => (
          <VacancyCard
            vacancy={item}
            onPress={() => router.push({ pathname: '/vacancy/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
            <EmptyState
              icon="document-text-outline"
              title="Сізде жарияланған хабарландыру жоқ"
              description="Бос жұмыс орнын жариялап, ол осы жерде тізім түрінде көрінеді."
            />
            <PillButton label="Вакансия жариялау" onPress={() => router.push('/(tabs)/post')} />
          </View>
        }
      />
    </View>
  );
}

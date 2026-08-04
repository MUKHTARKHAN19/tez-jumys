import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { SavedSearchWithRelations } from '@/types/database';

export default function SavedSearchesScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('savedSearches.authMessage')}>
      <SavedSearchesList />
    </AuthGate>
  );
}

function SavedSearchesList() {
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SavedSearchWithRelations[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setLoading(true);

      supabase
        .from('saved_searches')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*)'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!cancelled) {
            setItems((data as SavedSearchWithRelations[] | null) ?? []);
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from('saved_searches').delete().eq('id', id);
    if (!error) setItems((current) => current.filter((item) => item.id !== id));
    setBusyId(null);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const locationLabel = item.settlement
          ? localize(item.settlement)
          : item.district
            ? localize(item.district)
            : item.region
              ? localize(item.region)
              : t('vacancies.allCities');
        const positionLabel = item.position ? localize(item.position) : t('savedSearches.anyPosition');

        return (
          <Card style={styles.row}>
            <Ionicons name="notifications-outline" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {positionLabel}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(item.id)} disabled={busyId === item.id} hitSlop={8}>
              {busyId === item.id ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              )}
            </Pressable>
          </Card>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListEmptyComponent={
        <EmptyState
          icon="notifications-outline"
          title={t('savedSearches.emptyTitle')}
          description={t('savedSearches.emptyDescription')}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});

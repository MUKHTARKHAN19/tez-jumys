import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { BlockButton } from '@/components/BlockButton';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { ReportButton } from '@/components/ReportButton';
import { fontSize, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { Position, SeekerWithRelations } from '@/types/database';

export default function CandidatesScreen() {
  const { t, localize } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [seekers, setSeekers] = useState<SeekerWithRelations[]>([]);

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

      let query = supabase
        .from('seekers')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*)'
        )
        .order('created_at', { ascending: false });

      if (selectedPositionId) query = query.eq('position_id', selectedPositionId);

      query.then(({ data }) => {
        if (!cancelled) setSeekers((data as SeekerWithRelations[] | null) ?? []);
      });

      return () => {
        cancelled = true;
      };
    }, [selectedPositionId])
  );

  return (
    <View style={styles.container}>
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

      <FlatList
        data={seekers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name="person-circle-outline" size={28} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.full_name}
                </Text>
                <Text style={styles.position} numberOfLines={1}>
                  {item.position ? localize(item.position) : t('vacancyCard.positionFallback')}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color={colors.danger} />
              <Text style={styles.rowText} numberOfLines={1}>
                {item.settlement
                  ? localize(item.settlement)
                  : item.district
                    ? localize(item.district)
                    : item.region
                      ? localize(item.region)
                      : t('vacancyCard.locationFallback')}
              </Text>
            </View>

            {item.bio && (
              <Text style={styles.bio} numberOfLines={3}>
                {item.bio}
              </Text>
            )}

            <PillButton
              label={`${t('vacancyDetail.contactButtonPrefix')}${item.contact_phone}`}
              icon="call-outline"
              onPress={() => Linking.openURL(`tel:${item.contact_phone}`)}
            />

            <View style={styles.footerActions}>
              <ReportButton targetType="seeker" targetId={item.id} />
              <BlockButton
                userId={item.user_id}
                displayName={item.full_name}
                onBlocked={() => setSeekers((current) => current.filter((s) => s.id !== item.id))}
              />
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={t('candidates.emptyTitle')}
            description={t('candidates.emptyDescription')}
          />
        }
      />
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chipsList: {
      flexGrow: 0,
    },
    chipsRow: {
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    name: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    position: {
      color: colors.accent,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    rowText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    bio: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    footerActions: {
      gap: spacing.sm,
    },
  });

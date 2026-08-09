import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { fontSize, spacing, type ColorTokens } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

type BlockedRow = {
  blocked_user_id: string;
  blocked_name: string | null;
  created_at: string;
};

export default function BlockedUsersScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('blockedUsers.authMessage')}>
      <BlockedUsersList />
    </AuthGate>
  );
}

function BlockedUsersList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BlockedRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setLoading(true);

      supabase
        .from('user_blocks')
        .select('blocked_user_id, blocked_name, created_at')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (!cancelled) {
            setRows((data as BlockedRow[] | null) ?? []);
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const handleUnblock = async (blockedUserId: string) => {
    if (!user) return;
    setBusyId(blockedUserId);
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_user_id', blockedUserId);
    if (!error) {
      setRows((current) => current.filter((r) => r.blocked_user_id !== blockedUserId));
    }
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
      data={rows}
      keyExtractor={(item) => item.blocked_user_id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Card style={styles.row}>
          <Ionicons name="person-circle-outline" size={22} color={colors.textMuted} />
          <Text style={styles.name} numberOfLines={1}>
            {item.blocked_name || t('blockedUsers.fallbackName')}
          </Text>
          <Pressable
            onPress={() => handleUnblock(item.blocked_user_id)}
            disabled={busyId === item.blocked_user_id}
            hitSlop={8}>
            {busyId === item.blocked_user_id ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={styles.unblockText}>{t('blockedUsers.unblockAction')}</Text>
            )}
          </Pressable>
        </Card>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListEmptyComponent={
        <EmptyState icon="hand-left-outline" title={t('blockedUsers.emptyTitle')} />
      }
    />
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
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
    name: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    unblockText: {
      color: colors.accent,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  });

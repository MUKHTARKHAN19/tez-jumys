import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export function AdminGate({ children }: PropsWithChildren) {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user || !isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg, padding: spacing.md, backgroundColor: colors.background }}>
        <EmptyState
          icon="shield-outline"
          title={t('admin.accessDeniedTitle')}
          description={t('admin.accessDeniedMessage')}
        />
        <PillButton label={t('admin.backButton')} onPress={() => router.back()} />
      </View>
    );
  }

  return <>{children}</>;
}

import { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

type AuthGateProps = PropsWithChildren<{
  message?: string;
}>;

export function AuthGate({ children, message }: AuthGateProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg, padding: spacing.md, backgroundColor: colors.background }}>
        <EmptyState
          icon="lock-closed-outline"
          title={t('authGate.title')}
          description={message ?? t('authGate.defaultMessage')}
        />
        <PillButton label={t('authGate.loginButton')} onPress={() => router.push('/auth')} />
      </View>
    );
  }

  return <>{children}</>;
}

import { Stack } from 'expo-router';

import { AdminGate } from '@/components/AdminGate';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';

export default function AdminLayout() {
  const { t } = useLanguage();

  return (
    <AdminGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundElevated },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: t('admin.dashboardTitle') }} />
        <Stack.Screen name="vacancies" options={{ title: t('admin.vacanciesTitle') }} />
        <Stack.Screen name="banned-words" options={{ title: t('admin.bannedWordsTitle') }} />
        <Stack.Screen name="employers" options={{ title: t('admin.employersTitle') }} />
        <Stack.Screen name="seekers" options={{ title: t('admin.seekersTitle') }} />
        <Stack.Screen name="reports" options={{ title: t('admin.reportsTitle') }} />
      </Stack>
    </AdminGate>
  );
}

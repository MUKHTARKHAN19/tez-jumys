import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export default function EmptyStateScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      <EmptyState
        icon="search-outline"
        title={t('emptyStateDemo.title')}
        description={t('emptyStateDemo.description')}
      />
    </View>
  );
}

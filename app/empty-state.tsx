import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';

export default function EmptyStateScreen() {
  const { t } = useLanguage();

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

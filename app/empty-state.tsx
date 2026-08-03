import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';

export default function EmptyStateScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      <EmptyState
        icon="search-outline"
        title="Нәтиже табылмады"
        description="Сүзгі параметрлерін өзгертіп көріңіз немесе іздеу аймағын кеңейтіңіз."
      />
    </View>
  );
}

import { StyleSheet, Text, View } from 'react-native';

import { LogoMark } from '@/components/LogoMark';
import { colors, fontSize } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';

export function HeaderBrand() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <LogoMark size={38} />
      <View>
        <Text style={styles.name}>Tez Jumys</Text>
        <Text style={styles.tagline}>{t('brand.tagline')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});

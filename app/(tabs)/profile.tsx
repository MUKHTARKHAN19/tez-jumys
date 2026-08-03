import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Card } from '@/components/Card';
import { LogoMark } from '@/components/LogoMark';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';

type AppLanguage = 'kk' | 'ru';

const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }[] = [
  { icon: 'business-outline', label: 'Бизнес профилі' },
  { icon: 'notifications-outline', label: 'Хабарландырулар' },
  { icon: 'help-circle-outline', label: 'Көмек орталығы' },
  { icon: 'log-out-outline', label: 'Шығу' },
];

export default function ProfileScreen() {
  const [language, setLanguage] = useState<AppLanguage>('kk');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <LogoMark size={56} />
        <View>
          <Text style={styles.name}>Қонақ пайдаланушы</Text>
          <Text style={styles.subtitle}>Профиль әлі толтырылмаған</Text>
        </View>
      </View>

      <Card style={styles.languageCard}>
        <Text style={styles.label}>Тіл</Text>
        <View style={styles.languageSwitch}>
          <Pressable
            style={[styles.languageOption, language === 'kk' && styles.languageOptionActive]}
            onPress={() => setLanguage('kk')}>
            <Text
              style={[
                styles.languageText,
                language === 'kk' && styles.languageTextActive,
              ]}>
              Қазақша
            </Text>
          </Pressable>
          <Pressable
            style={[styles.languageOption, language === 'ru' && styles.languageOptionActive]}
            onPress={() => setLanguage('ru')}>
            <Text
              style={[
                styles.languageText,
                language === 'ru' && styles.languageTextActive,
              ]}>
              Русский
            </Text>
          </Pressable>
        </View>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            style={[styles.menuRow, index !== menuItems.length - 1 && styles.menuRowBorder]}
            onPress={
              item.label === 'Бизнес профилі'
                ? () => router.push('/business-profile')
                : item.onPress
            }>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  languageCard: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.pill,
    padding: 4,
  },
  languageOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: colors.accent,
  },
  languageText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  languageTextActive: {
    color: colors.white,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});

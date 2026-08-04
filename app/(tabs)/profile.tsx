import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

import { Card } from '@/components/Card';
import { LogoMark } from '@/components/LogoMark';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage, type AppLanguage } from '@/lib/i18n';

export default function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();

  const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'heart-outline', label: t('profile.favorites'), onPress: () => router.push('/favorites') },
    ...(user
      ? [
          {
            icon: 'business-outline' as const,
            label: t('profile.businessProfile'),
            onPress: () => router.push('/business-profile'),
          },
          {
            icon: 'person-circle-outline' as const,
            label: t('profile.seekerProfile'),
            onPress: () => router.push('/seeker-profile'),
          },
          {
            icon: 'people-outline' as const,
            label: t('profile.candidates'),
            onPress: () => router.push('/candidates'),
          },
          {
            icon: 'hand-left-outline' as const,
            label: t('profile.blockedUsers'),
            onPress: () => router.push('/blocked-users'),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            icon: 'shield-checkmark-outline' as const,
            label: t('profile.adminPanel'),
            onPress: () => router.push('/admin' as Href),
          },
        ]
      : []),
    {
      icon: 'help-circle-outline',
      label: t('profile.helpCenter'),
      onPress: () => Linking.openURL('mailto:tez.jumys@mail.ru'),
    },
    ...(user
      ? [{ icon: 'log-out-outline' as const, label: t('profile.signOut'), onPress: signOut }]
      : []),
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <LogoMark size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.email ?? t('profile.guestName')}
          </Text>
          <Text style={styles.subtitle}>
            {user ? t('profile.loggedIn') : t('profile.notLoggedIn')}
          </Text>
        </View>
      </View>

      {!user && (
        <Card style={styles.noticeCard}>
          <Ionicons name="log-in-outline" size={20} color={colors.accent} />
          <Text style={styles.noticeText}>{t('profile.loginNotice')}</Text>
          <PillButton label={t('profile.loginButton')} onPress={() => router.push('/auth')} />
        </Card>
      )}

      <Card style={styles.languageCard}>
        <Text style={styles.label}>{t('profile.languageLabel')}</Text>
        <View style={styles.languageSwitch}>
          <LanguageOption
            value="kk"
            label="Қазақша"
            active={language === 'kk'}
            onPress={setLanguage}
          />
          <LanguageOption
            value="ru"
            label="Русский"
            active={language === 'ru'}
            onPress={setLanguage}
          />
        </View>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            style={[styles.menuRow, index !== menuItems.length - 1 && styles.menuRowBorder]}
            onPress={item.onPress}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Pressable
        style={styles.supportRow}
        onPress={() => Linking.openURL('mailto:tez.jumys@mail.ru')}>
        <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
        <Text style={styles.supportText}>
          {t('profile.supportEmailPrefix')}tez.jumys@mail.ru
        </Text>
      </Pressable>

      {user && (
        <Pressable style={styles.dangerRow} onPress={() => router.push('/delete-account')}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.dangerLabel}>{t('profile.deleteAccount')}</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}

function LanguageOption({
  value,
  label,
  active,
  onPress,
}: {
  value: AppLanguage;
  label: string;
  active: boolean;
  onPress: (value: AppLanguage) => void;
}) {
  return (
    <Pressable
      style={[styles.languageOption, active && styles.languageOptionActive]}
      onPress={() => onPress(value)}>
      <Text style={[styles.languageText, active && styles.languageTextActive]}>{label}</Text>
    </Pressable>
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
  noticeCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
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
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  supportText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  dangerLabel: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

import { Card } from '@/components/Card';
import { LogoMark } from '@/components/LogoMark';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage, type AppLanguage } from '@/lib/i18n';
import {
  hasPushToken,
  registerForPushNotifications,
  unregisterPushNotifications,
} from '@/lib/pushNotifications';
import { useTheme, type ThemeMode } from '@/lib/theme';

export default function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const { colors, mode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBusy, setNotificationsBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    hasPushToken(user.id).then(setNotificationsEnabled);
  }, [user]);

  const handleToggleNotifications = async (value: boolean) => {
    if (!user) return;
    setNotificationsBusy(true);
    if (value) {
      const granted = await registerForPushNotifications(user.id);
      setNotificationsEnabled(granted);
    } else {
      await unregisterPushNotifications(user.id);
      setNotificationsEnabled(false);
    }
    setNotificationsBusy(false);
  };

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
          {
            icon: 'notifications-outline' as const,
            label: t('profile.savedSearches'),
            onPress: () => router.push('/saved-searches' as Href),
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
            styles={styles}
          />
          <LanguageOption
            value="ru"
            label="Русский"
            active={language === 'ru'}
            onPress={setLanguage}
            styles={styles}
          />
        </View>
      </Card>

      <Card style={styles.languageCard}>
        <Text style={styles.label}>{t('profile.themeLabel')}</Text>
        <View style={styles.languageSwitch}>
          <ThemeOption
            value="dark"
            label={t('profile.themeDark')}
            active={mode === 'dark'}
            onPress={setThemeMode}
            styles={styles}
          />
          <ThemeOption
            value="light"
            label={t('profile.themeLight')}
            active={mode === 'light'}
            onPress={setThemeMode}
            styles={styles}
          />
        </View>
      </Card>

      {user && (
        <Card style={styles.notificationsRow}>
          <Ionicons name="notifications-outline" size={20} color={colors.accent} />
          <Text style={styles.notificationsLabel}>{t('profile.notifications')}</Text>
          {notificationsBusy ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
              thumbColor={colors.white}
            />
          )}
        </Card>
      )}

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
  styles,
}: {
  value: AppLanguage;
  label: string;
  active: boolean;
  onPress: (value: AppLanguage) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      style={[styles.languageOption, active && styles.languageOptionActive]}
      onPress={() => onPress(value)}>
      <Text style={[styles.languageText, active && styles.languageTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ThemeOption({
  value,
  label,
  active,
  onPress,
  styles,
}: {
  value: ThemeMode;
  label: string;
  active: boolean;
  onPress: (value: ThemeMode) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      style={[styles.languageOption, active && styles.languageOptionActive]}
      onPress={() => onPress(value)}>
      <Text style={[styles.languageText, active && styles.languageTextActive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
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
    notificationsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    notificationsLabel: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
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

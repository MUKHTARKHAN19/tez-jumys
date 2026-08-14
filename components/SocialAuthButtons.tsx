import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { PhonePromptModal } from '@/components/PhonePromptModal';
import { PillButton } from '@/components/PillButton';
import { fontSize, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { signInWithApple, signInWithGoogle } from '@/lib/socialAuth';
import { useTheme } from '@/lib/theme';

type SocialAuthButtonsProps = {
  onSuccess: () => void;
  onError: (message: string) => void;
};

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [phonePromptVisible, setPhonePromptVisible] = useState(false);

  const handleApple = async () => {
    if (busy) return;
    setBusy('apple');
    try {
      const result = await signInWithApple();
      if (!result) return;
      if (result.isNewUser && result.isPrivateRelayEmail) {
        setPhonePromptVisible(true);
      } else {
        onSuccess();
      }
    } catch {
      onError(t('auth.socialError'));
    } finally {
      setBusy(null);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy('google');
    try {
      const result = await signInWithGoogle();
      if (!result) return;
      onSuccess();
    } catch {
      onError(t('auth.socialError'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('auth.orDivider')}</Text>
        <View style={styles.dividerLine} />
      </View>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            isDark
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={25}
          style={styles.appleButton}
          onPress={handleApple}
        />
      )}

      <PillButton
        label={t('auth.googleSignIn')}
        icon="logo-google"
        variant="outline"
        onPress={handleGoogle}
        disabled={busy === 'google'}
      />

      <PhonePromptModal
        visible={phonePromptVisible}
        onDone={() => {
          setPhonePromptVisible(false);
          onSuccess();
        }}
      />
    </View>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginVertical: spacing.xs,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    appleButton: {
      width: '100%',
      height: 50,
    },
  });
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

// Supabase жобасының баптауына қарай қалпына келтіру сілтемесі екі түрлі болуы
// мүмкін: ескі "implicit" ағыны (#access_token=...&refresh_token=...) немесе
// жаңа PKCE ағыны (?code=...). Екеуін де қолдаймыз.
function extractRecoveryParams(url: string): URLSearchParams | null {
  const separatorIndex = Math.max(url.indexOf('#'), url.indexOf('?'));
  if (separatorIndex === -1) return null;
  return new URLSearchParams(url.slice(separatorIndex + 1));
}

export default function ResetPasswordScreen() {
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyUrl = async (url: string | null) => {
      if (!url) return;
      const params = extractRecoveryParams(url);
      if (!params) return;

      const code = params.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && !exchangeError) setReady(true);
        return;
      }

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!cancelled && !sessionError) setReady(true);
      }
    };

    Linking.getInitialURL().then((url) => {
      applyUrl(url).finally(() => {
        if (!cancelled) setChecking(false);
      });
    });

    const subscription = Linking.addEventListener('url', (event) => applyUrl(event.url));

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const handleSave = async () => {
    setError(null);

    if (!password || password.length < 6) {
      setError(t('resetPassword.errorWeak'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('resetPassword.errorMismatch'));
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  };

  if (checking) {
    return (
      <ScreenContainer>
        <Text style={styles.intro}>{t('resetPassword.checking')}</Text>
      </ScreenContainer>
    );
  }

  if (done) {
    return (
      <ScreenContainer>
        <Text style={styles.successText}>{t('resetPassword.successMessage')}</Text>
        <PillButton
          label={t('resetPassword.continueButton')}
          onPress={() => router.replace('/(tabs)')}
        />
      </ScreenContainer>
    );
  }

  if (!ready) {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>{t('resetPassword.invalidLink')}</Text>
        <PillButton
          label={t('forgotPassword.backToLogin')}
          onPress={() => router.replace('/forgot-password')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.intro}>{t('resetPassword.intro')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('resetPassword.newPasswordLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('resetPassword.confirmPasswordLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PillButton label={t('resetPassword.submitButton')} onPress={handleSave} disabled={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  successText: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});

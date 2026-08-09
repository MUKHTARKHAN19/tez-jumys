import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { checkIsBlocked } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

type Mode = 'sign_in' | 'sign_up';

export default function AuthScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError(t('auth.errorRequired'));
      return;
    }

    setLoading(true);
    const { error: authError } =
      mode === 'sign_in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === 'sign_up') {
      setInfo(t('auth.signUpSuccess'));
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (userId && (await checkIsBlocked(userId))) {
      await supabase.auth.signOut();
      setError(t('auth.blockedMessage'));
      return;
    }

    router.back();
  };

  return (
    <ScreenContainer>
      <View style={styles.switcher}>
        <Pressable
          style={[styles.switchOption, mode === 'sign_in' && styles.switchOptionActive]}
          onPress={() => setMode('sign_in')}>
          <Text style={[styles.switchLabel, mode === 'sign_in' && styles.switchLabelActive]}>
            {t('auth.signIn')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.switchOption, mode === 'sign_up' && styles.switchOptionActive]}
          onPress={() => setMode('sign_up')}>
          <Text style={[styles.switchLabel, mode === 'sign_up' && styles.switchLabelActive]}>
            {t('auth.signUp')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.emailLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.passwordLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {mode === 'sign_in' && (
        <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
          <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
        </Pressable>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {info && <Text style={styles.infoText}>{info}</Text>}

      <PillButton
        label={mode === 'sign_in' ? t('auth.signIn') : t('auth.signUp')}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.pill,
    padding: 4,
  },
  switchOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  switchOptionActive: {
    backgroundColor: colors.accent,
  },
  switchLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  switchLabelActive: {
    color: colors.white,
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
  infoText: {
    color: colors.success,
    fontSize: fontSize.sm,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

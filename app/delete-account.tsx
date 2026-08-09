import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

export default function DeleteAccountScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('deleteAccount.authMessage')}>
      <DeleteAccountContent />
    </AuthGate>
  );
}

function DeleteAccountContent() {
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const { error: fnError } = await supabase.functions.invoke('delete-account');

    if (fnError) {
      setLoading(false);
      setError(t('deleteAccount.errorMessage'));
      return;
    }

    await signOut();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={styles.iconWrap}>
        <Ionicons name="warning-outline" size={40} color={colors.danger} />
      </View>

      <Text style={styles.title}>{t('deleteAccount.title')}</Text>
      <Text style={styles.description}>{t('deleteAccount.description')}</Text>

      <View style={styles.list}>
        <Text style={styles.listItem}>• {t('deleteAccount.itemProfile')}</Text>
        <Text style={styles.listItem}>• {t('deleteAccount.itemVacancies')}</Text>
        <Text style={styles.listItem}>• {t('deleteAccount.itemPhotos')}</Text>
      </View>

      <Text style={styles.warning}>{t('deleteAccount.irreversible')}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PillButton
        label={t('deleteAccount.confirmButton')}
        icon="trash-outline"
        onPress={handleDelete}
        disabled={loading}
      />
      {loading && <ActivityIndicator color={colors.danger} />}

      <PillButton
        label={t('deleteAccount.cancelButton')}
        variant="outline"
        onPress={() => router.back()}
        disabled={loading}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    iconWrap: {
      alignSelf: 'center',
      width: 72,
      height: 72,
      borderRadius: radii.lg,
      backgroundColor: `${colors.danger}1F`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: '700',
      textAlign: 'center',
    },
    description: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    list: {
      gap: spacing.xs,
      alignSelf: 'stretch',
    },
    listItem: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    warning: {
      color: colors.danger,
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
    },
    errorText: {
      color: colors.danger,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
  });

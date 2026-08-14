import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PillButton } from '@/components/PillButton';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

type PhonePromptModalProps = {
  visible: boolean;
  onDone: () => void;
};

export function PhonePromptModal({ visible, onDone }: PhonePromptModalProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPhone('');
    setError(null);
    setSaving(false);
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      setError(t('phonePrompt.errorRequired'));
      return;
    }
    setSaving(true);
    await supabase.auth.updateUser({ data: { phone: phone.trim() } });
    reset();
    onDone();
  };

  const handleSkip = () => {
    reset();
    onDone();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('phonePrompt.title')}</Text>
          <Text style={styles.description}>{t('phonePrompt.description')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('phonePrompt.placeholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <PillButton label={t('phonePrompt.saveButton')} onPress={handleSave} disabled={saving} />
          <Pressable onPress={handleSkip} hitSlop={8} disabled={saving}>
            <Text style={styles.skipText}>{t('phonePrompt.skipButton')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
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
      lineHeight: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.background,
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
      textAlign: 'center',
    },
    skipText: {
      color: colors.textMuted,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
  });
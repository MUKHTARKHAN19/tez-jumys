import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';

export default function BusinessProfileScreen() {
  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  return (
    <ScreenContainer>
      <Text style={styles.intro}>
        Бұл ақпарат бір рет толтырылады және жариялайтын барлық хабарландыруларда көрсетіледі.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Бизнес / компания атауы</Text>
        <TextInput
          style={styles.input}
          placeholder="Мысалы: «Дәм» дүкені"
          placeholderTextColor={colors.textMuted}
          value={businessName}
          onChangeText={setBusinessName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Байланыс телефоны</Text>
        <TextInput
          style={styles.input}
          placeholder="+7 (___) ___ __ __"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Орналасқан жері</Text>
        <PillButton
          label={locationLabel ?? 'Ауданды / елді мекенді таңдау'}
          variant="outline"
          icon="location-outline"
          onPress={() => {
            setLocationLabel(null);
            router.push('/location-filter');
          }}
        />
      </View>

      <PillButton label="Сақтау" onPress={() => router.back()} />
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
});

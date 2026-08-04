import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { ImagePickerField } from '@/components/ImagePickerField';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { useLocationSelection } from '@/lib/locationSelection';
import { supabase } from '@/lib/supabase';
import type { District, Employer, Region, Settlement } from '@/types/database';

export default function BusinessProfileScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('businessProfile.authMessage')}>
      <BusinessProfileForm />
    </AuthGate>
  );
}

function BusinessProfileForm() {
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const { getSelection, setSelection } = useLocationSelection();
  const locationSelection = getSelection('business-profile');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [regionId, setRegionId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('employers')
      .select('*, region:regions(*), district:districts(*), settlement:settlements(*)')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(
        ({
          data,
        }: {
          data:
            | (Employer & { region: Region | null; district: District | null; settlement: Settlement | null })
            | null;
        }) => {
          if (data) {
            setEmployerId(data.id);
            setBusinessName(data.business_name);
            setContactPhone(data.contact_phone);
            setRegionId(data.region_id);
            setDistrictId(data.district_id);
            setSettlementId(data.settlement_id);
            setLocationLabel(
              data.settlement
                ? localize(data.settlement)
                : data.district
                  ? localize(data.district)
                  : data.region
                    ? localize(data.region)
                    : null
            );
            setLogoUrl(data.logo_url);
          }
          setLoading(false);
        }
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (locationSelection.regionId) {
      setRegionId(locationSelection.regionId);
      setDistrictId(locationSelection.districtId);
      setSettlementId(locationSelection.settlementId);
      setLocationLabel(locationSelection.label);
    }
  }, [locationSelection]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    if (!businessName || !contactPhone) {
      setError(t('businessProfile.errorRequired'));
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase.from('employers').upsert(
      {
        ...(employerId ? { id: employerId } : {}),
        user_id: user.id,
        business_name: businessName,
        contact_phone: contactPhone,
        region_id: regionId,
        district_id: districtId,
        settlement_id: settlementId,
        logo_url: logoUrl,
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSelection('business-profile', {
      regionId: null,
      districtId: null,
      settlementId: null,
      label: null,
    });
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.intro}>{t('businessProfile.intro')}</Text>

      <ImagePickerField
        label={t('businessProfile.logoLabel')}
        value={logoUrl}
        onChange={setLogoUrl}
        uploadPath={`employers/${user?.id}/logo`}
      />

      <View style={styles.field}>
        <Text style={styles.label}>{t('businessProfile.nameLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('businessProfile.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={businessName}
          onChangeText={setBusinessName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('businessProfile.phoneLabel')}</Text>
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
        <Text style={styles.label}>{t('businessProfile.locationLabel')}</Text>
        <PillButton
          label={locationLabel ?? t('businessProfile.locationPlaceholder')}
          variant="outline"
          icon="location-outline"
          onPress={() => router.push('/location-filter?target=business-profile')}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PillButton label={t('businessProfile.saveButton')} onPress={handleSave} disabled={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
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
});

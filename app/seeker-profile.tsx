import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EulaModal } from '@/components/EulaModal';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fontSize, radii, spacing, type ColorTokens } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { acceptEula, hasAcceptedEula } from '@/lib/eula';
import { useLanguage } from '@/lib/i18n';
import { useLocationSelection } from '@/lib/locationSelection';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { District, Position, Region, Seeker, Settlement } from '@/types/database';

export default function SeekerProfileScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('seekerProfile.authMessage')}>
      <SeekerProfileForm />
    </AuthGate>
  );
}

type SeekerRow = Seeker & {
  region: Region | null;
  district: District | null;
  settlement: Settlement | null;
};

function SeekerProfileForm() {
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { getSelection, setSelection } = useLocationSelection();
  const locationSelection = getSelection('seeker-profile');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seekerId, setSeekerId] = useState<string | null>(null);
  const [eulaVisible, setEulaVisible] = useState(false);

  const [positions, setPositions] = useState<Position[]>([]);
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [positionId, setPositionId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('positions').select('*').order('name_kk'),
      supabase
        .from('seekers')
        .select('*, region:regions(*), district:districts(*), settlement:settlements(*)')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]).then(([positionsResult, seekerResult]) => {
      setPositions(positionsResult.data ?? []);
      const data = seekerResult.data as SeekerRow | null;
      if (data) {
        setSeekerId(data.id);
        setFullName(data.full_name);
        setContactPhone(data.contact_phone);
        setPositionId(data.position_id);
        setRegionId(data.region_id);
        setDistrictId(data.district_id);
        setSettlementId(data.settlement_id);
        setBio(data.bio ?? '');
        setLocationLabel(
          data.settlement
            ? localize(data.settlement)
            : data.district
              ? localize(data.district)
              : data.region
                ? localize(data.region)
                : null
        );
      } else {
        // Жаңа профиль — Apple/Google арқылы кірген кезде сақталған атау/телефонды
        // алдын ала толтырамыз (user_metadata: lib/socialAuth.ts, PhonePromptModal).
        const metaFullName = user.user_metadata?.full_name;
        const metaPhone = user.user_metadata?.phone;
        if (typeof metaFullName === 'string') setFullName(metaFullName);
        if (typeof metaPhone === 'string') setContactPhone(metaPhone);
      }
      setLoading(false);
    });
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

    if (!fullName || !contactPhone) {
      setError(t('seekerProfile.errorRequired'));
      return;
    }

    if (!seekerId && !(await hasAcceptedEula(user.id))) {
      setEulaVisible(true);
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase.from('seekers').upsert(
      {
        ...(seekerId ? { id: seekerId } : {}),
        user_id: user.id,
        full_name: fullName,
        contact_phone: contactPhone,
        position_id: positionId,
        region_id: regionId,
        district_id: districtId,
        settlement_id: settlementId,
        bio: bio || null,
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSelection('seeker-profile', { regionId: null, districtId: null, settlementId: null, label: null });
    router.back();
  };

  const handleDelete = async () => {
    if (!seekerId) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('seekers').delete().eq('id', seekerId);
    setSaving(false);
    if (!deleteError) router.back();
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
      <Text style={styles.intro}>{t('seekerProfile.intro')}</Text>

      {seekerId && (
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeText}>{t('seekerProfile.visibleNotice')}</Text>
        </Card>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>{t('seekerProfile.nameLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('seekerProfile.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('seekerProfile.positionLabel')}</Text>
        <View style={styles.chipsWrap}>
          {positions.map((position) => (
            <Chip
              key={position.id}
              label={localize(position)}
              selected={positionId === position.id}
              onPress={() =>
                setPositionId((current) => (current === position.id ? null : position.id))
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('seekerProfile.locationLabel')}</Text>
        <PillButton
          label={locationLabel ?? t('seekerProfile.locationPlaceholder')}
          variant="outline"
          icon="location-outline"
          onPress={() => router.push('/location-filter?target=seeker-profile')}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('seekerProfile.phoneLabel')}</Text>
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
        <Text style={styles.label}>{t('seekerProfile.bioLabel')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('seekerProfile.bioPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <PillButton label={t('seekerProfile.saveButton')} onPress={handleSave} disabled={saving} />

      {seekerId && (
        <PillButton
          label={t('seekerProfile.deleteButton')}
          variant="outline"
          onPress={handleDelete}
          disabled={saving}
        />
      )}

      <EulaModal
        visible={eulaVisible}
        onAccept={async () => {
          if (!user) return;
          await acceptEula(user.id);
          setEulaVisible(false);
          handleSave();
        }}
        onClose={() => setEulaVisible(false)}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
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
    noticeCard: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    noticeText: {
      color: colors.accent,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    field: {
      gap: spacing.sm,
    },
    label: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      gap: spacing.sm,
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
    textArea: {
      minHeight: 90,
      textAlignVertical: 'top',
    },
    errorText: {
      color: colors.danger,
      fontSize: fontSize.sm,
    },
  });

import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EulaModal } from '@/components/EulaModal';
import { ImagePickerField } from '@/components/ImagePickerField';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { getSalaryPeriodOptions } from '@/constants/salaryPeriod';
import { getScheduleOptions } from '@/constants/schedule';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { acceptEula, hasAcceptedEula } from '@/lib/eula';
import { useLanguage } from '@/lib/i18n';
import { useLocationSelection, type LocationSelectionTarget } from '@/lib/locationSelection';
import { supabase } from '@/lib/supabase';
import type {
  Employer,
  Position,
  SalaryPeriod,
  VacancySchedule,
  VacancyWithRelations,
} from '@/types/database';

type VacancyFormProps = {
  employer: Employer;
  initialVacancy?: VacancyWithRelations | null;
  locationTarget: LocationSelectionTarget;
  onSaved: () => void;
};

export function VacancyForm({ employer, initialVacancy, locationTarget, onSaved }: VacancyFormProps) {
  const isEdit = !!initialVacancy;
  const { language, t, localize } = useLanguage();
  const { getSelection, setSelection } = useLocationSelection();
  const locationSelection = getSelection(locationTarget);

  const [positions, setPositions] = useState<Position[]>([]);
  const [positionId, setPositionId] = useState<string | null>(initialVacancy?.position_id ?? null);
  const [salaryFrom, setSalaryFrom] = useState(initialVacancy?.salary_from?.toString() ?? '');
  const [salaryTo, setSalaryTo] = useState(initialVacancy?.salary_to?.toString() ?? '');
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(
    initialVacancy?.salary_period ?? 'month'
  );
  const [schedule, setSchedule] = useState<VacancySchedule | null>(initialVacancy?.schedule ?? null);
  const [regionId, setRegionId] = useState<string | null>(initialVacancy?.region_id ?? null);
  const [districtId, setDistrictId] = useState<string | null>(initialVacancy?.district_id ?? null);
  const [settlementId, setSettlementId] = useState<string | null>(initialVacancy?.settlement_id ?? null);
  const [locationLabel, setLocationLabel] = useState<string | null>(
    initialVacancy?.settlement
      ? localize(initialVacancy.settlement)
      : initialVacancy?.district
        ? localize(initialVacancy.district)
        : initialVacancy?.region
          ? localize(initialVacancy.region)
          : null
  );
  const [contactPhone, setContactPhone] = useState(
    initialVacancy?.contact_phone ?? employer.contact_phone ?? ''
  );
  const [description, setDescription] = useState(initialVacancy?.description ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialVacancy?.photo_url ?? null);

  const [saving, setSaving] = useState(false);
  const [statusOverlay, setStatusOverlay] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  const [eulaVisible, setEulaVisible] = useState(false);

  useEffect(() => {
    if (!statusOverlay) return;
    const duration = statusOverlay.type === 'success' ? 1600 : 2400;
    const timeout = setTimeout(() => closeStatusOverlay(), duration);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusOverlay]);

  const closeStatusOverlay = () => {
    const wasSuccess = statusOverlay?.type === 'success';
    setStatusOverlay(null);
    if (wasSuccess) {
      onSaved();
    }
  };

  useEffect(() => {
    supabase
      .from('positions')
      .select('*')
      .order('name_kk')
      .then(({ data }) => setPositions(data ?? []));
  }, []);

  useEffect(() => {
    if (locationSelection.regionId) {
      setRegionId(locationSelection.regionId);
      setDistrictId(locationSelection.districtId);
      setSettlementId(locationSelection.settlementId);
      setLocationLabel(locationSelection.label);
    }
  }, [locationSelection]);

  const handleSubmit = async () => {
    setStatusOverlay(null);

    if (!positionId || !regionId || !contactPhone) {
      setStatusOverlay({ type: 'error', message: t('post.errorRequiredFields') });
      return;
    }

    if (!isEdit && !(await hasAcceptedEula(employer.user_id))) {
      setEulaVisible(true);
      return;
    }

    setSaving(true);
    const payload = {
      employer_id: employer.id,
      position_id: positionId,
      region_id: regionId,
      district_id: districtId,
      settlement_id: settlementId,
      salary_from: salaryFrom ? Number(salaryFrom) : null,
      salary_to: salaryTo ? Number(salaryTo) : null,
      salary_period: salaryPeriod,
      schedule,
      description: description || null,
      contact_phone: contactPhone,
      photo_url: photoUrl,
    };

    const { error: saveError } = initialVacancy
      ? await supabase.from('vacancies').update(payload).eq('id', initialVacancy.id)
      : await supabase.from('vacancies').insert({ ...payload, is_active: true });
    setSaving(false);

    if (saveError) {
      setStatusOverlay({ type: 'error', message: saveError.message });
      return;
    }

    setSelection(locationTarget, { regionId: null, districtId: null, settlementId: null, label: null });

    if (!isEdit) {
      setPositionId(null);
      setSalaryFrom('');
      setSalaryTo('');
      setSalaryPeriod('month');
      setSchedule(null);
      setDescription('');
      setPhotoUrl(null);
      setRegionId(null);
      setDistrictId(null);
      setSettlementId(null);
      setLocationLabel(null);
    }

    setStatusOverlay({ type: 'success', message: t('post.successMessage') });
  };

  return (
    <ScreenContainer>
      <ImagePickerField
        label={t('post.photoLabel')}
        value={photoUrl}
        onChange={setPhotoUrl}
        uploadPath={`vacancies/${employer.user_id}/photo`}
      />

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.positionLabel')}</Text>
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
        <Text style={styles.label}>{t('post.salaryLabel')}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder={t('post.salaryFromPlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={salaryFrom}
            onChangeText={setSalaryFrom}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder={t('post.salaryToPlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={salaryTo}
            onChangeText={setSalaryTo}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.salaryPeriodLabel')}</Text>
        <View style={styles.chipsWrap}>
          {getSalaryPeriodOptions(language).map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={salaryPeriod === option.value}
              onPress={() => setSalaryPeriod(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.scheduleLabel')}</Text>
        <View style={styles.chipsWrap}>
          {getScheduleOptions(language).map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={schedule === option.value}
              onPress={() =>
                setSchedule((current) => (current === option.value ? null : option.value))
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.locationLabel')}</Text>
        <PillButton
          label={locationLabel ?? t('post.locationPlaceholder')}
          variant="outline"
          icon="location-outline"
          onPress={() => router.push(`/location-filter?target=${locationTarget}`)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.descriptionLabel')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('post.descriptionPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('post.phoneLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="+7 (___) ___ __ __"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />
      </View>

      <PillButton
        label={isEdit ? t('post.updateButton') : t('post.submitButton')}
        onPress={handleSubmit}
        disabled={saving}
      />

      <EulaModal
        visible={eulaVisible}
        onAccept={async () => {
          await acceptEula(employer.user_id);
          setEulaVisible(false);
          handleSubmit();
        }}
        onClose={() => setEulaVisible(false)}
      />

      <Modal transparent visible={!!statusOverlay} animationType="fade" statusBarTranslucent>
        <Pressable style={styles.overlayBackdrop} onPress={closeStatusOverlay}>
          <View style={styles.overlayCard}>
            <Ionicons
              name={statusOverlay?.type === 'success' ? 'checkmark-circle' : 'close-circle'}
              size={72}
              color={statusOverlay?.type === 'success' ? colors.success : colors.danger}
            />
            <Text style={styles.overlayText}>{statusOverlay?.message}</Text>
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.lg,
  },
  overlayCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    minWidth: 220,
  },
  overlayText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowInput: {
    flex: 1,
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
});
